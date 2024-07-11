import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    TextField,
    Button,
    Grid,
    Card,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api.js";
import Navbar from "../Navbar.jsx";

const EditQuestionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [inputFormat, setInputFormat] = useState("");
    const [outputFormat, setOutputFormat] = useState("");
    const [constraints, setConstraints] = useState("");
    const [sampleInput, setSampleInput] = useState("");
    const [sampleOutput, setSampleOutput] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthAndAdmin = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await api.get("/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setIsAuthenticated(true);
                setIsAdmin(response.data.user.role === "admin");
            } catch (error) {
                console.error("Authentication check failed:", error);
                navigate("/login");
            }
        };

        const fetchProblem = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get(`/problem/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const problem = response.data.problem;
                setTitle(problem.title);
                setDescription(problem.description);
                setInputFormat(problem.inputFormat);
                setOutputFormat(problem.outputFormat);
                setConstraints(problem.constraints);
                setSampleInput(problem.sampleInput);
                setSampleOutput(problem.sampleOutput);
                setDifficulty(problem.difficulty);
                setTestCases(problem.testCases);
            } catch (error) {
                console.error("Failed to fetch problem:", error);
            }
        };

        checkAuthAndAdmin();
        fetchProblem();
    }, [id, navigate]);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: "", output: "" }]);
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const handleDeleteTestCase = (index) => {
        const newTestCases = [...testCases];
        newTestCases.splice(index, 1);
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !isAdmin) {
            alert("You are not authorized to edit this question.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await api.put(
                `/editProblem/${id}`,
                {
                    title,
                    description,
                    inputFormat,
                    outputFormat,
                    constraints,
                    sampleInput,
                    sampleOutput,
                    difficulty,
                    testCases,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            navigate("/problemset");
        } catch (error) {
            console.error("Failed to update problem:", error);
        }
    };

    return (
        <div style={{ backgroundColor: "#f0f4f8" }}>
            <Navbar />
            <Container className="mt-8">
                <Card elevation={3} className="p-6" style={{ backgroundColor: "#f5f5f5" }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        style={{
                            fontFamily: 'Roboto Slab, serif',
                            fontWeight: 'bold',
                        }}
                    >
                        Edit Question
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Title"
                                    variant="outlined"
                                    fullWidth
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Input Format"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={inputFormat}
                                    onChange={(e) => setInputFormat(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Output Format"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={outputFormat}
                                    onChange={(e) => setOutputFormat(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Constraints"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={constraints}
                                    onChange={(e) => setConstraints(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Sample Input"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={sampleInput}
                                    onChange={(e) => setSampleInput(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Sample Output"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={sampleOutput}
                                    onChange={(e) => setSampleOutput(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Difficulty</InputLabel>
                                    <Select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        label="Difficulty"
                                    >
                                        <MenuItem value="Easy">Easy</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="Hard">Hard</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Test Cases
                                </Typography>
                                {testCases.map((testCase, index) => (
                                    <Grid container spacing={2} key={index} className="mb-4">
                                        <Grid item xs={5}>
                                            <TextField
                                                label="Input"
                                                variant="outlined"
                                                multiline
                                                rows={4}
                                                fullWidth
                                                value={testCase.input}
                                                onChange={(e) =>
                                                    handleTestCaseChange(index, "input", e.target.value)
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={5}>
                                            <TextField
                                                label="Output"
                                                variant="outlined"
                                                multiline
                                                rows={4}
                                                fullWidth
                                                value={testCase.output}
                                                onChange={(e) =>
                                                    handleTestCaseChange(index, "output", e.target.value)
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={2} className="flex items-center">
                                            <IconButton onClick={() => handleDeleteTestCase(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAddTestCase}
                                    style={{
                                        marginRight: 10,
                                        backgroundColor: "#4f4f4f",
                                        color: "#fff",
                                    }}
                                >
                                    Add Test Case
                                </Button>
                            </Grid>
                            <Grid item xs={12} className="flex justify-center mt-4">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    style={{
                                        backgroundColor: "#d32f2f",
                                        color: "#fff",
                                    }}
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Card>
            </Container>
        </div>
    );
};

export default EditQuestionForm;
