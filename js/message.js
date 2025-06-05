const socket = new WebSocket('ws://localhost:8080');

const user = JSON.parse(localStorage.getItem('user'));



 socket.addEventListener("open", () => {
    console.log("WebSocket connection established");
     socket.send(JSON.stringify({
    type: "initSession",
    accountId: JSON.parse(localStorage.getItem('user')).accountid
}));

});

const currentAccountID = user.accountid;

// Helper to get query param by name
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

let unreadMentionCounts = {};  // e.g., { "general": 3, "bus 1": 0, ... }

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const channels = await loadUserChannels();
    

    const channelToOpen = getQueryParam('channel');
   

    if (channelToOpen && channels.some(c => c.name === channelToOpen)) {
  switchChannel(channelToOpen);
  updateChannelUI(channelToOpen);
} else {
  const jstKidlatChannel = channels.find(c => c.name.toLowerCase() === 'jst kidlat');
  if (jstKidlatChannel) {
    switchChannel(jstKidlatChannel.name);
    updateChannelUI(jstKidlatChannel.name);
  } else if (channels.length > 0) {
    switchChannel(channels[0].name);
    updateChannelUI(channels[0].name);
  } else {
    switchChannel('general');
    updateChannelUI('general');
  }
}

  } catch (err) {
    console.error(err);
    switchChannel('general');
    updateChannelUI('general');
  }

   
});

function updateChannelUI(channelName) {
  const channelButtons = document.querySelectorAll('#channels-container .channel-button');
  channelButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.channel === channelName);
  });

  const channelTitle = document.getElementById('channel-title');
  if (channelTitle) {
    channelTitle.textContent = channelName;
  }
}




let currentChannel = "general";
let lastMessageDate = null;

const sidebar = document.getElementById('sidebar');

async function loadUserChannels() {
  try {
    // Assuming currentAccountID is defined globally or passed in
    const response = await fetch(`/channels?accountID=${currentAccountID}`);
    const channels = await response.json();

console.log("Fetched channels:", channels); // Log the channels

    renderChannels(channels);

    // Join the first channel or fallback to 'general'
    if (channels.length > 0) {
      switchChannel(channels[0].name); // change '.name' if your property differs
    } else {
      switchChannel('general');
    }

    return channels; 
  } catch (error) {
    console.error("Failed to load channels:", error);
    switchChannel('general');
  }
}

function renderChannels(channels) {
  const channelsContainer = document.getElementById('channels-container');

  // Clear previous channels
  channelsContainer.innerHTML = '';

  const roleChannels = ['Admins', 'Drivers', 'Controllers', 'Dispatchers', 'Maintenance', 'Cashiers'];
  const roleChannelsLower = roleChannels.map(r => r.toLowerCase());

  // Sort channels
  const sortedChannels = [...channels].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA === 'jst kidlat') return -1;
    if (nameB === 'jst kidlat') return 1;

    const isRoleA = roleChannelsLower.includes(nameA);
    const isRoleB = roleChannelsLower.includes(nameB);

    const isBusA = /^bus \d+$/i.test(a.name);
    const isBusB = /^bus \d+$/i.test(b.name);

    if (isRoleA && !isRoleB) return -1;
    if (!isRoleA && isRoleB) return 1;

    if (isBusA && !isBusB) return 1;
    if (!isBusA && isBusB) return -1;

    return a.name.localeCompare(b.name); // fallback alphabetical
  });

  // Render sorted channels
  sortedChannels.forEach(channel => {
    const a = document.createElement('a');
    a.href = "#";
    a.classList.add('channel-button');
    a.dataset.channel = channel.name;

    let iconClass = 'bx bx-chat';
    const channelNameLower = channel.name.toLowerCase();

    if (channelNameLower === 'jst kidlat' || channelNameLower === 'general') {
      iconClass = 'bx bx-chat';
    } else if (roleChannelsLower.includes(channelNameLower)) {
      iconClass = 'bx bx-group';
    } else if (/^bus \d+$/i.test(channel.name)) {
      iconClass = 'bx bx-bus';
    }

    a.innerHTML = `<i class='${iconClass}'></i> ${channel.name}`;

    const badge = document.createElement('span');
    badge.classList.add('mention-badge');
    badge.style.display = 'none';
    badge.id = `mention-badge-${channel.name.replace(/\s+/g, '-').toLowerCase()}`;

    a.appendChild(badge);

    if (channelNameLower === 'jst kidlat') {
      a.classList.add('active');
      const channelTitle = document.getElementById('channel-title');
      if (channelTitle) {
        channelTitle.textContent = channel.name;
      }
    }

    a.addEventListener('click', () => {
      document.querySelectorAll('#channels-container .channel-button').forEach(el => {
        el.classList.remove('active');
      });

      a.classList.add('active');

      const channelTitle = document.getElementById('channel-title');
      if (channelTitle) {
        channelTitle.textContent = channel.name;
      }

      switchChannel(channel.name);
    });

    channelsContainer.appendChild(a);
  });
}



let membersInChannel = []; // Populated from backend
const inputBox = document.getElementById('textMessage');
const suggestionsBox = document.getElementById('mentionSuggestions');



// Fetch members when switching channel
async function fetchChannelMembers(channelName) {
  try {
    const res = await fetch(`/channel-members?channel=${channelName}`);
    const members = await res.json();
    membersInChannel = members; // e.g., [{name: "Juan Dela Cruz", accountid: "1"}, ...]
    console.log(membersInChannel);
  } catch (error) {
    console.error('Failed to fetch channel members:', error);
    membersInChannel = [];
  }
}

async function switchChannel(channel) {
  if (channel === currentChannel) return;

  // Immediately hide badge and reset count for the channel you're switching to
  const badge = document.getElementById(`mention-badge-${channel.replace(/\s+/g, '-').toLowerCase()}`);

  if (badge) {
    badge.style.display = 'none';
    badge.textContent = '0';
    unreadMentionCounts[channel] = 0;
  }

  currentChannel = channel;
  lastMessageDate = null;
  document.querySelector('.chatbox__messages').innerHTML = '';
  document.getElementById('textMessage').value = '';
  document.getElementById('mentionSuggestions').style.display = 'none';

  selectedMentions = [];

  await fetchChannelMembers(channel);

  socket.send(JSON.stringify({
    type: "joinChannel",
    channel: currentChannel
  }));


 
}





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
    data.messages.forEach(displayReceivedMessage);
  } else {
    displayReceivedMessage(data);
  }

  checkUnseenMentionsChannel();  // call once here
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
    const isMentioned = Array.isArray(messageData.mentions) &&
        messageData.mentions.some(m => Number(m.accountid) === currentAccountID);

    let messageClass = isSent ? "message message--sent" : "message message--received";

    let messageContent = "";
    if (messageData.message) {
        messageContent = `<p>${formatMentions(messageData.message, messageData.mentions)}</p>`;
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

    if (isMentioned) {
        const bubble = newMessage.querySelector('.message__content');
        if (bubble) {
            bubble.classList.add('message__content--mention');

            // If user already saw the message, add the 'stopped' class to stop animation
            if (Array.isArray(messageData.seenBy) && messageData.seenBy.includes(currentAccountID)) {
                bubble.classList.add('stopped');
            }
        }
    }

    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

    // SeenBy Update Section
    if (!Array.isArray(messageData.seenBy)) {
        messageData.seenBy = [];
    }

    socket.send(JSON.stringify({
    type: 'update-seenBy',
    messageId: messageData._id,
    accountId: currentAccountID
  }));

  // Immediately update the unreadMentionCounts locally
  if (unreadMentionCounts[currentChannel] && unreadMentionCounts[currentChannel] > 0) {
    unreadMentionCounts[currentChannel] = Math.max(0, unreadMentionCounts[currentChannel] - 1);

    // Update badge UI for current channel
    const badge = document.getElementById(`mention-badge-${currentChannel.replace(/\s+/g, '-').toLowerCase()}`);
    if (badge) {
      if (unreadMentionCounts[currentChannel] > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = unreadMentionCounts[currentChannel];
      } else {
        badge.style.display = 'none';
      }
    }
  }
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

    // Filter out removed mentions before sending
    const filteredMentions = selectedMentions.filter(mention =>
        messageText.includes(`@${mention.name}`)
    );

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const messageData = {
        type: "chatMessage",
        sender: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
        profilePic: user.pic || 'img/noprofile.jpg',
        message: messageText,
        voiceMessage: null,
        channel: currentChannel,
        timestamp: new Date().toISOString(),
        mentions: filteredMentions
    };

    console.log("Sending message with mentions:", messageData.mentions);

    socket.send(JSON.stringify(messageData));
    input.value = '';
    selectedMentions = [];
}

function getUserName() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`;
}

async function sendVoiceMessage(audioBlob) {
    const formData = new FormData();
    formData.append("voice", audioBlob, "voice_message.webm");

    try {
        const response = await fetch("/upload-voice", {
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

inputBox.addEventListener('input', () => {
  const cursorPos = inputBox.selectionStart;
  const textBeforeCursor = inputBox.value.slice(0, cursorPos);

  const match = /@(\w*)$/.exec(textBeforeCursor);

  if (match) {
    const query = match[1].toLowerCase();
    const filtered = membersInChannel.filter(member =>
      member.fullName?.toLowerCase().includes(query)
    );

    console.log("FILTERED:", filtered);

    if (filtered.length > 0) {
      showMentionSuggestions(filtered, match[0]);
      suggestionsBox.style.display = 'block';
    } else {
      suggestionsBox.style.display = 'none';
    }
  } else {
    suggestionsBox.style.display = 'none';
  }
});


function showMentionSuggestions(users, triggerText) {
  if (!users || users.length === 0) return;

  suggestionsBox.innerHTML = '';

 users.forEach(user => {
  const item = document.createElement('div'); // CHANGED from 'button' to 'div'
  item.className = 'mention-suggestion-item';
  item.onclick = () => insertMention(user);

  const img = document.createElement('img');
  img.className = 'mention-suggestion-avatar';
  img.src = user.profilePicture || './img/noprofile.jpg';
  img.onerror = () => img.src = './img/noprofile.jpg';

  const name = document.createElement('span');
  name.className = 'mention-suggestion-name';
  name.textContent = user.fullName;

  item.appendChild(img);
  item.appendChild(name);
  suggestionsBox.appendChild(item);
});

const input = document.getElementById('textMessage');
suggestionsBox.style.bottom = `${input.offsetHeight + 8}px`; // 8px gap
suggestionsBox.style.left = `${input.offsetLeft}px`;

}



let selectedMentions = [];

function insertMention(user) {
  const mentionText = `@${user.fullName}`;
  const cursorPos = inputBox.selectionStart;
  const text = inputBox.value;
  const match = /@(\w*)$/.exec(text.slice(0, cursorPos));

  if (!match) return;

  const start = cursorPos - match[0].length;
  const newText = text.slice(0, start) + mentionText + ' ' + text.slice(cursorPos);

  inputBox.value = newText;
  inputBox.focus();
  inputBox.selectionStart = inputBox.selectionEnd = start + mentionText.length + 1;

  // Only add if not already in selectedMentions
  if (!selectedMentions.find(m => m.id === user.accountid)) {
    selectedMentions.push({ accountid: user.accountID, name: user.fullName });
  }
  console.log(selectedMentions);

  suggestionsBox.style.display = 'none';
}



function formatMentions(text, mentions = []) {
  if (!mentions || mentions.length === 0) return text;

  let formattedText = text;
  mentions.forEach(mention => {
    const regex = new RegExp(`@${mention.name}\\b`, 'g');
    formattedText = formattedText.replace(regex, `<span class="mention">@${mention.name}</span>`);
  });

  return formattedText;
}
async function checkUnseenMentionsChannel() {
  try {
    const res = await fetch(`/api/unseen-mentions/${currentAccountID}`);
    const unseenMentions = await res.json(); // Expecting message array with mentions and channel fields

    // Reset the unread counts
    unreadMentionCounts = {};

    unseenMentions.forEach(msg => {
      if (!msg.seenBy.includes(currentAccountID)) {

        if (!unreadMentionCounts[msg.channel]) {
          unreadMentionCounts[msg.channel] = 0;
        }
        unreadMentionCounts[msg.channel]++;
      }
    });



    // Update UI badges
    Object.keys(unreadMentionCounts).forEach(channel => {
      const badge = document.getElementById(`mention-badge-${channel.replace(/\s+/g, '-').toLowerCase()}`);
      if (badge) {
        const count = unreadMentionCounts[channel];
        if (count > 0) {
          badge.style.display = 'inline-block';
          badge.textContent = count;
          console.log("bringing badge back");
        } else {
          badge.style.display = 'none';
        }
      }
    });

  } catch (error) {
    console.error("Failed to fetch unseen mentions:", error);
  }
}


