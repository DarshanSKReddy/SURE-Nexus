import csv
import os
from collections import defaultdict
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from supabase import create_client

BASE_DIR = Path(__file__).parent
OUTPUT_PATH = BASE_DIR / "data" / "training_data_from_supabase.csv"
OUTPUT_FIELDS = [
    "quiz_score",
    "attempts",
    "completion_percentage",
    "time_spent_minutes",
    "risk_level",
]


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


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

    output_rows = []
    source_table = "course_quiz_attempts"

    try:
        response = client.table("course_quiz_attempts").select("user_id, course_id, score, passed, time_spent_minutes, created_at").order("created_at", desc=False).execute()
        rows = response.data or []
        grouped_attempts: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)

        for row in rows:
            user_id = str(row.get("user_id") or "")
            course_id = str(row.get("course_id") or "")
            if not user_id or not course_id:
                continue
            grouped_attempts[(user_id, course_id)].append(row)

        for attempt_rows in grouped_attempts.values():
            attempt_count = len(attempt_rows)
            latest_row = attempt_rows[-1]
            score = safe_float(latest_row.get("score"))
            passed = bool(latest_row.get("passed"))
            completion = 100.0 if passed else min(95.0, max(10.0, score * 10))
            total_time_spent = sum(safe_float(item.get("time_spent_minutes"), 0.0) for item in attempt_rows)
            time_spent = max(15.0, total_time_spent or attempt_count * 30.0)

            output_rows.append(
                {
                    "quiz_score": score,
                    "attempts": attempt_count,
                    "completion_percentage": completion,
                    "time_spent_minutes": time_spent,
                    "risk_level": map_to_risk_level(score, completion),
                }
            )
    except Exception:
        source_table = "course_progress"
        response = client.table("course_progress").select("user_id, course_id, score, passed, updated_at").order("updated_at", desc=False).execute()
        rows = response.data or []

        grouped_progress: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
        for row in rows:
            user_id = str(row.get("user_id") or "")
            course_id = str(row.get("course_id") or "")
            if not user_id or not course_id:
                continue
            grouped_progress[(user_id, course_id)].append(row)

        for progress_rows in grouped_progress.values():
            attempt_count = len(progress_rows)
            latest_row = progress_rows[-1]
            score = safe_float(latest_row.get("score"))
            passed = bool(latest_row.get("passed"))
            completion = 100.0 if passed else min(90.0, max(10.0, score * 10))
            time_spent = max(15.0, attempt_count * 30.0)

            output_rows.append(
                {
                    "quiz_score": score,
                    "attempts": attempt_count,
                    "completion_percentage": completion,
                    "time_spent_minutes": time_spent,
                    "risk_level": map_to_risk_level(score, completion),
                }
            )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.DictWriter(fp, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Exported {len(output_rows)} rows from {source_table} to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
