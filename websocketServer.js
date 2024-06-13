const socketio = require('socket.io');

let io;

function initializeWebSocket(server) {
    io = socketio(server);

    io.on('connection', (socket) => {
        console.log('A client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
}

function notifyNewOrder(order) {
    if (io) {
        io.emit('newOrder', order);
    } else {
        console.error('Socket.IO server is not initialized.');
    }
}

module.exports = {
    initializeWebSocket,
    notifyNewOrder,
};
