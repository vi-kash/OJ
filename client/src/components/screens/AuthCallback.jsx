import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthCallback = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const setToken = async () => {
            try {
                localStorage.setItem("token", token);
                toast.success("Authentication successfull!");
                navigate("/");
            } catch (error) {
                toast.error("Failed to authenticate!");
                navigate("/login");
            }
        };

        setToken();
    }, [navigate, token]);

    return <Typography>processing...</Typography>
}

export default AuthCallback;