from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import os

from pdf_utils import extract_pdf_text
from summarizer import summarize_text
from utils.file_handler import save_uploaded_file, cleanup_file

router = APIRouter()

@router.post("/pdf")
async def summarize_pdf(file: UploadFile, level: str = Form("short")):
    # Check if file is provided
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension (case insensitive)
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF (.pdf or .PDF)")
    
    # Validate level parameter
    valid_levels = ["short", "medium", "long", "very_long"]
    if level not in valid_levels:
        raise HTTPException(status_code=400, detail=f"Level must be one of: {', '.join(valid_levels)}")
    
    temp_path = None
    try:
        temp_path = save_uploaded_file(file)
        text = extract_pdf_text(temp_path)
        
        if not text.strip():
            # Provide more specific error message
            raise HTTPException(
                status_code=400, 
                detail="PDF is empty, unreadable, or contains only images. Please ensure the PDF contains selectable text."
            )
            
        result = summarize_text(text, level)
        return JSONResponse({"summary": result, "level": level, "filename": file.filename})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    finally:
        if temp_path:
            cleanup_file(temp_path)

@router.post("/pdf-diagnostic")
async def diagnose_pdf(file: UploadFile):
    """Diagnostic endpoint to help debug PDF processing issues"""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF (.pdf or .PDF)")
    
    temp_path = None
    try:
        temp_path = save_uploaded_file(file)
        
        # Get file info
        file_size = os.path.getsize(temp_path)
        
        # Try to extract text
        text = extract_pdf_text(temp_path)
        text_length = len(text) if text else 0
        
        # Try to get PDF info
        from pypdf import PdfReader
        reader = PdfReader(temp_path)
        total_pages = len(reader.pages)
        
        return JSONResponse({
            "filename": file.filename,
            "file_size_bytes": file_size,
            "total_pages": total_pages,
            "text_extracted": text_length > 0,
            "text_length": text_length,
            "preview_text": text[:200] + "..." if text and len(text) > 200 else text,
            "status": "success" if text_length > 0 else "no_text_found"
        })
        
    except Exception as e:
        return JSONResponse({
            "filename": file.filename,
            "error": str(e),
            "error_type": type(e).__name__,
            "status": "error"
        })
    finally:
        if temp_path:
            cleanup_file(temp_path)

@router.post("/text")
async def summarize_text_input(text: str = Form(...), level: str = Form("short")):
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text input is empty")
            
        result = summarize_text(text, level)
        return JSONResponse({"summary": result, "level": level})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")