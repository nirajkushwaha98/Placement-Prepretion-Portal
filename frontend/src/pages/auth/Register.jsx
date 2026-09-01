import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Lock, Mail, User, GraduationCap, Building2, BookOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    college: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    graduation_year: 2026,
    phone: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const gradYear = formData.graduation_year ? parseInt(formData.graduation_year, 10) : null;
      await register({
        ...formData,
        graduation_year: Number.isNaN(gradYear) ? null : gradYear,
        username: formData.email.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredEmail: formData.email.trim().toLowerCase(),
            successMsg: `Account for ${formData.first_name} created successfully! Sign in below with your email & password.`,
          },
        });
      }, 1200);
    } catch (err) {
      let errorMsg = 'Registration failed. Please check your information.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.email) {
          errorMsg = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.username) {
          errorMsg = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.password) {
          errorMsg = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.non_field_errors) {
          errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const val = data[firstKey];
            errorMsg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
          }
        }
      } else if (err.message) {
        errorMsg = `Server unreachable: ${err.message}. Make sure the backend server is running.`;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/25 text-white font-black text-2xl mb-3">
            P
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Create Student Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Join the comprehensive campus placement training ecosystem
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Account created successfully! Redirecting to sign in...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Rahul"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Verma"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                College / University
              </label>
              <input
                type="text"
                required
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Apex Institute of Technology"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  required
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="B.Tech"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  required
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="CSE / IT / ECE"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  required
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  placeholder="2026"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Complete Student Registration</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
