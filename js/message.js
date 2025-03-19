const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (error) {
        console.error("Invalid message format:", event.data);
        return;
    }

    if (data.type === "history") {
        // Load previous messages
        data.messages.forEach(displayReceivedMessage);
    } else {
        displayReceivedMessage(data);
    }
};


let lastMessageDate = null; // Keeps track of the last displayed message date

function displayReceivedMessage(messageData) {
    const chatboxMessages = document.querySelector('.chatbox__messages');
    const messageDate = new Date(messageData.timestamp);
    const formattedDate = messageDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Check if this is the first message of a new day
    if (lastMessageDate !== formattedDate) {
        lastMessageDate = formattedDate; // Update the last recorded date

        // Create a date divider
        const dateDivider = document.createElement('div');
        dateDivider.className = 'date-divider';
        dateDivider.innerText = formattedDate;
        chatboxMessages.appendChild(dateDivider);
    }

    // Create message element
    const newMessage = document.createElement('div');
    newMessage.className = messageData.sender === getUserName() ? 'message message--sent' : 'message message--received';

    newMessage.innerHTML = `
        <img src="${messageData.profilePic}" alt="Profile Picture" class="message__profile-pic">
        <div class="message__content">
            <p>${messageData.sender}</p>
            <p>${messageData.message}</p>
            <span class="message__time">${messageDate.toLocaleTimeString()}</span>
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
        sender: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
        profilePic: user.pic || 'img/noprofile.jpg',
        message: messageText,
        timestamp: new Date().toISOString()
    };

    socket.send(JSON.stringify(messageData)); // Send message to server

    input.value = ''; // Clear input field
}


// Function to append sent messages to the chatbox
function appendSentMessage(messageData) {
    displayReceivedMessage(messageData);
}

// Helper function to get username
function getUserName() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`;
}
