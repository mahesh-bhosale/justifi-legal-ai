import torch
import re
from model_loader import model, tokenizer, answer_question
from config import MAX_INPUT_LENGTH

def ask_with_context(question: str, context: str, max_answer_tokens: int = 150) -> str:
    """Answer questions based on provided context using AI model"""
    if not context.strip():
        return "No context provided to answer the question."

    try:
        # Use the AI model for question answering
        answer = answer_question(question, context, max_answer_tokens)
        
        # Clean up the answer
        answer = clean_answer(answer, question)
        
        # Check if answer is coherent
        if is_incoherent(answer):
            # Try fallback method
            fallback_answer = extract_simple_answer(context, question)
            if not is_incoherent(fallback_answer):
                return fallback_answer
        
        return answer

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

def extract_location_info(context, question):
    """Extract location information using regex patterns"""
    try:
        # Look for common location patterns
        location_patterns = [
            r'located at\s+([^.]*)',
            r'situated at\s+([^.]*)',
            r'address[:\s]+([^.]*)',
            r'at\s+([A-Z][^.]*?(?:street|road|avenue|building|complex|center|centre|premises|chamber|hall))',
            r'in\s+([A-Z][^.]*?(?:district|city|state|area))',
            r'high court\s+([^.]*?(?:at|in|located|situated)[^.]*)',
        ]
        
        for pattern in location_patterns:
            matches = re.findall(pattern, context, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        return None
    except Exception as e:
        return None

def extract_simple_answer(context, question):
    """Extract a simple answer from context using improved keyword matching"""
    try:
        question_lower = question.lower()
        context_sentences = [s.strip() for s in context.split('.') if s.strip()]
        
        # Extract keywords from question
        question_words = [word.lower() for word in question.split() if len(word) > 2]
        
        # Special handling for location questions - try regex patterns first
        if any(word in question_lower for word in ['location', 'where', 'place', 'address', 'situated', 'located']):
            # Try regex-based location extraction
            location_info = extract_location_info(context, question)
            if location_info:
                return location_info
        
        # Special handling for location questions - prioritize these
        if any(word in question_lower for word in ['location', 'where', 'place', 'address', 'situated', 'located']):
            # First, look for sentences that explicitly mention location of high court
            high_court_location_sentences = []
            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                # Check if sentence mentions high court AND location
                if 'high court' in sentence_lower and any(loc_word in sentence_lower for loc_word in ['at', 'in', 'located', 'situated', 'district', 'city', 'state', 'address', 'building', 'premises']):
                    high_court_location_sentences.append(sentence)
            
            if high_court_location_sentences:
                return high_court_location_sentences[0].strip()
            
            # If no specific high court location found, look for any location information
            location_keywords = [
                'court', 'building', 'street', 'district', 'area', 'location', 'situated', 'located', 
                'near', 'road', 'avenue', 'place', 'city', 'state', 'country', 'address', 'premises',
                'chamber', 'hall', 'complex', 'center', 'centre', 'office', 'headquarters', 'at', 'in'
            ]
            
            # Look for sentences with location information
            location_sentences = []
            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                location_matches = sum(1 for keyword in location_keywords if keyword in sentence_lower)
                if location_matches > 0:
                    location_sentences.append((sentence, location_matches))
            
            if location_sentences:
                # Sort by number of location keyword matches
                location_sentences.sort(key=lambda x: x[1], reverse=True)
                return location_sentences[0][0].strip()
        
        # Special handling for "high court" questions
        if 'high court' in question_lower:
            # Look for sentences that mention high court with location context
            high_court_sentences = []
            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                if 'high court' in sentence_lower:
                    # Check if this sentence contains location information
                    if any(loc_word in sentence_lower for loc_word in ['at', 'in', 'located', 'situated', 'district', 'city', 'state', 'address', 'building', 'premises']):
                        high_court_sentences.append(sentence)
            
            if high_court_sentences:
                return high_court_sentences[0].strip()
            
            # If no location context, just return any sentence with high court
            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                if 'high court' in sentence_lower:
                    return sentence.strip()
        
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
            # For location questions, avoid generic legal text
            if any(word in question_lower for word in ['location', 'where', 'place', 'address', 'situated', 'located']):
                # Filter out sentences that are clearly not about location
                non_location_indicators = ['rent', 'eviction', 'tenant', 'landlord', 'payment', 'arrears', 'decree', 'suit', 'defendant', 'plaintiff', 'act', 'provision']
                location_sentences = []
                for sentence in context_sentences:
                    sentence_lower = sentence.lower()
                    # Skip sentences that are clearly about rent/eviction
                    if not any(indicator in sentence_lower for indicator in non_location_indicators):
                        location_sentences.append(sentence)
                
                if location_sentences:
                    return location_sentences[0].strip()
                else:
                    return "No specific location information found in the document."
            
            # Return the longest sentence that seems informative
            informative_sentences = [s for s in context_sentences if len(s) > 50]
            if informative_sentences:
                return max(informative_sentences, key=len).strip()
            return context_sentences[0].strip()
        
        return "The requested information was not found in the provided context."
        
    except Exception as e:
        return f"Could not extract answer: {str(e)}"