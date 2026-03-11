import re
from typing import List


def _split_into_sentences(text: str) -> List[str]:
    """
    Lightweight sentence splitter for legal text.

    This avoids external heavy dependencies and works reasonably well for
    research/demo purposes.
    """
    # Normalize whitespace
    normalized = re.sub(r"\s+", " ", text.strip())
    if not normalized:
        return []

    # Split on sentence enders while keeping them attached
    parts = re.split(r"([.!?])\s+", normalized)
    sentences: List[str] = []
    current = ""

    for i in range(0, len(parts), 2):
        chunk = parts[i].strip()
        if not chunk:
            continue
        end = parts[i + 1] if i + 1 < len(parts) else ""
        sentence = (chunk + end).strip()
        if sentence:
            sentences.append(sentence)

    return sentences


def _score_sentence(sentence: str) -> float:
    """
    Heuristic importance score for a sentence.

    Approximates "influence" using:
    - presence of strong legal / outcome-related terms
    - sentence length (very short or extremely long sentences are down-weighted)
    """
    s = sentence.lower()

    keywords_positive = [
        "accept",
        "granted",
        "allowed",
        "upheld",
        "in favour of",
        "sufficient evidence",
    ]
    keywords_negative = [
        "reject",
        "dismissed",
        "failed",
        "insufficient",
        "no merit",
        "without merit",
        "no evidence",
        "lack of",
    ]
    keywords_procedural = [
        "jurisdiction",
        "constitutional",
        "violation",
        "precedent",
        "previous judgments",
        "binding",
    ]

    score = 0.0

    for kw in keywords_positive:
        if kw in s:
            score += 2.0
    for kw in keywords_negative:
        if kw in s:
            score += 2.0
    for kw in keywords_procedural:
        if kw in s:
            score += 1.5

    # Length-based adjustment
    length = len(sentence.split())
    if length < 5:
        score *= 0.3
    elif length < 10:
        score *= 0.6
    elif length > 60:
        score *= 0.7
    else:
        score *= 1.0

    # Small base term so non-keyword but reasonably sized sentences aren't all zero
    score += min(max(length / 40.0, 0.0), 0.5)

    return score


def generate_explanation(text: str, top_k: int = 3) -> List[str]:
    """
    Extract top influential sentences from the document.

    This function is model-agnostic and uses heuristics over the raw text to
    approximate which sentences are most decisive for the outcome. It is
    designed for Explainable AI visualisations / summaries and returns a list
    of sentences:

        {
          "explanation": [
            "The petitioner failed to provide sufficient legal evidence.",
            "Previous judgments in similar cases were rejected.",
            "The appeal does not establish constitutional violation."
          ]
        }
    """
    sentences = _split_into_sentences(text)
    if not sentences:
        return []

    scored = [(s, _score_sentence(s)) for s in sentences]
    # Sort by descending score and keep top_k unique sentences
    scored.sort(key=lambda x: x[1], reverse=True)

    seen = set()
    top_sentences: List[str] = []
    for sentence, score in scored:
        normalized = sentence.strip()
        if not normalized or normalized.lower() in seen:
            continue
        seen.add(normalized.lower())
        top_sentences.append(normalized)
        if len(top_sentences) >= top_k:
            break

    return top_sentences

