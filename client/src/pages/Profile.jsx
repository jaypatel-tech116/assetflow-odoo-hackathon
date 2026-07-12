import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { getMyProfile, updateMyProfile, changePassword as changePasswordApi } from '../services/apiService';
import './Profile.css';

function Skeleton({ h = 16, w = '100%', style = {} }) {
  return <div style={{ height: h, width: w, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const [form, setForm] = useState({
    full_name: '', phone: '', alternate_phone: '', date_of_birth: '', gender: '', address: '', designation: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.user);
        setForm({
          full_name: res.user.full_name || '',
          phone: res.user.phone || '',
          alternate_phone: res.user.alternate_phone || '',
          date_of_birth: res.user.date_of_birth || '',
          gender: res.user.gender || '',
          address: res.user.address || '',
          designation: res.user.designation || '',
        });
        // Also update localStorage
        localStorage.setItem('assetflow_user', JSON.stringify(res.user));
      } catch (err) { console.error(err.message); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      const res = await updateMyProfile(form);
      setProfile(res.user);
      localStorage.setItem('assetflow_user', JSON.stringify(res.user));
      setSaveMsg('✅ Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) { setSaveErr(err.message); }
    finally { setSaving(false); }
  };

  const handlePassChange = async () => {
    setChangingPass(true); setPassMsg(''); setPassErr('');
    try {
      await changePasswordApi(passwords);
      setPassMsg('✅ Password changed successfully!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPassMsg(''), 3000);
    } catch (err) { setPassErr(err.message); }
    finally { setChangingPass(false); }
  };

  const displayName = profile?.full_name || 'User';
  const displayEmail = profile?.email || '—';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const profileDetails = [
    { icon: '🪪', label: 'Employee ID', value: `EMP-${String(profile?.id || 0).padStart(5,'0')}` },
    { icon: '📅', label: 'Date of Joining', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—' },
    { icon: '👤', label: 'Role', value: profile?.role || '—' },
    { icon: '🏢', label: 'Department', value: profile?.department?.name || 'Not assigned' },
    { icon: '📍', label: 'Location', value: 'Main Office' },
    { icon: '🧑‍💼', label: 'Designation', value: profile?.designation || '—' },
  ];

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <Topbar title="My Profile" subtitle="View and update your profile information and account settings." searchPlaceholder="Search anything..." />
      <div className="page-content">
        <div className="profile-page">

          {/* Profile Header */}
          <div className="profile-header-card">
            <div className="profile-header-left">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">{initials}</div>
                <div className="profile-avatar-edit">📷</div>
              </div>
              <div className="profile-basic-info">
                {loading ? <Skeleton h={22} w={160} style={{marginBottom:8}} /> : <h2>{displayName}</h2>}
                <div className="profile-role">{profile?.role || '—'}</div>
                <div className="profile-contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>
                  {displayEmail}
                </div>
                {profile?.phone && (
                  <div className="profile-contact-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    {profile.phone}
                  </div>
                )}
                <div className="profile-contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {profile?.department?.name || 'Not assigned'} Department
                </div>
              </div>
            </div>
            <div className="profile-header-right">
              {profileDetails.map((d, i) => (
                <div className="profile-detail-item" key={i}>
                  <div className="profile-detail-label"><span style={{fontSize:13}}>{d.icon}</span>{d.label}</div>
                  <div className="profile-detail-value">{loading ? <Skeleton h={13} w={100} /> : d.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Layout */}
          <div className="profile-layout">
            <div className="profile-left">
              <div className="profile-form-card">
                <div className="profile-form-header">
                  <h3>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Personal Information
                  </h3>
                  <button className="btn-edit-profile">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Profile
                  </button>
                </div>
                <div className="profile-form-body">
                  {saveMsg && <div style={{padding:'10px 12px',background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,color:'#16a34a',fontSize:'12.5px',marginBottom:16}}>{saveMsg}</div>}
                  {saveErr && <div style={{padding:'10px 12px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,color:'#dc2626',fontSize:'12.5px',marginBottom:16}}>{saveErr}</div>}

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={form.full_name} onChange={e => setForm(f=>({...f,full_name:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" type="email" value={displayEmail} disabled style={{background:'#f9fafb',color:'#9ca3af'}} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Alternate Phone</label>
                      <input className="form-input" value={form.alternate_phone} onChange={e => setForm(f=>({...f,alternate_phone:e.target.value}))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input className="form-input" value={profile?.department?.name || 'Not assigned'} disabled style={{background:'#f9fafb',color:'#9ca3af'}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input className="form-input" value={form.designation} onChange={e => setForm(f=>({...f,designation:e.target.value}))} placeholder="Your designation" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input className="form-date form-input" type="date" value={form.date_of_birth} onChange={e => setForm(f=>({...f,date_of_birth:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={form.gender} onChange={e => setForm(f=>({...f,gender:e.target.value}))}>
                        <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full">
                      <label className="form-label">Address</label>
                      <input className="form-input" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="Your address" />
                    </div>
                  </div>
                  <button className="btn-save-changes" onClick={handleSave} disabled={saving}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-right">
              {/* Change Password */}
              <div className="profile-security-card">
                <div className="profile-form-header">
                  <h3>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    Change Password
                  </h3>
                </div>
                <div className="security-form">
                  {passMsg && <div style={{padding:'8px 12px',background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,color:'#16a34a',fontSize:'12.5px'}}>{passMsg}</div>}
                  {passErr && <div style={{padding:'8px 12px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,color:'#dc2626',fontSize:'12.5px'}}>{passErr}</div>}
                  {[
                    { label: 'Current Password', field: 'current_password', key: 'current' },
                    { label: 'New Password', field: 'new_password', key: 'new' },
                    { label: 'Confirm New Password', field: 'confirm_password', key: 'confirm' },
                  ].map(p => (
                    <div className="password-group" key={p.key}>
                      <label className="form-label">{p.label}</label>
                      <div className="password-input-wrap">
                        <input className="form-input" type={showPass[p.key] ? 'text' : 'password'}
                          placeholder={`Enter ${p.label.toLowerCase()}`}
                          value={passwords[p.field]}
                          onChange={e => setPasswords(pw => ({ ...pw, [p.field]: e.target.value }))} />
                        <span className="password-eye" onClick={() => setShowPass(s => ({ ...s, [p.key]: !s[p.key] }))}>
                          {showPass[p.key] ? '🙈' : '👁️'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button className="btn-update-password" onClick={handlePassChange} disabled={changingPass}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    {changingPass ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* Secure Banner */}
              <div className="secure-banner">
                <div className="secure-banner-icon">🛡️</div>
                <div className="secure-banner-text">
                  <h4>Secure Your Account</h4>
                  <p>Keep your password confidential and change it regularly for better security.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
