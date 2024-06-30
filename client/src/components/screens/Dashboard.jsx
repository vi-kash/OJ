import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Typography, Button, Grid, Box, Card, CardContent } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import api from "../../api.js";
import Navbar from "../Navbar.jsx";

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [problems, setProblems] = useState([]);
    const [contests, setContests] = useState([]);

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
                setIsAdmin(response.data.user.role === "admin");
                setProblems(response.data.problems);
                setContests(response.data.contests);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
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
                <Card sx={{ margin: "auto", mt: 4, p: 2, textAlign: "center" }}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            Welcome, {user.name}
                        </Typography>
                        <Typography variant="h6">Username: {user.username}</Typography>
                        <Typography variant="h6">Email: {user.email}</Typography>
                    </CardContent>
                </Card>
                <Box mt={4} display="flex" justifyContent="center">
                    <Card sx={{ width: "100%", p: 2 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                                Previously Solved Questions
                            </Typography>
                            <Grid container spacing={2}>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Title</TableCell>
                                                <TableCell align="right">Difficulty</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {problems.map((problem) => (
                                                <TableRow
                                                    key={problem.title}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        <Link to={`/problem/${problem.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {problem.title}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="right">{problem.difficulty}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
                <Box mt={4} display="flex" justifyContent="center">
                    <Card sx={{ width: "100%", p: 2 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                                Previously Participated Contests
                            </Typography>
                            <Grid container spacing={2}>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Title</TableCell>
                                                <TableCell>Score</TableCell>
                                                <TableCell>Rank</TableCell>
                                                <TableCell>submissionDate</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {contests.map((contest) => (
                                                <TableRow
                                                    key={contest.title}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        <Link to={`/contest/${contest.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {contest.title}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="right">{contest.score}</TableCell>
                                                    <TableCell align="right">{contest.rank}</TableCell>
                                                    <TableCell align="right">{contest.submissionDate}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
                {isAdmin && (
                    <Box mt={4} display="flex" justifyContent="center">
                        <Button variant="contained" color="primary" onClick={() => navigate("/addQuestion")}>
                            Add Question
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate("/createContest")} sx={{ ml: 2 }}>
                            Create Contest
                        </Button>
                    </Box>
                )}
            </Container>
        </div >
    );
};

export default Dashboard;
