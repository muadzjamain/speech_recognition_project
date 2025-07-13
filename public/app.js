document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const recordingStatus = document.getElementById('recordingStatus');
    const statusText = document.getElementById('statusText');
    const transcriptionDiv = document.getElementById('transcription');
    const interpretationDiv = document.getElementById('interpretation');
    const modeIcon = document.getElementById('modeIcon');
    const modeText = document.getElementById('modeText');
    const clearTranscriptionButton = document.getElementById('clearTranscriptionButton');
    const clearInterpretationButton = document.getElementById('clearInterpretationButton');

    // Socket.io connection
    const socket = io();

    // Variables for speech recognition
    let recognition;
    let isRecording = false;
    let finalTranscript = '';

    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
        startButton.disabled = true;
        statusText.textContent = 'Speech recognition not supported';
    } else {
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Event handler for speech recognition results
        recognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    // Process the transcript locally
                    handleTranscription(transcript);
                    // Add to transcription display
                    transcriptionDiv.innerHTML += `<p>${transcript}</p>`;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update transcription display
            transcriptionDiv.innerHTML = `
                <p>${finalTranscript}</p>
                <p><i>${interimTranscript}</i></p>
            `;
        };

        // Event handlers for speech recognition
        recognition.onstart = () => {
            isRecording = true;
            recordingStatus.classList.add('recording');
            statusText.textContent = 'Listening...';
            startButton.disabled = true;
            stopButton.disabled = false;
        };

        recognition.onend = () => {
            if (isRecording) {
                // If still recording, restart recognition (to make it continuous)
                recognition.start();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            statusText.textContent = `Error: ${event.error}`;
        };
    }
    
    // Function to start recording
    function startRecording() {
        try {
            finalTranscript = '';
            recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            statusText.textContent = 'Error: Could not start speech recognition';
        }
    }
    
    // Function to stop recording
    function stopRecording() {
        if (recognition && isRecording) {
            recognition.stop();
            
            // Update UI
            isRecording = false;
            recordingStatus.classList.remove('recording');
            statusText.textContent = 'Ready';
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    }
    
    // Event listeners for buttons
    startButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);
    clearTranscriptionButton.addEventListener('click', () => {
        transcriptionDiv.innerHTML = '';
        finalTranscript = '';
    });
    clearInterpretationButton.addEventListener('click', () => {
        interpretationDiv.innerHTML = '';
    });
    
    // Function to process text with Gemini API via backend
    function processWithGemini(text) {
        statusText.textContent = 'Processing with Gemini...';
        socket.emit('interpret-text', text);
    }

    // Socket event handlers
    socket.on('connect', () => {
        console.log('Connected to server');
        statusText.textContent = 'Ready';
    });

    socket.on('interpretation-result', (interpretation) => {
        interpretationDiv.innerHTML += `<p>${interpretation}</p>`;
        statusText.textContent = 'Ready';
    });
    
    // Handle light/dark mode toggle
    function toggleMode(mode) {
        if (mode === 'dark') {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            modeIcon.classList.remove('fa-sun');
            modeIcon.classList.add('fa-moon');
            modeText.textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            modeIcon.classList.remove('fa-moon');
            modeIcon.classList.add('fa-sun');
            modeText.textContent = 'Light Mode';
        }
    }
    
    // Process transcription results
    async function handleTranscription(text) {
        // Check for light/dark mode commands
        const lowerText = text.toLowerCase();
        if (lowerText.includes('close the light') || lowerText.includes('dark mode')) {
            toggleMode('dark');
        } else if (lowerText.includes('open the light') || lowerText.includes('light mode')) {
            toggleMode('light');
        }
        
        // Process with Gemini
        await processWithGemini(text);
    }
    
    socket.on('error', (errorMessage) => {
        console.error('Server error:', errorMessage);
        statusText.textContent = `Error: ${errorMessage}`;
    });
});
