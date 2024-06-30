import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Grid, Box } from "@mui/material";
import api from "../../api.js";
import Navbar from "../Navbar.jsx";

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [solvedQuestions, setSolvedQuestions] = useState([]);
    const [contests, setContests] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

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

                setUser(response.data.user);
                setSolvedQuestions(response.data.solvedQuestions);
                setContests(response.data.contests);
                setIsAdmin(response.data.user.role === "admin");
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                navigate("/login");
            }
        };

        fetchUserData();
    }, [navigate]);

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <div>
            <Navbar />
            <Container>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user.name}
                </Typography>
                <Typography variant="h6">Username: {user.username}</Typography>
                <Typography variant="h6">Email: {user.email}</Typography>
                <Box mt={4}>
                    <Typography variant="h5">Previous Solved Questions</Typography>
                    <Grid container spacing={2}>
                        {solvedQuestions.slice(0, 10).map((question, index) => (
                            <Grid item key={index} xs={12} sm={6} md={4}>
                                <Typography>{question.title}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Box mt={4}>
                    <Typography variant="h5">Previously Participated Contests</Typography>
                    <Grid container spacing={2}>
                        {contests.slice(0, 5).map((contest, index) => (
                            <Grid item key={index} xs={12} sm={6} md={4}>
                                <Typography>{contest.name} - Score: {contest.score}, Rank: {contest.rank}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {isAdmin && (
                    <Box mt={4}>
                        <Button variant="contained" color="primary" onClick={() => navigate("/addQuestion")}>
                            Add Question
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate("/createContest")} sx={{ ml: 2 }}>
                            Create Contest
                        </Button>
                    </Box>
                )}
            </Container>
        </div>
    );
};

export default Dashboard;
