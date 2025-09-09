from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from openai import OpenAI
import json
from datetime import datetime, timedelta
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enhanced CORS configuration - apply this FIRST before any routes
CORS(app,
     origins=["http://localhost:5173",
              "http://127.0.0.1:5173", "http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization",
                    "Accept", "Origin", "X-Requested-With"],
     supports_credentials=True,
     max_age=3600)

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')  # Put your API key in .env file
)

# Add explicit OPTIONS handler for preflight requests


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers',
                             "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods',
                             "GET,PUT,POST,DELETE,OPTIONS")
        return response

# Add CORS headers to all responses


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.route('/api/process-brain-dump', methods=['POST', 'OPTIONS'])
@cross_origin()
def process_brain_dump():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        print("🟢 Received brain dump request")

        # Get data from the request
        data = request.get_json()
        print(f"🟡 Request data: {data}")

        brain_dump = data.get('brain_dump', '')
        user_id = data.get('user_id', '')

        if not brain_dump:
            print("🔴 No brain dump text provided")
            return jsonify({'error': 'No brain dump text provided'}), 400

        print(f"🟢 Processing brain dump: {brain_dump[:100]}...")

        # Process the brain dump with GPT
        events = process_with_gpt(brain_dump)

        print(f"🟢 Generated {len(events)} events")
        print(f"🟡 Events: {events}")

        # Here you would typically save to your database
        # For now, we'll just return the events

        return jsonify(events), 200

    except Exception as e:
        print(f"🔴 Error processing brain dump: {e}")
        return jsonify({'error': 'Failed to process brain dump'}), 500


def process_with_gpt(brain_dump_text):
    """
    Use GPT to process the brain dump and create optimal schedule
    """
    try:
        print("🟡 Calling OpenAI API...")

        # Get current date for context
        current_date = datetime.now()

        # Create a detailed prompt for GPT
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
        2. If "due by [date]" is mentioned, schedule 1-2 days before the due date
        3. For recurring tasks, suggest a good day of the week
        4. Consider optimal times (work tasks during work hours, personal tasks in evenings/weekends)
        5. Spread tasks across different days to avoid overloading
        6. For vague timing like "this week" or "soon", pick reasonable dates
        
        Only return the JSON array, no additional text.
        """

        # Call OpenAI API (updated for new version)
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using the more affordable model
            messages=[
                {"role": "system", "content": "You are a scheduling assistant that returns only valid JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )

        # Parse the response
        gpt_response = response.choices[0].message.content.strip()
        print(f"🟢 GPT Response: {gpt_response}")

        # Try to parse the JSON response
        try:
            events = json.loads(gpt_response)

            # Validate and clean the events
            cleaned_events = []
            for event in events:
                if all(key in event for key in ['title', 'date', 'time']):
                    # Add unique ID if not present
                    if 'id' not in event:
                        event['id'] = str(uuid.uuid4())
                    cleaned_events.append(event)

            print(f"🟢 Cleaned events: {cleaned_events}")
            return cleaned_events

        except json.JSONDecodeError as e:
            print(f"🔴 JSON decode error: {e}")
            print(f"🔴 Raw GPT response: {gpt_response}")
            # If GPT didn't return valid JSON, create a basic event
            return [{
                'id': str(uuid.uuid4()),
                'title': 'Process brain dump items',
                'date': (current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                'time': '10:00'
            }]

    except Exception as e:
        print(f"🔴 Error with GPT processing: {e}")
        # Return a fallback event
        return [{
            'id': str(uuid.uuid4()),
            'title': 'Review tasks from brain dump',
            'date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
            'time': '09:00'
        }]

    # Health check endpoint


@app.route('/api/health', methods=['GET'])
@cross_origin()
def health_check():
    return jsonify({'status': 'Backend is running!'}), 200

# Test endpoint to verify CORS


@app.route('/api/test-cors', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin()
def test_cors():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight ok'}), 200

    return jsonify({
        'status': 'CORS is working!',
        'method': request.method,
        'timestamp': datetime.now().isoformat()
    }), 200


if __name__ == '__main__':
    print("🟢 Starting Flask server with enhanced CORS support...")
    app.run(debug=True, port=5001, host='0.0.0.0')  # Changed to port 5001
