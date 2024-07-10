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
    Button
} from "@mui/material";
import api from "../../api.js";
import Navbar from "../Navbar.jsx";
import { Editor } from "@monaco-editor/react";

const Problem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get(`/problem/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProblem(response.data.problem);
            } catch (error) {
                console.error("Failed to fetch problem:", error);
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
            navigate("/problemset");
        } catch (error) {
            console.error("Failed to delete problem:", error);
        }
    };

    if (!problem) {
        return (
            <Container>
                <CircularProgress />
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <div>
            <Navbar />
            <Container>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} style={{ padding: 20, marginTop: 20 }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {problem.title}
                            </Typography>
                            <Typography variant="body1" component="p">
                                {problem.description}
                            </Typography>
                            <Typography variant="body1" component="p">
                                <strong>Difficulty:</strong> {problem.difficulty}
                            </Typography>
                            <Typography variant="body1" component="p">
                                <strong>Input Format:</strong> {problem.inputFormat}
                            </Typography>
                            <Typography variant="body1" component="p">
                                <strong>Output Format:</strong> {problem.outputFormat}
                            </Typography>
                            <Typography variant="body1" component="p">
                                <strong>Constraints:</strong> {problem.constraints}
                            </Typography>
                            <Typography variant="body1" component="p">
                                <strong>Sample Input:</strong> {problem.sampleInput}
                            </Typography>
                            <Typography variant="body1" component="p">
                                <strong>Sample Output:</strong> {problem.sampleOutput}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} style={{ padding: 20, marginTop: 20 }}>
                            <CodeEditorComponent problem={problem} />
                        </Card>
                    </Grid>
                </Grid>
                {isAdmin && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 25 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/editProblem/${id}`)}
                            style={{ marginRight: 10 }}
                        >
                            Edit Problem
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleDelete}
                        >
                            Delete Problem
                        </Button>
                    </div>
                )}
            </Container>
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

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    const handleRun = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.post("/run", {
                code,
                input,
                language,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOutput(response.data.output);
        } catch (error) {
            console.error("Failed to run code:", error);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.post(`/submit/${problem.id}`, {
                code,
                language,
                problem,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data);
        } catch (error) {
            console.error("Failed to submit code:", error);
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
                height="300px"
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
            </Grid>
            <div className="flex justify-center mt-4">
                <Button variant="contained" color="primary" onClick={handleRun} style={{ marginRight: 10 }}>
                    Run
                </Button>
                <Button variant="contained" color="secondary" onClick={handleSubmit}>
                    Submit
                </Button>
            </div>
        </Container>
    );
};

export default Problem;
