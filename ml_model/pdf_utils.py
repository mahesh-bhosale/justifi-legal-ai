from pypdf import PdfReader
import tempfile
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_pdf_text(pdf_path: str) -> str:
    """Extract text from PDF file with enhanced error handling"""
    try:
        logger.info(f"Attempting to extract text from PDF: {pdf_path}")
        
        # Check if file exists and is readable
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file does not exist: {pdf_path}")
            return ""
        
        file_size = os.path.getsize(pdf_path)
        logger.info(f"PDF file size: {file_size} bytes")
        
        if file_size == 0:
            logger.error("PDF file is empty")
            return ""
        
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        logger.info(f"PDF has {total_pages} pages")
        
        if total_pages == 0:
            logger.error("PDF has no pages")
            return ""
        
        pages_text = []
        pages_with_text = 0
        
        for page_num, page in enumerate(reader.pages):
            try:
                txt = page.extract_text()
                if txt and txt.strip():
                    pages_text.append(txt.strip())
                    pages_with_text += 1
                    logger.info(f"Extracted text from page {page_num + 1}: {len(txt)} characters")
                else:
                    logger.warning(f"No text found on page {page_num + 1}")
            except Exception as page_error:
                logger.error(f"Error extracting text from page {page_num + 1}: {page_error}")
                continue
        
        if pages_with_text == 0:
            logger.error("No text could be extracted from any page")
            return ""
        
        result = "\n\n".join(pages_text).strip()
        logger.info(f"Successfully extracted {len(result)} characters from {pages_with_text} pages")
        
        return result
        
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        return ""