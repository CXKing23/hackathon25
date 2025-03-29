from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS so React can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailInput(BaseModel):
    subject: str
    body: str


@app.post("/scan")
def scan_email(email: EmailInput):
    suspicious_phrases = ["click here", "free money", "urgent action"]

    # ✅ Combine subject and body into one string
    content = f"{email.subject} {email.body}".lower()

    # ✅ Check if any keyword appears in the content
    is_phishing = any(phrase in content for phrase in suspicious_phrases)

    return {"phishing": is_phishing}
