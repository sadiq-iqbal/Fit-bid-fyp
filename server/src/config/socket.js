const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

module.exports = (io) => {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    // Join engagement room
    socket.on('join_engagement', (engagementId) => {
      socket.join(`engagement:${engagementId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { engagementId, content, recipientIds, attachmentUrl } = data;
        const message = await Message.create({
          engagement: engagementId,
          sender: socket.userId,
          recipients: recipientIds || null,
          content,
          attachmentUrl: attachmentUrl || null,
          readBy: [socket.userId],
        });
        await message.populate('sender', 'name avatar role');
        io.to(`engagement:${engagementId}`).emit('new_message', message);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async ({ engagementId }) => {
      await Message.updateMany(
        { engagement: engagementId, readBy: { $ne: socket.userId } },
        { $addToSet: { readBy: socket.userId } }
      );
    });

    // Typing indicator
    socket.on('typing', ({ engagementId }) => {
      socket.to(`engagement:${engagementId}`).emit('user_typing', { userId: socket.userId });
    });

    socket.on('stop_typing', ({ engagementId }) => {
      socket.to(`engagement:${engagementId}`).emit('user_stop_typing', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });
};
