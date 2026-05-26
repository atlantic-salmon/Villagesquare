const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ── In-memory store ────────────────────────────────────────────────────────────
const store = {
  servers: [
    {
      id: 'server-1',
      name: 'Village Square',
      icon: 'VS',
      color: '#43b581',
      channels: [
        { id: 'ch-1', type: 'text',  name: 'general' },
        { id: 'ch-2', type: 'text',  name: 'announcements' },
        { id: 'ch-3', type: 'text',  name: 'off-topic' },
        { id: 'ch-4', type: 'voice', name: 'Town Hall' },
        { id: 'ch-5', type: 'voice', name: 'Hangout' },
      ],
    },
    {
      id: 'server-2',
      name: 'Dev Corner',
      icon: 'DC',
      color: '#7289da',
      channels: [
        { id: 'ch-6', type: 'text',  name: 'general' },
        { id: 'ch-7', type: 'text',  name: 'code-review' },
        { id: 'ch-8', type: 'voice', name: 'Dev Talk' },
      ],
    },
    {
      id: 'server-3',
      name: 'Game Lounge',
      icon: 'GL',
      color: '#f04747',
      channels: [
        { id: 'ch-9',  type: 'text',  name: 'general' },
        { id: 'ch-10', type: 'text',  name: 'lfg' },
        { id: 'ch-11', type: 'voice', name: 'Gaming Session' },
      ],
    },
  ],

  messages: {
    'ch-1': [
      {
        id: uuidv4(), channelId: 'ch-1',
        author: { id: 'bot', username: 'VillageBot', avatar: 'VB', color: '#43b581' },
        content: 'Welcome to VillageSquare! 🌿 This is your community hub.',
        timestamp: Date.now() - 7_200_000,
      },
      {
        id: uuidv4(), channelId: 'ch-1',
        author: { id: 'user-2', username: 'TownCrier', avatar: 'TC', color: '#faa61a' },
        content: 'Hey everyone! Glad to be here.',
        timestamp: Date.now() - 3_600_000,
      },
      {
        id: uuidv4(), channelId: 'ch-1',
        author: { id: 'user-3', username: 'CodeWizard', avatar: 'CW', color: '#7289da' },
        content: 'What a great place! 🎉',
        timestamp: Date.now() - 1_800_000,
      },
    ],
    'ch-2': [
      {
        id: uuidv4(), channelId: 'ch-2',
        author: { id: 'bot', username: 'VillageBot', avatar: 'VB', color: '#43b581' },
        content: '📣 VillageSquare is now live! Welcome all villagers.',
        timestamp: Date.now() - 86_400_000,
      },
    ],
    'ch-6': [
      {
        id: uuidv4(), channelId: 'ch-6',
        author: { id: 'user-3', username: 'CodeWizard', avatar: 'CW', color: '#7289da' },
        content: 'Hello dev friends! 👋 Anyone up for a code review?',
        timestamp: Date.now() - 900_000,
      },
    ],
    'ch-9': [
      {
        id: uuidv4(), channelId: 'ch-9',
        author: { id: 'user-4', username: 'Lurker99', avatar: 'L9', color: '#f04747' },
        content: 'GGs only in this server 🎮',
        timestamp: Date.now() - 600_000,
      },
    ],
  },

  onlineUsers: [
    { id: 'user-2', username: 'TownCrier',  avatar: 'TC', color: '#faa61a', status: 'online' },
    { id: 'user-3', username: 'CodeWizard', avatar: 'CW', color: '#7289da', status: 'online' },
    { id: 'user-4', username: 'Lurker99',   avatar: 'L9', color: '#f04747', status: 'idle'   },
    { id: 'user-5', username: 'NightOwl',   avatar: 'NO', color: '#b9bbbe', status: 'dnd'    },
    { id: 'user-6', username: 'Wanderer',   avatar: 'WA', color: '#747f8d', status: 'offline' },
  ],
};

// ── REST API ───────────────────────────────────────────────────────────────────
app.get('/api/servers', (_req, res) => {
  res.json(store.servers);
});

app.get('/api/channels/:channelId/messages', (req, res) => {
  const { channelId } = req.params;
  res.json(store.messages[channelId] || []);
});

app.get('/api/users/online', (_req, res) => {
  res.json(store.onlineUsers);
});

// ── Socket.io ──────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('[socket] connected:', socket.id);

  socket.on('join_channel', (channelId) => {
    // Leave previous rooms (keep the socket's own room)
    socket.rooms.forEach((room) => {
      if (room !== socket.id) socket.leave(room);
    });
    socket.join(channelId);
  });

  socket.on('send_message', ({ channelId, content, author }) => {
    if (!channelId || !content || !author) return;

    const message = {
      id: uuidv4(),
      channelId,
      author,
      content,
      timestamp: Date.now(),
    };

    if (!store.messages[channelId]) store.messages[channelId] = [];
    store.messages[channelId].push(message);

    io.to(channelId).emit('new_message', message);
  });

  socket.on('disconnect', () => {
    console.log('[socket] disconnected:', socket.id);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`VillageSquare server running → http://localhost:${PORT}`);
});
