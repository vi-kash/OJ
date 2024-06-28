import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from "./components/screens/Register.jsx";
import Login from "./components/screens/Login.jsx";
import Dashboard from "./components/screens/Dashboard.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
