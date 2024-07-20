import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Register from './components/screens/Register.jsx';
import Login from './components/screens/Login.jsx';
import Dashboard from './components/screens/Dashboard.jsx';
import Problemset from './components/screens/Problemset.jsx';
import Problem from './components/screens/Problem.jsx';
import AddQuestionForm from './components/screens/AddQuestionForm.jsx';
import EditQuestionForm from './components/screens/EditQuestionForm.jsx';
import MySubmissions from "./components/screens/MySubmissions.jsx";
import AllSubmissions from "./components/screens/AllSubmissions.jsx";
import AuthCallback from './components/screens/AuthCallback.jsx';
import ForgotPassword from './components/screens/ForgotPassword.jsx';
import UpdateProfile from './components/screens/UpdateProfile.jsx';
import UpdateEmail from './components/screens/UpdateEmail.jsx';
import ChangePassword from './components/screens/ChangePassword.jsx';
import './App.css';

const App = () => {
    return (
        <BrowserRouter>
            <ToastContainer />
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/problemset" element={<Problemset />} />
                <Route path="/problem/:id" element={<Problem />} />
                <Route path="/addQuestion" element={<AddQuestionForm />} />
                <Route path="/editProblem/:id" element={<EditQuestionForm />} />
                <Route path="/mySubmissions/:id" element={<MySubmissions />} />
                <Route path="/allSubmissions/:id" element={<AllSubmissions />} />
                <Route path="/auth/callback/:token" element={<AuthCallback />} />
                <Route path="/forgotPassword" element={<ForgotPassword />} />
                <Route path="/updateProfile" element={<UpdateProfile />} />
                <Route path="/updateEmail" element={<UpdateEmail />} />
                <Route path="/changePassword" element={<ChangePassword />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
