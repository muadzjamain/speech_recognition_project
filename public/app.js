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
                    handleTranscription(transcript); // Process for commands and AI interpretation
                    transcriptionDiv.innerHTML = `<p>${finalTranscript}</p>`; // Show the full final transcript
                } else {
                    interimTranscript += transcript;
                }
            }
            // Show interim results separately
            const finalP = transcriptionDiv.querySelector('p:first-child') || document.createElement('p');
            let interimP = transcriptionDiv.querySelector('p:last-child i');
            if (!interimP) {
                const p = document.createElement('p');
                interimP = document.createElement('i');
                p.appendChild(interimP);
                transcriptionDiv.appendChild(p);
            } else {
                 interimP = interimP.parentElement;
            }
            finalP.innerHTML = finalTranscript;
            interimP.innerHTML = `<i>${interimTranscript}</i>`;
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
    
    const handleTranscription = async (text) => {
        if (!text.trim()) return;

        // First, check for mode commands
        const lowerText = text.toLowerCase();
        if (lowerText.includes('close the light') || lowerText.includes('dark mode')) {
            toggleMode('dark');
        } else if (lowerText.includes('open the light') || lowerText.includes('light mode')) {
            toggleMode('light');
        }

        // Then, send for AI interpretation
        try {
            const response = await fetch('/api/interpret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();
            interpretationDiv.innerHTML = `<p>${data.interpretation}</p>`;
        } catch (error) {
            console.error('Error fetching interpretation:', error);
            interpretationDiv.innerHTML = `<p class="error">Failed to get interpretation. Please try again.</p>`;
        }
    };
});
