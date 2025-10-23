import os
import torch
import logging
from transformers import AutoTokenizer, AutoModelForQuestionAnswering, AutoModelForSeq2SeqLM, BitsAndBytesConfig

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use a more appropriate model for question answering
MODEL_NAME = "distilbert-base-cased-distilled-squad"  # Better for Q&A tasks
SUMMARIZATION_MODEL_NAME = "facebook/bart-large-cnn"  # Better for summarization

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
        
        # Truncate text to avoid memory issues
        if len(text) > 4000:
            text = text[:4000] + "..."
        
        # Tokenize input
        inputs = summarization_tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=1024,
            padding=True
        ).to(device)
        
        with torch.inference_mode():
            try:
                # Generate summary based on level
                level_configs = {
                    "short": {"max_length": 50, "min_length": 20},
                    "medium": {"max_length": 100, "min_length": 40},
                    "long": {"max_length": 200, "min_length": 80},
                    "very_long": {"max_length": 300, "min_length": 120}
                }
                
                config = level_configs.get(level, level_configs["short"])
                
                output_tokens = summarization_model.generate(
                    **inputs,
                    max_length=config["max_length"],
                    min_length=config["min_length"],
                    do_sample=False,  # Use greedy decoding for better consistency
                    num_beams=4,  # Use beam search for better quality
                    early_stopping=True,
                    no_repeat_ngram_size=2,
                    pad_token_id=summarization_tokenizer.pad_token_id,
                    eos_token_id=summarization_tokenizer.eos_token_id
                )
                
                # Decode the generated summary
                summary = summarization_tokenizer.decode(output_tokens[0], skip_special_tokens=True).strip()
                
                if summary and len(summary) > 10:
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
        # Split into sentences
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
