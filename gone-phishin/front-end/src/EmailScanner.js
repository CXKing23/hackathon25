import React, { useState } from 'react';

const EmailScanner = () => {
  const [emailContent, setEmailContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/detect-phishing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email_content: emailContent })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error scanning email:', error);
      setResult({ success: false, error: 'Error connecting to the server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h2>Email Phishing Scanner</h2>
      <textarea
        placeholder="Paste your email content here..."
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        rows="10"
        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
      />
      <br />
      <button onClick={handleScan} disabled={loading} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        {loading ? 'Scanning...' : 'Scan Email'}
      </button>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          {result.success ? (
            <div>
              <h3>Analysis Result</h3>
              <p>
                <strong>Phishing:</strong> {result.is_phishing ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Confidence Score:</strong> {result.confidence_score}
              </p>
              {result.reasons && result.reasons.length > 0 && (
                <div>
                  <strong>Reasons:</strong>
                  <ul>
                    {result.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.suspicious_elements && result.suspicious_elements.length > 0 && (
                <div>
                  <strong>Suspicious Elements:</strong>
                  <ul>
                    {result.suspicious_elements.map((elem, index) => (
                      <li key={index}>{elem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'red' }}>
              <p>Error: {result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailScanner;




/*import React, { useState } from "react";
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
      
      { isLoading && <p className=" loading-text">Loading...</p>} {# Blinking text 
       }
        <h2>Email Scanner</h2>
      <input placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />
      <textarea placeholder="Body" onChange={(e) => setBody(e.target.value)} />
      <button onClick={handleScan}>Scan Email</button>
      <p>{result}</p>
    </div>
  );
};

export default EmailScanner;
*/
