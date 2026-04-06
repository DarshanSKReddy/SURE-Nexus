from pathlib import Path
from typing import List, Optional

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field


MODEL_PATH = Path(__file__).parent / "model" / "risk_model.joblib"

app = FastAPI(title="SURE Nexus ML Service", version="1.0.0")


class RiskRequest(BaseModel):
	quiz_score: float = Field(ge=0, le=10)
	attempts: int = Field(ge=1)
	completion_percentage: float = Field(ge=0, le=100)
	time_spent_minutes: float = Field(ge=0)


class RiskResponse(BaseModel):
	learning_status: str
	recommendations: List[str]
	model_source: str


model: Optional[object] = None


def load_model() -> Optional[object]:
	if MODEL_PATH.exists():
		try:
			return joblib.load(MODEL_PATH)
		except Exception:
			return None
	return None


def map_prediction_to_status(prediction: int) -> str:
	if prediction <= 0:
		return "On Track"
	if prediction == 1:
		return "Building Momentum"
	return "Needs Strong Focus"


def build_recommendations(status: str) -> List[str]:
	if status == "On Track":
		return [
			"Keep your current pace and continue practicing daily.",
			"Take one challenge quiz this week to stay sharp.",
		]
	if status == "Building Momentum":
		return [
			"Revise one weak topic and complete 5 extra practice questions.",
			"Use a 30-minute focused learning block each day.",
		]
	return [
		"Revisit the last module and retake the quiz after revision.",
		"Break study into short sessions and track completion daily.",
	]


@app.on_event("startup")
def startup_load_model() -> None:
	global model
	model = load_model()


@app.get("/health")
def health() -> dict:
	return {
		"ok": True,
		"model_loaded": model is not None,
		"model_path": str(MODEL_PATH),
	}


@app.post("/predict-risk", response_model=RiskResponse)
def predict_risk(payload: RiskRequest) -> RiskResponse:
	features = np.array(
		[
			[
				payload.quiz_score,
				payload.attempts,
				payload.completion_percentage,
				payload.time_spent_minutes,
			]
		]
	)

	if model is not None:
		prediction = int(model.predict(features)[0])
		model_source = "trained_model"
	else:
		# Fallback heuristic if trained model is unavailable.
		if payload.quiz_score >= 8 and payload.completion_percentage >= 70:
			prediction = 0
		elif payload.quiz_score >= 6:
			prediction = 1
		else:
			prediction = 2
		model_source = "heuristic_fallback"

	status = map_prediction_to_status(prediction)
	return RiskResponse(
		learning_status=status,
		recommendations=build_recommendations(status),
		model_source=model_source,
	)
