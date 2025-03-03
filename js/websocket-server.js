// const WebSocket = require('ws');
// const express = require('express');
// const http = require('http');

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// let clients = [];

// wss.on('connection', (ws) => {
//   console.log('New client connected');
//   clients.push(ws);

//   ws.on('message', (message) => {
//     console.log('Received:', message);

//     // Broadcast the message to all connected clients
//     clients.forEach(client => {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//     clients = clients.filter(client => client !== ws);
//   });
// });

// server.listen(3000, () => {
//   console.log('WebSocket server running on ws://localhost:3000');
// });

const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from "public/"
app.use(express.static(path.join(__dirname, 'public')));

// Serve the chat page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'message_trial.html'));
});

// Store connected clients
let clients = [];

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.push(ws);

  ws.on('message', (message) => {
    console.log('Received:', message);

    // ✅ Broadcast the message to all clients, including the sender
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws);
  });
});

server.listen(3000, () => {
  console.log('WebSocket server running on http://localhost:3000');
});
