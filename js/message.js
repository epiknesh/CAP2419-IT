const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = (event) => {
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function () {
            displayMessage(reader.result); // Convert Blob to text
        };
        reader.readAsText(event.data);
    } else {
        displayMessage(event.data); // Already a string
    }
};

// Function to display received messages
function displayMessage(messageText) {
    const chatboxMessages = document.querySelector('.chatbox__messages');
    const newMessage = document.createElement('div');
    newMessage.className = 'message message--received';
    newMessage.innerHTML = `
        <img src="img/noprofile.jpg" alt="Profile Picture" class="message__profile-pic">
        <div class="message__content">
            <p>Other User</p>
            <p>${messageText}</p>
            <span class="message__time">${new Date().toLocaleTimeString()}</span>
        </div>`;
    chatboxMessages.appendChild(newMessage);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}

const sendButton = document.querySelector('.chatbox__input button');
const input = document.querySelector('.chatbox__input input');

sendButton.addEventListener('click', sendMessage);
input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = input.value.trim();
    if (message !== '') {
        socket.send(message);
        appendSentMessage(message);
        input.value = '';
    }
}

// Function to append sent messages to the chatbox
function appendSentMessage(message) {
    const chatboxMessages = document.querySelector('.chatbox__messages');
    const newMessage = document.createElement('div');
    newMessage.className = 'message message--sent';
    newMessage.innerHTML = `
        <img src="img/noprofile.jpg" alt="Profile Picture" class="message__profile-pic">
        <div class="message__content">
            <p>You</p>
            <p>${message}</p>
            <span class="message__time">${new Date().toLocaleTimeString()}</span>
        </div>`;
    chatboxMessages.appendChild(newMessage);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}
