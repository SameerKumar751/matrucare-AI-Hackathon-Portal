import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import Spinner from '../components/Spinner.jsx';
import { colleges, courses, branches, years, domains, teamSizes } from '../config/options.js';
import { vName, vEmail, vMobile, vRequired, vProject, vPpt, vPrototype, vDemo } from '../utils/validators.js';

const emptyMember = () => ({ name: '', email: '' });
const initial = (user) => ({
  fullName: user.fullName, email: user.email, mobileNumber: '', collegeName: '', course: '', branch: '', yearOfStudy: '',
  domain: '', projectName: '', pptLink: '', prototypeLink: '', demoVideoLink: '', teamSize: 1, teamMembers: [],
});

// Field-level validators (key -> fn)
const rules = {
  fullName: vName, mobileNumber: vMobile, collegeName: vRequired('your college'), course: vRequired('a course'),
  branch: vRequired('a branch'), yearOfStudy: vRequired('a year'), domain: vRequired('a domain'),
  projectName: vProject, pptLink: vPpt, prototypeLink: vPrototype, demoVideoLink: vDemo,
};

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState(() => initial(user));
  const [errors, setErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState([]);
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { message, emailSent }

  // Already registered? Go to dashboard (duplicate registration is also blocked server-side)
  useEffect(() => {
    api.get('/hackathon/my-entry').then((r) => { if (r.data.data.registration) navigate('/dashboard', { replace: true }); }).catch(() => {}).finally(() => setChecking(false));
  }, [navigate]);

  const set = (name, value) => { setForm((f) => ({ ...f, [name]: value })); setErrors((e) => ({ ...e, [name]: '' })); };
  const onChange = (e) => set(e.target.name, e.target.value);

  // Team size N => N-1 member forms; keep already typed members when resizing
  const onTeamSize = (e) => {
    const size = Number(e.target.value);
    setForm((f) => ({ ...f, teamSize: size, teamMembers: Array.from({ length: size - 1 }, (_, i) => f.teamMembers[i] || emptyMember()) }));
    setMemberErrors([]);
  };
  const setMember = (i, key, value) => {
    setForm((f) => ({ ...f, teamMembers: f.teamMembers.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)) }));
    setMemberErrors((me) => me.map((x, idx) => (idx === i ? { ...x, [key]: '' } : x)));
  };

  const validate = () => {
    const errs = {};
    Object.entries(rules).forEach(([k, fn]) => { const m = fn(form[k]); if (m) errs[k] = m; });
    const seen = new Set([form.email.toLowerCase()]);
    const mErrs = form.teamMembers.map((m) => {
      const e = {};
      const n = vName(m.name); if (n) e.name = n;
      const em = vEmail(m.email);
      if (em) e.email = em;
      else { const k = m.email.trim().toLowerCase(); if (seen.has(k)) e.email = 'Duplicate email in team'; seen.add(k); }
      return e;
    });
    setErrors(errs); setMemberErrors(mErrs);
    return Object.keys(errs).length === 0 && mErrs.every((e) => Object.keys(e).length === 0);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) { setApiError('Please fix the highlighted fields.'); return; }
    setBusy(true);
    try {
      const res = await api.post('/hackathon/register', form);
      setDone({ message: res.data.message, emailSent: res.data.data.emailSent });
      window.scrollTo(0, 0);
    } catch (err) {
      setApiError(getErrorMessage(err));
      const se = err.response?.data?.errors;
      if (se) { setErrors(se); if (Array.isArray(se.teamMembers)) setMemberErrors(se.teamMembers); }
    } finally { setBusy(false); }
  };

  if (checking) return <Spinner full />;

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
        <h1 className="mt-4 text-3xl font-bold">You are registered</h1>
        <div className="mt-4 text-left"><Alert type={done.emailSent ? 'success' : 'error'}>{done.message}</Alert></div>
        <Link to="/dashboard" className="btn-primary mt-6">View my dashboard</Link>
      </div>
    );
  }

  const sel = (name, label, list, extra = {}) => (
    <Field label={label} htmlFor={name} error={errors[name]}>
      <select id={name} name={name} className={`input ${errors[name] ? 'input-error' : ''}`} value={form[name]} onChange={onChange} {...extra}>
        <option value="">Select</option>
        {list.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
  const txt = (name, label, props = {}) => (
    <Field label={label} htmlFor={name} error={errors[name]} hint={props.hint}>
      <input id={name} name={name} className={`input ${errors[name] ? 'input-error' : ''}`} value={form[name]} onChange={onChange} {...props} hint={undefined} />
    </Field>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="page-title">Hackathon registration</h1>
      <p className="mt-1 text-sm text-muted">You are the team leader. All fields are required unless marked optional.</p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-8">
        <Alert>{apiError}</Alert>

        <section className="card grid gap-4 sm:grid-cols-2" aria-label="Participant">
          <h2 className="text-lg font-bold sm:col-span-2">Participant details</h2>
          {txt('fullName', 'Full name', { autoComplete: 'name' })}
          <Field label="Email address" htmlFor="email" hint="Taken from your account"><input id="email" className="input" value={form.email} readOnly disabled /></Field>
          {txt('mobileNumber', 'Mobile number', { inputMode: 'numeric', maxLength: 10, placeholder: '10-digit number' })}
          {sel('collegeName', 'College name', colleges)}
          {sel('course', 'Course', courses)}
          {sel('branch', 'Branch', branches)}
          {sel('yearOfStudy', 'Year of study', years)}
        </section>

        <section className="card grid gap-4 sm:grid-cols-2" aria-label="Project">
          <h2 className="text-lg font-bold sm:col-span-2">Project details</h2>
          {sel('domain', 'Domain / track', domains)}
          {txt('projectName', 'Project name')}
          {txt('pptLink', 'PPT link', { type: 'url', placeholder: 'Google Drive / OneDrive link', hint: 'Make sure the link is shareable' })}
          {txt('prototypeLink', 'Prototype link', { type: 'url', placeholder: 'GitHub / Figma / live demo' })}
          {txt('demoVideoLink', 'Demo video link (optional)', { type: 'url', placeholder: 'YouTube / Drive link' })}
        </section>

        <section className="card space-y-4" aria-label="Team">
          <h2 className="text-lg font-bold">Team</h2>
          <div className="max-w-xs">
            <Field label="Team size (including you)" htmlFor="teamSize" error={errors.teamSize}>
              <select id="teamSize" className="input" value={form.teamSize} onChange={onTeamSize}>
                {teamSizes.map((n) => <option key={n} value={n}>{n === 1 ? '1 (solo)' : n}</option>)}
              </select>
            </Field>
          </div>
          {typeof errors.teamMembers === 'string' && <Alert>{errors.teamMembers}</Alert>}
          {form.teamMembers.map((m, i) => (
            <fieldset key={i} className="grid gap-4 rounded-lg border border-white/10 p-4 sm:grid-cols-2">
              <legend className="px-1 text-sm font-semibold">Member {i + 1}</legend>
              <Field label="Member name" htmlFor={`mn${i}`} error={memberErrors[i]?.name}>
                <input id={`mn${i}`} className={`input ${memberErrors[i]?.name ? 'input-error' : ''}`} value={m.name} onChange={(e) => setMember(i, 'name', e.target.value)} />
              </Field>
              <Field label="Member email" htmlFor={`me${i}`} error={memberErrors[i]?.email}>
                <input id={`me${i}`} type="email" className={`input ${memberErrors[i]?.email ? 'input-error' : ''}`} value={m.email} onChange={(e) => setMember(i, 'email', e.target.value)} />
              </Field>
            </fieldset>
          ))}
        </section>

        <button className="btn-primary w-full sm:w-auto" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Submitting' : 'Submit registration'}</button>
      </form>
    </div>
  );
}
