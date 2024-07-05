import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-6 text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
          <p className="text-lg">Username: {user.username}</p>
          <p className="text-lg">Email: {user.email}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Previously Solved Questions</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border-b-2 pb-2">Title</th>
                  <th className="border-b-2 pb-2 text-right">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-100">
                    <td className="py-2">
                      <Link to={`/problem/${problem.id}`} className="text-blue-500 hover:underline">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="py-2 text-right">{problem.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Previously Participated Contests</h2>
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
        </div>
        {isAdmin && (
          <div className="text-center mt-8">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              onClick={() => navigate("/addQuestion")}
            >
              Add Question
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => navigate("/createContest")}
            >
              Create Contest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
