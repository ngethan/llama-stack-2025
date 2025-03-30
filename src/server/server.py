from flask import Flask, request, jsonify
import base64
import requests
from PIL import Image
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

SYSTEM_PROMPT = """Act as an OCR assistant. Analyze the provided image and:
1. Recognize all visible text in the image as accurately as possible.
2. Maintain the original structure and formatting of the text.
3. If any words or phrases are unclear, indicate this with [unclear] in your transcription.
Provide only the transcription without any additional comments."""

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encode_image_to_base64(image_path):
    """Convert an image file to a base64 encoded string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def perform_ocr(image_path):
    """Perform OCR on the given image using Llama 3.2-Vision."""
    base64_image = encode_image_to_base64(image_path)
    response = requests.post(
        "http://localhost:8000/chat",  # Ensure this URL matches your Ollama service endpoint
        json={
            "model": "llama3.2-vision",
            "messages": [
                {
                    "role": "user",
                    "content": SYSTEM_PROMPT,
                    "images": [base64_image],
                },
            ],
        }
    )

    if response.status_code == 200:
        return response.json().get("message", {}).get("content", "")
    else:
        print("Error:", response.status_code, response.text)
        return None

@app.route('/ocr', methods=['POST'])
def ocr_endpoint():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser submits an empty part without filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            result = perform_ocr(filepath)
            if result:
                # Clean up the uploaded file
                os.remove(filepath)
                return jsonify({"text": result})
            else:
                return jsonify({"error": "OCR processing failed"}), 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)