
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

// Routers
const authRouter = require("./controllers/authController");
const userRouter = require("./controllers/userController");
const chatRouter = require("./controllers/chatControllers");
const messageRouter = require("./controllers/messageController");
const Message = require('./models/message');
const Chat = require('./models/chat');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

const onlineUser = [];

// app.use(express.json)({
//   limit:'50mb'
// })

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  // Join user room
  socket.on("join-room", (userId) => {
    socket.join(userId);
  });

  // Send message (persist then broadcast saved message)
  socket.on("send-message", async (message) => {
    try {

      // persist message to DB
      const newMessage = new Message({
        chatId: message.chatId,
        sender: message.sender,
        text: message.text,
        image: message.image || null,
        read: false,
      });

      const savedMessage = await newMessage.save();

      // update chat lastMessage and unread counter
      await Chat.findByIdAndUpdate(
        message.chatId,
        { lastMessage: savedMessage._id, $inc: { unreadMessagesCount: 1 } },
        { new: true }
      );

      // broadcast savedMessage to all members (rooms)
      const members = message.members || [];
      members.forEach((memberId) => {
        io.to(memberId).emit("receive-message", savedMessage);
        io.to(memberId).emit("set-message-count", savedMessage);
      });
    } catch (err) {
      console.error('Error in send-message handler:', err.message);
    }
  });

  

socket.on("clear-unread-messages", async (data) => {
  const senderId = data.clearedBy; // user who opened the chat
  const members = data.members;

  // Emit to other members only
  members.forEach((memberId) => {
    if (memberId !== senderId) {
      // Send chatId and IDs of messages marked as read
      io.to(memberId).emit("message-read", { chatId: data.chatId });
      io.to(memberId).emit("message-count-cleared", data);
    }
  });
});


  // Typing indicator
  socket.on("user-typing", (data) => {
    const senderId = data.sender;
    const members = data.members;

    members.forEach((memberId) => {
      if (memberId !== senderId) {
        io.to(memberId).emit("started-typing", data);
      }
    });
  });

  socket.on('user-login', userId=>{
    if(!onlineUser.includes(userId)){
        onlineUser.push(userId);
    }
    socket.emit('online-users' , onlineUser);
  })

  socket.on('user-offline' , userId=>{
    onlineUser.splice(onlineUser.indexOf(userId) , 1);
    io.emit('online-users-updated' , onlineUser);
  })

  socket.on("disconnect", () => {});
});

module.exports = server;

