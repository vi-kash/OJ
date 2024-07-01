import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from "./components/screens/Register.jsx";
import Login from "./components/screens/Login.jsx";
import Dashboard from "./components/screens/Dashboard.jsx";
import Problemset from "./components/screens/Problemset.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/problemset" element={<Problemset />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
