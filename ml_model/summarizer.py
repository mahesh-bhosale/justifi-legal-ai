import torch
import re
from model_loader import model, tokenizer
from config import MAX_INPUT_LENGTH, SUMMARIZATION_CONFIG

def summarize_text(text: str, level: str = "short") -> str:
    """Summarize text with different detail levels"""
    if not text.strip():
        return "No text content found to summarize."

    try:
        # If model failed to load, use simple summarization
        if model is None or tokenizer is None:
            print("Model not loaded, using simple summarization")
            return create_simple_summary_by_level(text, level)

        cfg = SUMMARIZATION_CONFIG.get(level, SUMMARIZATION_CONFIG["short"])
        
        # Truncate text to avoid CUDA errors
        if len(text) > 2000:
            text = text[:2000] + "..."
        
        prompt = f"{cfg['instruction']}\n\n{text}\n\nSummary:"

        # Tokenize input
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=min(MAX_INPUT_LENGTH, 1024),
            padding=True
        ).to(model.device)

        # Generate summary
        with torch.no_grad():
            try:
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=min(cfg["max_new_tokens"], 200),
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    eos_token_id=tokenizer.eos_token_id,
                    pad_token_id=tokenizer.pad_token_id,
                    repetition_penalty=1.1
                )

                # Extract generated text
                generated_tokens = outputs[0][inputs.input_ids.shape[-1]:]
                summary = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

                # Clean up prompt fragments
                summary = re.sub(r'^(Summary|Instruction):\s*', '', summary, flags=re.IGNORECASE).strip()

                if summary and len(summary) > 10:
                    return summary
                else:
                    return create_simple_summary_by_level(text, level)
                    
            except Exception as cuda_error:
                print(f"CUDA error in summarization: {cuda_error}")
                return create_simple_summary_by_level(text, level)

    except Exception as e:
        print(f"Summarization error: {e}")
        return create_simple_summary_by_level(text, level)

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