# Legal AI Assistant - Usage Guide

## ✅ Problem Solved!

The terminal errors have been resolved and the API is now working correctly.

## 🚀 How to Run the Server

1. **Start the server:**
   ```bash
   cd ml_model
   python run_server.py
   ```

2. **The server will start on:** `http://localhost:8000`

## 📝 Available API Endpoints

### 1. Text Summarization
**POST** `/summarize/text`
- **Parameters:**
  - `text` (string): The text to summarize
  - `level` (string): Summary level - "short", "medium", "long", "very_long"

**Example:**
```bash
curl -X POST "http://localhost:8000/summarize/text" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=Your legal document text here&level=short"
```

### 2. PDF Summarization
**POST** `/summarize/pdf`
- **Parameters:**
  - `file` (file): PDF file to upload
  - `level` (string): Summary level

**Example:**
```bash
curl -X POST "http://localhost:8000/summarize/pdf" \
  -F "file=@document.pdf" \
  -F "level=short"
```

### 3. Text Question Answering
**POST** `/ask/text`
- **Parameters:**
  - `text` (string): The text to ask questions about
  - `question` (string): Your question

**Example:**
```bash
curl -X POST "http://localhost:8000/ask/text" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=Your legal document text&question=What is the main issue?"
```

### 4. PDF Question Answering
**POST** `/ask/pdf`
- **Parameters:**
  - `file` (file): PDF file to upload
  - `question` (string): Your question

### 5. Health Check
**GET** `/health`
- Returns server status

### 6. API Information
**GET** `/`
- Returns available endpoints

## 🧪 Testing

Run the test script to verify everything works:
```bash
python test_api.py
```

## 🔧 What Was Fixed

1. **Disk Space Issues**: Switched to a smaller, more reliable model
2. **Import Errors**: Fixed all relative import issues
3. **PyTorch Security**: Updated to use safetensors format
4. **Missing Dependencies**: Added python-multipart for form data
5. **Model Loading**: Simplified model loading with fallback options
6. **Error Handling**: Added comprehensive error handling

## 📊 Current Status

- ✅ Server starts successfully
- ✅ All API endpoints respond correctly
- ✅ Text summarization works
- ✅ Question answering works
- ✅ PDF processing endpoints are available
- ✅ Health check works
- ✅ Error handling is robust

## 🎯 Next Steps

1. **For Production**: Consider switching back to the original legal model once you have more disk space
2. **For Better Results**: The current model is basic - for legal-specific tasks, use the original model
3. **For Scaling**: The server can handle multiple requests simultaneously

The API is now fully functional and ready to use!
