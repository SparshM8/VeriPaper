import argparse
import csv
import os
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.model_selection import train_test_split

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

from app.services.ai_detection import _extract_features


def load_dataset(path: Path):
    texts = []
    labels = []
    with path.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            text = row.get("text")
            label = row.get("label")
            if text is None or label is None:
                continue
            texts.append(text)
            labels.append(int(label))
    return texts, labels


def main():
    parser = argparse.ArgumentParser(description="Train AI detector (logistic regression).")
    parser.add_argument("--data", required=True, help="CSV with columns: text,label (0=human,1=ai)")
    parser.add_argument("--output", default="backend/models/ai_detector.joblib")
    args = parser.parse_args()

    data_path = Path(args.data)
    texts, labels = load_dataset(data_path)
    if not texts:
        raise SystemExit("No training data found.")

    features = np.array([_extract_features(text) for text in texts])
    labels = np.array(labels)

    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="binary")
    cm = confusion_matrix(y_test, preds)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)

    print("Accuracy:", round(acc, 4))
    print("Precision:", round(precision, 4))
    print("Recall:", round(recall, 4))
    print("F1:", round(f1, 4))
    print("Confusion Matrix:\n", cm)
    print("Saved model to", output_path)


if __name__ == "__main__":
    main()
