import React, { useState } from 'react';
import Logo from './Logo.png';  // Adjust the path as needed

const EmailScanner = () => {
  // States to manage email content, scan result, loading status, and file name
  const [emailContent, setEmailContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [fileName, setFileName] = useState(''); // State for the file name

  // Function to handle file input for .eml files
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); // Set the file name when a file is selected

      const reader = new FileReader();
      reader.onload = (event) => {
        setEmailContent(event.target.result); // Set the email content from the file
      };
      reader.readAsText(file);
    }
  };

  // Function to trigger scanning
  const handleScan = async () => {
    if (!emailContent) {
      alert('Please upload a .eml file first.');
      return;
    }
    setLoading(true);
    setIsSpinning(true);  // Start spinning logo during the scan

    try {
      const response = await fetch('http://127.0.0.1:5002/api/detect-phishing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_content: emailContent }),
      });

      const data = await response.json();
      setResult(data);  // Set the result of the scan

    } catch (error) {
      setResult({ success: false, error: 'Error connecting to the server.' });
    } finally {
      setLoading(false);
      setIsSpinning(false); // Stop spinning once scan is finished
    }
  };

  return (
    <div class="container">
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem' }}>
      {/* Logo and spinning animation */}
      <div style={{ textAlign: 'center' }}>
        <img
          src={Logo}
          alt="Logo"
          className={`Logo${isSpinning ? " spin" : ""}`}
          style={{ width: '100px', height: '100px', marginBottom: '1rem' }}
        />
        {loading && <p className="loading-text">Scanning...</p>}
      </div>

      <h2>Email Phishing Scanner</h2>
      <p>Please upload a .eml file containing the email you want to analyze.</p>

      {/* File input for uploading .eml file */}
      <div className="file-upload">
        <input
          type="file"
          accept=".eml"
          id="fileInput"
          onChange={handleFileChange}
          style={{ marginBottom: '1rem' }}
        />
        <label htmlFor="fileInput">{fileName || 'No file chosen'}</label>
      </div>
      {/* Other Button for uploading .eml file */}
      <div className='uploadbutton'>
        <button class="upload-button" onclick="document.getElementById('fileInput').click();">Upload .eml file</button>
      </div>
      {/* Scan button */}
      <button
        onClick={handleScan}
        disabled={loading}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        {loading ? 'Scanning...' : 'Scan Email'}
      </button>
      {/* Area for inputing Text Manually*/}
      <div>
      <textarea class="text-input" placeholder="Or paste email content here manually"></textarea>
      </div>
      {/* Display the scan results */}
      {result && (
        <div style={{ marginTop: '2rem' }}>
          {result.success ? (
            <div>
              <h3>Analysis Result</h3>
              <p><strong>Final Decision:</strong> {result.final_summary}</p>
              <p><strong>Phishing:</strong> {result.is_phishing ? 'Yes' : 'No'}</p>
              <p><strong>Confidence Score:</strong> {result.confidence_score ?? 'N/A'}</p>
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
                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.raw_analysis && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Raw Analysis:</strong>
                  <pre style={{ background: '#f0f0f0', padding: '1rem', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {result.raw_analysis}
                  </pre>
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
    </div>
  );
};

export default EmailScanner;
