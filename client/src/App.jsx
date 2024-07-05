import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from "./components/screens/Register.jsx";
import Login from "./components/screens/Login.jsx";
import Dashboard from "./components/screens/Dashboard.jsx";
import Problemset from "./components/screens/Problemset.jsx";
import Problem from "./components/screens/Problem.jsx";
import "./App.css";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/problemset" element={<Problemset />} />
                <Route path="/problem/:id" element={<Problem />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
