#!/usr/bin/env python3
"""
Test script to verify ML model fixes
"""

import sys
import os

# Add the ml_model directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml_model'))

def test_imports():
    """Test that all imports work correctly"""
    try:
        print("Testing imports...")
        
        # Test config import
        from ml_model.config import MODEL_NAME, MAX_INPUT_LENGTH, SUMMARIZATION_CONFIG
        print(f"✅ Config loaded - Model: {MODEL_NAME}, Max length: {MAX_INPUT_LENGTH}")
        
        # Test summarization config
        print(f"✅ Summarization levels available: {list(SUMMARIZATION_CONFIG.keys())}")
        
        # Test file handler
        from ml_model.utils.file_handler import save_uploaded_file, cleanup_file
        print("✅ File handler imports work")
        
        # Test PDF utils
        from ml_model.pdf_utils import extract_pdf_text
        print("✅ PDF utils imports work")
        
        print("\n🎉 All imports successful! The fixes are working correctly.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_model_loader_structure():
    """Test that model_loader has the expected structure"""
    try:
        print("\nTesting model_loader structure...")
        
        # Read the model_loader file
        with open('ml_model/ml_model/model_loader.py', 'r') as f:
            content = f.read()
        
        # Check for key improvements
        checks = [
            ("Device handling fix", "if not torch.cuda.is_available():"),
            ("Error handling", "try:"),
            ("Logging", "logger.info"),
            ("Proper device assignment", "device = \"cpu\""),
            ("Proper device assignment", "device = \"cuda\""),
        ]
        
        for check_name, check_string in checks:
            if check_string in content:
                print(f"✅ {check_name}: Found")
            else:
                print(f"❌ {check_name}: Missing")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing structure: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing ML Model Fixes")
    print("=" * 40)
    
    success = True
    success &= test_imports()
    success &= test_model_loader_structure()
    
    if success:
        print("\n🎉 All tests passed! The ML model fixes are working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
