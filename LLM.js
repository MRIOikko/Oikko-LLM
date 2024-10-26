const chatLog = document.getElementById('chat-log'),
    userInput = document.getElementById('user-input'),
    sendButton = document.getElementById('send-button'),
    buttonIcon = document.getElementById('button-icon'),
    info = document.querySelector('.info');

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') {
        return;
    }
    appendMessage('user', message);
    userInput.value = '';

    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '96fe58a1edmsh64abdfc6c6d56dap19fd5djsnd234de8c1a26',
		'x-rapidapi-host': 'chat-gpt26.p.rapidapi.com',
		'Content-Type': 'application/json',
        },
        body: `{"messages":[{"role":"user","content":"${message}"}]}`
    };
    fetch('https://chat-gpt26.p.rapidapi.com/', options).then((response) => response.json()).then((response) => {
        appendMessage('bot', response.choices[0].message.content);

        buttonIcon.classList.add('fa-solid', 'fa-bolt');
        buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
    }).catch((err) => {
        if (err.name === 'TypeError') {
            appendMessage('bot', 'ERROR : Check Your Skibidi API Key! ');
            buttonIcon.classList.add('fa-solid', 'fa-bolt');
            buttonIcon.classList.remove('fas', 'fa-spinner', 'fa-pulse');
        }
    });
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
    chatLog.scrollTo = chatLog.scrollHeight;

}