# Voice Transcription & AI Interpretation Demo

A Node.js application that captures live voice input, transcribes it using Google Speech API, and interprets the transcribed text using Google's Gemini AI.

## Features

- Live voice capture
- Real-time speech-to-text transcription using Google Speech API
- AI interpretation using Google Gemini
- Voice-activated light/dark mode toggle
- Simple and intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- Google Cloud account with Speech-to-Text API enabled
- Google AI Studio account with Gemini API access

## Setup Instructions

1. Clone or download this repository

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Google Cloud credentials:
   - Create a Google Cloud project
   - Enable the Speech-to-Text API
   - Create a service account and download the JSON key file
   - Rename the key file to `google-credentials.json` and place it in the project root directory

4. Set up Gemini API:
   - Get your Gemini API key from Google AI Studio
   - Update the `.env` file with your API key

5. Configure environment variables:
   - Edit the `.env` file and update the following:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
     GEMINI_API_KEY=your_gemini_api_key_here
     PORT=3000
     ```

6. Start the application:
   ```
   npm start
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click the "Start Recording" button to begin capturing audio
2. Speak clearly into your microphone
3. Click "Stop Recording" when you're done speaking
4. View the transcription and AI interpretation in their respective panels
5. Use voice commands to toggle between light and dark mode:
   - Say "close the light" to switch to dark mode
   - Say "open the light" to switch to light mode

## Technologies Used

- Node.js
- Express.js
- Socket.io
- Google Cloud Speech-to-Text API
- Google Gemini AI
- Web Audio API

## License

MIT
