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

const defaultTheme = createTheme();

const SignUp = () => {
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userData = {
      name: `${formData.get("firstName")} ${formData.get("lastName")}`,
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
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

  const handleGoogleSignIn = () => {
    toast.info("Google sign-up is not implemented yet.");
  };

  const handleGitHubSignIn = () => {
    toast.info("GitHub sign-up is not implemented yet.");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <div style={{
        backgroundColor: '#f0f4f8',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
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
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
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
