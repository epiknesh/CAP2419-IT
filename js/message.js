const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = (event) => {
    let messageData;
    
    try {
        messageData = JSON.parse(event.data); // Attempt to parse JSON
    } catch (error) {
        console.error("Invalid message format:", event.data);
        return; // Exit if parsing fails
    }

    displayReceivedMessage(messageData);
};

// Function to display received messages
function displayReceivedMessage(messageData) {
    const chatboxMessages = document.querySelector('.chatbox__messages');
    const newMessage = document.createElement('div');
    newMessage.className = 'message message--received';
    newMessage.innerHTML = `
        <img src="${messageData.profilePic}" alt="Profile Picture" class="message__profile-pic">
        <div class="message__content">
            <p>${messageData.sender}</p>
            <p>${messageData.message}</p>
            <span class="message__time">${new Date(messageData.timestamp).toLocaleTimeString()}</span>
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
    const messageText = input.value.trim();
    if (messageText === '') return;

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const messageData = {
        sender: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`, // Concatenating first and last name
        profilePic: user.pic || 'img/noprofile.jpg', // Fallback if profile picture is missing
        message: messageText,
        timestamp: new Date().toISOString()
    };
    
    socket.send(JSON.stringify(messageData)); // Send as JSON
    appendSentMessage(messageData);

    input.value = ''; // Clear input field
}


// Function to append sent messages to the chatbox
function appendSentMessage(messageData) {
    const chatboxMessages = document.querySelector('.chatbox__messages');
    const newMessage = document.createElement('div');
    newMessage.className = 'message message--sent';
    newMessage.innerHTML = `
        <img src="${messageData.profilePic}" alt="Profile Picture" class="message__profile-pic">
        <div class="message__content">
            <p>${messageData.sender}</p>
            <p>${messageData.message}</p>
            <span class="message__time">${new Date(messageData.timestamp).toLocaleTimeString()}</span>
        </div>`;
    
    chatboxMessages.appendChild(newMessage);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}
