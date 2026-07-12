import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../services/employeeService';
import './Profile.css';

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', department: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data.user);
        setFormData({
          full_name: data.user.full_name || '',
          phone: data.user.phone || '',
          department: data.user.department || '',
        });
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMsg('');
    setSaveError('');
    try {
      const data = await updateProfile(formData);
      setProfile(data.user);
      setSaveMsg('Profile updated successfully');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPwError('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setPwError('New password must be at least 8 characters');
      return;
    }

    setPwLoading(true);
    try {
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPwMsg('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-loading" style={{ height: '60vh' }}>
        <div className="dash-spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View and update your profile information.</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Profile Info Card */}
        <div className="profile-card profile-info-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {(profile?.full_name || authUser?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{profile?.full_name || authUser?.full_name}</h2>
            <span className="profile-role-badge">{profile?.role || authUser?.role || 'Employee'}</span>
          </div>

          {saveMsg && <div className="book-success">{saveMsg}</div>}
          {saveError && <div className="book-error">{saveError}</div>}

          <form onSubmit={handleSaveProfile}>
            <div className="profile-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profile?.email || ''} disabled className="input-disabled" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  placeholder="IT Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="profile-actions">
              {editing ? (
                <>
                  <button type="button" className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saveLoading}>
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="profile-card">
          <h2 className="profile-card-title">Change Password</h2>

          {pwMsg && <div className="book-success">{pwMsg}</div>}
          {pwError && <div className="book-error">{pwError}</div>}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              />
            </div>
            <div className="profile-actions">
              <button type="submit" className="btn-primary btn-change-pw" disabled={pwLoading}>
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

