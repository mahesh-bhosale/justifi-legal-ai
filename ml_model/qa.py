import torch
import re
from model_loader import model, tokenizer
from config import MAX_INPUT_LENGTH

def ask_with_context(question: str, context: str, max_answer_tokens: int = 150) -> str:
    """Answer questions based on provided context"""
    if not context.strip():
        return "No context provided to answer the question."

    try:
        # If model failed to load, return a simple response
        if model is None or tokenizer is None:
            print("Model not loaded, using simple extraction")
            return extract_simple_answer(context, question)

        # Use simple extraction method for better results
        return extract_simple_answer(context, question)

    except Exception as e:
        print(f"QA error: {e}")
        return f"Error generating answer: {str(e)}"

def clean_answer(answer, question):
    """Clean up the generated answer"""
    # Remove common prefixes
    answer = re.sub(r'^(Answer|Based on|According to|The answer is|It is|This is):\s*', '', answer, flags=re.IGNORECASE).strip()
    
    # Remove question repetition
    if question.lower() in answer.lower():
        answer = answer.replace(question, "").strip()
    
    # Clean up extra whitespace
    answer = re.sub(r'\s+', ' ', answer).strip()
    
    # Remove incomplete sentences at the end
    if answer.endswith(('...', '..', '.')):
        answer = answer.rstrip('.')
    
    return answer

def is_incoherent(text):
    """Check if the text is incoherent or irrelevant"""
    incoherent_indicators = [
        "What is it",
        "Answer: It is",
        "In other words",
        "we should always look forward",
        "please consider visiting",
        "Chief Justice of Supreme Court",
        "elevated level below ground"
    ]
    
    text_lower = text.lower()
    for indicator in incoherent_indicators:
        if indicator.lower() in text_lower:
            return True
    
    # Check for very short or repetitive text
    if len(text) < 20 or len(set(text.split())) < 5:
        return True
        
    return False

def extract_simple_answer(context, question):
    """Extract a simple answer from context using keyword matching"""
    try:
        question_lower = question.lower()
        context_sentences = [s.strip() for s in context.split('.') if s.strip()]
        
        # Extract keywords from question
        question_words = [word.lower() for word in question.split() if len(word) > 2]
        
        # Find sentences that contain question keywords
        relevant_sentences = []
        for sentence in context_sentences:
            sentence_lower = sentence.lower()
            # Count how many question words appear in this sentence
            word_matches = sum(1 for word in question_words if word in sentence_lower)
            if word_matches > 0:
                relevant_sentences.append((sentence, word_matches))
        
        if relevant_sentences:
            # Sort by relevance (number of keyword matches) and length
            relevant_sentences.sort(key=lambda x: (x[1], len(x[0])), reverse=True)
            best_sentence = relevant_sentences[0][0]
            return best_sentence.strip()
        
        # Special handling for location questions
        if any(word in question_lower for word in ['location', 'where', 'place', 'address', 'situated', 'located']):
            location_keywords = ['court', 'building', 'street', 'district', 'area', 'location', 'situated', 'located', 'near', 'road']
            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                if any(keyword in sentence_lower for keyword in location_keywords):
                    return sentence.strip()
        
        # Special handling for "when" questions
        if any(word in question_lower for word in ['when', 'date', 'established', 'founded', 'created']):
            time_keywords = ['established', 'founded', 'created', 'date', 'year', 'since', 'in 19', 'in 20']
            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                if any(keyword in sentence_lower for keyword in time_keywords):
                    return sentence.strip()
        
        # Special handling for "what" questions
        if 'what' in question_lower:
            definition_keywords = ['is', 'are', 'means', 'refers to', 'defined as']
            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                if any(keyword in sentence_lower for keyword in definition_keywords):
                    return sentence.strip()
        
        # If no specific match, return the most informative sentence
        if context_sentences:
            # Return the longest sentence that seems informative
            informative_sentences = [s for s in context_sentences if len(s) > 50]
            if informative_sentences:
                return max(informative_sentences, key=len).strip()
            return context_sentences[0].strip()
        
        return "The requested information was not found in the provided context."
        
    except Exception as e:
        return f"Could not extract answer: {str(e)}"