import base64
import requests
from PIL import Image
import os
import tempfile
import json
import time
from typing import Optional, List, Tuple
from pdf2image import convert_from_path
import pytesseract
import shutil

# Configuration
SUPPORTED_IMAGE_FORMATS = {
    '.jpg': 'JPEG',
    '.jpeg': 'JPEG',
    '.png': 'PNG',
    '.bmp': 'BMP',
    '.tiff': 'TIFF',
    '.webp': 'WEBP',
    '.gif': 'GIF'
}

SUPPORTED_DOC_FORMATS = {
    '.pdf': 'PDF'
}

SYSTEM_PROMPT = """Act as an OCR assistant. Analyze the provided image and:
1. Recognize all visible text in the image as accurately as possible.
2. Maintain the original structure and formatting of the text.
3. If any words or phrases are unclear, indicate this with [unclear] in your transcription.
Provide only the transcription without any additional comments."""

class OCRProcessor:
    def __init__(self):
        self.temp_dirs = []
        
    def __del__(self):
        self.cleanup()
        
    def cleanup(self):
        """Clean up all temporary directories."""
        for temp_dir in self.temp_dirs:
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass
    
    def create_temp_dir(self) -> str:
        """Create a managed temporary directory."""
        temp_dir = tempfile.mkdtemp()
        self.temp_dirs.append(temp_dir)
        return temp_dir
    
    def is_supported_file(self, file_path: str) -> bool:
        """Check if the file format is supported."""
        ext = os.path.splitext(file_path)[1].lower()
        return ext in SUPPORTED_IMAGE_FORMATS or ext in SUPPORTED_DOC_FORMATS
    
    def pdf_to_images(self, pdf_path: str, dpi: int = 300) -> List[str]:
        """Convert PDF to list of image paths with progress tracking."""
        temp_dir = self.create_temp_dir()
        try:
            print(f"Converting PDF to images (DPI: {dpi})...")
            start_time = time.time()
            images = convert_from_path(
                pdf_path,
                dpi=dpi,
                output_folder=temp_dir,
                fmt='jpeg',
                thread_count=4
            )
            
            image_paths = []
            for i, image in enumerate(images):
                path = os.path.join(temp_dir, f'page_{i+1}.jpg')
                image.save(path, 'JPEG', quality=85)
                image_paths.append(path)
                print(f"Converted page {i+1}/{len(images)}")
            
            print(f"PDF conversion completed in {time.time() - start_time:.1f}s")
            return image_paths
        except Exception as e:
            print(f"PDF conversion failed: {e}")
            raise
    
    def optimize_image(self, image_path: str) -> Tuple[str, bool]:
        """Optimize image for OCR processing."""
        temp_dir = self.create_temp_dir()
        temp_path = os.path.join(temp_dir, 'optimized.jpg')
        
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if needed
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                if max(img.size) > 2048:
                    img.thumbnail((2048, 2048))
                
                # Save optimized version
                img.save(temp_path, 'JPEG', quality=85, optimize=True)
                return temp_path, True
        except Exception as e:
            print(f"Image optimization failed: {e}")
            return image_path, False
    
    def llama_ocr_streaming(self, base64_image: str) -> Optional[str]:
        """Perform OCR with streaming progress."""
        full_response = ""
        start_time = time.time()
        
        try:
            print("Starting Llama OCR processing...")
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
                    "stream": True
                },
                stream=True,
                timeout=300
            )
            
            for line in response.iter_lines():
                if line:
                    decoded = line.decode('utf-8')
                    if decoded.startswith('data:'):
                        try:
                            chunk = json.loads(decoded[5:])
                            if 'message' in chunk and 'content' in chunk['message']:
                                content = chunk['message']['content']
                                full_response += content
                                print(content, end='', flush=True)
                        except json.JSONDecodeError:
                            continue
            
            print(f"\nLlama OCR completed in {time.time() - start_time:.1f}s")
            return full_response.strip()
        
        except requests.exceptions.RequestException as e:
            print(f"\nLlama OCR error: {e}")
            return None
    
    def tesseract_ocr(self, image_path: str) -> Optional[str]:
        """Perform OCR using Tesseract with progress."""
        print("Starting Tesseract OCR...")
        start_time = time.time()
        try:
            result = pytesseract.image_to_string(Image.open(image_path))
            print(f"Tesseract OCR completed in {time.time() - start_time:.1f}s")
            return result
        except Exception as e:
            print(f"Tesseract OCR error: {e}")
            return None
    
    def process_file(self, file_path: str) -> Optional[str]:
        """Process a single file with progress tracking."""
        print(f"\nProcessing file: {os.path.basename(file_path)}")
        
        if not os.path.exists(file_path):
            print("Error: File not found")
            return None
            
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext in SUPPORTED_DOC_FORMATS:
            try:
                image_paths = self.pdf_to_images(file_path)
                full_text = []
                
                for i, img_path in enumerate(image_paths):
                    print(f"\nProcessing page {i+1}/{len(image_paths)}")
                    page_text = self.process_image_file(img_path)
                    if page_text:
                        full_text.append(page_text)
                
                return "\n\n".join(full_text) if full_text else None
            except Exception as e:
                print(f"PDF processing failed: {e}")
                return None
                
        elif ext in SUPPORTED_IMAGE_FORMATS:
            return self.process_image_file(file_path)
        else:
            print(f"Unsupported file format: {ext}")
            return None
    
    def process_image_file(self, image_path: str) -> Optional[str]:
        """Process a single image file."""
        optimized_path, was_optimized = self.optimize_image(image_path)
        
        try:
            with open(optimized_path, "rb") as img_file:
                base64_image = base64.b64encode(img_file.read()).decode('utf-8')
            
            # First try Llama with streaming
            print("\nAttempting Llama OCR...")
            result = self.llama_ocr_streaming(base64_image)
            if result:
                return result
            
            # Fallback to Tesseract
            print("\nFalling back to Tesseract OCR")
            return self.tesseract_ocr(optimized_path)
            
        finally:
            if was_optimized and os.path.exists(optimized_path):
                os.remove(optimized_path)

if __name__ == "__main__":
    try:
        processor = OCRProcessor()
        
        files_to_process = [
            "MyMercy - Test Details.pdf",
        ]
        
        valid_files = [f for f in files_to_process if os.path.exists(f) and processor.is_supported_file(f)]
        
        if not valid_files:
            print("Error: No valid files found")
            print("Supported formats:")
            print("Images:", ", ".join(SUPPORTED_IMAGE_FORMATS.keys()))
            print("Documents:", ", ".join(SUPPORTED_DOC_FORMATS.keys()))
        else:
            for file_path in valid_files:
                start_time = time.time()
                result = processor.process_file(file_path)
                
                if result:
                    print("\nFinal OCR Result:")
                    print(result)
                else:
                    print("Failed to process file")
                
                print(f"\nTotal processing time: {time.time() - start_time:.1f} seconds")
                
    except KeyboardInterrupt:
        print("\nProcess interrupted by user")
    except Exception as e:
        print(f"Fatal error: {e}")
    finally:
        print("Processing complete")