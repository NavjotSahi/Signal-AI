# AI-Powered Incident Response Platform

A full-stack, AI-driven web application designed to streamline IT incident management. This platform allows users to log new incidents, which are then automatically classified by an AI model. Teams can track and update the status of incidents through a clean, interactive dashboard.

**Live Demo:** **[https://incident-platform-ui.onrender.com/](https://incident-platform-ui.onrender.com/)**

---

## 🚀 Key Features

*   **🤖 AI-Powered Triage:** New incidents are automatically categorized (`database`, `networking`, `authentication`, etc.) using a zero-shot classification model from the Hugging Face Inference API.
*   **⚙️ Full-Stack CRUD Functionality:** Users can Create, Read, and Update incidents in a seamless, single-page application experience.
*   **✔️ Interactive Dashboard:** A clean, responsive table displays all incidents. Users can update an incident's status (`new`, `investigating`, `resolved`) directly from the UI with changes reflected instantly.
*   **Modern Tech Stack:** Built with a Python/FastAPI backend and a React frontend, demonstrating a mastery of modern web development tools.
*   **CI/CD Deployment:** The entire application is deployed on Render, with automatic deployments triggered on pushes to the main branch.

---

## 🛠️ Tech Stack

| Category      | Technology                                       |
| ------------- | ------------------------------------------------ |
| **Frontend**  | React, Axios, CSS                                |
| **Backend**   | Python, FastAPI, Gunicorn                        |
| **Database**  | MongoDB (via MongoDB Atlas)                      |
| **AI / ML**   | Hugging Face Inference API (bart-large-mnli)     |
| **Deployment**| Render (for frontend and backend)                |
| **Version Control**| Git & GitHub                               |

---

## ⚙️ Running Locally

To run this project on your local machine, follow these steps:

### Prerequisites

*   Git
*   Node.js and npm
*   Python 3.8+ and pip

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NavjotSahi/incident-platform
    cd incident-platform
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```
    Create a `.env` file in the `backend` directory and add your secrets:
    ```env
    MONGO_URI="your_mongodb_connection_string"
    HF_API_TOKEN="your_huggingface_api_token"
    ```
    Run the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running on `http://127.0.0.1:8000`.

3.  **Frontend Setup:**
    (Open a new terminal window)
    ```bash
    cd frontend
    npm install
    npm start
    ```
    The frontend will open automatically in your browser at `http://localhost:3000`.