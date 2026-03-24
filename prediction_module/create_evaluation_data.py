import pandas as pd
import torch
import time
from tqdm import tqdm
from prediction import chunk_predict

def predict_document(text):
    result = chunk_predict(text)
    return {
        "prediction": result["prediction"],
        "confidence": result["confidence"]
    }

# Load test dataset
df_test = pd.read_csv("E:\\final year project\\justifi-legal-ai\\datasets\\binary_test\\CJPE_ext_SCI_HCs_Tribunals_daily_orders_test.csv")
df_test = df_test.sample(2000, random_state=42)
df_test = df_test[['text', 'label']].dropna()

results = []

for _, row in tqdm(df_test.iterrows(), total=len(df_test)):
    text = str(row["text"])
    y_true = int(row["label"])
    doc_length = len(text)

    start_time = time.time()
    result = predict_document(text)
    end_time = time.time()

    response_time_ms = (end_time - start_time) * 1000

    y_pred = 1 if result["prediction"] == "ACCEPT" else 0
    y_prob = result["confidence"]

    results.append([
        y_true,
        y_pred,
        y_prob,
        response_time_ms,
        doc_length
    ])

eval_df = pd.DataFrame(results, columns=[
    "y_true",
    "y_pred",
    "y_prob",
    "response_time_ms",
    "doc_length"
])

eval_df.to_csv("evaluation_data.csv", index=False)

print("evaluation_data.csv created successfully")