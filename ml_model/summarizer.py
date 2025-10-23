import torch
import re
from model_loader import generate_summary

def summarize_text(text: str, level: str = "short") -> str:
    """Summarize text with different detail levels using AI model"""
    if not text.strip():
        return "No text content found to summarize."

    try:
        # Use the AI-based summarization
        summary = generate_summary(text, level=level)
        return summary

    except Exception as e:
        print(f"Summarization error: {e}")
        return f"Error generating summary: {str(e)}"

def create_simple_summary_by_level(text: str, level: str) -> str:
    """Create extractive summary based on level"""
    try:
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if not sentences:
            return f"[Extractive Summary] {text[:200]}{'...' if len(text) > 200 else ''}"
        
        # Determine number of sentences based on level
        level_map = {
            "short": 2,
            "medium": 4,
            "long": 6,
            "very_long": 8
        }
        
        num_sentences = level_map.get(level, 2)
        summary_sentences = sentences[:min(num_sentences, len(sentences))]
        summary = '. '.join(summary_sentences) + '.'
        
        return f"[Extractive Summary - {level.title()}] {summary}"
    except:
        return f"[Extractive Summary] {text[:200]}{'...' if len(text) > 200 else ''}"