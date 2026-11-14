import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(state?.justSent ? 'A 6-digit code was sent to your email. It expires in 10 minutes.' : '');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(state?.justSent ? 60 : 0);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!email) return <Navigate to="/signup" replace />;

  const onVerify = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!/^\d{6}$/.test(otp)) return setError('Enter the 6-digit code');
    setBusy(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      navigate('/login', { state: { verified: true, email } });
    } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  };

  const onResend = async () => {
    setError(''); setInfo('');
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setInfo(res.data.message); setCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.response?.data?.retryAfter) setCooldown(err.response.data.retryAfter);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="page-title">Verify your email</h1>
      <p className="mt-1 text-sm text-muted">Enter the code sent to <b>{email}</b>.</p>
      <form onSubmit={onVerify} noValidate className="card mt-6 space-y-4">
        <Alert>{error}</Alert>
        <Alert type="success">{info}</Alert>
        <Field label="6-digit code" htmlFor="otp">
          <input id="otp" className="input text-center text-2xl tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
        </Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Verify email</button>
        <button type="button" onClick={onResend} disabled={cooldown > 0} className="btn-outline w-full">{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}</button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/signup" className="font-semibold text-neon">Use a different email</Link></p>
    </div>
  );
}
