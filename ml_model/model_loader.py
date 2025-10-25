import os
import torch
import logging
import re
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, AutoModelForSeq2SeqLM, BitsAndBytesConfig

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use a more appropriate model for question answering
MODEL_NAME = "distilbert-base-cased-distilled-squad"  # Better for Q&A tasks
SUMMARIZATION_MODEL_NAME = "pszemraj/led-large-book-summary"  # Better for summarization

os.makedirs("offload_folder", exist_ok=True)

logger.info("Loading models for testing...")

# Initialize variables
model = None
tokenizer = None
summarization_model = None
summarization_tokenizer = None
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {device}")

try:
    # Load QA model
    logger.info("Loading QA model...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    logger.info("✅ QA Tokenizer loaded successfully")
    
    model = AutoModelForQuestionAnswering.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float32 if device == "cpu" else torch.float16,
        low_cpu_mem_usage=True,
    )
    model = model.to(device)
    logger.info(f"✅ QA Model loaded successfully on: {device.upper()}")
    
except Exception as e:
    logger.error(f"❌ Failed to load QA model: {e}")
    model = None
    tokenizer = None

try:
    # Load summarization model
    logger.info("Loading summarization model...")
    summarization_tokenizer = AutoTokenizer.from_pretrained(SUMMARIZATION_MODEL_NAME)
    logger.info("✅ Summarization Tokenizer loaded successfully")
    
    summarization_model = AutoModelForSeq2SeqLM.from_pretrained(
        SUMMARIZATION_MODEL_NAME,
        torch_dtype=torch.float32 if device == "cpu" else torch.float16,
        low_cpu_mem_usage=True,
    )
    summarization_model = summarization_model.to(device)
    logger.info(f"✅ Summarization Model loaded successfully on: {device.upper()}")
    
except Exception as e:
    logger.error(f"❌ Failed to load summarization model: {e}")
    summarization_model = None
    summarization_tokenizer = None

def generate_summary(text, max_new_tokens=150, level="short"):
    """Generate summary using proper summarization model"""
    try:
        if not text.strip():
            return "No text provided for summarization."
        
        # If summarization model failed to load, use fallback
        if summarization_model is None or summarization_tokenizer is None:
            logger.warning("Summarization model not loaded, using fallback")
            return create_simple_summary_by_level(text, level)
        
        # Truncate text to avoid memory issues (increased limit)
        if len(text) > 8000:
            text = text[:8000] + "..."
        
        # Tokenize input with higher max_length
        inputs = summarization_tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=2048,  # Increased from 1024
            padding=True
        ).to(device)
        
        with torch.inference_mode():
            try:
                # Generate summary based on level (significantly increased lengths)
                level_configs = {
                    "short": {"max_length": 200, "min_length": 90},
                    "medium": {"max_length": 400, "min_length": 250},
                    "long": {"max_length": 900, "min_length": 500},
                    "very_long": {"max_length": 1500, "min_length": 750}
                }
                
                config = level_configs.get(level, level_configs["short"])
                
                # Special handling for LED model - it needs different parameters
                generation_kwargs = {
                    "max_new_tokens": config["max_length"],
                    "min_new_tokens": config["min_length"],
                    "do_sample": True,
                    "temperature": 0.9,
                    "top_p": 0.95,
                    "top_k": 50,
                    "num_beams": 3,
                    "length_penalty": 1.0,  # Neutral length penalty
                    "no_repeat_ngram_size": 2,
                    "early_stopping": False,  # CRITICAL: Don't stop early
                    "pad_token_id": summarization_tokenizer.pad_token_id,
                    "eos_token_id": summarization_tokenizer.eos_token_id,
                    "repetition_penalty": 1.05
                }
                
                # For LED model, we need to handle global_attention_mask
                if hasattr(inputs, 'global_attention_mask') or 'global_attention_mask' in inputs:
                    # LED model expects global attention mask
                    try:
                        global_attention_mask = torch.zeros(
                            inputs['input_ids'].shape, 
                            dtype=torch.long,
                            device=inputs['input_ids'].device
                        )
                        # Set first token to 1 for global attention
                        global_attention_mask[:, 0] = 1
                        generation_kwargs['global_attention_mask'] = global_attention_mask
                    except Exception as e:
                        logger.warning(f"Could not set global_attention_mask: {e}")
                
                output_tokens = summarization_model.generate(**inputs, **generation_kwargs)


                
                # Decode the generated summary
                summary = summarization_tokenizer.decode(output_tokens[0], skip_special_tokens=True).strip()
                
                # Post-process to ensure the summary doesn't cut off mid-sentence
                if summary and len(summary) > 10:
                    # Check if summary ends with incomplete sentence
                    if not summary.endswith(('.', '!', '?')):
                        # Try to find the last complete sentence
                        last_punct = max(
                            summary.rfind('.'),
                            summary.rfind('!'),
                            summary.rfind('?')
                        )
                        
                        if last_punct > 0 and last_punct > len(summary) * 0.8:
                            # Use the last complete sentence
                            summary = summary[:last_punct + 1]
                        else:
                            # If we can't find a good sentence boundary, try to complete it
                            # Look for the last word and see if we can add context
                            words = summary.split()
                            if len(words) > 5:
                                # Take the last few words and see if we can find them in the original text
                                last_words = ' '.join(words[-5:])
                                # Try to find a complete sentence in the original text that contains these words
                                pattern = re.escape(last_words) + r'.*?[.!?]'
                                match = re.search(pattern, text, re.IGNORECASE)
                                if match:
                                    # Found a complete sentence, use it
                                    complete_sentence = match.group(0)
                                    # Replace the incomplete ending with the complete sentence
                                    summary = summary[:summary.rfind(last_words)] + complete_sentence
                                else:
                                    # Just add a period
                                    summary += '.'
                            else:
                                summary += '.'
                    
                    # Ensure we have at least the minimum length
                    if len(summary.split()) < config["min_length"] / 10:  # rough word count check
                        logger.warning("Generated summary too short, using fallback")
                        return create_simple_summary_by_level(text, level)
                    
                    return summary
                else:
                    return create_simple_summary_by_level(text, level)
                    
            except Exception as cuda_error:
                logger.warning(f"CUDA error in summarization: {cuda_error}")
                return create_simple_summary_by_level(text, level)
        
    except Exception as e:
        logger.error(f"Error in generate_summary: {e}")
        return create_simple_summary_by_level(text, level)

def answer_question(question, context, max_answer_length=100):
    """Answer a question based on the given context using the QA model"""
    try:
        if not context.strip():
            return "No context provided to answer the question."
        
        if not question.strip():
            return "No question provided."
        
        # If model failed to load, use fallback
        if model is None or tokenizer is None:
            logger.warning("Model not loaded, using fallback QA")
            return fallback_qa(question, context)
        
        # Truncate context if too long
        if len(context) > 2000:
            context = context[:2000] + "..."
        
        # Tokenize inputs
        inputs = tokenizer(
            question,
            context,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        ).to(device)
        
        with torch.inference_mode():
            try:
                outputs = model(**inputs)
                start_scores = outputs.start_logits
                end_scores = outputs.end_logits
                
                # Get the most likely answer
                start_idx = torch.argmax(start_scores)
                end_idx = torch.argmax(end_scores)
                
                # Ensure end_idx >= start_idx
                if end_idx < start_idx:
                    end_idx = start_idx
                
                # Extract answer tokens
                answer_tokens = inputs.input_ids[0][start_idx:end_idx + 1]
                answer = tokenizer.decode(answer_tokens, skip_special_tokens=True)
                
                # Clean up the answer
                answer = answer.strip()
                
                if answer and len(answer) > 2:
                    return answer
                else:
                    return fallback_qa(question, context)
                    
            except Exception as cuda_error:
                logger.warning(f"CUDA error in QA: {cuda_error}")
                return fallback_qa(question, context)
        
    except Exception as e:
        logger.error(f"Error in answer_question: {e}")
        return fallback_qa(question, context)

def fallback_qa(question, context):
    """Fallback QA method when model is not available"""
    try:
        question_lower = question.lower()
        context_sentences = [s.strip() for s in context.split('.') if s.strip()]
        
        # Extract keywords from question
        question_words = [word.lower() for word in question.split() if len(word) > 2]
        
        # Find sentences that contain question keywords
        relevant_sentences = []
        for sentence in context_sentences:
            sentence_lower = sentence.lower()
            word_matches = sum(1 for word in question_words if word in sentence_lower)
            if word_matches > 0:
                relevant_sentences.append((sentence, word_matches))
        
        if relevant_sentences:
            # Sort by relevance
            relevant_sentences.sort(key=lambda x: x[1], reverse=True)
            return relevant_sentences[0][0].strip()
        
        # If no specific match, return the most informative sentence
        if context_sentences:
            informative_sentences = [s for s in context_sentences if len(s) > 50]
            if informative_sentences:
                return max(informative_sentences, key=len).strip()
            return context_sentences[0].strip()
        
        return "The requested information was not found in the provided context."
        
    except Exception as e:
        return f"Could not extract answer: {str(e)}"

def create_simple_summary_by_level(text, level="short"):
    """Create a simple extractive summary based on level"""
    try:
        import re
        
        # Clean and normalize text first
        text = re.sub(r'\s+', ' ', text.strip())  # Normalize whitespace
        
        # Better sentence splitting - handle various sentence endings
        sentence_endings = r'[.!?]+'
        sentences = re.split(sentence_endings, text)
        
        # Clean and filter sentences
        clean_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 15 and not sentence.isdigit():  # Filter out very short sentences and numbers
                clean_sentences.append(sentence)
        
        if not clean_sentences:
            return f"[Extractive Summary] {text[:300]}{'...' if len(text) > 300 else ''}"
        
        # Determine number of sentences based on level (increased significantly)
        level_map = {
            "short": 5,
            "medium": 10,
            "long": 20,
            "very_long": 35
        }
        
        num_sentences = level_map.get(level, 5)
        
        # Smart sentence selection for better coverage
        if len(clean_sentences) <= num_sentences:
            summary_sentences = clean_sentences
        else:
            if level == "short":
                # For short, take first few sentences
                summary_sentences = clean_sentences[:num_sentences]
            elif level == "medium":
                # For medium, take from beginning and middle
                mid_point = len(clean_sentences) // 2
                summary_sentences = clean_sentences[:num_sentences//2] + clean_sentences[mid_point:mid_point + num_sentences//2]
            else:
                # For long summaries, distribute across the text
                step = max(1, len(clean_sentences) // num_sentences)
                summary_sentences = []
                for i in range(0, len(clean_sentences), step):
                    if len(summary_sentences) >= num_sentences:
                        break
                    summary_sentences.append(clean_sentences[i])
        
        # Join sentences and ensure proper punctuation
        summary = '. '.join(summary_sentences)
        
        # Ensure proper ending
        if summary and not summary.endswith(('.', '!', '?')):
            summary += '.'
        
        return f"[Extractive Summary - {level.title()}] {summary}"
    except Exception as e:
        return f"[Extractive Summary] {text[:300]}{'...' if len(text) > 300 else ''}"

def create_simple_summary(text):
    """Create a simple extractive summary"""
    try:
        # Split into sentences
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if len(sentences) <= 3:
            return f"[Extractive Summary] {text[:300]}{'...' if len(text) > 300 else ''}"
        
        # Take first 2-3 sentences as summary
        summary_sentences = sentences[:3]
        summary = '. '.join(summary_sentences) + '.'
        
        return f"[Extractive Summary] {summary}"
    except:
        return f"[Extractive Summary] {text[:200]}{'...' if len(text) > 200 else ''}"
