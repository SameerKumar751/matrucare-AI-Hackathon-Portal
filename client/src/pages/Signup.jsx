import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import { vName, vEmail, vPassword } from '../utils/validators.js';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = {
      fullName: vName(form.fullName), email: vEmail(form.email), password: vPassword(form.password),
      confirmPassword: form.password === form.confirmPassword ? '' : 'Passwords do not match',
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    try {
      await api.post('/auth/signup', form);
      navigate('/verify-otp', { state: { email: form.email.trim().toLowerCase(), justSent: true } });
    } catch (err) {
      setApiError(getErrorMessage(err));
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="page-title">Create your account</h1>
      <p className="mt-1 text-sm text-muted">We will email a 6-digit code to verify your address.</p>
      <form onSubmit={onSubmit} noValidate className="card mt-6 space-y-4">
        <Alert>{apiError}</Alert>
        <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
          <input id="fullName" name="fullName" className={`input ${errors.fullName ? 'input-error' : ''}`} value={form.fullName} onChange={onChange} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" name="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={onChange} autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters with uppercase, lowercase and a number">
          <input id="password" name="password" type="password" className={`input ${errors.password ? 'input-error' : ''}`} value={form.password} onChange={onChange} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type="password" className={`input ${errors.confirmPassword ? 'input-error' : ''}`} value={form.confirmPassword} onChange={onChange} autoComplete="new-password" />
        </Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Creating account' : 'Create account'}</button>
      </form>
      <p className="mt-4 text-center text-sm">Already have an account? <Link to="/login" className="font-semibold text-neon">Login</Link></p>
    </div>
  );
}
