import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api.js";
import Navbar from "../Navbar.jsx";
import { Container, Grid, Card, Typography } from "@mui/material";
import { Box } from "@mui/system";

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
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!user) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", p: 2 }}>
        <Container maxWidth="md">
          <Card sx={{ backgroundColor: "white", borderRadius: 10, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: 4, padding: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>Welcome, {user.name}</Typography>
            <Typography variant="h6" align="center" gutterBottom>Username: {user.username}</Typography>
            <Typography variant="h6" align="center">Email: {user.email}</Typography>
          </Card>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: "white", borderRadius: 10, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: 3 }}>
                <Typography variant="h5" align="center" gutterBottom>Solved Questions</Typography>
                <div style={{ overflowX: 'auto' }}>
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="border-b-2 pb-2">Title</th>
                        <th className="border-b-2 pb-2 text-right">Difficulty</th>
                        <th className="border-b-2 pb-2 text-right">Accuracy</th>
                        <th className="border-b-2 pb-2 text-right">Total Submissions</th>
                        <th className="border-b-2 pb-2 text-right">Language</th>
                        <th className="border-b-2 pb-2 text-right">Submission Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems
                        .filter((problem) => problem.title !== "Unknown")
                        .map((problem) => (
                          <tr key={problem.id} className="hover:bg-gray-100">
                            <td className="py-2">
                              <Link to={`/problem/${problem.id}`} className="text-blue-500 hover:underline">
                                {problem.title}
                              </Link>
                            </td>
                            <td className="py-2 text-right">
                              {problem.difficulty}
                            </td>
                            <td className="py-2 text-right">
                              {(problem.acceptedCount / problem.totalSubmissions).toFixed(2)}
                            </td>
                            <td className="py-2 text-right">
                              {problem.totalSubmissions}
                            </td>
                            <td className="py-2 text-right">
                              {problem.language}
                            </td>
                            <td className="py-2 text-right">
                              {new Date(problem.submissionDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}

                    </tbody>
                  </table>
                </div>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: "white", borderRadius: 10, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: 3 }}>
                <Typography variant="h5" align="center" gutterBottom>Participated Contests</Typography>
                <div style={{ overflowX: 'auto' }}>
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="border-b-2 pb-2">Title</th>
                        <th className="border-b-2 pb-2 text-right">Score</th>
                        <th className="border-b-2 pb-2 text-right">Rank</th>
                        <th className="border-b-2 pb-2 text-right">Submission Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contests.map((contest) => (
                        <tr key={contest.id} className="hover:bg-gray-100">
                          <td className="py-2">
                            <Link to={`/contest/${contest.id}`} className="text-blue-500 hover:underline">
                              {contest.title}
                            </Link>
                          </td>
                          <td className="py-2 text-right">{contest.score}</td>
                          <td className="py-2 text-right">{contest.rank}</td>
                          <td className="py-2 text-right">{contest.submissionDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Grid>
          </Grid>
          {isAdmin && (
            <div className="text-center mt-8">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded mr-2 hover:bg-gray-800"
                onClick={() => navigate("/addQuestion")}
              >
                Add Question
              </button>
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                onClick={() => navigate("/createContest")}
              >
                Create Contest
              </button>
            </div>
          )}
        </Container>
      </Box>
    </div>
  );
};

export default Dashboard;
