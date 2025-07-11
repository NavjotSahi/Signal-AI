// frontend/src/CreateIncidentForm.js
import React, { useState } from "react";
import axios from "axios";
import "./CreateIncidentForm.css";

const API_URL = "http://127.0.0.1:8000";

// We accept a function 'onIncidentCreated' as a prop
// to notify the parent component (App.js) when we're done.
function CreateIncidentForm({ onIncidentCreated }) {
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("medium"); // Default severity
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission which reloads the page
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/incidents`, {
        source,
        message,
        severity,
      });

      // Call the function passed from App.js to update the main list
      onIncidentCreated(response.data);

      // Reset the form for the next entry
      setSource("");
      setMessage("");
      setSeverity("medium");
    } catch (err) {
      setError("Failed to create incident. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Incident</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="source">Source</label>
          <input
            id="source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., Prometheus, Grafana"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the incident..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Incident"}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateIncidentForm;
