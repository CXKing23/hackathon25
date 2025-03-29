import React, { useState } from 'react';

const EmailScanner = () => {
  // State to hold the email content loaded from a .eml file
  const [emailContent, setEmailContent] = useState('');
  // State to hold the analysis result returned from the backend
  const [result, setResult] = useState(null);
  // State to indicate whether scanning is in progress
  const [loading, setLoading] = useState(false);

  // Handler function for scanning the email content
  const handleScan = async () => {
    // If no file has been uploaded, alert the user
    if (!emailContent) {
      alert('Please upload a .eml file first.');
      return;
    }
    setLoading(true);       // Indicate that scanning has started
    setResult(null);        // Clear any previous results

    try {
      // Send a POST request to the Flask backend with the email content in JSON format
      const response = await fetch('http://127.0.0.1:5002/api/detect-phishing', {
        method: 'POST',      // HTTP method
        headers: {
          'Content-Type': 'application/json'  // Specify that we're sending JSON data
        },
        body: JSON.stringify({ email_content: emailContent })  // Convert email content to a JSON string
      });

      // Parse the JSON response from the backend
      const data = await response.json();
      // Save the result in state to be displayed later
      setResult(data);
    } catch (error) {
      console.error('Error scanning email:', error);
      setResult({ success: false, error: 'Error connecting to the server.' });
    } finally {
      setLoading(false);    // Indicate that scanning is finished
    }
  };

  // Handler function to process the file input (for .eml files)
  const handleFileChange = (e) => {
    const file = e.target.files[0];  // Get the first selected file
    if (file) {
      const reader = new FileReader();  // Create a new FileReader
      // When the file is loaded, update emailContent with its text content
      reader.onload = (event) => {
        setEmailContent(event.target.result);
      };
      // Read the file as plain text
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem' }}>
      {/* Heading for the Email Scanner */}
      <h2>Email Phishing Scanner</h2>
      
      {/* Prompt for uploading a .eml file */}
      <p>Please upload a .eml file containing the email you want to analyze.</p>
      
      {/* File input for .eml files */}
      <input
        type="file"
        accept=".eml"  // Restrict file type to .eml
        onChange={handleFileChange}  // When a file is selected, read its content
        style={{ marginBottom: '1rem' }}
      />
      
      {/* Button to trigger the scanning process */}
      <button
        onClick={handleScan}  // Trigger handleScan when clicked
        disabled={loading}    // Disable button while scanning is in progress
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        {loading ? 'Scanning...' : 'Scan Email'}  {/* Show loading text if scanning */}
      </button>
      
      {/* Display the result returned from the backend */}
      {result && (
        <div style={{ marginTop: '2rem' }}>
          {result.success ? (
            // If analysis was successful, display the details
            <div>
              <h3>Analysis Result</h3>
              <p>
                <strong>Final Decision:</strong> {result.final_summary}
              </p>
              {/* Additional details for transparency */}
              <p>
                <strong>Phishing:</strong> {result.is_phishing ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Confidence Score:</strong> {result.confidence_score !== null ? result.confidence_score : 'N/A'}
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
              {result.extracted_links && result.extracted_links.length > 0 && (
                <div>
                  <strong>Extracted Links:</strong>
                  <ul>
                    {result.extracted_links.map((link, index) => (
                      <li key={index}>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Display raw analysis output in a scrollable preformatted block */}
              {result.raw_analysis && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Raw Analysis:</strong>
                  <pre style={{ 
                    background: '#f0f0f0', 
                    padding: '1rem', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {result.raw_analysis}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            // Display error message if analysis failed
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
