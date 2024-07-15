import axios from "axios";

const API_URL = "http://13.127.122.1:8000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
