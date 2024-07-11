/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Grid,
    Card,
    Container,
    Typography,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Button,
} from "@mui/material";
import api from "../../api.js";
import Navbar from "../Navbar.jsx";
import { Editor } from "@monaco-editor/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Problem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error handling

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get(`/problem/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProblem(response.data.problem);
                setLoading(false); // Update loading state
            } catch (error) {
                console.error("Failed to fetch problem:", error);
                setLoading(false); // Update loading state
                setError("Failed to fetch problem. Please try again."); // Set error message
            }
        };

        const checkAdminStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get("/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsAdmin(response.data.user.role === "admin");
            } catch (error) {
                console.error("Failed to check admin status:", error);
            }
        };

        fetchProblem();
        checkAdminStatus();
    }, [id]);

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            await api.delete(`/deleteProblem/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Problem deleted successfully!");
            navigate("/problemset");
        } catch (error) {
            console.error("Failed to delete problem:", error);
            toast.error("Failed to delete problem. Please try again.");
        }
    };

    if (loading) {
        return (
            <Container>
                <CircularProgress />
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography variant="h5" color="error" gutterBottom>
                    Error: {error}
                </Typography>
            </Container>
        );
    }

    return (
        <div>
            <Navbar />
            <div
                style={{
                    width: "100%",
                    height: "100vh",
                    padding: 16,
                    backgroundColor: "#f0f4f8",
                    display: "flex",
                    flexDirection: "column", // Flex direction column for main container
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flex: "1 1 auto", // Flex 1 1 auto for flexible resizing
                        overflow: "hidden", // Prevent overflow of the entire container
                        gap: 10, // Gap between left and right halves
                    }}
                >
                    <Card
                        elevation={3}
                        style={{
                            flex: "2 2 40%",
                            padding: 20,
                            marginTop: 20,
                            marginBottom: 10,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 16,
                            overflow: "auto",
                        }}
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            style={{
                                fontFamily: "Roboto Slab, serif",
                                fontWeight: "bold",
                            }}
                        >
                            {problem.title}
                        </Typography>
                        <Typography
                            variant="body1"
                            component="p"
                            style={{
                                marginBottom: 20,
                                fontFamily: "Arial, sans-serif",
                                fontSize: "1.1rem",
                            }}
                        >
                            {problem.description}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="h2"
                            style={{
                                fontFamily: "Arial, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Difficulty:
                        </Typography>
                        <Typography
                            variant="body1"
                            component="p"
                            style={{
                                marginBottom: 20,
                                fontFamily: "Arial, sans-serif",
                                fontSize: "1rem",
                            }}
                        >
                            {problem.difficulty}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="h2"
                            style={{
                                fontFamily: "Arial, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Input Format:
                        </Typography>
                        <Typography
                            variant="body1"
                            component="p"
                            style={{
                                marginBottom: 20,
                                fontFamily: "Arial, sans-serif",
                                fontSize: "1rem",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {problem.inputFormat}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="h2"
                            style={{
                                fontFamily: "Arial, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Output Format:
                        </Typography>
                        <Typography
                            variant="body1"
                            component="p"
                            style={{
                                marginBottom: 20,
                                fontFamily: "Arial, sans-serif",
                                fontSize: "1rem",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {problem.outputFormat}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="h2"
                            style={{
                                fontFamily: "Arial, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Constraints:
                        </Typography>
                        <Typography
                            variant="body1"
                            component="p"
                            style={{
                                marginBottom: 20,
                                fontFamily: "Arial, sans-serif",
                                fontSize: "1rem",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {problem.constraints}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="h2"
                            style={{
                                fontFamily: "Arial, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Sample Input:
                        </Typography>
                        <Typography
                            variant="body1"
                            component="p"
                            style={{
                                marginBottom: 20,
                                fontFamily: "Arial, sans-serif",
                                fontSize: "1rem",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {problem.sampleInput}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="h2"
                            style={{
                                fontFamily: "Arial, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Sample Output:
                        </Typography>
                        <Typography
                            variant="body1"
                            component="p"
                            style={{
                                marginBottom: 20,
                                fontFamily: "Arial, sans-serif",
                                fontSize: "1rem",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {problem.sampleOutput}
                        </Typography>
                    </Card>
                    <Card
                        elevation={3}
                        style={{
                            flex: "3 3 60%",
                            padding: 20,
                            marginTop: 20,
                            marginBottom: 10,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 16,
                            overflow: "auto",
                        }}
                    >
                        <CodeEditorComponent problem={problem} />
                    </Card>
                </div>
                {isAdmin && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: 20,
                            marginBottom: 25,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/editProblem/${id}`)}
                            style={{
                                marginRight: 10,
                                backgroundColor: "#4f4f4f",
                                color: "#fff",
                            }}
                        >
                            Edit Problem
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleDelete}
                            style={{
                                backgroundColor: "#d32f2f",
                                color: "#fff",
                            }}
                        >
                            Delete Problem
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CodeEditorComponent = ({ problem }) => {
    const [code, setCode] = useState(
        `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
    );
    const [language, setLanguage] = useState("cpp");
    const [input, setInput] = useState(problem.sampleInput || "");
    const [output, setOutput] = useState("");
    const [verdict, setVerdict] = useState(null); // State for verdict
    const [running, setRunning] = useState(false);
    const [error, setError] = useState(null); // State for error messages

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    const handleRun = async () => {
        try {
            setRunning(true);
            const token = localStorage.getItem("token");
            const response = await api.post("/run", {
                code,
                input,
                language,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOutput(response.data.output);
            setError(null); // Clear any previous errors
            setVerdict(null);
        } catch (error) {
            console.error("Failed to run code:", error);
            setError("Failed to run code. Please try again."); // Set error message
            setOutput("");
            setVerdict(null);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setRunning(true);
            const token = localStorage.getItem("token");
            const response = await api.post(`/submit/${problem.id}`, {
                code,
                language,
                problem,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVerdict(response.data.status); // Update verdict based on submission response
            setError(null); // Clear any previous errors
            setOutput("");
        } catch (error) {
            console.error("Failed to submit code:", error);
            setError("Failed to submit code. Please try again."); // Set error message
        } finally {
            setRunning(false);
        }
    };

    return (
        <Container maxWidth="md" className="my-4">
            <div className="flex justify-center mb-4">
                <FormControl variant="outlined" className="w-64">
                    <InputLabel id="language-select-label">Language</InputLabel>
                    <Select
                        labelId="language-select-label"
                        id="language-select"
                        value={language}
                        onChange={handleLanguageChange}
                        label="Language"
                    >
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="java">Java</MenuItem>
                        <MenuItem value="cpp">C++</MenuItem>
                        <MenuItem value="python">Python</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <Editor
                height="600px"
                defaultLanguage={language}
                defaultValue={code}
                onChange={(value) => setCode(value)}
                theme="vs-dark"
                options={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 14,
                }}
            />
            <Grid marginTop={2} container spacing={2} className="my-4">
                <Grid item xs={6}>
                    <TextField
                        label="Input"
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Output"
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                        value={output}
                        readOnly
                    />
                </Grid>
                {verdict && (
                    <Grid item xs={12}>
                        <TextField
                            label="Verdict"
                            multiline
                            rows={4}
                            variant="outlined"
                            fullWidth
                            value={verdict}
                            readOnly
                            style={{ marginTop: 20 }}
                        />
                    </Grid>
                )}
                {error && (
                    <Grid item xs={12}>
                        <TextField
                            label="Error"
                            multiline
                            rows={4}
                            variant="outlined"
                            fullWidth
                            value={error}
                            readOnly
                            style={{ marginTop: 20, borderColor: "#d32f2f", borderWidth: 2 }}
                        />
                    </Grid>
                )}
            </Grid>
            <div className="flex justify-center mt-4">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRun}
                    style={{
                        marginRight: 10,
                        backgroundColor: "#4f4f4f",
                        color: "#fff",
                    }}
                    disabled={running}
                >
                    Run
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSubmit}
                    style={{ backgroundColor: "#d32f2f", color: "#fff" }}
                    disabled={running}
                >
                    Submit
                </Button>
            </div>
        </Container>
    );
};

export default Problem;
