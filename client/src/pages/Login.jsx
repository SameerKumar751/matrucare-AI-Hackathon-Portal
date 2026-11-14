import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import { vEmail } from '../utils/validators.js';

export default function Login() {
  const { user, login } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: state?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setUnverifiedEmail('');
    const errs = { email: vEmail(form.email), password: form.password ? '' : 'Enter your password' };
    setErrors(errs);
    if (errs.email || errs.password) return;
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') setUnverifiedEmail(err.response.data.email);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="page-title">Welcome back</h1>
      <form onSubmit={onSubmit} noValidate className="card mt-6 space-y-4">
        {state?.verified && <Alert type="success">Email verified. Please log in.</Alert>}
        <Alert>{error}</Alert>
        {unverifiedEmail && <Link to="/verify-otp" state={{ email: unverifiedEmail }} className="block text-sm font-semibold text-neon">Verify your email now</Link>}
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <input id="password" type="password" className={`input ${errors.password ? 'input-error' : ''}`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Login</button>
      </form>
      <p className="mt-4 text-center text-sm">New here? <Link to="/signup" className="font-semibold text-neon">Create an account</Link></p>
    </div>
  );
}
