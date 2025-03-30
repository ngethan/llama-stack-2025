import base64
import requests
import time
import json
from PIL import Image

SYSTEM_PROMPT = """Act as an OCR assistant. Analyze the provided image and:
1. Recognize all visible text in the image as accurately as possible.
2. Maintain the original structure and formatting of the text.
3. If any words or phrases are unclear, indicate this with [unclear] in your transcription.
Provide only the transcription without any additional comments."""
def encode_image_to_base64(image_path):
    """Convert an image file to a base64 encoded string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')
    
def perform_ocr(image_path, show_progress=True):
    """Perform OCR with streaming progress."""
    base64_image = encode_image_to_base64(image_path)
    
    start_time = time.time()
    last_update = start_time
    
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3.2-vision",
                "messages": [
                    {
                        "role": "user",
                        "content": SYSTEM_PROMPT,
                        "images": [base64_image],
                    }
                ],
                "stream": True  # Enable streaming
            },
            stream=True,
            timeout=300
        )
        
        full_response = ""
        if show_progress:
            print("Starting OCR processing...")
        
        for line in response.iter_lines():
            if line:
                current_time = time.time()
                if show_progress and current_time - last_update > 1.0:  # Update every second
                    print(f"Processing... {current_time - start_time:.1f}s elapsed")
                    last_update = current_time
                
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith('data:'):
                    try:
                        chunk = json.loads(decoded_line[5:])
                        if 'message' in chunk and 'content' in chunk['message']:
                            full_response += chunk['message']['content']
                            if show_progress:
                                print(chunk['message']['content'], end='', flush=True)
                    except json.JSONDecodeError:
                        continue
        
        if show_progress:
            print(f"\n\nTotal processing time: {time.time() - start_time:.1f} seconds")
        
        return full_response.strip()
    
    except requests.exceptions.RequestException as e:
        print(f"\nOCR Error: {str(e)}")
        return None
    
if __name__ == "__main__":
    image_path = "test.jpeg"  # Replace with your image path
    result = perform_ocr(image_path)
    if result:
        print("OCR Recognition Result:")
        print(result)