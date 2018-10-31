module.exports = function (io) {
    io.on('connection', socket => {
        // console.log('User connected to server')

        //listens for refresh event and emits new event to all clients 
        socket.on('refresh', (data) => {
            io.emit('refreshPage', {});
        })
    });
};