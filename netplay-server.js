const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const rooms = {};

wss.on('connection', (ws) => {
  let currentRoom = null;
  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }
    if (data.type === 'join') {
      currentRoom = data.room;
      rooms[currentRoom] = rooms[currentRoom] || new Set();
      rooms[currentRoom].add(ws);
      ws.send(JSON.stringify({ type: 'joined', room: currentRoom }));
    }
    if (data.type === 'chat' && currentRoom) {
      for (const client of rooms[currentRoom]) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'chat', message: data.message }));
        }
      }
    }
    if (data.type === 'sync' && currentRoom && data.state) {
      for (const client of rooms[currentRoom]) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'sync', state: data.state }));
        }
      }
    }
  });
  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      if (rooms[currentRoom].size === 0) delete rooms[currentRoom];
    }
  });
});

server.listen(8080, () => {
  console.log('Netplay backend running on http://localhost:8080');
});
