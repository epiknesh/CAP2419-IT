from tracker.centroidtracker import CentroidTracker
from tracker.trackableobject import TrackableObject
from imutils.video import VideoStream
from itertools import zip_longest
from utils.mailer import Mailer
from imutils.video import FPS
from utils import thread
from pymongo import MongoClient
from queue import Queue
import datetime
import numpy as np
import threading
import argparse
import datetime
import schedule
import logging
import imutils
import time
import dlib
import json
import csv
import cv2


# execution start time
start_time = time.time()
# setup logger
logging.basicConfig(level = logging.INFO, format = "[INFO] %(message)s")
logger = logging.getLogger(__name__)
# initiate features config.
with open("utils/config.json", "r") as file:
    config = json.load(file)

# Initiate the MongoDB client
client = MongoClient("mongodb+srv://seanbartolome7slm:cap2419it@busmateph.vfi4r.mongodb.net/")

# Replace 'BusMatePH' with your database name
db = client["BusMatePH"]

# Replace 'capacity' with your collection name
collection = db["capacity"]

data_queue = Queue()

def parse_arguments():
	# function to parse the arguments
    ap = argparse.ArgumentParser()
    ap.add_argument("-p", "--prototxt", required=False,
        help="path to Caffe 'deploy' prototxt file")
    ap.add_argument("-m", "--model", required=True,
        help="path to Caffe pre-trained model")
    ap.add_argument("-i", "--input", type=str,
        help="path to optional input video file")
    ap.add_argument("-o", "--output", type=str,
        help="path to optional output video file")
    # confidence default 0.4
    ap.add_argument("-c", "--confidence", type=float, default=0.4,
        help="minimum probability to filter weak detections")
    ap.add_argument("-s", "--skip-frames", type=int, default=30,
        help="# of skip frames between detections")
    args = vars(ap.parse_args())
    return args

def send_mail():
	# function to send the email alerts
	Mailer().send(config["Email_Receive"])

def log_data_worker():
    while True:
        try:
            # Get the data from the queue
            capacity = data_queue.get()

            # Define the query to find the document (assuming busID is unique)
            query = {"busID": 4}
            
            # Define the update operation
            update = {
                "$set": {
                    "capacity": capacity,
                    "date": datetime.datetime.now()  # Update timestamp
                }
            }

            # Update the document, insert if it does not exist
            collection.update_one(query, update, upsert=True)
            print("Capacity updated successfully:", capacity)

        except Exception as e:
            print("Error updating MongoDB:", e)
        
        finally:
            data_queue.task_done()  # Mark task as done

# Start the background worker thread
worker_thread = threading.Thread(target=log_data_worker, daemon=True)
worker_thread.start()


def log_data(capacity):
	data_queue.put(capacity)
    # Define the query to find the document (assuming busID is unique)
    #query = {"busID": 1}

    # Define the update operation
    #update = {
        #"$set": {
            #"capacity": capacity,
            #"date": datetime.datetime.now()  # Update the timestamp
        #}
    #}

    # Update the document, insert if it does not exist
    #result = collection.update_one(query, update, upsert=True)

    #if result.modified_count:
        #print("Capacity updated successfully.")
    #elif result.upserted_id:
        #print(f"New record inserted with id {result.upserted_id}")
    #else:
        #print("No changes made.")

	# THIS FUNCTION INSERTS DATA TO DB EVERYTIME CAPACITY CHANGES			
	# initiate the MongoDB client
	# client = MongoClient("mongodb+srv://seanbartolome7slm:cap2419it@busmateph.vfi4r.mongodb.net/")

	# Replace 'mydatabase' with the name of your database
	# db = client["BusMatePH"]

	# Replace 'mycollection' with the name of your collection
	# collection = db["capacity"]

	#Prepare the data for insertion
	#data = {
	#		"date": datetime.datetime.now(),
	#		"capacity": capacity,
	#		"busID": 1
			#"status": "Open" if capacity < config["Threshold"] else "Closed"
	#}
	
	#Insert the data into the MongoDB collection
	#result = collection.insert_one(data)
	#print("Data inserted with record id", result.inserted_id)
	
	
	
	# function to log the counting data
	#data = [move_exit, in_time, move_in, out_time]
	# transpose the data to align the columns properly
	#export_data = zip_longest(*data, fillvalue = '')

	#with open('utils/data/logs/counting_data.csv', 'w', newline = '') as myfile:
	#	wr = csv.writer(myfile, quoting = csv.QUOTE_ALL)
	#	if myfile.tell() == 0: # check if header rows are already existing
	#		wr.writerow(("Move In", "In Time", "Move Out", "Out Time"))
	#		wr.writerows(export_data)

def people_counter():
	# main function for people_counter.py
	args = parse_arguments()
	# initialize the list of class labels MobileNet SSD was trained to detect
	CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
		"bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
		"dog", "horse", "motorbike", "person", "pottedplant", "sheep",
		"sofa", "train", "tvmonitor"]

	# load our serialized model from disk
	net = cv2.dnn.readNetFromCaffe(args["prototxt"], args["model"])

	# if a video path was not supplied, grab a reference to the ip camera
	if not args.get("input", False):
		logger.info("Logger is working")	
		logger.info("Starting the live stream..")
		#vs = VideoStream(config["url"]).start() #http://192.168.1.3:5000/video_feed - URL 100.100.13.85:5000 

		vs = VideoStream(int(config["url"])).start() # // THIS IS FOR WEBCAM

		time.sleep(2.0)

	# otherwise, grab a reference to the video file
	else:
		logger.info("Starting the video..")
		vs = cv2.VideoCapture(args["input"])

	# initialize the video writer (we'll instantiate later if need be)
	writer = None

	# initialize the frame dimensions (we'll set them as soon as we read
	# the first frame from the video)
	W = None
	H = None

	# instantiate our centroid tracker, then initialize a list to store
	# each of our dlib correlation trackers, followed by a dictionary to
	# map each unique object ID to a TrackableObject
	ct = CentroidTracker(maxDisappeared=40, maxDistance=50)
	trackers = []
	trackableObjects = {}

	# initialize the total number of frames processed thus far, along
	# with the total number of objects that have moved either up or down
	totalFrames = 0
	totalDown = 0
	totalUp = 0
	# initialize empty lists to store the counting data
	total = []
	move_in = []
	move_exit =[]
	out_time = []
	in_time = []

	# start the frames per second throughput estimator
	fps = FPS().start()

	if config["Thread"]:
		vs = thread.ThreadingClass(config["url"])
		#vs = VideoStream(int(config["url"])).start() # // THIS IS FOR WEBCAM

	# loop over frames from the video stream
	while True:
		# grab the next frame and handle if we are reading from either
		# VideoCapture or VideoStream
		if args["input"]:
			ret, frame = vs.read()
			if not ret:
				print("Video stream ended..")
				break
		else:
			frame = vs.read()
		
		if frame is None:
			print("Frame not available..")
			break

		# if we are viewing a video and we did not grab a frame then we
		# have reached the end of the video
		if args["input"] is not None and frame is None:
			break

		# resize the frame to have a maximum width of 500 pixels (the
		# less data we have, the faster we can process it), then convert
		# the frame from BGR to RGB for dlib
		frame = imutils.resize(frame, width = 500)
		rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
		# gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		# frame = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)  # Convert back to BGR for compatibility with other functions
		# rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

		# if the frame dimensions are empty, set them
		if W is None or H is None:
			(H, W) = frame.shape[:2]

		# if we are supposed to be writing a video to disk, initialize
		# the writer
		if args["output"] is not None and writer is None:
			fourcc = cv2.VideoWriter_fourcc(*"mp4v")
			writer = cv2.VideoWriter(args["output"], fourcc, 30,
				(W, H), True)

		# initialize the current status along with our list of bounding
		# box rectangles returned by either (1) our object detector or
		# (2) the correlation trackers
		status = "Waiting"
		rects = []

		# check to see if we should run a more computationally expensive
		# object detection method to aid our tracker
		if totalFrames % args["skip_frames"] == 0:
			# set the status and initialize our new set of object trackers
			status = "Detecting"
			trackers = []

			# convert the frame to a blob and pass the blob through the
			# network and obtain the detections
			blob = cv2.dnn.blobFromImage(frame, 0.007843, (W, H), 127.5)
			net.setInput(blob)
			detections = net.forward()

			# loop over the detections
			for i in np.arange(0, detections.shape[2]):
				# extract the confidence (i.e., probability) associated
				# with the prediction
				confidence = detections[0, 0, i, 2]

				# filter out weak detections by requiring a minimum
				# confidence
				if confidence > args["confidence"]:
					# extract the index of the class label from the
					# detections list
					idx = int(detections[0, 0, i, 1])

					# if the class label is not a person, ignore it
					if CLASSES[idx] != "person":
						continue

					# compute the (x, y)-coordinates of the bounding box
					# for the object
					box = detections[0, 0, i, 3:7] * np.array([W, H, W, H])
					(startX, startY, endX, endY) = box.astype("int")

					# construct a dlib rectangle object from the bounding
					# box coordinates and then start the dlib correlation
					# tracker
					tracker = dlib.correlation_tracker()
					rect = dlib.rectangle(startX, startY, endX, endY)
					tracker.start_track(rgb, rect)

					# add the tracker to our list of trackers so we can
					# utilize it during skip frames
					trackers.append(tracker)

		# otherwise, we should utilize our object *trackers* rather than
		# object *detectors* to obtain a higher frame processing throughput
		else:
			# loop over the trackers
			for tracker in trackers:
				# set the status of our system to be 'tracking' rather
				# than 'waiting' or 'detecting'
				status = "Tracking"

				# update the tracker and grab the updated position
				tracker.update(rgb)
				pos = tracker.get_position()

				# unpack the position object
				startX = int(pos.left())
				startY = int(pos.top())
				endX = int(pos.right())
				endY = int(pos.bottom())

				# add the bounding box coordinates to the rectangles list
				rects.append((startX, startY, endX, endY))

		# draw a horizontal line in the center of the frame -- once an
		# object crosses this line we will determine whether they were
		# moving 'up' or 'down'
		cv2.line(frame, (0, H // 2), (W, H // 2), (0, 0, 0), 3)
		cv2.putText(frame, "-Prediction border - Entrance-", (10, H - ((i * 20) + 200)),
			cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

		# use the centroid tracker to associate the (1) old object
		# centroids with (2) the newly computed object centroids
		objects = ct.update(rects)

		# loop over the tracked objects
		for (objectID, centroid) in objects.items():
			# check to see if a trackable object exists for the current
			# object ID
			to = trackableObjects.get(objectID, None)

			# if there is no existing trackable object, create one
			if to is None:
				to = TrackableObject(objectID, centroid)

			# otherwise, there is a trackable object so we can utilize it
			# to determine direction
			else:
				# the difference between the y-coordinate of the *current*
				# centroid and the mean of *previous* centroids will tell
				# us in which direction the object is moving (negative for
				# 'up' and positive for 'down')
				#y = [c[1] for c in to.centroids]
				#direction = centroid[1] - np.mean(y)
				if len(to.centroids) > 0:
						direction = centroid[1] - to.centroids[-1][1]  # Compare with the last known position
				else:
						direction = 0
				to.centroids.append(centroid)
				TOLERANCE = 10	#Adjust the tolerance value to match the object's speed
				# check to see if the object has been counted or not
				if not to.counted:
					# if the direction is negative (indicating the object
					# is moving up) AND the centroid is above the center
					# line, count the object
					if direction < 0 and centroid[1] < (H // 2 + TOLERANCE):
						totalUp += 1
						date_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
						move_in.append(totalUp)
						out_time.append(date_time)
						capacity = len(move_in) - len(move_exit)
						logger.info("Total people inside: {}".format(len(move_in) - len(move_exit)))
						log_data(capacity)
						to.counted = True

					# if the direction is positive (indicating the object
					# is moving down) AND the centroid is below the
					# center line, count the object
					elif direction > 0 and centroid[1] > (H // 2 - TOLERANCE):
						totalDown += 1
						date_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
						move_exit.append(totalDown)
						in_time.append(date_time)
						capacity = len(move_in) - len(move_exit)
						logger.info("Total people inside: {}".format(len(move_in) - len(move_exit)))
						log_data(capacity)
						# if the people limit exceeds over threshold, send an email alert
						if sum(total) >= config["Threshold"]:
							cv2.putText(frame, "-ALERT: People limit exceeded-", (10, frame.shape[0] - 80),
								cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 0, 255), 2)
							if config["ALERT"]:
								logger.info("Sending alert..")
								email_thread = threading.Thread(target = send_mail)
								email_thread.daemon = True
								email_thread.start()
								logger.info("Alert sent!")
						to.counted = True
						to.last_count_time = time.time()    # Added a Timestamp to the last count time
						# compute the sum of total people inside
						total = []
						total.append(len(move_in) - len(move_exit))

			# store the trackable object in our dictionary
			trackableObjects[objectID] = to

			# draw both the ID of the object and the centroid of the
			# object on the output frame
			text = "ID {}".format(objectID)
			cv2.putText(frame, text, (centroid[0] - 10, centroid[1] - 10),
				cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
			cv2.circle(frame, (centroid[0], centroid[1]), 4, (255, 255, 255), -1)

		# construct a tuple of information we will be displaying on the frame
		info_status = [
		("Enter", totalUp),
		("Exit", totalDown),
		("Status", status),
		]

		#info_total = [
		#("Total people inside", ', '.join(map(str, total))),
		#]

		# display the output
		for (i, (k, v)) in enumerate(info_status):
			text = "{}: {}".format(k, v)
			cv2.putText(frame, text, (10, H - ((i * 20) + 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

		#for (i, (k, v)) in enumerate(info_total):
		#	text = "{}: {}".format(k, v)
		#	cv2.putText(frame, text, (265, H - ((i * 20) + 60)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

		# initiate a simple log to save the counting data
		if config["Log"]:
			log_data(capacity)

		# check to see if we should write the frame to disk
		if writer is not None:
			writer.write(frame)

		# show the output frame
		cv2.imshow("Real-Time Monitoring/Analysis Window", frame)
		key = cv2.waitKey(1) & 0xFF
		# if the `q` key was pressed, break from the loop
		if key == ord("q"):
			break
		# increment the total number of frames processed thus far and
		# then update the FPS counter
		totalFrames += 1
		fps.update()

		# initiate the timer
		if config["Timer"]:
			# automatic timer to stop the live stream (set to 8 hours/28800s)
			end_time = time.time()
			num_seconds = (end_time - start_time)
			if num_seconds > 28800:
				break

	# stop the timer and display FPS information
	fps.stop()
	if totalFrames > 0:
		logger.info("Elapsed time: {:.2f}".format(fps.elapsed()))
		logger.info("Approx. FPS: {:.2f}".format(fps.fps()))
	else:
		logger.info("No frames available..")
	# release the camera device/resource (issue 15)
	if args["input"]:
		ret, frame = vs.read()
		if not ret:
			vs.release()
	else:
			vs.stop()
	# close any open windows

	#cv2.destroyAllWindows()

if __name__ == "__main__":
    people_counter()

