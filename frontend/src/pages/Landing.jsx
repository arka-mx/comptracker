import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLeetCodeStats, fetchCodeForcesStats } from '../services/api';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalQuestions: 0,
        totalHours: 0,
        loading: true
    });

    useEffect(() => {
        const loadStats = async () => {
            if (!user) {
                setStats({ totalQuestions: 0, totalHours: 0, loading: false });
                return;
            }

            const leetcodeHandle = user.apiHandles?.leetcode || user.email?.split('@')[0];
            const codeforcesHandle = user.apiHandles?.codeforces || user.email?.split('@')[0];

            try {
                const [lcData, cfData] = await Promise.all([
                    fetchLeetCodeStats(leetcodeHandle),
                    fetchCodeForcesStats(codeforcesHandle)
                ]);

                const lcCount = typeof lcData === 'object' ? (lcData.count === '-' ? 0 : lcData.count) : 0;
                const lcSeconds = typeof lcData === 'object' ? lcData.activeSeconds : 0;

                const cfCount = typeof cfData === 'object' ? (cfData.count === '-' ? 0 : cfData.count) : 0;
                const cfSeconds = typeof cfData === 'object' ? cfData.activeSeconds : 0;

                setStats({
                    totalQuestions: lcCount + cfCount,
                    totalHours: Math.round((lcSeconds + cfSeconds) / 3600),
                    loading: false
                });
            } catch (err) {
                console.error("Failed to load landing stats", err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        loadStats();
    }, [user]);

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

                </div>

                <div className="hero-visuals">
                    {/* Mascot and Cards Mockup */}
                    <div className="mascot-container">
                        <span style={{ fontSize: '80px' }}>🦉</span>
                    </div>

                    <div className="stats-preview">
                        <div className="stat-card p-1">
                            {/* <div className="avatar-small">
                                {user?.avatar && <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />}
                            </div> */}
                            <div className="stat-info">
                                <h3>{user?.name || 'Guest User'}</h3>
                                <span>Programmer</span>
                            </div>
                        </div>
                        <div className="stat-card p-2">
                            <span className="stat-label">Total Questions</span>
                            <span className="stat-value">{stats.loading ? '-' : stats.totalQuestions}</span>
                        </div>
                        <div className="stat-card p-3">
                            <span className="stat-label">Total Active Hours</span>
                            <span className="stat-value">{stats.loading ? '-' : stats.totalHours}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
