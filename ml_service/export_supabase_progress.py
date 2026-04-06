import csv
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

BASE_DIR = Path(__file__).parent
OUTPUT_PATH = BASE_DIR / "data" / "training_data_from_supabase.csv"


def map_to_risk_level(score: float, completion: float) -> int:
    if score >= 8 and completion >= 70:
        return 0
    if score >= 6:
        return 1
    return 2


def main() -> None:
    load_dotenv()

    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_key:
        raise RuntimeError("Supabase credentials not found in environment.")

    client = create_client(supabase_url, supabase_key)
    response = client.table("course_progress").select("user_id, course_id, score, passed, updated_at").execute()
    rows = response.data or []

    user_attempts = {}
    for row in rows:
        user_id = row.get("user_id")
        user_attempts[user_id] = user_attempts.get(user_id, 0) + 1

    output_rows = []
    for row in rows:
        score = float(row.get("score") or 0)
        passed = bool(row.get("passed"))
        attempts = user_attempts.get(row.get("user_id"), 1)
        completion = 100.0 if passed else min(90.0, score * 10)
        time_spent = max(15.0, attempts * 30.0)
        risk_level = map_to_risk_level(score, completion)

        output_rows.append(
            {
                "quiz_score": score,
                "attempts": attempts,
                "completion_percentage": completion,
                "time_spent_minutes": time_spent,
                "risk_level": risk_level,
            }
        )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.DictWriter(
            fp,
            fieldnames=[
                "quiz_score",
                "attempts",
                "completion_percentage",
                "time_spent_minutes",
                "risk_level",
            ],
        )
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Exported {len(output_rows)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
