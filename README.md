# Bouchra

# Chatbot Application README

https://bouchra.onrender.com/

## Introduction
This project is a multilingual chatbot application that allows users to communicate using text or voice messages in **French**, **English**, **Arabic**, and **Hausa**. The chatbot stores all messages in the user's browser using **IndexedDB** and provides options to copy, share, download, and listen to AI-generated responses.

## Features
1. **Multilingual Support**
   - Supports communication in four languages:
     - **French**
     - **English**
     - **Arabic**
     - **Hausa**
2. **Message Types**
   - Users can send:
     - **Text messages**
     - **Voice messages**
3. **Message Storage**
   - Messages are stored locally in the browser using **IndexedDB**.
4. **Message Actions**
   - Users can:
     - **Copy** messages to the clipboard.
     - **Share** messages using the Web Share API.
     - **Download** messages as text or audio files.
     - **Listen** to AI-generated voice responses.

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: FastAPI (Python)
- **Local Storage**: IndexedDB (Browser-based database)
- **Voice Processing**:
  - Speech-to-text and text-to-speech conversion using Web APIs and Python libraries.

## Prerequisites
Ensure you have the following installed:
1. **Python 3.9+**
2. **FastAPI** and required dependencies
3. **A modern web browser** (with IndexedDB support)

## Installation

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/UmarBelloKanwa/Bouchra
   cd chatbot-project/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Linux/macOS
   venv\Scripts\activate    # For Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Open `index.html` in your browser.

## Usage
1. Launch the backend server by running the following command in the `backend` directory:
   ```bash
   uvicorn main:app --reload
   ```
2. Open `index.html` in your browser to access the chatbot interface.

## Key Functionalities
- **Send Messages**: Users can send text or voice messages.
- **Receive AI Responses**: AI responses are displayed and can be listened to using the built-in text-to-speech feature.
- **Manage Messages**:
  - Copy messages to the clipboard.
  - Share messages via supported apps or platforms.
  - Download messages as files.
  - Listen to AI responses directly from the interface.

## Future Enhancements
1. Add more languages for communication.
2. Implement offline support for the chatbot.
3. Enhance the UI/UX with more interactive elements.

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Contributors
- **Umar Bello Kanwa** ([umarbellokawa@gmail.com](mailto:umarbellokawa@gmail.com))

---
Thank you for using this chatbot application!

