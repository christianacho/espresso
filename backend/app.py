from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from datetime import datetime, timedelta
import uuid
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class BrainDumpRequest(BaseModel):
    user_id: str | None = None
    brain_dump: str


@app.post("/api/process-brain-dump")
async def process_brain_dump(request: BrainDumpRequest):
    try:
        brain_dump = request.brain_dump
        if not brain_dump:
            return {"error": "No brain dump text provided"}

        events = process_with_gpt(brain_dump)
        return events

    except Exception as e:
        print(f"Error: {e}")
        return {"error": "Failed to process brain dump"}


def process_with_gpt(brain_dump_text: str):
    try:
        current_date = datetime.now()

        prompt = f"""
        You are a smart scheduling assistant. The user has provided a brain dump of tasks and events. 
        Please analyze this text and create an optimal schedule.

        Current date: {current_date.strftime('%Y-%m-%d')}
        
        User's brain dump:
        "{brain_dump_text}"
        
        Please extract tasks and suggest optimal scheduling. Return a JSON array of events with this exact format:
        [
            {{
                "id": "unique_id",
                "title": "Task name",
                "date": "YYYY-MM-DD",
                "time": "HH:MM"
            }}
        ]
        
        Guidelines:
        1. If no specific date is mentioned, schedule within the next 7 days
        2. If no specific date is mentioned, but user specificed a day of the week
        2. If "due by [date]" is mentioned, schedule 1-2 days before the due date
        3. For recurring tasks, suggest a good day of the week
        4. Consider optimal times (work tasks during work hours, personal tasks in evenings/weekends)
        5. Spread tasks across different days to avoid overloading
        6. For vague timing like "this week" or "soon", pick reasonable dates
        
        Only return the JSON array, no additional text.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a scheduling assistant that returns only valid JSON arrays.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=1000,
            temperature=0.7,
        )

        gpt_response = response.choices[0].message.content.strip()

        try:
            events = json.loads(gpt_response)
            cleaned = []
            for event in events:
                if all(k in event for k in ["title", "date", "time"]):
                    if "id" not in event:
                        event["id"] = str(uuid.uuid4())
                    cleaned.append(event)
            return cleaned
        except json.JSONDecodeError:
            return [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Process brain dump items",
                    "date": (current_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                    "time": "10:00",
                }
            ]

    except Exception:
        return [
            {
                "id": str(uuid.uuid4()),
                "title": "Review tasks from brain dump",
                "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
                "time": "09:00",
            }
        ]

@app.get("/api/health")
async def health_check():
    return {"status": "Backend is running!"}

@app.get("/api/test-cors")
async def test_cors():
    return {
        "status": "CORS is working!",
        "timestamp": datetime.now().isoformat(),
    }
