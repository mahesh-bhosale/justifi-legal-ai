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
            # Provide more specific error message
            raise HTTPException(
                status_code=400, 
                detail="PDF is empty, unreadable, or contains only images. Please ensure the PDF contains selectable text."
            )
            
        result = ask_with_context(question, text)
        return JSONResponse({"answer": result, "question": question, "filename": file.filename})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    finally:
        if temp_path:
            cleanup_file(temp_path)

@router.post("/pdf-debug")
async def debug_pdf_qa(file: UploadFile, question: str = Form(...)):
    """Debug endpoint to see what text is extracted and how QA processes it"""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF (.pdf or .PDF)")
    
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
    
    temp_path = None
    try:
        temp_path = save_uploaded_file(file)
        text = extract_pdf_text(temp_path)
        
        if not text.strip():
            raise HTTPException(
                status_code=400, 
                detail="PDF is empty, unreadable, or contains only images. Please ensure the PDF contains selectable text."
            )
        
        # Get some sample text for debugging
        sample_text = text[:500] + "..." if len(text) > 500 else text
        
        # Process the question
        result = ask_with_context(question, text)
        
        return JSONResponse({
            "question": question,
            "filename": file.filename,
            "text_length": len(text),
            "sample_text": sample_text,
            "answer": result,
            "debug_info": {
                "question_words": [word.lower() for word in question.split() if len(word) > 2],
                "text_sentences_count": len([s.strip() for s in text.split('.') if s.strip()]),
                "contains_high_court": 'high court' in text.lower(),
                "contains_location_words": any(word in text.lower() for word in ['court', 'building', 'street', 'district', 'area', 'location', 'situated', 'located'])
            }
        })
        
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