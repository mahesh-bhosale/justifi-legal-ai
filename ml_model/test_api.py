#!/usr/bin/env python3
"""
Test script for the Legal AI Assistant API
"""

import requests
import json
import time

def test_api():
    base_url = "http://localhost:8000"
    
    print("Testing Legal AI Assistant API...")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("[PASS] Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"[FAIL] Health check failed: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Health check error: {e}")
        return
    
    # Test 2: Text summarization
    print("\n2. Testing text summarization...")
    test_text = """
    This is a legal contract between John Smith and ABC Corporation dated January 1, 2024. 
    The contract outlines the terms of employment including salary, benefits, and working hours. 
    John Smith agrees to work as a software engineer for a period of two years. 
    The salary is set at $80,000 per year with health insurance and paid vacation. 
    Both parties agree to the terms and conditions outlined in this agreement.
    """
    
    try:
        response = requests.post(
            f"{base_url}/summarize/text",
            data={
                "text": test_text,
                "level": "short"
            }
        )
        if response.status_code == 200:
            result = response.json()
            print("[PASS] Text summarization passed")
            print(f"   Summary: {result['summary']}")
        else:
            print(f"[FAIL] Text summarization failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"[ERROR] Text summarization error: {e}")
    
    # Test 3: Question answering
    print("\n3. Testing question answering...")
    try:
        response = requests.post(
            f"{base_url}/ask/text",
            data={
                "text": test_text,
                "question": "What is the salary mentioned in the contract?"
            }
        )
        if response.status_code == 200:
            result = response.json()
            print("[PASS] Question answering passed")
            print(f"   Answer: {result['answer']}")
        else:
            print(f"[FAIL] Question answering failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"[ERROR] Question answering error: {e}")
    
    # Test 4: API info
    print("\n4. Testing API info endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            result = response.json()
            print("[PASS] API info passed")
            print(f"   Available endpoints: {list(result['endpoints'].keys())}")
        else:
            print(f"[FAIL] API info failed: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] API info error: {e}")
    
    print("\n" + "=" * 50)
    print("API testing completed!")

if __name__ == "__main__":
    test_api()
