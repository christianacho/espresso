from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import openai
import os
from datetime import datetime, timedelta
import json
import re
from supabase import create_client, Client
import jwt

# Initialize FastAPI app
app = FastAPI(title="Calendar AI Backend", version="1.0.0")

# CORS middleware to allow your React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Load environment variables
load_dotenv()

# Environment variables
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Validate required environment variables
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")
if not SUPABASE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY

# Pydantic models for request/response


class BrainDumpRequest(BaseModel):
    brain_dump: str
    user_id: str


class EventRequest(BaseModel):
    text: str
    user_id: str


class ProcessedEvent(BaseModel):
    id: str
    title: str
    description: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    priority: str


class EventResponse(BaseModel):
    success: bool
    events: List[ProcessedEvent]
    message: str

# Authentication dependency - make it optional for now


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return {"sub": "anonymous"}  # Allow anonymous access for testing

    try:
        token = credentials.credentials
        # Verify the JWT token with Supabase
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except jwt.InvalidTokenError:
        return {"sub": "anonymous"}  # Fallback to anonymous


@app.get("/")
async def root():
    return {"message": "Calendar AI Backend is running!"}


@app.post("/api/process-brain-dump")
async def process_brain_dump(request: BrainDumpRequest):
    """
    Process brain dump text and return structured events for the calendar
    """
    try:
        print(f"🟢 Received brain dump request: {request.brain_dump[:50]}...")

        # Process the brain dump text with GPT
        processed_events = await parse_events_with_gpt(request.brain_dump)
        print(f"🟢 GPT processed {len(processed_events)} events")

        # Convert to the format expected by the frontend
        frontend_events = []
        for i, event in enumerate(processed_events):
            frontend_events.append({
                "id": f"ai_{int(datetime.now().timestamp())}_{i}",
                "title": event.title,
                "description": event.description,
                "date": event.date,
                "time": event.time,
                "priority": event.priority
            })

        print(f"🟢 Returning {len(frontend_events)} events to frontend")
        return frontend_events

    except Exception as e:
        print(f"🔴 Error processing brain dump: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing brain dump: {str(e)}"
        )


async def parse_events_with_gpt(text: str) -> List[ProcessedEvent]:
    """
    Use GPT to parse the brain dump text and extract structured events
    """
    try:
        print(f"🟡 Sending to GPT: {text[:100]}...")

        current_date = datetime.now()
        current_day = current_date.strftime('%A')
        today = current_date.strftime('%Y-%m-%d')

        # Calculate weekday mapping for GPT
        weekdays = ['Monday', 'Tuesday', 'Wednesday',
                    'Thursday', 'Friday', 'Saturday', 'Sunday']
        current_weekday_num = current_date.weekday()  # 0=Monday, 6=Sunday

        # Calculate tomorrow
        tomorrow = current_date + timedelta(days=1)

        # Calculate next week's dates (7+ days from today)
        days_ahead = {}
        # Calculate next week's dates (always the following week)
        # Calculate next week's dates (always the following week)
        for i, day_name in enumerate(weekdays):
            days_until = (i - current_weekday_num) % 7
            if days_until == 0:
                days_until = 7
            next_week_date = current_date + \
                timedelta(days=days_until + 7)  # force NEXT week
            days_ahead[f"next_{day_name.lower()}"] = next_week_date.strftime(
                '%Y-%m-%d')

        # Calculate this week's remaining dates (closest upcoming, not including today)
        for i, day_name in enumerate(weekdays):
            days_until = (i - current_weekday_num) % 7
            if days_until == 0:
                days_until = 7
            this_week_date = current_date + timedelta(days=days_until)
            days_ahead[f"this_{day_name.lower()}"] = this_week_date.strftime(
                '%Y-%m-%d')

        # Debug print calculated dates
        print(f"🔍 DEBUG - Today is: {current_date.strftime('%Y-%m-%d %A')}")
        print(
            f"🔍 DEBUG - Next Wednesday: {days_ahead.get('next_wednesday', 'ERROR')}")
        print(
            f"🔍 DEBUG - This Wednesday: {days_ahead.get('this_wednesday', 'ERROR')}")

        # Create enhanced prompt with PRE-CALCULATED dates
        prompt = f"""
        You are a smart calendar assistant. Parse this text and create appropriate calendar events.

        Current date: {current_date.strftime('%Y-%m-%d')} ({current_day})
        Current time: {current_date.strftime('%H:%M')}

        Text to parse: "{text}"

        STEP 1: Break down the input into individual tasks/events
        STEP 2: For each task, determine if it needs preparation or not
        STEP 3: Use the PRE-CALCULATED dates below (DO NOT calculate dates yourself)

        USE THESE EXACT DATES - DO NOT CALCULATE:
        - "today" = {today}
        - "tomorrow" = {tomorrow.strftime('%Y-%m-%d')}
        - "next monday" = {days_ahead.get('next_monday', 'ERROR')}
        - "next tuesday" = {days_ahead.get('next_tuesday', 'ERROR')}
        - "next wednesday" = {days_ahead.get('next_wednesday', 'ERROR')}
        - "next thursday" = {days_ahead.get('next_thursday', 'ERROR')}
        - "next friday" = {days_ahead.get('next_friday', 'ERROR')}
        - "next saturday" = {days_ahead.get('next_saturday', 'ERROR')}
        - "next sunday" = {days_ahead.get('next_sunday', 'ERROR')}
        - "monday" (without next) = {days_ahead.get('this_monday', 'ERROR')}
        - "tuesday" (without next) = {days_ahead.get('this_tuesday', 'ERROR')}
        - "wednesday" (without next) = {days_ahead.get('this_wednesday', 'ERROR')}
        - "thursday" (without next) = {days_ahead.get('this_thursday', 'ERROR')}
        - "friday" (without next) = {days_ahead.get('this_friday', 'ERROR')}
        - "saturday" (without next) = {days_ahead.get('this_saturday', 'ERROR')}
        - "sunday" (without next) = {days_ahead.get('this_sunday', 'ERROR')}

        CRITICAL RULES:

        1. **ONLY create preparation events for WORK/ACADEMIC DEADLINES**
           - Words that need preparation: "due by", "deadline", "submit by", "finish by", "assignment due", "project due", "report due"
           - Create TWO events: preparation day before + deadline day
           - Both get "high" priority

        2. **NEVER create preparation events for these activities:**
           - practice, rehearsal, training, workout, gym
           - church, service, worship, meeting
           - appointments, calls, social events
           - shopping, errands, personal tasks
           - These get ONE event only on the specified day

        3. **Process ALL parts of the input - don't miss any tasks!**

        EXAMPLES:

        Input: "practice next wednesday"
        Output:
        [
          {{"title": "Practice", "description": "Regular practice session", "date": "{days_ahead.get('next_wednesday', 'ERROR')}", "time": "18:00", "priority": "medium"}}
        ]

        Input: "practice wednesday" (without "next")
        Output:
        [
          {{"title": "Practice", "description": "Regular practice session", "date": "{days_ahead.get('this_wednesday', 'ERROR')}", "time": "18:00", "priority": "medium"}}
        ]

        Input: "assignment due next friday"  
        Output:
        [
          {{"title": "Work on Assignment", "description": "Preparation for assignment", "date": "{(datetime.strptime(days_ahead.get('next_friday', today), '%Y-%m-%d') - timedelta(days=1)).strftime('%Y-%m-%d')}", "time": "14:00", "priority": "high"}},
          {{"title": "Assignment Due", "description": "Assignment deadline", "date": "{days_ahead.get('next_friday', 'ERROR')}", "time": "17:00", "priority": "high"}}
        ]

        IMPORTANT: 
        - Use ONLY the pre-calculated dates provided above
        - Match the text exactly to find the right date
        - Process EVERY task mentioned in the input
        - Don't duplicate events
        - Only ONE preparation event per deadline
        - Return events in chronological order
        - NO preparation events for practice/gym/church/calls/meetings!

        Return ONLY a valid JSON array. Make sure ALL tasks from the input are included!
        """

        response = openai.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "system",
                    "content": "You are a calendar assistant that uses PRE-CALCULATED dates provided in the prompt. Do NOT calculate dates yourself - use ONLY the exact dates given in the prompt. Always return valid JSON arrays. Process ALL tasks mentioned in the input."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )

        # Parse the JSON response
        gpt_response = response.choices[0].message.content.strip()
        print(f"🟡 GPT raw response: {gpt_response}")

        # Clean up the response
        json_str = gpt_response.strip()

        # Remove markdown code block formatting if present
        if json_str.startswith('```json'):
            json_str = json_str.replace(
                '```json', '').replace('```', '').strip()
        elif json_str.startswith('```'):
            json_str = json_str.replace('```', '').strip()

        # Try to find JSON array in the response
        json_match = re.search(r'\[.*\]', json_str, re.DOTALL)
        if json_match:
            json_str = json_match.group()

        print(f"🟡 Final JSON to parse: {json_str}")

        # Parse JSON
        events_data = json.loads(json_str)

        # Enhanced fallback logic for empty arrays
        if not events_data:
            print("🟡 GPT returned empty array, creating smart fallback event")

            # Analyze the text to create better fallbacks
            text_lower = text.lower()

            # Only create preparation events for actual work deadlines
            if any(word in text_lower for word in ['due by', 'deadline', 'submit by', 'finish by', 'assignment due', 'project due', 'report due']):
                # It's a work deadline - create two events
                events_data = [
                    {
                        "title": f"Work on: {text[:25]}",
                        "description": f"Preparation for: {text}",
                        "date": (current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                        "time": "14:00",
                        "priority": "high"
                    },
                    {
                        "title": f"Due: {text[:25]}",
                        "description": f"Deadline: {text}",
                        "date": (current_date + timedelta(days=2)).strftime('%Y-%m-%d'),
                        "time": "17:00",
                        "priority": "high"
                    }
                ]
            else:
                # Regular event - no preparation needed for practice/gym/church/calls etc.
                events_data = [{
                    "title": text[:40] if len(text) <= 40 else text[:37] + "...",
                    "description": f"Event: {text}",
                    "date": (current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                    "time": "10:00",
                    "priority": "medium"
                }]

        # Convert to ProcessedEvent objects
        processed_events = []
        for i, event_data in enumerate(events_data):
            processed_events.append(ProcessedEvent(
                id=f"gpt_{int(datetime.now().timestamp())}_{i}",
                title=event_data.get("title", "Untitled Event"),
                description=event_data.get("description", ""),
                date=event_data.get("date", current_date.strftime('%Y-%m-%d')),
                time=event_data.get("time", "10:00"),
                priority=event_data.get("priority", "medium")
            ))

        print(f"🟢 Successfully processed {len(processed_events)} events")
        return processed_events

    except json.JSONDecodeError as e:
        print(f"🔴 JSON parsing error: {str(e)}")
        print(f"🔴 GPT Response: {gpt_response}")

        # Enhanced fallback with deadline detection
        current_date = datetime.now()
        text_lower = text.lower()

        # Only create preparation events for actual work deadlines
        if any(word in text_lower for word in ['due by', 'deadline', 'submit by', 'finish by', 'assignment due', 'project due', 'report due']):
            # Create deadline events
            prep_event = ProcessedEvent(
                id=f"fallback_prep_{int(datetime.now().timestamp())}",
                title=f"Work on: {text[:25]}",
                description=f"Preparation for: {text}",
                date=(current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                time="14:00",
                priority="high"
            )
            due_event = ProcessedEvent(
                id=f"fallback_due_{int(datetime.now().timestamp())}",
                title=f"Due: {text[:25]}",
                description=f"Deadline: {text}",
                date=(current_date + timedelta(days=2)).strftime('%Y-%m-%d'),
                time="17:00",
                priority="high"
            )
            return [prep_event, due_event]
        else:
            # Single event fallback - no preparation for practice/gym/church etc.
            fallback_event = ProcessedEvent(
                id=f"fallback_{int(datetime.now().timestamp())}",
                title=text[:40] if len(text) <= 40 else text[:37] + "...",
                description=f"Original text: {text}",
                date=current_date.strftime('%Y-%m-%d'),
                time="10:00",
                priority="medium"
            )
            return [fallback_event]

    except Exception as e:
        print(f"🔴 GPT processing error: {str(e)}")

        # Enhanced fallback with better error handling
        current_date = datetime.now()
        fallback_event = ProcessedEvent(
            id=f"error_fallback_{int(datetime.now().timestamp())}",
            title=f"Review: {text[:30]}...",
            description=f"AI processing failed. Original: {text}",
            date=current_date.strftime('%Y-%m-%d'),
            time="10:00",
            priority="high"  # High priority since it needs manual review
        )
        return [fallback_event]

# Legacy endpoint for compatibility


@app.post("/process-events", response_model=EventResponse)
async def process_events(
    request: EventRequest,
    current_user: dict = Depends(verify_token)
):
    # Convert to new format and call the new endpoint
    brain_dump_request = BrainDumpRequest(
        brain_dump=request.text, user_id=request.user_id)
    events = await process_brain_dump(brain_dump_request)

    return EventResponse(
        success=True,
        events=events,
        message=f"Successfully processed {len(events)} events"
    )


@app.get("/api/events")
async def get_user_events(user_id: str, month: Optional[str] = None):
    """
    Get all events for a specific user (optional: filtered by month)
    """
    try:
        # For now, return empty array since we're not persisting to DB yet
        return {"success": True, "events": []}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching events: {str(e)}"
        )


@app.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(verify_token)
):
    """
    Delete a specific event
    """
    try:
        # Placeholder for event deletion
        return {"success": True, "message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting event: {str(e)}"
        )


@app.post("/api/debug-parse")
async def debug_parse(request: BrainDumpRequest):
    """
    Debug endpoint to see exactly what GPT is receiving and returning
    """
    try:
        current_date = datetime.now()

        print(f"🔍 DEBUG - Input text: '{request.brain_dump}'")
        print(
            f"🔍 DEBUG - Current date: {current_date.strftime('%Y-%m-%d %A')}")

        # Test the parsing without processing
        processed_events = await parse_events_with_gpt(request.brain_dump)

        debug_info = {
            "input_text": request.brain_dump,
            "current_date": current_date.strftime('%Y-%m-%d'),
            "current_day": current_date.strftime('%A'),
            "processed_events": [
                {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "date": event.date,
                    "time": event.time,
                    "priority": event.priority
                }
                for event in processed_events
            ],
            "event_count": len(processed_events)
        }

        return debug_info

    except Exception as e:
        return {
            "error": str(e),
            "input_text": request.brain_dump
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting server on http://localhost:5001")
    uvicorn.run(app, host="0.0.0.0", port=5001)
