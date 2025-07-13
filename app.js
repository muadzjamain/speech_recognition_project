require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Simple ping/pong to keep connection alive
  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('interpret-text', async (text) => {
    try {
      const prompt = `Provide a plain text response without any markdown formatting bold italics. Interpret the following text: ${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const interpretation = await response.text();
      socket.emit('interpretation-result', interpretation);
    } catch (error) {
      console.error('Error with Gemini API:', error);
      socket.emit('error', 'Failed to get interpretation from Gemini API.');
    }
  });
});

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
