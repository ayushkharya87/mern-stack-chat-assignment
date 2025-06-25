module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ vendorId, agentId }) => {
      const room = generateRoomId(vendorId, agentId);
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on('sendMessage', (data) => {
      const room = generateRoomId(data.sender, data.receiver);
      console.log(`Sending to room: ${room}`);
      io.to(room).emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  function generateRoomId(vendorId, agentId) {
    return vendorId < agentId
      ? `${vendorId}_${agentId}`
      : `${agentId}_${vendorId}`;
  }
};
