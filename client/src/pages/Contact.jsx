import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import { vName, vEmail } from '../utils/validators.js';
import { eventConfig } from '../config/eventConfig.js';

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user.fullName, email: user.email, message: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const errs = { name: vName(form.name), email: vEmail(form.email), message: form.message.trim().length >= 10 ? '' : 'Message must be at least 10 characters' };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    try {
      const res = await api.post('/contact', form);
      setSuccess(res.data.message);
      setForm({ ...form, message: '' });
    } catch (err) { setError(getErrorMessage(err)); if (err.response?.data?.errors) setErrors(err.response.data.errors); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="page-title">Contact us</h1>
      <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted"><Mail className="h-4 w-4" />{eventConfig.contactEmail}</p>
      <form onSubmit={onSubmit} noValidate className="card mt-6 space-y-4">
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
        <Field label="Name" htmlFor="name" error={errors.name}>
          <input id="name" className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Message" htmlFor="message" error={errors.message}>
          <textarea id="message" rows={5} className={`input ${errors.message ? 'input-error' : ''}`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Send message</button>
      </form>
    </div>
  );
}
