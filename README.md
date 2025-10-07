# HealthInsight Hub

HealthInsight Hub is an interactive web application designed to help users explore potential health symptoms in an intuitive and educational way. It is not a substitute for professional medical advice but serves as a tool to guide users in understanding their health concerns better.

## Features

- **Interactive Symptom Checker:** A visual, clickable body map to identify areas of concern.
- **Guided Questions:** A series of questions to narrow down potential conditions.
- **User Authentication:** Secure login and registration for users to save and view their diagnosis history.
- **Admin Dashboard:** A separate interface for administrators to manage the application.
- **Privacy-Focused:** User data is handled securely, and the tool is designed to be anonymous without an account.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm installed
- MongoDB installed and running

### Installation

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your_username/healthinsight-hub.git
   ```
2. **Install NPM packages for the backend:**
   ```sh
   cd backend
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the `backend` directory and add the following:
   ```
   MONGO_URI=mongodb://localhost:27017/healthinsight
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

1. **Start the backend server:**
   ```sh
   cd backend
   node server.js
   ```
2. **Open the frontend:**
   Open the `index.html` file in your browser to start using the application.

## Disclaimer

This tool is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.