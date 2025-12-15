import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Trophy, Code, Terminal, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchLeetCodeStats, fetchCodeForcesStats, fetchCodeChefStats } from '../services/api';
import './Tracker.css';

const PlatformCard = ({ name, platformId, icon: Icon, color, initialCount, storageKey, apiFunc, userHandle, onUpdateHandle }) => {
    const [count, setCount] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? parseInt(saved, 10) : initialCount;
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
                const newCount = await apiFunc(userHandle);
                setCount(newCount);
                alert(`Synced ${name} for ${userHandle}!`);
            } else {
                setTimeout(() => {
                    // Fallback to manual increment simulation if no API
                    setCount(c => c + 1);
                    alert(`Manual update for ${name}`);
                }, 500);
            }
        } catch (error) {
            alert(`Failed to sync ${name}: ${error.message}`);
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
        <div className="platform-card" style={{ borderColor: color }}>
            <div className="card-header">
                <div className="icon-wrapper" style={{ backgroundColor: `${color}20`, color: color }}>
                    <Icon size={24} />
                </div>
                <h3>{name}</h3>
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
                            <span className="user-handle-hint" style={{ fontSize: '12px', color: '#a1a1aa' }}>
                                {userHandle ? `@${userHandle}` : 'Not connected'}
                            </span>
                            <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 0 }}>
                                <Edit2 size={12} />
                            </button>
                        </>
                    )}
                </div>

                <div className="button-group">
                    <button className="btn-inc" onClick={() => setCount(c => c + 1)} title="Increment">+</button>
                    <button className="btn-update" onClick={handleUpdate} disabled={isUpdating || !userHandle}>
                        {isUpdating ? 'Syncing...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Tracker = () => {
    const { user, updateHandle } = useAuth();

    // Get handles from user object or fallback to email prefix
    const defaultHandle = user?.email?.split('@')[0] || '';
    const leetcodeHandle = user?.apiHandles?.leetcode || defaultHandle;
    const codeforcesHandle = user?.apiHandles?.codeforces || defaultHandle;
    const codechefHandle = user?.apiHandles?.codechef || defaultHandle;

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
                        initialCount={150}
                        storageKey={`leetcode_${leetcodeHandle}`}
                        apiFunc={fetchLeetCodeStats}
                        userHandle={leetcodeHandle}
                        onUpdateHandle={updateHandle}
                    />
                    <PlatformCard
                        name="CodeChef"
                        platformId="codechef"
                        icon={Trophy}
                        color="#5b4638"
                        initialCount={45}
                        storageKey={`codechef_${codechefHandle}`}
                        apiFunc={fetchCodeChefStats}
                        userHandle={codechefHandle}
                        onUpdateHandle={updateHandle}
                    />
                    <PlatformCard
                        name="CodeForces"
                        platformId="codeforces"
                        icon={Terminal}
                        color="#318ce7"
                        initialCount={80}
                        storageKey={`codeforces_${codeforcesHandle}`}
                        apiFunc={fetchCodeForcesStats}
                        userHandle={codeforcesHandle}
                        onUpdateHandle={updateHandle}
                    />
                </div>

                <div className="activity-section">
                    <h2>Recent Activity</h2>
                    <div className="activity-placeholder">
                        Graph Placeholder (Activity Heatmap)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tracker;
