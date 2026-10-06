// Central Socket.io instance so any controller can push real-time events
let io = null;

export function setIO(ioInstance) {
  io = ioInstance;
  io.on("connection", (socket) => {
    // Client emits 'identify' with their userId right after connecting
    socket.on("identify", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
}

export function getIO() {
  return io;
}

// Push a real-time event to one specific user (e.g. new notification)
export function pushToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

// Broadcast to everyone (e.g. leaderboard update, SafeWalk SOS, campus emergency)
export function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}
