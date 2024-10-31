const chatLog = document.getElementById('chat-log'),
    userInput = document.getElementById('user-input'),
    sendButton = document.getElementById('send-button'),
    buttonIcon = document.getElementById('button-icon'),
    info = document.querySelector('.info');


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';


const synth = window.speechSynthesis;
let isMuted = false;


const voiceButton = document.createElement('button');
voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
voiceButton.className = 'voice-button';
sendButton.parentNode.insertBefore(voiceButton, sendButton);


const muteButton = document.createElement('button');
muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
muteButton.className = 'mute-button';
sendButton.parentNode.insertBefore(muteButton, sendButton);


let isListening = false;


voiceButton.addEventListener('click', toggleVoiceInput);
muteButton.addEventListener('click', toggleMute);
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});


function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
        muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        muteButton.setAttribute('title', 'Unmute AI voice');
        synth.cancel();
    } else {
        muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        muteButton.setAttribute('title', 'Mute AI voice');
    }
    muteButton.classList.toggle('muted');
}


function toggleVoiceInput() {
    if (!isListening) {
        recognition.start();
        voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        voiceButton.classList.add('listening');
        isListening = true;
    } else {
        recognition.stop();
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.classList.remove('listening');
        isListening = false;
    }
}


recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
};


recognition.onend = () => {
    voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceButton.classList.remove('listening');
    isListening = false;
};


function splitIntoSentences(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
}


function speakMessage(message) {
    if (isMuted) return;


    synth.cancel();


    const sentences = splitIntoSentences(message);
    let currentSentence = 0;


    function speakNextSentence() {
        if (currentSentence < sentences.length && !isMuted) {
            const utterance = new SpeechSynthesisUtterance(sentences[currentSentence]);
            utterance.lang = 'en-GB';
            utterance.rate = 1.01;
            utterance.pitch = 1.4;


           
            utterance.onend = () => {
                currentSentence++;
                speakNextSentence();
            };


           
            utterance.onerror = (event) => {
                console.error('Speech error:', event);
                currentSentence = sentences.length;
            };


            synth.speak(utterance);
        }
    }


    speakNextSentence();
}


async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') {
        return;
    }
    

    appendMessage('user', message);
    userInput.value = '';


    try {
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': '96fe58a1edmsh64abdfc6c6d56dap19fd5djsnd234de8c1a26',
		'x-rapidapi-host': 'chat-gpt26.p.rapidapi.com',
		'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                model: 'gpt-3.5-turbo'
            })
        };


        const response = await fetch('https://chat-gpt26.p.rapidapi.com/', options);
        const data = await response.json();
       
        const botResponse = data.choices[0].message.content;
        appendMessage('bot', botResponse);
       
        speakMessage(botResponse);
       
        buttonIcon.classList.add('fa-solid', 'fa-bolt');
        buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
    } catch (err) {
        console.error('Error:', err);
        appendMessage('bot', 'Sorry, there was an error processing your request.');
        buttonIcon.classList.add('fa-solid', 'fa-bolt');
        buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
    }
}


function appendMessage(sender, message) {
    info.style.display = "none";
    buttonIcon.classList.remove('fa-solid', 'fa-bolt');
    buttonIcon.classList.add('fas', 'fa-spinner', 'fa-pulse');
   
    const messageElement = document.createElement('div');
    const iconElement = document.createElement('div');
    const chatElement = document.createElement('div');
    const icon = document.createElement('i');
   
    chatElement.classList.add("chat-box");
    iconElement.classList.add("icon");
    messageElement.classList.add(sender);
    messageElement.innerText = message;
   
    if (sender === 'user') {
        icon.classList.add('fa-solid', 'fa-ghost');
        iconElement.setAttribute('id', 'user-icon');
    } else {
        icon.classList.add('fa-solid', 'fa-circle-notch');
        iconElement.setAttribute('id', 'bot-icon');
    }
   
    iconElement.appendChild(icon);
    chatElement.appendChild(iconElement);
    chatElement.appendChild(messageElement);
    chatLog.appendChild(chatElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}