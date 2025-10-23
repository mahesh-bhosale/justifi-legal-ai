from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse

from pdf_utils import extract_pdf_text
from summarizer import summarize_text
from utils.file_handler import save_uploaded_file, cleanup_file

router = APIRouter()

@router.post("/pdf")
async def summarize_pdf(file: UploadFile, level: str = Form("short")):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    temp_path = None
    try:
        temp_path = save_uploaded_file(file)
        text = extract_pdf_text(temp_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="PDF is empty or unreadable")
            
        result = summarize_text(text, level)
        return JSONResponse({"summary": result, "level": level})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
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