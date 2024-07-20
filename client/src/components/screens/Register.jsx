import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Google as GoogleIcon, GitHub as GitHubIcon } from "@mui/icons-material";
import '@fontsource/roboto-slab';
import api from "../../api.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultTheme = createTheme();

const SignUp = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");

  const validatePassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    if (!validatePassword(newPassword)) {
      setPasswordError("Password must be at least 8 characters long, contain both lowercase and uppercase letters, include at least one numeric digit, and one special character.");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (event) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);
    if (newConfirmPassword !== password) {
      setPasswordMatchError("Passwords do not match.");
    } else {
      setPasswordMatchError("");
    }
  };

  const handleSendOtp = async () => {
    try {
      const response = await api.post("/send-otp", { email });
      if (response.status === 200) {
        setEmailSent(true);
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
      console.error("Failed to send OTP. ", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await api.post("/validate-otp", { email, otp });
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const userData = {
      name: `${formData.get("firstName")} ${formData.get("lastName")}`,
      username: formData.get("username"),
      email,
      password,
    };

    try {
      const response = await api.post("/register", userData);
      if (response.status === 201) {
        toast.success("Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            toast.error("Please enter all the information");
            break;
          case 409:
            toast.error(error.response.data);
            break;
          case 500:
            toast.error("An error occurred while registering. Please try again.");
            break;
          default:
            toast.error("Registration failed. Please try again.");
            break;
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
      console.error("Registration failed:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    window.location.href = "https://backend.online-judge.site/auth/google";
  };

  const handleGitHubSignIn = () => {
    window.location.href = "https://backend.online-judge.site/auth/github";
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
            <Typography
              component="h1"
              variant="h4"
              gutterBottom
              sx={{
                fontFamily: 'Roboto Slab, serif',
                fontWeight: 'bold',
              }}
            >
              Welcome to CodeSpace
            </Typography>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpVerified}
                  />
                </Grid>
                {emailSent && !otpVerified && (
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="otp"
                      label="Enter OTP"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    disabled={!otpVerified}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    disabled={!otpVerified}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    disabled={!otpVerified}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={handlePasswordChange}
                    error={!!passwordError}
                    helperText={passwordError}
                    disabled={!otpVerified}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    error={!!passwordMatchError}
                    helperText={passwordMatchError}
                    disabled={!otpVerified}
                  />
                </Grid>
                {!emailSent && (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSendOtp}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Send OTP
                    </Button>
                  </Grid>
                )}
                {emailSent && !otpVerified && (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleVerifyOtp}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Verify OTP
                    </Button>
                  </Grid>
                )}
                {otpVerified && (
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Sign Up
                    </Button>
                  </Grid>
                )}
              </Grid>
              <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    sx={{
                      color: 'white',
                      backgroundColor: '#db4437',
                      borderColor: '#db4437',
                      '&:hover': {
                        backgroundColor: '#c23321',
                        borderColor: '#c23321',
                      }
                    }}
                  >
                    Google
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    onClick={handleGitHubSignIn}
                    sx={{
                      color: 'white',
                      backgroundColor: '#333',
                      borderColor: '#333',
                      '&:hover': {
                        backgroundColor: '#24292e',
                        borderColor: '#24292e',
                      }
                    }}
                  >
                    GitHub
                  </Button>
                </Grid>
              </Grid>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link href="/login" variant="body2">
                    <p>Already have an account? Sign in</p>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default SignUp;
