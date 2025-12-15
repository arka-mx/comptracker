import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Globe,
    ClipboardList,
    LayoutTemplate,
    Binoculars,
    Code2,
    FileText,
    CalendarDays,
    Trophy,
    User,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handlePlaceholderClick = (feature) => {
        alert(`${feature} feature coming soon!`);
    };

    const handleLogout = async () => {
        if (!user) {
            alert("user already logged out");
            return;
        }

        if (window.confirm("Are you sure you want to logout?")) {
            await logout();
            navigate('/login');
        }
    };

    return (
        <nav className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-icon" title="Comptracker">🦉</span>
            </div>

            <div className="sidebar-menu">
                <NavLink to="/" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} title="Home">
                    <Home size={20} />
                </NavLink>
                <NavLink to="/tracker" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} title="Tracker">
                    <Globe size={20} />
                </NavLink>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-item" onClick={() => handlePlaceholderClick('Profile')} title="Profile">
                    <User size={20} />
                </div>
                <div className="sidebar-item" onClick={handleLogout} title="Logout">
                    <LogOut size={20} />
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
