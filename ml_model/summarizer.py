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
        # Fall back to extractive summarization
        return create_simple_summary_by_level(text, level)

def create_simple_summary_by_level(text: str, level: str) -> str:
    """Create extractive summary with guaranteed complete sentences only"""
    try:
        # Clean and normalize text
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Use a more reliable sentence splitting approach
        sentences = split_sentences_reliably(text)
        
        if not sentences:
            # Fallback: return a clean truncation
            clean_text = text[:400].rsplit('.', 1)[0] + '.' if '.' in text[:400] else text[:400] + '...'
            return f"[Summary] {clean_text}"
        
        # Get the appropriate number of sentences for the level
        sentence_counts = {"short": 3, "medium": 5, "long": 8, "very_long": 12}
        target_count = sentence_counts.get(level, 3)
        
        # Always take complete sentences from the beginning
        summary_sentences = sentences[:min(target_count, len(sentences))]
        
        # Join the sentences
        summary = ' '.join(summary_sentences)
        
        # Ensure the summary ends with proper punctuation
        summary = summary.strip()
        if summary and not summary[-1] in '.!?':
            summary += '.'
            
        return f"[Extractive Summary - {level.title()}] {summary}"
        
    except Exception as e:
        print(f"Summary error: {e}")
        # Final fallback with sentence-aware truncation
        if len(text) > 400:
            # Try to break at the last complete sentence
            last_period = text[:400].rfind('.')
            if last_period > 200:  # Ensure we have reasonable content
                clean_text = text[:last_period + 1]
            else:
                clean_text = text[:400] + '...'
        else:
            clean_text = text
        return f"[Summary] {clean_text}"

def split_sentences_reliably(text: str) -> list:
    """Split text into complete sentences using multiple methods"""
    sentences = []
    
    # Method 1: Use regex to find sentences ending with punctuation
    pattern1 = r'[^.!?]*[.!?]'
    sentences1 = re.findall(pattern1, text)
    
    # Method 2: Split on punctuation followed by space and capital letter
    pattern2 = r'(?<=[.!?])\s+(?=[A-Z])'
    sentences2 = re.split(pattern2, text)
    
    # Choose the method that gives more reasonable results
    if len(sentences1) >= len(sentences2) and sentences1:
        candidate_sentences = sentences1
    else:
        candidate_sentences = sentences2
    
    # Clean and filter sentences
    for sentence in candidate_sentences:
        clean_sentence = sentence.strip()
        # Only include sentences that are reasonably long and complete
        if (len(clean_sentence) > 25 and 
            clean_sentence[-1] in '.!?' and
            not clean_sentence.isdigit()):
            sentences.append(clean_sentence)
    
    # If we still don't have good sentences, try a simpler approach
    if not sentences:
        # Split by periods and reconstruct
        parts = text.split('.')
        reconstructed = []
        current_sentence = ""
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
                
            current_sentence += part + '.'
            # If we have a reasonably long sentence, add it
            if len(current_sentence) > 40:
                reconstructed.append(current_sentence.strip())
                current_sentence = ""
        
        # Add the last sentence if meaningful
        if current_sentence and len(current_sentence) > 20:
            reconstructed.append(current_sentence.strip())
            
        sentences = reconstructed
    
    return sentences

# Alternative SIMPLE version if the above still has issues:
def create_simple_summary_by_level_simple(text: str, level: str) -> str:
    """Very simple but reliable sentence-based summary"""
    try:
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Simple sentence splitting - find all segments that end with punctuation
        sentences = []
        current = ""
        
        for char in text:
            current += char
            if char in '.!?':
                sent = current.strip()
                if len(sent) > 30:  # Only include reasonably long sentences
                    sentences.append(sent)
                current = ""
        
        # Add any remaining text as last sentence if meaningful
        if current.strip() and len(current.strip()) > 30:
            sentences.append(current.strip() + '.')
        
        if not sentences:
            return f"[Summary] {text[:400]}{'...' if len(text) > 400 else ''}"
        
        # Determine how many sentences to take
        level_map = {"short": 2, "medium": 4, "long": 6, "very_long": 8}
        num_sentences = min(level_map.get(level, 2), len(sentences))
        
        summary = ' '.join(sentences[:num_sentences])
        
        return f"[Summary - {level.title()}] {summary}"
        
    except Exception as e:
        return f"[Summary] {text[:500]}{'...' if len(text) > 500 else ''}"

# Export the functions
__all__ = ['summarize_text', 'create_simple_summary_by_level']