from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "sample_training_data.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "risk_model.joblib"
METRICS_PATH = MODEL_DIR / "metrics_summary.txt"


def main() -> None:
    df = pd.read_csv(DATA_PATH)

    feature_columns = [
        "quiz_score",
        "attempts",
        "completion_percentage",
        "time_spent_minutes",
    ]
    target_column = "risk_level"

    x = df[feature_columns]
    y = df[target_column]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.3,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(x_train, y_train)

    y_pred = model.predict(x_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, zero_division=0)
    matrix = confusion_matrix(y_test, y_pred)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    metrics_lines = [
        "Model Evaluation Summary",
        "========================",
        f"Dataset rows: {len(df)}",
        f"Train rows: {len(x_train)}",
        f"Test rows: {len(x_test)}",
        f"Accuracy: {accuracy:.4f}",
        "",
        "Classification Report:",
        report,
        "Confusion Matrix:",
        str(matrix),
        "",
    ]
    METRICS_PATH.write_text("\n".join(metrics_lines), encoding="utf-8")

    print(f"Model saved to: {MODEL_PATH}")
    print(f"Metrics saved to: {METRICS_PATH}")


if __name__ == "__main__":
    main()
