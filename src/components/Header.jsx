import React from 'react';
import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="main-header">
            <div className="header-left">
                {/* Breadcrumb or Title could go here */}
            </div>
            <div className="header-right">
                <button className="btn-primary-outline" onClick={() => alert('Company Wise Kit feature coming soon!')}>Company Wise Kit 🪙</button>
                <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <div className="profile-avatar" onClick={() => navigate('/login')} title="Login" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <User size={20} />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
