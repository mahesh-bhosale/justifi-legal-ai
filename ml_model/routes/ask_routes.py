from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse

from pdf_utils import extract_pdf_text
from qa import ask_with_context
from utils.file_handler import save_uploaded_file, cleanup_file

router = APIRouter()

@router.post("/pdf")
async def ask_pdf(file: UploadFile, question: str = Form(...)):
    # Check if file is provided
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension (case insensitive)
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF (.pdf or .PDF)")
    
    # Check if question is provided
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
    
    temp_path = None
    try:
        temp_path = save_uploaded_file(file)
        text = extract_pdf_text(temp_path)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="PDF is empty or unreadable")
            
        result = ask_with_context(question, text)
        return JSONResponse({"answer": result, "question": question, "filename": file.filename})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    finally:
        if temp_path:
            cleanup_file(temp_path)

@router.post("/text")
async def ask_text(question: str = Form(...), text: str = Form(...)):
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text input is empty")
            
        result = ask_with_context(question, text)
        return JSONResponse({"answer": result, "question": question})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")