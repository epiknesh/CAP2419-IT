from flask import Flask, render_template, Response
import cv2

app = Flask(__name__)

# Initialize OpenCV video capture
camera = cv2.VideoCapture(0)  # Use 0 for the default camera or specify your camera index

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # Process the frame (e.g., detect passengers)
            frame = process_frame(frame)

            # Encode the frame in JPEG format
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def process_frame(frame):
    # Convert to grayscale for processing
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Example: Draw a rectangle (custom logic for passenger detection goes here)
    cv2.rectangle(frame, (50, 50), (200, 200), (0, 255, 0), 2)
    cv2.putText(frame, "Detecting...", (60, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    return frame

@app.route('/')
def index():
    return render_template('opencv.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
