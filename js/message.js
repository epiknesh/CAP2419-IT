const socket = new WebSocket('ws://localhost:8080');

const user = JSON.parse(localStorage.getItem('user'));

const currentAccountID = user.accountid;


let currentChannel = "general";
let lastMessageDate = null;

const sidebar = document.getElementById('sidebar');

async function loadUserChannels() {
  try {
    // Assuming currentAccountID is defined globally or passed in
    const response = await fetch(`http://localhost:3000/channels?accountID=${currentAccountID}`);
    const channels = await response.json();

console.log("Fetched channels:", channels); // Log the channels

    renderChannels(channels);

    // Join the first channel or fallback to 'general'
    if (channels.length > 0) {
      switchChannel(channels[0].name); // change '.name' if your property differs
    } else {
      switchChannel('general');
    }
  } catch (error) {
    console.error("Failed to load channels:", error);
    switchChannel('general');
  }
}


function renderChannels(channels) {
  const channelsContainer = document.getElementById('channels-container');

  // Clear previous channels (but preserve home link if needed)
  channelsContainer.innerHTML = '';

  channels.forEach(channel => {
    const a = document.createElement('a');
    a.href = "#";
    a.classList.add('channel-button');
    a.dataset.channel = channel.name;

    // Determine icon based on channel name/type
    let iconClass = 'bx bx-chat';

    const roleChannels = ['Admins', 'Drivers', 'Controllers', 'Dispatchers', 'Maintenance', 'Cashiers'];
    const roleChannelsLower = roleChannels.map(r => r.toLowerCase());

    const channelNameLower = channel.name.toLowerCase();

    if (channelNameLower === 'jst kidlat' || channelNameLower === 'general') {
      iconClass = 'bx bx-chat';
    } else if (roleChannelsLower.includes(channelNameLower)) {
      iconClass = 'bx bx-group';
    } else if (/^bus \d+$/i.test(channel.name)) {
      iconClass = 'bx bx-bus';
    }

    a.innerHTML = `<i class='${iconClass}'></i> ${channel.name}`;

    // Add 'active' class if it's JST Kidlat (default)
    if (channelNameLower === 'jst kidlat') {
      a.classList.add('active');
      const channelTitle = document.getElementById('channel-title');
      if (channelTitle) {
        channelTitle.textContent = channel.name;
      }
    }

    a.addEventListener('click', () => {
      // Remove active class from all channel buttons
      document.querySelectorAll('#channels-container .channel-button').forEach(el => {
        el.classList.remove('active');
      });

      // Add active class to the clicked one
      a.classList.add('active');

      // Update channel title
      const channelTitle = document.getElementById('channel-title');
      if (channelTitle) {
        channelTitle.textContent = channel.name;
      }

      // Trigger channel switch logic
      switchChannel(channel.name);
    });

    channelsContainer.appendChild(a);
  });
}






function switchChannel(channel) {
  if (channel === currentChannel) return;

  currentChannel = channel;
  lastMessageDate = null;
  document.querySelector('.chatbox__messages').innerHTML = '';

  socket.send(JSON.stringify({
    type: "joinChannel",
    channel: currentChannel
  }));
}

// Call loadUserChannels on page load
window.addEventListener('DOMContentLoaded', () => {
  loadUserChannels();
});

socket.onopen = () => {
    // Join the default channel on load
    socket.send(JSON.stringify({ type: "joinChannel", channel: currentChannel }));
};

socket.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (error) {
        console.error("Invalid message format:", event.data);
        return;
    }

    if (data.type === "history") {
        // Load previous messages for the channel
        data.messages.forEach(displayReceivedMessage);
    } else {
        displayReceivedMessage(data);
    }
};

function displayReceivedMessage(messageData) {
    if (!messageData || messageData.channel !== currentChannel) return;

    const chatboxMessages = document.querySelector('.chatbox__messages');
    const messageDate = new Date(messageData.timestamp);
    const formattedDate = messageDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (lastMessageDate !== formattedDate) {
        lastMessageDate = formattedDate;
        const dateDivider = document.createElement('div');
        dateDivider.className = 'date-divider';
        dateDivider.innerText = formattedDate;
        chatboxMessages.appendChild(dateDivider);
    }

    const isSent = messageData.sender === getUserName();
    const messageClass = isSent ? "message message--sent" : "message message--received";

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
        type: "chatMessage",
        sender: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
        profilePic: user.pic || 'img/noprofile.jpg',
        message: messageText,
        voiceMessage: null,
        channel: currentChannel,
        timestamp: new Date().toISOString()
    };

    socket.send(JSON.stringify(messageData));
    input.value = '';
}

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
            type: "chatMessage",
            sender: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
            profilePic: user.pic || 'img/noprofile.jpg',
            message: null,
            voiceMessage: data.voiceUrl,
            channel: currentChannel,
            timestamp: new Date().toISOString()
        };

        socket.send(JSON.stringify(messageData));
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
        recordButton.classList.add("recording");
    } else {
        stopRecording();
        recordButton.classList.remove("recording");
    }
});

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
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


