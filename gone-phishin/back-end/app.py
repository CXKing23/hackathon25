from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import re

# Load environment variables from .env file
try:
    load_dotenv()
    # Try to get API key from environment
    api_key = os.getenv("GEMINI_API_KEY")
    
    # If not found in environment, prompt user to enter it
    if not api_key:
        print("Gemini API key not found in .env file.")
        api_key = input("Please enter your Gemini API key: ")
        
        # Optionally save it to .env file
        with open(".env", "w") as f:
            f.write(f"GEMINI_API_KEY={api_key}")
            print("API key saved to .env file for future use.")
except:
    print("No .env file found. Continuing without it.")
    api_key = os.getenv("GEMINI_API_KEY")  # Try to get from environment anyway
    if not api_key:
        api_key = input("Please enter your Gemini API key: ")

# Initialize Flask application
app = Flask(__name__)

# Enable CORS to allow requests from React frontend
CORS(app)

# Configure Google Gemini API with your API key
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Select the Gemini model to use
model = genai.GenerativeModel('gemini-pro')

def analyze_email(email_content):
    """
    Analyze an email using Google's Gemini API to detect if it's a phishing attempt
    
    Args:
        email_content (str): The content of the email to analyze
        
    Returns:
        dict: Analysis results including whether it's phishing and explanation
    """
    # Construct the prompt for Gemini API
    prompt = f"""
    Analyze the following email to determine if it's a phishing attempt.
    Email:
    ---
    {email_content}
    ---
    
    Return your analysis in the following format:
    - is_phishing: true or false
    - confidence_score: a number between 0 and 1
    - reasons: bullet points describing why this is or isn't phishing
    - suspicious_elements: any suspicious links, requests, or language
    """
    
    try:
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Parse the response to extract structured data
        response_text = response.text
        
        # Extract whether it's phishing
        is_phishing_match = re.search(r'is_phishing:\s*(true|false)', response_text, re.IGNORECASE)
        is_phishing = is_phishing_match.group(1).lower() == 'true' if is_phishing_match else None
        
        # Extract confidence score
        confidence_match = re.search(r'confidence_score:\s*(0\.\d+|1\.0|1)', response_text)
        confidence_score = float(confidence_match.group(1)) if confidence_match else None
        
        # Extract reasons
        reasons_section = re.search(r'reasons:(.*?)(?:suspicious_elements:|$)', response_text, re.DOTALL)
        reasons_text = reasons_section.group(1) if reasons_section else ""
        reasons = [r.strip() for r in re.findall(r'[-•]\s*(.*?)(?:\n|$)', reasons_text) if r.strip()]
        
        # Extract suspicious elements
        suspicious_section = re.search(r'suspicious_elements:(.*?)$', response_text, re.DOTALL)
        suspicious_text = suspicious_section.group(1) if suspicious_section else ""
        suspicious_elements = [s.strip() for s in re.findall(r'[-•]\s*(.*?)(?:\n|$)', suspicious_text) if s.strip()]
        
        return {
            "success": True,
            "is_phishing": is_phishing,
            "confidence_score": confidence_score,
            "reasons": reasons,
            "suspicious_elements": suspicious_elements,
            "raw_analysis": response_text  # Include raw analysis for debugging
        }
    
    except Exception as e:
        # Return error information if API call fails
        return {
            "success": False,
            "error": str(e)
        }

# Route to handle phishing detection requests
@app.route('/api/detect-phishing', methods=['POST'])
def detect_phishing():
    """
    API endpoint to receive email content and check if it's a phishing attempt
    
    Expected JSON request body:
    {
        "email_content": "..."
    }
    """
    # Get the JSON data from the request
    data = request.json
    
    # Check if email_content is provided
    if not data or 'email_content' not in data:
        return jsonify({
            "success": False,
            "error": "Missing email_content in request"
        }), 400
    
    # Get the email content from the request
    email_content = data['email_content']
    
    # Analyze the email
    results = analyze_email(email_content)
    
    # Return the analysis results
    return jsonify(results)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    #Simple health check endpoint to verify the API is running
    return jsonify({
        "status": "healthy",
        "message": "Phishing detection API is operational"
    })

# Run the Flask application
if __name__ == '__main__':
    # Check if API key is configured
    if not api_key:
        print("ERROR: Gemini API key not found. Please set GEMINI_API_KEY in your .env file.")
        exit(1)
    
    # Start the server, set debug=True during development only
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)