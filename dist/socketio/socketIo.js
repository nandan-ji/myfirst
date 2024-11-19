"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server);
    io.on("connection", (socket) => {
        console.log("A client connected");
        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`User ${room} has joined the room`);
            io.to(room).emit('message', `User ${socket.id} has joined the room`);
        });
        socket.on('locationUpdate', (data) => {
            io.to(data.vehicleId).emit('newLocation', data);
        });
        socket.on("disconnect", () => {
            console.log("A client disconnected");
        });
    });
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
exports.getIO = getIO;
