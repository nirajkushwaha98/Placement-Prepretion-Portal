import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/services';
import Badge from '../../components/Badge';
import {
  Shield, User, Mail, Phone, Building, Briefcase,
  Lock, Save, KeyRound, Eye, EyeOff, CheckCircle2,
  AlertTriangle, ArrowRight, Calendar, Hash
} from 'lucide-react';

const AdminProfile = () => {
  const { user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.admin_profile?.department || 'Placement Cell',
        designation: user.admin_profile?.designation || 'Placement Officer',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (profileErr) setProfileErr('');
    if (profileMsg) setProfileMsg('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordErr) setPasswordErr('');
    if (passwordMsg) setPasswordMsg('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    setProfileErr('');

    try {
      const res = await authService.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
      });

      if (refreshProfile) {
        await refreshProfile();
      }

      setProfileMsg(res.data?.message || 'Admin profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.response?.data?.email?.[0] ||
        'Failed to update profile. Please try again.';
      setProfileErr(errMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (!passwordData.current_password) {
      setPasswordErr('Please enter your current password.');
      return;
    }

    if (!passwordData.new_password || passwordData.new_password.length < 6) {
      setPasswordErr('New password must be at least 6 characters.');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordErr('New password and confirmation password do not match.');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await authService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordMsg(res.data?.message || 'Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setPasswordMsg(''), 5000);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.current_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        'Failed to change password. Please check your credentials.';
      setPasswordErr(errMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  const adminDisplayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.name || user?.username || 'Administrator';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-purple-400" />
            Admin Profile & Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your administrative credentials, departmental details, email login ID, and system password.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer w-fit"
        >
          <span>Admin Dashboard</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Admin Identity Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-purple-600/30 border border-purple-400/30">
              {(user?.first_name?.[0] || user?.username?.[0] || 'A').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {adminDisplayName}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-[10px] uppercase tracking-wider">
                  Administrator
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-purple-400" />
              <span>Admin ID: <strong className="text-white font-mono">#{user?.id || 1}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Member Since: <strong className="text-slate-300">{memberSince}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Information */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" />
                Profile & Contact Details
              </h3>
              <Badge variant="purple" size="xs">Identity</Badge>
            </div>

            {profileMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            {profileErr && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{profileErr}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleProfileChange}
                    placeholder="Admin first name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleProfileChange}
                    placeholder="Admin last name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Login Email Address</span>
                  <span className="text-[10px] text-purple-400 font-normal">Used for admin sign in</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleProfileChange}
                    placeholder="admin@placement.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    disabled
                    value="System Administrator (All Permissions)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleProfileChange}
                      placeholder="Placement Cell"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleProfileChange}
                      placeholder="Placement Officer"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Change Password */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-purple-400" />
                Change Password
              </h3>
              <Badge variant="purple" size="xs">Security</Badge>
            </div>

            {passwordMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {passwordErr && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{passwordErr}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    name="current_password"
                    required
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter existing password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    name="new_password"
                    required
                    minLength={6}
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new strong password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    name="confirm_password"
                    required
                    minLength={6}
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {changingPassword ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-[11px] text-purple-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-purple-400" />
                Password Security Best Practices:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-purple-300/80">
                <li>Must contain minimum 6 characters.</li>
                <li>Use a mix of uppercase, lowercase, numbers & symbols.</li>
                <li>Do not share admin credentials with unassigned staff.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
