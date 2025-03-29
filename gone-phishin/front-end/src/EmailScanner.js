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
