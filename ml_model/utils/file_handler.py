import tempfile
import os

def save_uploaded_file(upload_file) -> str:
    """Save uploaded file to temporary location and return path"""
    try:
        # Ensure the file has .pdf extension regardless of original case
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = upload_file.file.read()
            tmp.write(content)
            return tmp.name
    except Exception as e:
        raise Exception(f"Error saving file: {str(e)}")

def cleanup_file(file_path: str):
    """Remove temporary file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not remove temporary file {file_path}: {e}")