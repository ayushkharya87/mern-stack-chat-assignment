const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./socket');

dotenv.config();
connectDB();

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: 'https://mern-stack-chat-assignment.vercel.app', 
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocket(io); 

app.use('/api/agent', require('./routes/agent/agentRoutes'));
app.use('/api/vendor', require('./routes/vendor/vendorRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
