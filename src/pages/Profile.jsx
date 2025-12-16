import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Users, Bell, CreditCard, Download, Trash2, Edit2, Check, X, Camera } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, updateProfile, deleteAccount } = useAuth();
    const [activeTab, setActiveTab] = useState('My Profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const fileInputRef = useRef(null);

    // Initial state from user object
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        phone: '',
        location: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                phone: user.phone || '',
                location: user.location || ''
            });
        }
    }, [user]);

    const menuItems = [
        { name: 'My Profile', icon: <User size={18} /> },
        { name: 'Security', icon: <Shield size={18} /> },
        { name: 'Teams', icon: <Users size={18} /> },
        { name: 'Notifications', icon: <Bell size={18} /> },
        { name: 'Billing', icon: <CreditCard size={18} /> },
        { name: 'Data Export', icon: <Download size={18} /> },
    ];

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (section) => {
        const success = await updateProfile(formData);
        if (success) {
            if (section === 'personal') setIsEditing(false);
            if (section === 'address') setIsEditingAddress(false);
        } else {
            alert('Failed to update profile');
        }
    };

    const handleCancel = (section) => {
        // Reset form data to current user data
        setFormData({
            name: user.name || '',
            email: user.email || '',
            bio: user.bio || '',
            phone: user.phone || '',
            location: user.location || ''
        });
        if (section === 'personal') setIsEditing(false);
        if (section === 'address') setIsEditingAddress(false);
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            // Update profile with new avatar
            const success = await updateProfile({ avatar: base64String });
            if (!success) alert('Failed to upload photo');
        };
        reader.readAsDataURL(file);
    };

    // Calculate split name for display
    const firstName = formData.name.split(' ')[0] || 'Guest';
    const lastName = formData.name.split(' ').slice(1).join(' ') || '';

    return (
        <div className="profile-container">
            {/* Inner Sidebar */}
            <div className="profile-sidebar">
                <h2>Account Settings</h2>
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`profile-menu-item ${activeTab === item.name ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.name)}
                    >
                        <span style={{ marginLeft: '10px' }}>{item.name}</span>
                    </div>
                ))}

                <div className="profile-menu-item delete-account" onClick={async () => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        const success = await deleteAccount();
                        if (success) {
                            window.location.href = '/login';
                        } else {
                            alert('Failed to delete account');
                        }
                    }
                }}>
                    <span style={{ marginLeft: '10px' }}>Delete Account</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="profile-content">
                {activeTab === 'My Profile' ? (
                    <>
                        <div className="section-header">
                            <h3>My Profile</h3>
                        </div>

                        <div className="profile-card">
                            <div className="profile-avatar-container" onClick={handlePhotoClick} title="Change Photo">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="profile-avatar-img" />
                                ) : (
                                    <div className="profile-avatar">
                                        {getInitials(user?.name)}
                                    </div>
                                )}
                                <div className="avatar-overlay">
                                    <Camera size={20} color="white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>

                            <div className="profile-info">
                                <h4>{formData.name || 'User'}</h4>
                                <p className="profile-role">Programmer</p>
                                <span className="profile-location">{formData.location || 'No location set'}</span>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="section-header">
                            <h3>Personal Information</h3>
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="edit-btn save" onClick={() => handleSave('personal')}>
                                        <Check size={16} /> Save
                                    </button>
                                    <button className="edit-btn cancel" onClick={() => handleCancel('personal')}>
                                        <X size={16} /> Cancel
                                    </button>
                                </div>
                            ) : (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} /> Edit
                                </button>
                            )}
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        className="profile-input"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <div className="value">{formData.name}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Email address</label>
                                <div className="value">{user?.email}</div> {/* Email usually readonly */}
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="phone"
                                        className="profile-input"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+1 234..."
                                    />
                                ) : (
                                    <div className="value">{formData.phone || '-'}</div>
                                )}
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Bio</label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        className="profile-input bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <div className="value">{formData.bio || '-'}</div>
                                )}
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="section-header">
                            <h3>Address</h3>
                            {isEditingAddress ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="edit-btn save" onClick={() => handleSave('address')}>
                                        <Check size={16} /> Save
                                    </button>
                                    <button className="edit-btn cancel" onClick={() => handleCancel('address')}>
                                        <X size={16} /> Cancel
                                    </button>
                                </div>
                            ) : (
                                <button className="edit-btn" onClick={() => setIsEditingAddress(true)}>
                                    <Edit2 size={16} /> Edit
                                </button>
                            )}
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Location</label>
                                {isEditingAddress ? (
                                    <input
                                        type="text"
                                        name="location"
                                        className="profile-input"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="City, Country"
                                    />
                                ) : (
                                    <div className="value">{formData.location || '-'}</div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                        <h3>{activeTab} settings coming soon</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
