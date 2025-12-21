const route = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Chat = require('../models/chat');
const Message = require('../models/message');

route.post('/send-message' , authMiddleware , async(req ,res)=>{
    try{
        //strore the message into database
        const newMessage = new Message(req.body);
        const savedMessage =  await newMessage.save();


        const currentChat  = await Chat.findByIdAndUpdate({
            _id : req.body.chatId
        },{
            lastMessage : savedMessage._id,
            $inc :{unreadMessagesCount: 1}
        });

        res.status(201).send({
            message : 'Message sent successfully',
            success: true,
            data : savedMessage
        })

    }catch(error){
        res.status(400).send({
            message : error.message,
            success : false
        })
    }
});



route.get('/get-all-messages/:chatId', authMiddleware, async (req, res) => {
    try{
        const allMessages = await Message.find({chatId :req.params.chatId})
                             .sort({createdAt : 1});
        res.status(200).send({
            message : 'Messages fetched successfully',
            success : true,
            data : allMessages
        });

    }catch(error){
        res.status(400).send({
            message : error.message,
            success : false
        });
    }
});



module.exports = route;