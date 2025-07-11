import os
import uuid
import requests # New import
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# --- Configuration ---
MONGO_URI = os.getenv("MONGO_URI")
HF_API_TOKEN = os.getenv("HF_API_TOKEN") # New: Get Hugging Face token

if not MONGO_URI:
    raise RuntimeError("MONGO_URI environment variable not set!")
if not HF_API_TOKEN:
    raise RuntimeError("HF_API_TOKEN environment variable not set!")

# We'll use a powerful "zero-shot-classification" model.
# This model is great at classifying text without any prior training on our specific labels.
AI_MODEL_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
AI_HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}


# --- Database Connection ---
client = MongoClient(MONGO_URI)
db = client.incident_db
incident_collection = db.incidents


# --- AI Helper Function ---
def call_ai_model(message: str):
    """
    Calls the Hugging Face Inference API to classify the incident message.
    """
    # These are the potential categories we want the AI to choose from.
    candidate_labels = ["database", "networking", "authentication", "server-performance", "user-interface"]
    
    try:
        response = requests.post(AI_MODEL_URL, headers=AI_HEADERS, json={
            "inputs": message,
            "parameters": {"candidate_labels": candidate_labels},
        })
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
        result = response.json()
        # The AI model returns a list of labels sorted by confidence score.
        # We'll take the first one as our primary category.
        ai_category = result['labels'][0]
        confidence = result['scores'][0]

        print(f"AI Classification: '{ai_category}' with confidence {confidence:.2f}")
        return ai_category

    except requests.exceptions.RequestException as e:
        print(f"Error calling AI model: {e}")
        return "unclassified" # Return a default category on failure


# --- Models ---
class CreateIncidentRequest(BaseModel):
    source: str = Field(..., example="Prometheus")
    message: str = Field(..., example="High CPU usage on db-01")
    severity: str = Field(..., example="critical")

# No change to Incident model

# --- FastAPI App ---
app = FastAPI(
    title="AI Incident Response Platform",
    description="A platform to detect, classify, and respond to incidents."
)

# CORS Middleware

# Define allowed origins
origins = [
    "http://localhost:3000", # For local development
    "https://incident-platform-api.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Use the list here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "API is running"}


# --- UPDATED ENDPOINT ---
@app.post("/incidents", status_code=status.HTTP_201_CREATED)
def create_incident(incident_data: CreateIncidentRequest):
    """
    Receives a new alert, enriches it with AI classification,
    and stores it in the database.
    """
    # 1. Call the AI model with the incident message
    ai_suggested_category = call_ai_model(incident_data.message)
    
    # 2. Create the new incident document with the AI's suggestion
    try:
        new_incident = {
            "_id": str(uuid.uuid4()),
            "source": incident_data.source,
            "message": incident_data.message,
            "severity": incident_data.severity,
            "status": "new",
            "timestamp": datetime.now(timezone.utc),
            "category": ai_suggested_category # New AI-powered field!
        }
        
        result = incident_collection.insert_one(new_incident)
        created_incident = incident_collection.find_one({"_id": result.inserted_id})
        return created_incident

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/incidents")
def get_all_incidents():
    incidents = list(incident_collection.find({}).sort("timestamp", -1)) # Sort by newest first
    return incidents

# --- Add this new endpoint to main.py ---

class UpdateStatusRequest(BaseModel):
    """Model for the status update request."""
    status: str

@app.patch("/incidents/{incident_id}/status", status_code=status.HTTP_200_OK)
def update_incident_status(incident_id: str, status_update: UpdateStatusRequest):
    """Updates the status of a specific incident."""
    
    # Define the allowed statuses to prevent arbitrary updates
    allowed_statuses = ["new", "investigating", "resolved", "closed"]
    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(allowed_statuses)}"
        )

    # Find the incident and update its status in one atomic operation
    updated_incident = incident_collection.find_one_and_update(
        {"_id": incident_id},
        {"$set": {"status": status_update.status}},
        return_document=True # This makes MongoDB return the *new* document
    )

    if updated_incident is None:
        raise HTTPException(status_code=404, detail=f"Incident with ID {incident_id} not found")

    return updated_incident