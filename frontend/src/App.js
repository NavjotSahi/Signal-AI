import React, { useState, useEffect } from "react";
import axios from "axios"; // For making API calls
import "./App.css"; // We'll add some styles here
import CreateIncidentForm from "./CreateIncidentForm";

// The backend API is running on port 8000
// We define this so we don't have to type it out every time.
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function App() {
  // 'incidents' will hold our list of incidents from the API
  const [incidents, setIncidents] = useState([]);
  // 'loading' will be true while we are fetching data
  const [loading, setLoading] = useState(true);
  // 'error' will hold any error message if our API call fails
  const [error, setError] = useState(null);

  // useEffect is a React hook that runs after the component renders.
  // The empty array [] at the end means it will only run ONCE, when the component first loads.
  useEffect(() => {
    // We define an async function to fetch the data
    const fetchIncidents = async () => {
      try {
        // Make a GET request to our backend's /incidents endpoint
        const response = await axios.get(`${API_URL}/incidents`);
        // Update our state with the data from the API
        setIncidents(response.data);
      } catch (err) {
        // If there's an error, update the error state
        setError("Failed to fetch incidents. Is the backend server running?");
        console.error(err);
      } finally {
        // Whether it succeeds or fails, we are no longer loading
        setLoading(false);
      }
    };

    fetchIncidents(); // Call the function to start fetching
  }, []); // The empty array ensures this effect runs only once

  // --- Add this new function inside your App component ---

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      // Call the new PATCH endpoint
      const response = await axios.patch(
        `${API_URL}/incidents/${incidentId}/status`,
        {
          status: newStatus,
        }
      );

      // The API returns the updated incident. Now we update our local state.
      setIncidents((currentIncidents) =>
        currentIncidents.map((inc) =>
          // Find the incident that was changed...
          inc._id === incidentId
            ? // ...and replace it with the updated one from the server.
              response.data
            : // Otherwise, keep the incident as it was.
              inc
        )
      );
    } catch (err) {
      // You can add more robust error handling here, like a pop-up toast
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    }
  };
  // --- Add this function to App.js ---
  const handleIncidentCreated = (newIncident) => {
    // Add the new incident to the top of the existing list
    setIncidents((currentIncidents) => [newIncident, ...currentIncidents]);
  };

  // --- Render Logic ---
  if (loading) {
    return <div>Loading incidents...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Incident Response Dashboard</h1>
      </header>
      <main>
        {/* --- ADD THE FORM COMPONENT HERE --- */}
        <CreateIncidentForm onIncidentCreated={handleIncidentCreated} />
        <div className="incident-table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Source</th>
                <th>Message</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <tr key={incident._id}>
                    <td>{new Date(incident.timestamp).toLocaleString()}</td>
                    <td>{incident.category || "N/A"}</td>
                    <td>{incident.source}</td>
                    <td>{incident.message}</td>
                    <td className={`severity-${incident.severity}`}>
                      {incident.severity}
                    </td>
                    {/* --- This is the new, interactive status cell --- */}
                    <td>
                      <select
                        value={incident.status}
                        onChange={(e) =>
                          handleStatusChange(incident._id, e.target.value)
                        }
                        className={`status-select status-${incident.status}`}
                      >
                        <option value="new">New</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No incidents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
