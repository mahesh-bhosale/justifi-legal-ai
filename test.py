from transformers import pipeline

pipe = pipeline(
    "text-classification",
    model="vikas-maurya/justifi-inlegalbert-outcome-predictor"
)

text = """
This legal matter concerns appeal proceedings and judicial review.
"""

result = pipe(text)

print(result)