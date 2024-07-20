import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import api from "../../api.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultTheme = createTheme();

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState("");
    const [otpGenerated, setOtpGenerated] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const handlePasswordChange = (event) => {
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

    const handleGenerateOtp = async () => {
        try {
            await api.post("/forgot-password", { email });
            toast.success("OTP sent to your email!");
            setOtpGenerated(true);
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Please enter a valid email address.");
                        break;
                    case 404:
                        toast.error("User with this email not found.");
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
            console.error("Failed to send OTP. ", error);
        }
    };

    const handleSubmitOtp = async () => {
        try {
            await api.post("/verify-otp", { email, otp });
            toast.success("OTP verified successfully!");
            setOtpVerified(true);
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Invalid OTP or OTP expired.");
                        break;
                    case 404:
                        toast.error("User with this email not found.");
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
            console.error("Verify OTP failed:", error);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            await api.post("/reset-password", { email, otp, newPassword });
            toast.success("Password reset successfully!");
            navigate("/login");
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Invalid data or token expired.");
                        break;
                    case 404:
                        toast.error("User with this email not found.");
                        break;
                    case 500:
                        toast.error("An error occurred while resetting the password. Please try again.");
                        break;
                    default:
                        toast.error("Failed to reset password. Please try again.");
                        break;
                }
            } else {
                toast.error("Failed to reset password. Please try again.");
            }
            console.error("Change password failed:", error);
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Forgot Password
                        </Typography>
                        <form noValidate style={{ width: '100%', marginTop: '20px' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 2, mb: 2 }}
                                onClick={handleGenerateOtp}
                            >
                                Generate OTP
                            </Button>
                            {otpGenerated && (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="otp"
                                        label="Enter OTP"
                                        name="otp"
                                        autoComplete="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 2, mb: 2 }}
                                        onClick={handleSubmitOtp}
                                    >
                                        Submit OTP
                                    </Button>
                                </>
                            )}
                            {otpVerified && (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="new-password"
                                        label="New Password"
                                        name="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={handlePasswordChange}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="confirm-password"
                                        label="Confirm Password"
                                        name="confirm-password"
                                        type="password"
                                        autoComplete="confirm-password"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        error={!!passwordMatchError}
                                        helperText={passwordMatchError}
                                    />
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 2, mb: 2 }}
                                        onClick={handleChangePassword}
                                    >
                                        Change Password
                                    </Button>
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Link href="/login" variant="body2">
                                    Back to Login
                                </Link>
                                <Link href="/register" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </div>
                        </form>
                    </div>
                </Container>
            </div>
        </ThemeProvider>
    );
};

export default ForgotPassword;
