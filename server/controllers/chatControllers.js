const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Chat = require('./../models/chat');
const message = require('./../models/message');
const Message = require('./../models/message');
// creating api for crating new chat
router.post('/create-new-chat' ,authMiddleware ,async(req , res)=>{
    try{
        const chat = new Chat(req.body);
        const savedChat = await chat.save();

        await savedChat.populate('members');

        res.status(201).send({
            message: "Chat created successfully",
            success : true,
            data : savedChat
        })
    }catch(error){
        res.status(400).send({
            message : error.message,
            success:false
        })
    }
} )



// getting all chats of currently loggedin user
router.get('/get-all-chats' ,authMiddleware ,async(req , res)=>{
    try{
        const userId = req.userId;
        const allChats = await Chat.find({members:{$in:userId}})
        .populate('members')
        .populate('lastMessage')
        .sort({updatedAt: -1});
        

        res.status(200).send({
            message: "Chat fetched successfully",
            success : true,
            data : allChats
        })
    }catch(error){
        res.status(400).send({
            message : error.message,
            success:false
        })
    }
} );

router.post('/clear-unread-message' , authMiddleware , async(req , res)=>{
    try{
        const chatId = req.body.chatId;

        // we want to cont unreasd msg
        const chat = await Chat.findById(chatId);
        if(!chat){
            res.send({
                message : "No chat is found to the given Id",
                success : false
            })
        }
        const updatedChat =await Chat.findByIdAndUpdate(
            chatId ,
            {unreadMessagesCount : 0},
            {new: true}
        ).populate('members').populate('lastMessage');

        await Message.updateMany(
            {chatId : chatId , read:false},
            {read : true}
        )
        res.send({
            message : "Unread message cleared Successfully" ,
            success: true,
            data : updatedChat
        })
    }
    catch(error){
        res.send({
            message : error.message,
            success : false
        })
    }
})

module.exports = router;