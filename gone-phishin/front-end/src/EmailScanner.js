import React, { useState } from "react";
import Logo from "./Logo.png"; // Adjust the path as needed
import "./App.css"; // Ensure App.css is imported

const EmailScanner = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleScan = async () => {
    // You’ll call your backend API here later
    setIsLoading(true);
    setIsSpinning(true);

      // Simulate a delay for the loading state (e.g., 2 seconds)
  setTimeout(() => {
    const isPhishing = body.toLowerCase().includes("free money");
    setResult(isPhishing ? "⚠️ Phishing detected!" : "✅ Looks safe.");
    setIsLoading(false); // Hide "Loading..." text
    setIsSpinning(false); // Stop spinning the logo
  }, 2000); // Adjust the delay as needed
}


  return (
    <div>
      <img
        src = {Logo}
        alt=" Logo"
        className={`Logo${isSpinning ? " Spin" : ""}`}
      />
      
      { isLoading && <p className=" loading-text">Loading...</p>} {/* Blinking text */}
        <h2>Email Scanner</h2>
      <input placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />
      <textarea placeholder="Body" onChange={(e) => setBody(e.target.value)} />
      <button onClick={handleScan}>Scan Email</button>
      <p>{result}</p>
    </div>
  );
};

export default EmailScanner;
