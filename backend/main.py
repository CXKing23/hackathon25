from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class EmailInput(BaseModel):
    subject: str
    body: str


@app.post("/scan")
def scan_email(email: EmailInput):
    suspicious_phrases = ["click here", "free money", "urgent action"]
    content = f"{email.subject} {email.body}".lower()

    is_phishing = any(phrase in content for phrase in suspicious_phrases)

    return {"phishing": is_phishing}
