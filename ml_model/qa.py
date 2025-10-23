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
            print("Model not loaded, returning simple response")
            # Simple keyword-based response
            question_lower = question.lower()
            context_lower = context.lower()
            
            if "what" in question_lower:
                # Look for definitions or explanations
                sentences = context.split('.')
                for sentence in sentences:
                    if any(word in sentence.lower() for word in question_lower.split()):
                        return f"[Simple Answer] {sentence.strip()}"
                return "[Simple Answer] Based on the context, this information is not clearly available."
            
            elif "who" in question_lower or "name" in question_lower:
                # Look for names
                names = re.findall(r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*", context)
                if names:
                    return f"[Simple Answer] Found names: {', '.join(set(names))}"
                return "[Simple Answer] No names found in the context."
            
            else:
                return "[Simple Answer] Based on the context, this question requires AI processing which is currently unavailable."

        # Truncate context to avoid CUDA errors
        if len(context) > 1500:
            context = context[:1500] + "..."
        
        prompt = f"Answer this question based on the context:\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=min(MAX_INPUT_LENGTH, 1024),
            padding=True
        ).to(model.device)

        with torch.no_grad():
            try:
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=min(max_answer_tokens, 150),
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    eos_token_id=tokenizer.eos_token_id,
                    pad_token_id=tokenizer.pad_token_id,
                    repetition_penalty=1.1
                )
            except Exception as cuda_error:
                print(f"CUDA error in Q&A: {cuda_error}")
                return f"[Simple Answer] Based on the context, this question requires AI processing which is currently unavailable due to technical issues."

        # Extract generated text
        generated_tokens = outputs[0][inputs.input_ids.shape[-1]:]
        answer = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

        # Clean up prompt fragments
        answer = re.sub(r'^(Answer|Question|Context):\s*', '', answer, flags=re.IGNORECASE).strip()

        # Name extraction for questions about names
        if "name" in question.lower() or "who" in question.lower():
            names = re.findall(r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*", answer)
            if names:
                return list(set(names))

        return answer if answer else "Could not generate an answer. The question might be too complex or the context insufficient."

    except Exception as e:
        print(f"QA error: {e}")
        return f"Error generating answer: {str(e)}"