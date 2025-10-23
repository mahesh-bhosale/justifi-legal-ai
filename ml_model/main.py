from fastapi import FastAPI

from routes import summarize_routes, ask_routes

# Create FastAPI app
app = FastAPI(
    title="Legal AI Assistant",
    description="AI-powered legal document summarization and Q&A",
    version="1.0.0"
)

# Include routers
app.include_router(summarize_routes.router, prefix="/summarize", tags=["Summarization"])
app.include_router(ask_routes.router, prefix="/ask", tags=["Question Answering"])

@app.get("/")
async def root():
    return {
        "message": "Legal AI Assistant API", 
        "endpoints": {
            "summarize_pdf": "/summarize/pdf",
            "summarize_text": "/summarize/text", 
            "ask_pdf": "/ask/pdf",
            "ask_text": "/ask/text"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Legal AI Assistant"}

if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT
    
    print(f"Starting server on {HOST}:{PORT}")
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info"
    )