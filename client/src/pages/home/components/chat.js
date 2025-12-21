
import { useDispatch, useSelector } from "react-redux";
import { getAllMessages } from "../../../apiCalls/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { clearUnreadMessageCount } from "./../../../apiCalls/chat";
import { setAllChats } from "../../../redux/userSlice";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import moment from "moment";
import store from "./../../../redux/store";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }) {
    const dispatch = useDispatch();
    const { selectedChat, user, allChats } = useSelector(
        (state) => state.userReducer
    );

    const selectedUser = selectedChat?.members?.find((u) => u._id !== user._id);
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Send message
    const sendMessage = async (image) => {
        if (!message.trim() && !image) return;

        const newMessage = {
            chatId: selectedChat._id,
            sender: user._id,
            text: message,
            image: image || null,
        };

        // Emit message to socket
        socket.emit("send-message", {
            ...newMessage,
            members: selectedChat.members.map((m) => m._id),
            read: false,
            createdAt: new Date().toISOString(),
        });

        // clear input; server will persist and broadcast saved message
        setMessage("");
        
    };

    // Send image
    const sendImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => sendMessage(reader.result);
    };

    // Format time
    const formatTime = (timestamp) => {
        const now = moment();
        const diff = now.diff(moment(timestamp), "days");
        if (diff < 1) return `Today ${moment(timestamp).format("hh:mm A")}`;
        else if (diff === 1) return `Yesterday ${moment(timestamp).format("hh:mm A")}`;
        else return moment(timestamp).format("MMM D, hh:mm A");
    };

    // Format user name
    const formatName = (user) => {
        if (!user) return "";
        const fname = user.firstname[0].toUpperCase() + user.firstname.slice(1).toLowerCase();
        const lname = user.lastname[0].toUpperCase() + user.lastname.slice(1).toLowerCase();
        return fname + " " + lname;
    };

    // Load messages
    const getMessages = async () => {
        if (!selectedChat) return;
        try {
            dispatch(showLoader());
            const response = await getAllMessages(selectedChat._id);
            dispatch(hideLoader());
            if (response.success) setAllMessages(response.data);
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.message);
        }
    };

    // Clear unread messages
    const clearUnreadMessages = async () => {
        if (!selectedChat || !socket?.connected) return;
        const hasUnreadFromOtherUser = allMessages.some(
            (msg) =>
                msg.chatId === selectedChat._id &&
                msg.sender !== user._id &&
                !msg.read
        );


if (!hasUnreadFromOtherUser) return;
        try {
            socket.emit("clear-unread-messages", {
                chatId: selectedChat._id,
                members: selectedChat.members.map((m) => m._id),
                clearedBy: user._id,
            });

            const response = await clearUnreadMessageCount(selectedChat._id);
            if (response.success) {
                const updatedChats = allChats.map((chat) =>
                    chat._id === selectedChat._id ? { ...chat, unreadMessagesCount: 0 } : chat
                );
                dispatch(setAllChats(updatedChats));

                setAllMessages((prev) =>
                    prev.map((msg) =>
                        msg.sender === user._id ? msg : { ...msg, read: true }
                    )
                );
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Socket listeners
    useEffect(() => {
        getMessages();
        clearUnreadMessages();

        socket.off("receive-message").on("receive-message", (message) => {
            console.log('chat received message via socket:', message);
            const currentChat = store.getState().userReducer.selectedChat;
            const allChatsState = store.getState().userReducer.allChats;

            // Add to current chat messages if it matches
            if (currentChat?._id === message.chatId) {
                setAllMessages((prev) => [...prev, message]);
            }

            // Update lastMessage & unread count in allChats
            const updatedChats = allChatsState.map((chat) => {
                if (chat._id === message.chatId) {
                    const increment = currentChat?._id !== message.chatId ? 1 : 0;
                    return {
                        ...chat,
                        lastMessage: message,
                        unreadMessagesCount: (chat.unreadMessagesCount || 0) + increment,
                    };
                }
                return chat;
            });
            dispatch(setAllChats(updatedChats));
        });

        socket.off("message-count-cleared").on("message-count-cleared", (data) => {
            console.log('chat message-count-cleared event:', data);
            const currentChat = store.getState().userReducer.selectedChat;
            const allChatsState = store.getState().userReducer.allChats;

            if (currentChat?._id === data.chatId) {
                // Update allChats unread count
                const updatedChats = allChatsState.map((chat) =>
                    chat._id === data.chatId ? { ...chat, unreadMessagesCount: 0 } : chat
                );
                dispatch(setAllChats(updatedChats));

                // Update read flag for messages: mark messages FROM the other user as read
                setAllMessages((prev) =>
                    prev.map((msg) =>
                        msg.sender !== user._id ? { ...msg, read: true } : msg
                    )
                );
            }
        });

        socket.off("started-typing").on("started-typing", (data) => {
            if (selectedChat?._id === data.chatId && data.sender !== user._id) {
                setIsTyping(true);
                if (typingTimeout.current) clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
            }
        });
    }, [selectedChat, user, socket]);

    // Auto-scroll
    useEffect(() => {
        const msgContainer = document.getElementById("main-chat-area");
        if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
    }, [allMessages, isTyping]);

    return (
        <>
            {selectedChat && (
                <div className="app-chat-area">
                    <div className="app-chat-area-header">{formatName(selectedUser)}</div>

                    <div className="main-chat-area" id="main-chat-area">
                        {allMessages.map((msg) => {
                            const isCurrentUserSender = msg.sender === user._id;
                            return (
                                <div
                                    className="message-container"
                                    style={isCurrentUserSender ? { justifyContent: "end" } : { justifyContent: "start" }}
                                    key={msg._id}
                                >
                                    <div>
                                        <div className={isCurrentUserSender ? "send-message" : "received-message"}>
                                            <div>{msg.text}</div>
                                            {msg.image && <img src={msg.image} alt="image" height="120" width="120" />}
                                        </div>
                                        <div
                                            className="message-timestamp"
                                            style={isCurrentUserSender ? { float: "right" } : { float: "left" }}
                                        >
                                            {msg.createdAt && formatTime(msg.createdAt)}{" "}
                                            {isCurrentUserSender && msg.read && (
                                                <i className="fa fa-check-circle" aria-hidden="true" style={{ color: "#e74c3c" }}></i>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="typing-indicator">{isTyping && <i>typing...</i>}</div>
                    </div>
                    {showEmojiPicker && <div style={{width:'100%' , display:'flex' , padding:'0px , 20px' , justifyContent:"right"}}>
                        <EmojiPicker style={{width:"300px" , height:"400px"}} onEmojiClick={(e)=>setMessage(message+e.emoji)}></EmojiPicker>
                    </div>}


                    <div className="send-message-div">
                        <input
                            type="text"
                            className="send-message-input"
                            placeholder="Type a message"
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                socket.emit("user-typing", {
                                    chatId: selectedChat._id,
                                    members: selectedChat.members.map((m) => m._id),
                                    sender: user._id,
                                });
                            }}
                        />

                        <label htmlFor="file">
                            <i className="fa fa-picture-o send-image-btn"></i>
                            <input
                                type="file"
                                id="file"
                                style={{ display: "none" }}
                                accept="image/jpg,image/png,image/jpeg,image/gif"
                                onChange={sendImage}
                            />
                        </label>

                        <button
                            className="fa fa-smile-o send-emoji-btn"
                            aria-hidden="true"
                            onClick={() => { setShowEmojiPicker(!showEmojiPicker) }}
                        ></button>
                        <button
                            className="fa fa-paper-plane send-message-btn"
                            aria-hidden="true"
                            onClick={() => sendMessage("")}
                        ></button>
                    </div>


                </div>
            )}
        </>
    );
}

export default ChatArea;
