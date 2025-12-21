// import  { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getLoggedUser , getAllUsers} from "./../apiCalls/users";
// import { useDispatch, useSelector } from "react-redux";
// import { hideLoader, showLoader } from "../redux/loaderSlice";
// import toast from "react-hot-toast";
// import {  setUser , setAllUsers, setAllChats} from "../redux/userSlice";
// import { getAllChats } from "../apiCalls/chat";

// function ProtectedRoute({ children }){
//     const {user} = useSelector(state => state.userReducer);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const getLoggedInUsers = async () => {
//         let response = null;
//         try{
//             dispatch(showLoader());
//             response = await getLoggedUser();
//             dispatch(hideLoader());
//             if(response.success){
//                 dispatch(setUser(response.data) );
    
//             }
//             else{
//                 toast.error(response.message);
//                 window.location.href = "/login";
//             }
//         }catch(error){
//             dispatch(hideLoader());
//             navigate("/login");
//         }
//     }

//     const getAllUsersFromDb = async()=>{
//         let response = null;
//         try{
//             dispatch(showLoader());
//             response = await getAllUsers();
//             dispatch(hideLoader());
//             if(response.success){
//                 dispatch(setAllUsers(response.data) );
    
//             }
//             else{
//                 toast.error(response.message);
//                 window.location.href = "/login";
//             }

//         }catch(error){
//             dispatch(hideLoader());
//             navigate("/login");
//         }   
//     }

//     const getCurrentUserChats = async()=>{
//         try{
//             const response = await getAllChats();
//             if(response.success){
//                 dispatch(setAllChats(response.data));
//             }
//         }catch(error){
//             navigate('/login');
//         }
//     }


//     useEffect(() => {
//         if(localStorage.getItem('token')){
//             // User is authenticated, allow access
//             getLoggedInUsers();
//             getAllUsersFromDb();
//             getCurrentUserChats();
//         }else{
//             navigate("/login");
//         }
//     } ,[]);

//     return(
//         <div>
            
//             {children}
//         </div>
//     );

// }

// export default ProtectedRoute;



import  { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedUser , getAllUsers } from "./../apiCalls/users";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import toast from "react-hot-toast";
import { setUser , setAllUsers, setAllChats } from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";

function ProtectedRoute({ children }){
    const { user } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getLoggedInUsers = async () => {
        let response = null;
        try{
            dispatch(showLoader());
            response = await getLoggedUser();
            dispatch(hideLoader());

            if(response.success){
                dispatch(setUser(response.data));
            }
            else{
                toast.error(response.message);
                navigate("/login");     // ✅ keep redirect ONLY here
            }
        }catch(error){
            dispatch(hideLoader());
            navigate("/login");         // ❗ correct redirect
        }
    }

    const getAllUsersFromDb = async () => {
        let response = null;
        try{
            dispatch(showLoader());
            response = await getAllUsers();
            dispatch(hideLoader());

            if(response.success){
                dispatch(setAllUsers(response.data));
            }
            // ❌ FIX: remove redirect here  
            // this API is NOT authentication check
        }catch(error){
            dispatch(hideLoader());
            // ❌ FIX remove redirect here too
        }   
    }

    const getCurrentUserChats = async () => {
        try{
            const response = await getAllChats();
            if(response.success){
                dispatch(setAllChats(response.data));
            }
            // ❌ FIX: remove redirect here 
        }catch(error){
            // ❌ FIX: remove redirect here
        }
    }

    useEffect(() => {
        if(localStorage.getItem('token')){
            getLoggedInUsers();        // Only this must control login redirect
            getAllUsersFromDb();       // No redirect here
            getCurrentUserChats();     // No redirect here
        } else {
            navigate("/login");
        }
    }, []);

    return(
        <div>
            {children}
        </div>
    );
}

export default ProtectedRoute;
