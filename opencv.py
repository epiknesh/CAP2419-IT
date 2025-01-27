from flask import Flask, render_template, Response, jsonify
import cv2

# Initialize Flask application
app = Flask(__name__)

# Initialize the camera (using the default camera device)
camera = cv2.VideoCapture(0)

# Load the face detection classifier from OpenCV
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Route to serve the main page (HTML)
@app.route('/')
def index():
    return render_template('opencv.html')  # This will render the opencv.html file

# Function to generate frames for the live video feed
def generate_frames():
    while True:
        # Read a frame from the camera
        success, frame = camera.read()
        if not success:
            break  # If frame reading fails, exit loop

        # Convert the frame to grayscale (needed for face detection)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Perform face detection
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        
        # Draw rectangles around detected faces on the frame
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

        # Encode the frame as JPEG to send over HTTP
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        # Yield the frame to the client in a multipart format (for continuous video stream)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Route to provide the video feed
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Route to get the current passenger count based on the number of faces detected
@app.route('/passenger_count')
def passenger_count():
    success, frame = camera.read()
    if success:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces in the captured frame
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        
        # Return the number of detected faces as the passenger count (in JSON format)
        return jsonify({"count": len(faces)})
    
    # If the frame capture failed, return a count of 0
    return jsonify({"count": 0})

# Run the Flask application on localhost at port 5000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
