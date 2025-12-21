
import { useSelector } from "react-redux";
import ChatArea from "./components/chat";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import {io} from 'socket.io-client';
import { useEffect, useState } from "react";


// Use environment variable `REACT_APP_SOCKET_URL` to point to socket server.
// Fallback to http://localhost:5000 which matches server `PORT_NUMBER` in config.env.
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
function Home(){
    const {selectedChat , user} = useSelector(state=>state.userReducer);
    const [onlineUser , setOnlineUser] = useState([]);

    useEffect(()=>{
        if(!user) return;

        socket.emit('join-room' , user._id);
        socket.emit('user-login' , user._id);

        socket.on('connect', () => {});

        socket.on('online-users' , onlineUsers=>{
            setOnlineUser(onlineUsers);
        });
        socket.on('online-users-updated' , onlineUsers=>{
            setOnlineUser(onlineUsers);
        });

        return () => {
            socket.off('online-users');
            socket.off('online-users-updated');
            socket.off('connect');
        };
    } , [user])

    return(
        <div className="home-page">
            <Header socket ={socket}></Header>
            <div className="main-content">
                <Sidebar socket = {socket} onlineUser ={onlineUser} ></Sidebar>
               {selectedChat && <ChatArea socket = {socket}></ChatArea>}
            </div>
        </div>
    );

}
export default Home;