import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Tracker from './pages/Tracker';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Landing />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tracker"
                            element={
                                <ProtectedRoute>
                                    <Tracker />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
