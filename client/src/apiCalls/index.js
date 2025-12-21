// import axios from "axios";
// export const url = "http://localhost:5000";



// export const axiosInstance = axios.create({
//     headers:{
//         authorization : `Bearer ${localStorage.getItem("token") || ""}`
//     }
// });


import axios from "axios";

// Base URL of your backend
export const url = "http://localhost:5000";

// Create axios instance with base URL and auth header
export const axiosInstance = axios.create({
  baseURL: url, // <- this ensures all requests use this as base
  headers: {
    authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json"
  },
});
