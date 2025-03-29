import React, { useState } from "react";
import axios from "axios";

const EmailScanner = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");

  const handleScan = async () => {
    console.log("Scan button clicked!");
    try {
      console.log("Sending to backend:", { subject, body });
  
      const res = await axios.post("http://127.0.0.1:8000/scan", {
        subject,
        body,
      });
  
      console.log("Response:", res.data);  // ✅ now it's after `res` is defined
  
      setResult(res.data.phishing ? "⚠️ Phishing detected!" : "✅ Looks safe.");
    } catch (error) {
      console.error("Backend error:", error);
      setResult("❌ Error connecting to the backend.");
    }
  };    

  return (
    <div>
      <h2>Email Scanner</h2>
      <input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        placeholder="Email Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button onClick={handleScan}>Scan Email</button>
      <p>{result}</p>
    </div>
  );
};

export default EmailScanner;
