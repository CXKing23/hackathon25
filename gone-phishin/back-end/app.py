import re
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables from .env file
try:
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Gemini API key not found in .env file.")
        api_key = input("Please enter your Gemini API key: ")
        with open(".env", "w") as f:
            f.write(f"GEMINI_API_KEY={api_key}")
            print("API key saved to .env file for future use.")
except Exception as e:
    print("No .env file found. Continuing without it.")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = input("Please enter your Gemini API key: ")

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for requests from your React frontend

# Configure Google Gemini API with your API key
genai.configure(api_key=api_key)
# Set the model to use (adjust the identifier as needed based on your available models)
model = genai.GenerativeModel('gemini-2.0-flash')

def extract_links(email_content):
    """
    Extract URLs from the email content using a regular expression.
    
    Args:
        email_content (str): The full text content of the email.
        
    Returns:
        list: A list of URLs found in the email content.
    """
    url_pattern = r'(https?://[^\s]+)'  # Matches URLs starting with http or https
    links = re.findall(url_pattern, email_content)
    return links

def analyze_email(email_content):
    """
    Analyze an email using Google's Gemini API to determine if it's a phishing attempt.
    The analysis includes:
      - Checking if the email is phishing.
      - Analyzing links to see if they are counterfeit or malicious.
      - Evaluating sender information (if present) as part of the risk assessment.
    
    Args:
        email_content (str): The content of the email to analyze.
        
    Returns:
        dict: Analysis results including whether it's phishing, confidence score,
              reasons, suspicious elements, extracted links, and a final summary sentence.
    """
    # Extract links from the email content
    links_found = extract_links(email_content)
    
    # Construct the prompt for the Gemini API with additional instructions
    prompt = f"""
    Analyze the following email to determine if it's a phishing attempt.
    Consider the following:
      - Evaluate any URLs present in the email to determine if they are counterfeit or malicious.
      - Assess the sender information (such as the 'From:' field) as part of the risk analysis.
    Email:
    ---
    {email_content}
    ---
    
    Return your analysis in the following format:
      - is_phishing: true or false
      - confidence_score: a number between 0 and 1 indicating the confidence of your assessment
      - reasons: bullet points describing why the email is or isn't phishing
      - suspicious_elements: list any suspicious links, requests, or language
    """
    
    try:
        # Generate a response from the Gemini API using the constructed prompt
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Use regex to extract analysis details from the AI response
        
        # Extract phishing indicator (true or false)
        is_phishing_match = re.search(r'is_phishing:\s*(true|false)', response_text, re.IGNORECASE)
        if is_phishing_match:
            is_phishing = is_phishing_match.group(1).lower() == 'true'
        else:
            # Fallback: check for keywords in the response
            is_phishing = False if "is_phishing: false" in response_text.lower() else True
        
        # Extract confidence score
        confidence_match = re.search(r'confidence_score:\s*(0\.\d+|1\.0|1)', response_text)
        confidence_score = float(confidence_match.group(1)) if confidence_match else None
        
        # Extract reasons for the decision
        reasons_section = re.search(r'reasons:(.*?)(?:suspicious_elements:|$)', response_text, re.DOTALL)
        reasons_text = reasons_section.group(1) if reasons_section else ""
        reasons = [r.strip() for r in re.findall(r'[-•]\s*(.*?)(?:\n|$)', reasons_text) if r.strip()]
        
        # Extract suspicious elements such as malicious links or language
        suspicious_section = re.search(r'suspicious_elements:(.*?)$', response_text, re.DOTALL)
        suspicious_text = suspicious_section.group(1) if suspicious_section else ""
        suspicious_elements = [s.strip() for s in re.findall(r'[-•]\s*(.*?)(?:\n|$)', suspicious_text) if s.strip()]
        
        # Construct a final summary sentence based on the analysis details.
        confidence_str = f"{confidence_score:.2f}" if confidence_score is not None else "N/A"
        final_summary = (
            f"Based on the analysis, the email is {'phishing' if is_phishing else 'not phishing'} "
            f"with a confidence score of {confidence_str}." +
            (f" Reasons: {', '.join(reasons)}." if reasons else "")
        )
        
        # Format the raw analysis output to a single paragraph with proper spacing.
        formatted_raw = " ".join(line.strip() for line in response_text.splitlines() if line.strip())
        
        return {
            "success": True,
            "is_phishing": is_phishing,
            "confidence_score": confidence_score,
            "reasons": reasons,
            "suspicious_elements": suspicious_elements,
            "extracted_links": links_found,
            "raw_analysis": formatted_raw,
            "final_summary": final_summary
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# API endpoint to handle phishing detection requests
@app.route('/api/detect-phishing', methods=['POST'])
def detect_phishing():
    """
    API endpoint that receives email content and checks if it is a phishing attempt.
    Expects a JSON payload with the key "email_content".
    """
    data = request.json
    if not data or 'email_content' not in data:
        return jsonify({
            "success": False,
            "error": "Missing email_content in request"
        }), 400
    
    email_content = data['email_content']
    results = analyze_email(email_content)
    return jsonify(results)

# Health check endpoint to verify that the API is running
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Phishing detection API is operational"
    })

if __name__ == '__main__':
    if not api_key:
        print("ERROR: Gemini API key not found. Please set GEMINI_API_KEY in your .env file.")
        exit(1)
    
    print("\nStarting Flask server on port 5002...\n")
    app.run(debug=True, host='0.0.0.0', port=5002)


