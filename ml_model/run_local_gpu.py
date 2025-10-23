import uvicorn
from pyngrok import ngrok
import nest_asyncio

from config import NGROK_AUTH_TOKEN, PORT, HOST

def start_server_with_ngrok():
    """Start the server with ngrok tunnel for public access"""
    # Apply nest_asyncio for async support
    nest_asyncio.apply()
    
    # Set up ngrok
    if NGROK_AUTH_TOKEN:
        ngrok.set_auth_token(NGROK_AUTH_TOKEN)
        public_url = ngrok.connect(PORT)
        print(f"🚀 Public URL: {public_url.public_url}")
    else:
        print("⚠️  No NGROK token provided - running locally only")
    
    # Start the server
    print(f"Starting server on {HOST}:{PORT}")
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    start_server_with_ngrok()