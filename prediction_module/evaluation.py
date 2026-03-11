"""
Offline model evaluation and visualization utilities for the prediction module.

Expected input:
    prediction_module/evaluation_data.csv

Required columns:
    - epoch              : int, training epoch index
    - y_true             : int or str, ground-truth label (0/1 or REJECT/ACCEPT)
    - y_pred             : int or str, predicted label (0/1 or REJECT/ACCEPT)
    - y_prob             : float, model confidence for the positive / ACCEPT class in [0, 1]
    - response_time_ms   : float, end-to-end prediction time in milliseconds
    - doc_length         : int, document length (e.g. number of characters or tokens)

Outputs (PNG files):
    prediction_module/results/
        accuracy_vs_epoch.png
        precision_vs_recall.png
        confusion_matrix.png
        confidence_distribution.png
        response_time_vs_doc_length.png
"""

import os
from typing import Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn import metrics


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "evaluation_data.csv")
RESULTS_DIR = os.path.join(BASE_DIR, "results")


def _ensure_results_dir() -> None:
    os.makedirs(RESULTS_DIR, exist_ok=True)


def _load_data(path: str = DATA_PATH) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Evaluation data not found at {path}. "
            "Please provide evaluation_data.csv with the required columns."
        )
    df = pd.read_csv(path)
    required_cols = {
        "epoch",
        "y_true",
        "y_pred",
        "y_prob",
        "response_time_ms",
        "doc_length",
    }
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing required column(s) in CSV: {', '.join(sorted(missing))}")
    return df


def _to_binary(labels: pd.Series) -> np.ndarray:
    """
    Map labels to binary 0/1.
    Accepts either numeric (0/1) or string labels ('REJECT'/'ACCEPT').
    """
    if labels.dtype == "O":
        lower = labels.astype(str).str.lower().str.strip()
        return np.where(lower.isin(["1", "accept", "positive"]), 1, 0)
    return labels.astype(int).to_numpy()


def plot_accuracy_vs_epoch(df: pd.DataFrame) -> None:
    grouped = df.groupby("epoch")
    epochs = []
    accuracies = []
    for epoch, group in grouped:
        y_true = _to_binary(group["y_true"])
        y_pred = _to_binary(group["y_pred"])
        acc = metrics.accuracy_score(y_true, y_pred)
        epochs.append(epoch)
        accuracies.append(acc)

    plt.figure(figsize=(6, 4))
    plt.plot(epochs, accuracies, marker="o")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Accuracy vs Epoch")
    plt.grid(True, linestyle="--", alpha=0.4)
    plt.tight_layout()
    out_path = os.path.join(RESULTS_DIR, "accuracy_vs_epoch.png")
    plt.savefig(out_path, dpi=300)
    plt.close()


def plot_precision_recall(df: pd.DataFrame) -> None:
    y_true = _to_binary(df["y_true"])
    y_scores = df["y_prob"].to_numpy()

    precision, recall, _ = metrics.precision_recall_curve(y_true, y_scores)

    plt.figure(figsize=(6, 4))
    plt.plot(recall, precision, label="Model")
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("Precision vs Recall")
    plt.grid(True, linestyle="--", alpha=0.4)
    plt.tight_layout()
    out_path = os.path.join(RESULTS_DIR, "precision_vs_recall.png")
    plt.savefig(out_path, dpi=300)
    plt.close()


def plot_confusion_matrix(df: pd.DataFrame) -> None:
    y_true = _to_binary(df["y_true"])
    y_pred = _to_binary(df["y_pred"])

    cm = metrics.confusion_matrix(y_true, y_pred)
    labels = ["REJECT (0)", "ACCEPT (1)"]

    plt.figure(figsize=(5, 4))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=labels,
        yticklabels=labels,
    )
    plt.xlabel("Predicted label")
    plt.ylabel("True label")
    plt.title("Confusion Matrix")
    plt.tight_layout()
    out_path = os.path.join(RESULTS_DIR, "confusion_matrix.png")
    plt.savefig(out_path, dpi=300)
    plt.close()


def plot_confidence_distribution(df: pd.DataFrame) -> None:
    y_true = _to_binary(df["y_true"])
    y_pred = _to_binary(df["y_pred"])
    correct = y_true == y_pred

    plt.figure(figsize=(6, 4))
    sns.histplot(
        df["y_prob"],
        bins=20,
        hue=pd.Series(correct, name="correct"),
        multiple="stack",
        palette={True: "seagreen", False: "indianred"},
    )
    plt.xlabel("Model Confidence (probability for ACCEPT)")
    plt.ylabel("Count")
    plt.title("Confidence Distribution (Correct vs Incorrect)")
    plt.tight_layout()
    out_path = os.path.join(RESULTS_DIR, "confidence_distribution.png")
    plt.savefig(out_path, dpi=300)
    plt.close()


def plot_response_time_vs_doc_length(df: pd.DataFrame) -> None:
    plt.figure(figsize=(6, 4))
    sns.scatterplot(
        data=df,
        x="doc_length",
        y="response_time_ms",
        alpha=0.6,
    )
    plt.xlabel("Document Length")
    plt.ylabel("Prediction Response Time (ms)")
    plt.title("Prediction Response Time vs Document Length")
    plt.grid(True, linestyle="--", alpha=0.3)
    plt.tight_layout()
    out_path = os.path.join(RESULTS_DIR, "response_time_vs_doc_length.png")
    plt.savefig(out_path, dpi=300)
    plt.close()


def run_all(path: str = DATA_PATH) -> None:
    """
    Load evaluation data and generate all graphs into results/.
    """
    _ensure_results_dir()

    try:
        df = _load_data(path)
    except FileNotFoundError as exc:
        # Run gracefully without crashing when data is missing.
        print(str(exc))
        print(
            "\nTo use evaluation.py, create 'evaluation_data.csv' with columns:\n"
            "  epoch, y_true, y_pred, y_prob, response_time_ms, doc_length\n"
        )
        return
    except ValueError as exc:
        print(f"Invalid evaluation_data.csv format: {exc}")
        return

    print(f"Loaded {len(df)} evaluation rows from {path}")

    plot_accuracy_vs_epoch(df)
    print("Saved: accuracy_vs_epoch.png")

    plot_precision_recall(df)
    print("Saved: precision_vs_recall.png")

    plot_confusion_matrix(df)
    print("Saved: confusion_matrix.png")

    plot_confidence_distribution(df)
    print("Saved: confidence_distribution.png")

    plot_response_time_vs_doc_length(df)
    print("Saved: response_time_vs_doc_length.png")


if __name__ == "__main__":
    run_all()

