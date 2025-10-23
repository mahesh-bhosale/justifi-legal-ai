from pypdf import PdfReader
import tempfile
import os

def extract_pdf_text(pdf_path: str) -> str:
    """Extract text from PDF file"""
    try:
        reader = PdfReader(pdf_path)
        pages_text = []
        
        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                pages_text.append(txt)
                
        return "\n\n".join(pages_text).strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""