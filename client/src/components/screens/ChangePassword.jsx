import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import api from "../../api.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultTheme = createTheme();

const ChangePassword = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await api.get("/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data.user) {
                    navigate("/login");
                    return;
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast.error("Failed to fetch user data. Please try again.");
            }
        };

        fetchUserData();
    }, [navigate]);

    const validatePassword = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const handleNewPasswordChange = (event) => {
        const newPass = event.target.value;
        setNewPassword(newPass);
        if (!validatePassword(newPass)) {
            setPasswordError("Password must be at least 8 characters long, contain both lowercase and uppercase letters, include at least one numeric digit, and one special character.");
        } else {
            setPasswordError("");
        }
    };

    const handleConfirmPasswordChange = (event) => {
        const newConfirmPassword = event.target.value;
        setConfirmPassword(newConfirmPassword);
        if (newConfirmPassword !== newPassword) {
            setPasswordMatchError("Passwords do not match.");
        } else {
            setPasswordMatchError("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const passwordData = {
            currentPassword: formData.get("currentPassword"),
            newPassword: formData.get("newPassword"),
        };

        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/changePassword", passwordData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                toast.success("Password changed successfully!");
                navigate("/");
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error(error.response.data.message);
                        break;
                    case 401:
                        toast.error("Unauthorized. Please log in again.");
                        navigate("/login");
                        break;
                    case 500:
                        toast.error("An error occurred while changing the password. Please try again.");
                        break;
                    default:
                        toast.error("Failed to change password. Please try again.");
                        break;
                }
            } else {
                toast.error("Failed to change password. Please try again.");
            }
            console.error("Failed to change password: ", error);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <div style={{
                backgroundColor: '#f0f4f8',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '15px',
            }}>
                <Container component="main" maxWidth="xs" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <CssBaseline />
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Change Password
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <TextField
                                required
                                fullWidth
                                name="currentPassword"
                                label="Current Password"
                                type="password"
                                id="currentPassword"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                required
                                fullWidth
                                name="newPassword"
                                label="New Password"
                                type="password"
                                id="newPassword"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                error={!!passwordError}
                                helperText={passwordError}
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm New Password"
                                type="password"
                                id="confirmPassword"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                error={!!passwordMatchError}
                                helperText={passwordMatchError}
                                sx={{ mt: 2 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Change Password
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </div>
        </ThemeProvider>
    );
}

export default ChangePassword;
