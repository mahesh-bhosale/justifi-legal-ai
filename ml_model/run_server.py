#!/usr/bin/env python3
"""
Simple launcher script for the Legal AI Assistant
This script avoids import issues by running from the correct directory
"""

import sys
import os

# Add the ml_model directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
ml_model_dir = os.path.join(current_dir, 'ml_model')
sys.path.insert(0, ml_model_dir)

# Change to the ml_model directory
os.chdir(ml_model_dir)

if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT
    
    print(f"Starting Legal AI Assistant server on {HOST}:{PORT}")
    print("Available endpoints:")
    print("   - POST /summarize/pdf - Summarize PDF documents")
    print("   - POST /summarize/text - Summarize text input")
    print("   - POST /ask/pdf - Ask questions about PDF documents")
    print("   - POST /ask/text - Ask questions about text input")
    print("   - GET /health - Health check")
    print("   - GET / - API information")
    print()
    
    try:
        uvicorn.run(
            "main:app",
            host=HOST,
            port=PORT,
            reload=False,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")
        sys.exit(1)
