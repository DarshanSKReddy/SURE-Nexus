# Python + ML MVP Setup (Student Performance Risk Prediction)

This guide adds a real Python + ML use case to SURE Nexus.

## 1) Create Python environment

```bash
cd ml_service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Optional: Export training data from Supabase

Run this only after creating the optional attempts table below.

```bash
python export_supabase_progress.py
```

Output file: `ml_service/data/training_data_from_supabase.csv`

## 3) Train ML model

Using starter sample data:

```bash
python train_risk_model.py
```

This creates: `ml_service/model/risk_model.joblib`

It also writes model quality metrics to: `ml_service/model/metrics_summary.txt`

If you want to train on Supabase export, replace the CSV path in `train_risk_model.py` or copy exported CSV over `sample_training_data.csv`.

## 4) Start FastAPI service

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

## 5) Configure Next.js

In `.env.local`, add:

```env
NEXT_PUBLIC_ML_API_URL=http://127.0.0.1:8000
```

Then start app:

```bash
npm run dev
```

The dashboard now calls `POST /predict-risk` and renders an "AI Learning Insight" card.

## 6) External Supabase steps (run in SQL editor)

```sql
create table if not exists public.course_quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  course_id text not null,
  score int not null,
  passed boolean not null default false,
  time_spent_minutes numeric,
  created_at timestamptz not null default now()
);

alter table public.course_quiz_attempts enable row level security;

create policy "Users can view own attempts"
on public.course_quiz_attempts
for select
using (auth.uid() = user_id);

create policy "Users can insert own attempts"
on public.course_quiz_attempts
for insert
with check (auth.uid() = user_id);
```

## 7) Optional app enhancement to log attempts

Current app already stores module score in `course_progress`. You can additionally log each quiz submit into `course_quiz_attempts` from quiz pages to improve model quality over time.

## 8) Enable Cloud Day Planner (Supabase)

The dashboard planner supports two modes:

- `Cloud` mode when table `planner_tasks` exists and RLS policies allow access.
- `Local` mode fallback using browser storage when cloud table is unavailable.

Run this SQL in Supabase to enable cloud sync:

```sql
create table if not exists public.planner_tasks (
  id uuid primary key,
  user_id uuid not null,
  date_key date not null,
  title text not null,
  status text not null check (status in ('ongoing', 'completed', 'missed')),
  created_at timestamptz not null default now()
);

create index if not exists planner_tasks_user_date_idx
on public.planner_tasks (user_id, date_key);

alter table public.planner_tasks enable row level security;

drop policy if exists "Users can view own planner tasks" on public.planner_tasks;
create policy "Users can view own planner tasks"
on public.planner_tasks
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own planner tasks" on public.planner_tasks;
create policy "Users can insert own planner tasks"
on public.planner_tasks
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own planner tasks" on public.planner_tasks;
create policy "Users can update own planner tasks"
on public.planner_tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own planner tasks" on public.planner_tasks;
create policy "Users can delete own planner tasks"
on public.planner_tasks
for delete
using (auth.uid() = user_id);
```

## API Contract

### Request

`POST /predict-risk`

```json
{
  "quiz_score": 7.4,
  "attempts": 5,
  "completion_percentage": 50,
  "time_spent_minutes": 28
}
```

### Response

```json
{
  "learning_status": "Building Momentum",
  "recommendations": [
    "Review weak topics and attempt 5 extra practice questions.",
    "Maintain consistency with one module revision per day."
  ],
  "model_source": "trained_model"
}
```
