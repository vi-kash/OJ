import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/roboto';
import '@fontsource/roboto-slab';
import api from "../../api.js";
import EmailIcon from "@mui/icons-material/Email";

const defaultTheme = createTheme();

const UpdateEmail = () => {
    const [user, setUser] = useState({ email: "" });
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
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

                setUser({ email: response.data.user.email });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast.error("Failed to fetch user data. Please try again.");
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleEmailChange = (e) => {
        setUser({ email: e.target.value });
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handleSendOtp = async () => {
        try {
            const response = await api.post("/send-otp", { email: user.email });
            if (response.status === 200) {
                setOtpSent(true);
                toast.success("OTP sent to your email.");
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error(error.response.data.message);
                        break;
                    case 500:
                        toast.error("An error occurred while sending the OTP. Please try again.");
                        break;
                    default:
                        toast.error("Failed to send OTP. Please try again.");
                        break;
                }
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
            setOtpSent(false);
            setOtpVerified(false);
            console.error("Failed to send OTP. ", error);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await api.post("/validate-otp", { email: user.email, otp });
            if (response.status === 200) {
                setOtpVerified(true);
                toast.success("OTP verified.");
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error(error.response.data.message);
                        break;
                    case 500:
                        toast.error("An error occurred while verifying the OTP. Please try again.");
                        break;
                    default:
                        toast.error("Failed to verify OTP. Please try again.");
                        break;
                }
            } else {
                toast.error("Failed to verify OTP. Please try again.");
            }
            console.error("Failed to verify OTP. ", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/updateEmail", user, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                toast.success("Email updated successfully.");
                navigate("/");
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Email already in use, please try another!");
                        break;
                    case 500:
                        toast.error("An error occurred while updating the email. Please try again.");
                        break;
                    default:
                        toast.error("Failed to update email. Please try again.");
                        break;
                }
            } else {
                toast.error("Failed to update email. Please try again.");
            }
            console.error("Failed to update email: ", error);
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
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <EmailIcon />
                        </Avatar>
                        <Typography
                            component="h1"
                            variant="h5"
                            sx={{
                                fontFamily: 'Roboto Slab, serif',
                                fontWeight: 'bold',
                            }}
                        >
                            Update Email
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={user.email}
                                onChange={handleEmailChange}
                            />
                            {!otpSent && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSendOtp}
                                    sx={{ mt: 3, mb: 2, backgroundColor: "#333", fontFamily: "Roboto, sans-serif" }}
                                >
                                    Send OTP
                                </Button>
                            )}
                            {otpSent && !otpVerified && (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="otp"
                                        label="OTP"
                                        name="otp"
                                        autoComplete="otp"
                                        value={otp}
                                        onChange={handleOtpChange}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleVerifyOtp}
                                        sx={{ mt: 3, mb: 2, backgroundColor: "#333", fontFamily: "Roboto, sans-serif" }}
                                    >
                                        Verify OTP
                                    </Button>
                                </>
                            )}
                            {otpVerified && (
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2, backgroundColor: "#333", fontFamily: "Roboto, sans-serif" }}
                                >
                                    Update Email
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Container>
            </div>
        </ThemeProvider>
    );
};

export default UpdateEmail;
