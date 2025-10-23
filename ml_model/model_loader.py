import os
import torch
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use a more appropriate model for text generation
MODEL_NAME = "distilgpt2"  # Better for text generation tasks

os.makedirs("offload_folder", exist_ok=True)

logger.info("Loading simplified model for testing...")

try:
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    logger.info("✅ Tokenizer loaded successfully")
    
    # Load model (simplified approach)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Using device: {device}")
    
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float32 if device == "cpu" else torch.float16,
        low_cpu_mem_usage=True,
    )
    
    model = model.to(device)
    logger.info(f"✅ Model loaded successfully on: {device.upper()}")
    
except Exception as e:
    logger.error(f"❌ Failed to load model: {e}")
    # Create dummy model for testing
    logger.info("Creating dummy model for testing...")
    device = "cpu"
    model = None
    tokenizer = None

def generate_summary(text, max_new_tokens=150):
    """Generate summary with error handling"""
    try:
        if not text.strip():
            return "No text provided for summarization."
        
        # If model failed to load, return a simple summary
        if model is None or tokenizer is None:
            logger.warning("Model not loaded, returning simple summary")
            return create_simple_summary(text)
        
        # Truncate text to avoid CUDA errors
        if len(text) > 2000:
            text = text[:2000] + "..."
        
        # Create a proper prompt for summarization
        prompt = f"Summarize the following text:\n\n{text}\n\nSummary:"
        
        inputs = tokenizer(
            prompt, 
            return_tensors="pt", 
            truncation=True, 
            max_length=1024,
            padding=True
        ).to(device)
        
        with torch.inference_mode():
            try:
                output_tokens = model.generate(
                    **inputs,
                    max_new_tokens=min(max_new_tokens, 200),  # Limit tokens
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    pad_token_id=tokenizer.eos_token_id,
                    eos_token_id=tokenizer.eos_token_id,
                    repetition_penalty=1.1
                )
                
                # Decode only the new tokens
                generated_tokens = output_tokens[0][inputs.input_ids.shape[-1]:]
                summary = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()
                
                # Clean up the summary
                summary = summary.replace("Summary:", "").strip()
                summary = summary.replace("The following text:", "").strip()
                
                if summary and len(summary) > 10:
                    return summary
                else:
                    return create_simple_summary(text)
                    
            except Exception as cuda_error:
                logger.warning(f"CUDA error in generation: {cuda_error}")
                return create_simple_summary(text)
        
    except Exception as e:
        logger.error(f"Error in generate_summary: {e}")
        return create_simple_summary(text)

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
