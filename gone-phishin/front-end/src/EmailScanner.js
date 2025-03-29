import React, { useState } from "react";

const EmailScanner = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");

  const handleScan = async () => {
    // You’ll call your backend API here later
    const isPhishing = body.toLowerCase().includes("free money");
    setResult(isPhishing ? "⚠️ Phishing detected!" : "✅ Looks safe.");
  };

  return (
    <div>
      <h2>Email Scanner</h2>
      <input placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />
      <textarea placeholder="Body" onChange={(e) => setBody(e.target.value)} />
      <button onClick={handleScan}>Scan Email</button>
      <p>{result}</p>
    </div>
  );
};

export default EmailScanner;
