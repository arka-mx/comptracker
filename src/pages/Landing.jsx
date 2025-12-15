import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <Header />

            <div className="hero-section">
                <h1 className="hero-title">
                    Track, analyze & share
                </h1>
                <p className="hero-subtitle">
                    <span className="brand-highlight">Comptracker</span> helps you navigate and track your<br />
                    coding journey to success
                </p>

                <div className="hero-buttons">
                    <button className="btn-secondary" onClick={() => navigate('/tracker')}>Profile Tracker</button>
                    <button className="btn-primary" onClick={() => alert('Company Wise Kit feature coming soon!')}>Company-Wise Kit &rarr;</button>
                </div>

                <div className="hero-visuals">
                    {/* Mascot and Cards Mockup */}
                    <div className="mascot-container">
                        <span style={{ fontSize: '100px' }}>🦉</span>
                    </div>

                    <div className="stats-preview">
                        <div className="stat-card p-1">
                            <div className="avatar-small"></div>
                            <div className="stat-info">
                                <h3>Siddharth Singh</h3>
                                <span>Software Engineer @ Wells Fargo</span>
                            </div>
                        </div>
                        <div className="stat-card p-2">
                            <span className="stat-label">Total Questions</span>
                            <span className="stat-value">1010</span>
                        </div>
                        <div className="stat-card p-3">
                            <span className="stat-label">Total Active Days</span>
                            <span className="stat-value">348</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
