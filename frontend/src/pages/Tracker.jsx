import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { Code, Terminal, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchLeetCodeStats, fetchCodeForcesStats } from '../services/api';
import './Tracker.css';

const PlatformCard = ({ name, platformId, icon: Icon, color, initialCount, storageKey, apiFunc, userHandle, onUpdateHandle, titleClassName, className, onDataFetched }) => {
    const [count, setCount] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        // If saved exists, use it. Otherwise use initialCount if provided, else "-"
        if (saved !== null) return parseInt(saved, 10);
        return initialCount !== undefined ? initialCount : '-';
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Handle Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(userHandle || '');

    useEffect(() => {
        localStorage.setItem(storageKey, count);
    }, [count, storageKey]);

    useEffect(() => {
        setEditValue(userHandle || '');
    }, [userHandle]);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            if (apiFunc && userHandle) {
                const data = await apiFunc(userHandle);
                const newCount = typeof data === 'object' ? data.count : data;
                setCount(newCount);
                if (onDataFetched) onDataFetched(data);
                toast.success(`Synced ${name} for ${userHandle}!`);
            } else {
                setTimeout(() => {
                    // Fallback to manual increment simulation if no API
                    setCount(c => c + 1);
                    toast.success(`Manual update for ${name}`);
                }, 5);
            }
        } catch (error) {
            toast.error(`Failed to sync ${name}: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const saveHandle = () => {
        if (editValue && editValue !== userHandle) {
            onUpdateHandle(platformId, editValue);
        }
        setIsEditing(false);
    };

    return (
        <div className={`platform-card ${className || ''}`} style={{ borderColor: color }}>
            <div className="card-header">
                <div className="icon-wrapper" style={{ backgroundColor: `${color}20`, color: color }}>
                    <Icon size={24} />
                </div>
                <h3><span className={titleClassName}>{name}</span></h3>
            </div>
            <div className="card-body">
                <div className="count-display">
                    <span className="count-value">{count}</span>
                    <span className="count-label">Solved</span>
                </div>

                <div className="user-handle-section" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="handle-input"
                                style={{
                                    background: '#27272a', border: '1px solid #3f3f46', color: 'white',
                                    padding: '2px 5px', borderRadius: '4px', fontSize: '12px', width: '100px'
                                }}
                            />
                            <button onClick={saveHandle} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer' }}><Check size={14} /></button>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><X size={14} /></button>
                        </div>
                    ) : (
                        <>
                            <span className="user-handle-hint" style={{ fontSize: '12px' }}>
                                {userHandle ? `@${userHandle}` : 'Not connected'}
                            </span>
                            <button className="edit-handle-btn" onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <Edit2 size={12} />
                            </button>
                        </>
                    )}
                </div>

                <div className="button-group">

                    <button className="btn-update" onClick={handleUpdate} disabled={isUpdating || !userHandle}>
                        {isUpdating ? 'Syncing...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

import SubmissionGraph from '../components/SubmissionGraph';

const Tracker = () => {
    const { user, updateHandle } = useAuth();

    // Get handles from user object or fallback to email prefix
    const defaultHandle = user?.email?.split('@')[0] || '';
    const leetcodeHandle = user?.apiHandles?.leetcode || defaultHandle;
    const codeforcesHandle = user?.apiHandles?.codeforces || defaultHandle;

    const [leetcodeHistory, setLeetcodeHistory] = useState(() => {
        const saved = localStorage.getItem(`leetcode_history_${leetcodeHandle}`);
        return saved ? JSON.parse(saved) : {};
    });

    const handleLeetCodeData = (data) => {
        if (data.history) {
            setLeetcodeHistory(data.history);
            localStorage.setItem(`leetcode_history_${leetcodeHandle}`, JSON.stringify(data.history));
        }
    };

    return (
        <div className="tracker-page">
            <Header />
            <div className="tracker-content">
                <h1>Your Progress {user?.name ? `- Welcome, ${user.name}` : ''}</h1>
                <div className="platforms-grid">
                    <PlatformCard
                        name="LeetCode"
                        platformId="leetcode"
                        icon={Code}
                        color="#ffa116"
                        storageKey={`leetcode_${leetcodeHandle}`}
                        apiFunc={fetchLeetCodeStats}
                        userHandle={leetcodeHandle}
                        onUpdateHandle={updateHandle}
                        onDataFetched={handleLeetCodeData}
                    />

                    <PlatformCard
                        name="Codeforces"
                        platformId="codeforces"
                        icon={Terminal}
                        color="#318ce7"
                        titleClassName="codeforces-title"
                        className="codeforces-card"
                        storageKey={`codeforces_${codeforcesHandle}`}
                        apiFunc={fetchCodeForcesStats}
                        userHandle={codeforcesHandle}
                        onUpdateHandle={updateHandle}
                    />
                </div>

                <div className="activity-section">
                    <h2>Recent Activity (LeetCode)</h2>
                    <SubmissionGraph calendarData={leetcodeHistory} />
                </div>
            </div>
        </div>
    );
};

export default Tracker;
