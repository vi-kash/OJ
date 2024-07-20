import { useEffect } from "react";
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

const SignIn = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await api.get("/me", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    
                    if(response.data.user) {
                        navigate("/");
                    }
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const userData = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await api.post("/login", userData);
            const { token } = response.data;
            localStorage.setItem("token", token);
            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Please enter all the information");
                        break;
                    case 401:
                        if (error.response.data === "User not found!") {
                            toast.error("User not found!");
                        } else if (error.response.data === "Password is incorrect") {
                            toast.error("Password is incorrect");
                        } else {
                            toast.error("Invalid email or password");
                        }
                        break;
                    case 500:
                        toast.error("An error occurred while logging in. Please try again.");
                        break;
                    default:
                        toast.error("Login failed. Please try again.");
                        break;
                }
            } else {
                toast.error("Login failed. Please try again.");
            }
            console.error("Login failed:", error);
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
                            Welcome to CodeSpace
                        </Typography>
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                            <Grid container sx={{ mt: 3 }}>
                                <Grid item xs>
                                    <Link href="/forgotPassword" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="/register" variant="body2">
                                        {"Don't have an account? Sign Up"}
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

export default SignIn;
