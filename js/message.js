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
    if (!messageData) return;

    const chatboxMessages = document.querySelector('.chatbox__messages');
    const messageDate = new Date(messageData.timestamp);
    const formattedDate = messageDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // ✅ Add Date Divider if new day
    if (lastMessageDate !== formattedDate) {
        lastMessageDate = formattedDate;
        const dateDivider = document.createElement('div');
        dateDivider.className = 'date-divider';
        dateDivider.innerText = formattedDate;
        chatboxMessages.appendChild(dateDivider);
    }

    // ✅ Determine if message is sent or received
    const isSent = messageData.sender === getUserName();
    const messageClass = isSent ? "message message--sent" : "message message--received";

    // ✅ Build message content
    let messageContent = "";
    if (messageData.message) {
        messageContent = `<p>${messageData.message}</p>`;
    } else if (messageData.voiceMessage) {
        messageContent = `<audio controls src="${messageData.voiceMessage}"></audio>`;
    }

 const newMessage = document.createElement('div');
newMessage.className = messageClass;
newMessage.innerHTML = isSent
    ? `
        <div class="message__content">
            <p class="message__user">${messageData.sender}</p>
            ${messageContent}
            <span class="message__time">${messageDate.toLocaleTimeString()}</span>
        </div>
        <img src="${messageData.profilePic}" alt="Profile Picture" class="message__profile-pic">
    `
    : `
        <img src="${messageData.profilePic}" alt="Profile Picture" class="message__profile-pic">
        <div class="message__content">
            <p class="message__user">${messageData.sender}</p>
            ${messageContent}
            <span class="message__time">${messageDate.toLocaleTimeString()}</span>
        </div>
    `;


    chatboxMessages.appendChild(newMessage);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}


const sendButton = document.getElementById('sendButton');
const input = document.querySelector('.chatbox__input input');

sendButton.addEventListener('click', function () {
    sendMessage();
});
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

async function sendVoiceMessage(audioBlob) {
    const formData = new FormData();
    formData.append("voice", audioBlob, "voice_message.webm");

    try {
        const response = await fetch("http://localhost:3000/upload-voice", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!data.voiceUrl) {
            console.error("Upload failed:", data);
            return;
        }

        const user = JSON.parse(localStorage.getItem('user')) || {};
        const messageData = {
            sender: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
            profilePic: user.pic || 'img/noprofile.jpg',
            message: null,
            voiceMessage: data.voiceUrl, // Cloudinary URL
            timestamp: new Date().toISOString()
        };

        socket.send(JSON.stringify(messageData)); // Send to WebSocket
    } catch (error) {
        console.error("Error uploading voice message:", error);
    }
}

let mediaRecorder;
let audioChunks = [];

const recordButton = document.getElementById("recordButton");

recordButton.addEventListener("click", async function () {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        startRecording();
        recordButton.classList.add("recording"); // 🔴 Turn button red
    } else {
        stopRecording();
        recordButton.classList.remove("recording"); // 🔵 Back to blue
    }
});


function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        recordButton.classList.remove("recording"); // 🔵 Reset after stop
        console.log("🛑 Recording stopped...");
    }
}


async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            sendVoiceMessage(audioBlob);
        };

        console.log("🎙️ Recording started...");
    } catch (error) {
        console.error("❌ Error accessing microphone:", error);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("🛑 Recording stopped...");
    }
}
