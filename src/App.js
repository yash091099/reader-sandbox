import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const apiUrl = 'http://157.245.110.126:2101';

function App() {
  const [isLogsFullScreen, setIsLogsFullScreen] = useState(false);
  const [isErrorLogsFullScreen, setIsErrorLogsFullScreen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [logs, setLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchErrorLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/download/logs/TEST-READER-out`);
      setLogs(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/TEST-READER-error`);
      setErrorLogs(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch error logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    try {
      const formData = new FormData();
      formData.append('file', event.target.files[0]);
      setLoading(true);
      await axios.post(`${apiUrl}/upload/new/exchangeFile`, formData);
      setSelectedFile(event.target.files[0].name);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      setLoading(true);
      await axios.post(`${apiUrl}/${action}/reader`);
      toast.success(`Reader ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} reader`);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => setShowModal(!showModal);

  const handleJsonChange = (e) => {
    try {
      JSON.parse(e.target.value);
      setJsonData(e.target.value);
      setJsonError('');
    } catch (err) {
      setJsonError('Invalid JSON input');
    }
  };

  const handleSubmit = () => {
    try {
      JSON.parse(jsonData);
      setJsonError('');
      toggleModal();
    } catch (err) {
      setJsonError('Please ensure the JSON is valid before submitting.');
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonData);
    alert('JSON copied to clipboard!');
  };

  return (
    <div className="App">
      <ToastContainer />
      <div className="container">
        <div className="upload-strategy">
          <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileChange} />
          <label htmlFor="file-upload" className="upload-btn">
            <i className="fas fa-paperclip"></i> {selectedFile ? selectedFile : 'Upload File'}
          </label>
        </div>
        <div className="action-tabs">
          <button className="action-btn start" onClick={() => handleAction('start')}>START</button>
          <button className="action-btn stop" onClick={() => handleAction('stop')}>STOP</button>
          <button className="action-btn delete" onClick={() => handleAction('delete')}>DELETE</button>
        </div>
        {loading && (
          <div className="skeleton-loader">
            Loading...
          </div>
        )}
        {showModal && (
          <div className="modal">
            <button className="close-btn" onClick={toggleModal}>&times;</button>
            <textarea onChange={handleJsonChange} value={jsonData} placeholder="Enter JSON here..." className="json-input"></textarea>
            {jsonError && <p className="error">{
              jsonError}</p>}
              <button onClick={handleSubmit} className="submit-btn">Submit</button>
            </div>
          )}
          {jsonData && !jsonError && (
            <div className="json-preview">
              <button onClick={handleCopyJson} className="copy-btn"><i className="fas fa-copy"></i></button>
              <pre>{jsonData}</pre>
            </div>
          )}
          <div className="logs-container">
            {loading ? (
              <div className="skeleton-loader">Loading logs...</div>
            ) : (
              <>
                <div className={`logs-output ${isLogsFullScreen ? 'full-screen' : ''}`}>
                  <div className="card">
                    <div className="card-header">
                      Logs Output
                      <button className="fullscreen-btn" onClick={() => setIsLogsFullScreen(!isLogsFullScreen)}>
                        {isLogsFullScreen ? 'Minimise' : 'Full Screen'}
                      </button>
                    </div>
                    <div className="card-body">
                      {logs.map(log => <p key={log}>{log}</p>)}
                    </div>
                  </div>
                </div>
                <div className={`error-logs ${isErrorLogsFullScreen ? 'full-screen' : ''}`}>
                  <div className="card">
                    <div className="card-header">
                      Error Logs
                      <button className="fullscreen-btn" onClick={() => setIsErrorLogsFullScreen(!isErrorLogsFullScreen)}>
                        {isErrorLogsFullScreen ? 'Minimise' : 'Full Screen'}
                      </button>
                    </div>
                    <div className="card-body">
                      {errorLogs.map(error => <p key={error}>{error}</p>)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  export default App;
  