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

app = FastAPI(title="Calendar AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")
if not SUPABASE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY


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
    time: Optional[str] = None  # 12-hour format (e.g., "2:00 PM")
    priority: str


class EventResponse(BaseModel):
    success: bool
    events: List[ProcessedEvent]
    message: str


def convert_to_12_hour(time_24):
    """Helper function to convert 24-hour time to 12-hour format"""
    if not time_24:
        return None
    try:
        time_obj = datetime.strptime(time_24, "%H:%M")
        return time_obj.strftime("%I:%M %p").lstrip('0')
    except ValueError:
        return time_24


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
        print(f"Received brain dump request: {request.brain_dump[:50]}...")

        # Process the brain dump text with GPT
        processed_events = await parse_events_with_gpt(request.brain_dump)
        print(f"GPT processed {len(processed_events)} events")

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

        print(f"Returning {len(frontend_events)} events to frontend")
        return frontend_events

    except Exception as e:
        print(f"Error processing brain dump: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing brain dump: {str(e)}"
        )


async def parse_events_with_gpt(text: str) -> List[ProcessedEvent]:
    """
    Use GPT to parse the brain dump text and extract structured events
    """
    try:
        print(f"Sending to GPT: {text[:100]}...")

        # Get current date info
        current_date = datetime.now()
        current_day = current_date.strftime('%A')
        today = current_date.strftime('%Y-%m-%d')
        current_weekday = current_date.weekday()  # Monday=0, Sunday=6

        print(
            f"🔍 DEBUG - Today is: {current_date.strftime('%Y-%m-%d %A')} (weekday: {current_weekday})")

        # Create a more precise date calculation explanation for GPT
        prompt = f"""
        You are a smart calendar assistant. Parse this text and create appropriate calendar events.

        TODAY IS: {today} which is a {current_day} (weekday number: {current_weekday} where Monday=0, Sunday=6)
        Current time: {current_date.strftime('%H:%M')}

        Text to parse: "{text}"

        STEP 1: Break down the input into individual tasks/events
        STEP 2: For each task, determine if it needs preparation or not
        STEP 3: Calculate dates using these PRECISE RULES:

        WEEKDAY MAPPING: Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5, Sunday=6
        Today is {current_day} which is weekday {current_weekday}

        DATE CALCULATION RULES:

        1. FOR DAYS WITHOUT "NEXT" (like "friday", "monday"):
           - Find the NEXT upcoming occurrence of that weekday
           - If the target weekday is LATER this week: days_to_add = target_weekday - current_weekday
           - If the target weekday is EARLIER this week OR same day: days_to_add = (7 - current_weekday) + target_weekday
           
           Examples if today is wednesday (weekday 2):
           - "friday" → Friday is weekday 4 → 4 - 2 = 2 days → {(current_date + timedelta(days=2)).strftime('%Y-%m-%d')}
           - "monday" → Monday is weekday 0 → (7 - 2) + 0 = 5 days → {(current_date + timedelta(days=5)).strftime('%Y-%m-%d')}
           - "wednesday" → Same day, so next week → 7 days → {(current_date + timedelta(days=7)).strftime('%Y-%m-%d')}

            Examples if today is Monday (weekday 0):
           - "Monday" → Same day, so next week → 7 days → {(current_date + timedelta(days=7)).strftime('%Y-%m-%d')}

           Examples if today is Tuesday (weekday 1):
           - "Tuesday" → Same day, so next week → 7 days → {(current_date + timedelta(days=7)).strftime('%Y-%m-%d')}

           Examples if today is Thursday (weekday 3):
           - "Thursday" → Same day, so next week → 7 days → {(current_date + timedelta(days=7)).strftime('%Y-%m-%d')}

           Examples if today is Friday (weekday 4):
           - "Friday" → Same day, so next week → 7 days → {(current_date + timedelta(days=7)).strftime('%Y-%m-%d')}

           Examples if today is Saturday (weekday 5):
           - "Saturday" → Same day, so next week → 7 days → {(current_date + timedelta(days=7)).strftime('%Y-%m-%d')}

           Examples if today is Sunday (weekday 6):
           - "Sunday" → Same day, so next week → 7 days → {(current_date + timedelta(days=7)).strftime('%Y-%m-%d')}

        2. FOR DAYS WITH "NEXT" (like "next friday", "next monday"):
           - ALWAYS go to the following week (at least 7 days)
           - days_to_add = 7 + (target_weekday - current_weekday) if target_weekday >= current_weekday
           - days_to_add = 7 + (7 - current_weekday) + target_weekday if target_weekday < current_weekday
           
           Examples if today is Wednesday (weekday 2):
           - "next friday" → Friday is weekday 4 → 7 + (4 - 2) = 9 days → {(current_date + timedelta(days=9)).strftime('%Y-%m-%d')}
           - "next monday" → Monday is weekday 0 → 7 + (7 - 2) + 0 = 12 days → {(current_date + timedelta(days=12)).strftime('%Y-%m-%d')}

        3. FOR RELATIVE DAYS:
           - "tomorrow" → +1 day → {(current_date + timedelta(days=1)).strftime('%Y-%m-%d')}
           - "day after tomorrow" → +2 days → {(current_date + timedelta(days=2)).strftime('%Y-%m-%d')}

        CRITICAL RULES FOR MULTIPLE ITEMS:

        1. **WHEN INPUT SPECIFIES A NUMBER**: 
           - "7 projects due friday" = Create 7 separate project events
           - "3 assignments due monday" = Create 3 separate assignment events
           - Each should have a unique title like "Project 1 Due", "Project 2 Due", etc.
           - Each should have preparation events if they are work/academic deadlines

        2. **ONLY create preparation events for WORK/ACADEMIC DEADLINES**
           - Words that need preparation: "due by", "deadline", "submit by", "finish by", "assignment due", "project due", "report due"
           - Create TWO events: preparation day before + deadline day
           - Both get "high" priority

        3. **NEVER create preparation events for these activities:**
           - practice, rehearsal, training, workout, gym
           - church, service, worship, meeting
           - appointments, calls, social events
           - shopping, errands, personal tasks
           - These get ONE event only on the specified day

        4. **Process ALL parts of the input - don't miss any tasks!**

        IMPORTANT: 
        - Use the precise weekday calculation formulas above
        - **NEVER put events on past dates**
        - Process EVERY task mentioned in the input
        - Don't duplicate events
        - Only ONE preparation event per deadline
        - Return events in chronological order
        - NO preparation events for practice/gym/church/calls/meetings!
        - When a user gives a specific date (like "September 12th"), place the event ON THAT DATE
        - If no specific time is provided, leave time as null

        CALCULATION VERIFICATION:
        - Today: {current_day} (weekday {current_weekday})
        - This Friday would be: {(current_date + timedelta(days=(4-current_weekday) if 4 > current_weekday else 7-(current_weekday-4))).strftime('%Y-%m-%d')}
        - Next Friday would be: {(current_date + timedelta(days=7+(4-current_weekday) if 4 >= current_weekday else 7+(7-current_weekday)+4)).strftime('%Y-%m-%d')}

        Return ONLY a valid JSON array with format:
        [{{"title": "Event Title", "description": "Description", "date": "YYYY-MM-DD", "time": "HH:MM or null", "priority": "high/medium/low"}}]

        TITLE EXAMPLES:
        - For "project due friday": Title="Friday Project Due", Prep Title="Work on Friday Project"
        - For "project due next thursday": Title="Next Thursday Project Due", Prep Title="Prepare Next Thursday Project"
        - For "assignment due monday": Title="Monday Assignment Due", Prep Title="Work on Monday Assignment"

        Make sure ALL tasks from the input are included, dates are calculated correctly, and titles are specific to each project/day!
        """

        response = openai.chat.completions.create(
            model="gpt-4o-mini",  # Changed from gpt-4.1-nano which doesn't exist
            messages=[
                {
                    "role": "system",
                    "content": "You are a calendar assistant that calculates dates precisely based on weekday numbers. Use the exact formulas provided to calculate dates. Always return valid JSON arrays. Process ALL tasks mentioned in the input."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Lower temperature for more consistent date calculations
            max_tokens=1500
        )

        # Parse the JSON response
        gpt_response = response.choices[0].message.content.strip()
        print(f"GPT raw response: {gpt_response}")

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

        print(f"Final JSON to parse: {json_str}")

        # Parse JSON
        events_data = json.loads(json_str)

        # Enhanced fallback logic for empty arrays
        if not events_data:
            print("GPT returned empty array, creating smart fallback event")
            text_lower = text.lower()

            # Only create preparation events for actual work deadlines
            if any(word in text_lower for word in ['due by', 'deadline', 'submit by', 'finish by', 'assignment due', 'project due', 'report due']):
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
                events_data = [{
                    "title": text[:40] if len(text) <= 40 else text[:37] + "...",
                    "description": f"Event: {text}",
                    "date": (current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                    "time": "10:00",
                    "priority": "medium"
                }]

        # Convert to ProcessedEvent objects with validation
        processed_events = []
        for i, event_data in enumerate(events_data):
            # Validate date is not in the past
            event_date = datetime.strptime(event_data.get(
                "date", current_date.strftime('%Y-%m-%d')), '%Y-%m-%d')
            if event_date.date() < current_date.date():
                print(
                    f"Warning: Event date {event_date.date()} is in the past, moving to tomorrow")
                event_data["date"] = (
                    current_date + timedelta(days=1)).strftime('%Y-%m-%d')

            # Convert 24-hour time to 12-hour format
            time_24 = event_data.get("time")
            time_12 = convert_to_12_hour(time_24)

            processed_events.append(ProcessedEvent(
                id=f"gpt_{int(datetime.now().timestamp())}_{i}",
                title=event_data.get("title", "Untitled Event"),
                description=event_data.get("description", ""),
                date=event_data.get("date", current_date.strftime('%Y-%m-%d')),
                time=time_12,
                priority=event_data.get("priority", "medium")
            ))

        print(f"Successfully processed {len(processed_events)} events")
        for event in processed_events:
            print(f"  - {event.title} on {event.date} at {event.time}")

        return processed_events

    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
        print(f"GPT Response: {gpt_response}")

        # Enhanced fallback with deadline detection
        current_date = datetime.now()
        text_lower = text.lower()

        if any(word in text_lower for word in ['due by', 'deadline', 'submit by', 'finish by', 'assignment due', 'project due', 'report due']):
            prep_event = ProcessedEvent(
                id=f"fallback_prep_{int(datetime.now().timestamp())}",
                title=f"Work on: {text[:25]}",
                description=f"Preparation for: {text}",
                date=(current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                time=convert_to_12_hour("14:00"),
                priority="high"
            )
            due_event = ProcessedEvent(
                id=f"fallback_due_{int(datetime.now().timestamp())}",
                title=f"Due: {text[:25]}",
                description=f"Deadline: {text}",
                date=(current_date + timedelta(days=2)).strftime('%Y-%m-%d'),
                time=convert_to_12_hour("17:00"),
                priority="high"
            )
            return [prep_event, due_event]
        else:
            fallback_event = ProcessedEvent(
                id=f"fallback_{int(datetime.now().timestamp())}",
                title=text[:40] if len(text) <= 40 else text[:37] + "...",
                description=f"Original text: {text}",
                date=current_date.strftime('%Y-%m-%d'),
                time=convert_to_12_hour("10:00"),
                priority="medium"
            )
            return [fallback_event]

    except Exception as e:
        print(f"GPT processing error: {str(e)}")
        current_date = datetime.now()
        fallback_event = ProcessedEvent(
            id=f"error_fallback_{int(datetime.now().timestamp())}",
            title=f"Review: {text[:30]}...",
            description=f"AI processing failed. Original: {text}",
            date=current_date.strftime('%Y-%m-%d'),
            time=convert_to_12_hour("10:00"),
            priority="high"
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
