import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import path from "path";


const port = process.env.PORT || 3200;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

app.use(express.static(path.join(__dirname, 'public')));

const messages =[]
const rooms = {};

io.on("connection", (socket) => {
    console.log("A user connected");
    //Handle Private Chat room
    socket.on('joinPrivateRoom', (roomName) => {
        socket.join(roomName);
        rooms[socket.id] = roomName;
        console.log(`User joined private room: ${roomName}`);
    })

    // handle the group chat room
    socket.on('joinGroup', () => {
        socket.join('groupRoom');
        rooms[socket.id] = 'groupRoom';
        console.log("user joined group chat")
    })

    socket.on('chatMessage', (message,room) => {
        const sender = socket.id;
        messages.push({ message, sender, room });
        if (room) {
            io.to(room).emit('chatMessage', { message, sender });
        } else {
            io.to('groupRoom').emit('chatMessage', { message, sender });
        }
    })
    socket.on('disconnect', () => {
        console.log("user disconnected");
        delete rooms[socket.id];
    })



});

httpServer.listen(3000,()=>{
    console.log("Server listening on port 3000");
});