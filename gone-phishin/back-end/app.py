import openai
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Load API Key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

def check_phishing(email_text):
    """Detects phishing likelihood using GPT"""
    prompt = f"""
    Analyze the following email and determine if it is a phishing attempt.
    Provide a risk level (low, medium, high) and explain why.

    Email:
    {email_text}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    return response["choices"][0]["message"]["content"]

@app.route('/analyze_email', methods=['POST'])
def analyze_email():
    data = request.json
    email_text = data.get("email", "")

    if not email_text:
        return jsonify({"error": "No email text provided"}), 400

    result = check_phishing(email_text)
    return jsonify({"analysis": result})

if __name__ == '__main__':
    app.run(debug=True)
