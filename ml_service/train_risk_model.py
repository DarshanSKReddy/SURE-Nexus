from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "sample_training_data.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "risk_model.joblib"


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

    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(x, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"Model saved to: {MODEL_PATH}")


if __name__ == "__main__":
    main()
