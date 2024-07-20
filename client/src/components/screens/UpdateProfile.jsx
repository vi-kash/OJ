import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, CssBaseline, TextField, Box, Typography, Container, ThemeProvider, createTheme } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import api from "../../api.js";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/roboto';
import '@fontsource/roboto-slab';

const defaultTheme = createTheme();

const UpdateProfile = () => {
    const [user, setUser] = useState({ name: "", username: "" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

                setUser(response.data.user);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast.error("Failed to fetch user data. Please try again.");
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/updateProfile", user, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                toast.success("Profile updated successfully.");
                navigate("/");
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Username already taken, please try another!");
                        break;
                    case 500:
                        toast.error("An error occurred while updating the profile. Please try again.");
                        break;
                    default:
                        toast.error("Failed to update profile. Please try again.");
                        break;
                }
            } else {
                toast.error("Failed to update profile. Please try again.");
            }
            console.error("Failed to update profile: ", error);
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <div style={{
                backgroundColor: '#f0f4f8',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '15px'
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
                        <Typography
                            component="h1"
                            variant="h4"
                            gutterBottom
                            sx={{
                                fontFamily: 'Roboto Slab, serif',
                                fontWeight: 'bold',
                            }}
                        >
                            Update Profile
                        </Typography>
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <AccountCircleIcon />
                        </Avatar>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Name"
                                name="name"
                                autoComplete="name"
                                autoFocus
                                value={user.name}
                                onChange={handleChange}
                                sx={{ fontFamily: "Roboto, sans-serif" }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                value={user.username}
                                onChange={handleChange}
                                sx={{ fontFamily: "Roboto, sans-serif" }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, backgroundColor: "#333", fontFamily: "Roboto, sans-serif" }}
                            >
                                Update Profile
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </div>
        </ThemeProvider>
    );
};

export default UpdateProfile;
