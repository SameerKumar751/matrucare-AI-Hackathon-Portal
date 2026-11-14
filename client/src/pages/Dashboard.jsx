import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MailCheck, MailWarning } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';

const Item = ({ label, children }) => (<div><dt className="text-xs text-muted">{label}</dt><dd className="mt-0.5 break-words text-sm font-medium">{children}</dd></div>);
const ExtLink = ({ href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-neon underline">{href}</a>;

export default function Dashboard() {
  const { user } = useAuth();
  const [reg, setReg] = useState(undefined); // undefined = loading, null = not registered
  const [error, setError] = useState('');
  const [retryMsg, setRetryMsg] = useState({ type: '', text: '' });
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    api.get('/hackathon/my-entry').then((r) => setReg(r.data.data.registration)).catch((e) => { setError(getErrorMessage(e)); setReg(null); });
  }, []);

  // Retry a failed confirmation email (never creates a new registration)
  const retryConfirmation = async () => {
    setRetrying(true); setRetryMsg({ type: '', text: '' });
    try {
      const res = await api.post(`/hackathon/${reg._id}/resend-confirmation`);
      setReg(res.data.data.registration);
      setRetryMsg({ type: 'success', text: res.data.message });
    } catch (e) { setRetryMsg({ type: 'error', text: getErrorMessage(e) }); } finally { setRetrying(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="page-title">Welcome, {user.fullName}</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <section className="card md:col-span-1" aria-label="Profile">
          <h2 className="text-lg font-bold">Your profile</h2>
          <dl className="mt-4 space-y-3">
            <Item label="Name">{user.fullName}</Item>
            <Item label="Email">{user.email}</Item>
            <Item label="Account"><span className="inline-flex items-center gap-1 text-emerald-400"><BadgeCheck className="h-4 w-4" />{user.isVerified ? 'Verified' : 'Not verified'}</span></Item>
          </dl>
        </section>

        <section className="card md:col-span-2" aria-label="Hackathon registration">
          <h2 className="text-lg font-bold">Hackathon registration</h2>
          <Alert>{error}</Alert>
          {reg === undefined && <Spinner />}
          {reg === null && !error && (
            <div className="mt-4">
              <p className="text-sm text-muted">You have not registered for the hackathon yet.</p>
              <Link to="/register" className="btn-primary mt-4">Register now</Link>
            </div>
          )}
          {reg && (
            <div className="mt-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-neon/15 text-neon px-3 py-1 text-sm font-semibold"><BadgeCheck className="h-4 w-4" />Registered</p>
              <p className={`mt-3 inline-flex items-center gap-2 text-sm ${reg.confirmationEmailStatus === 'sent' ? 'text-emerald-400' : 'text-red-400'}`}>
                {reg.confirmationEmailStatus === 'sent' ? <MailCheck className="h-4 w-4" /> : <MailWarning className="h-4 w-4" />}
                {reg.confirmationEmailStatus === 'sent' ? 'Confirmation email sent' : 'Confirmation email could not be sent'}
              </p>
              {reg.confirmationEmailStatus !== 'sent' && (
                <div className="mt-3 space-y-3">
                  <button type="button" onClick={retryConfirmation} disabled={retrying} className="btn-outline">{retrying ? 'Sending' : 'Resend confirmation email'}</button>
                  <Alert type={retryMsg.type || 'error'}>{retryMsg.text}</Alert>
                </div>
              )}
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Item label="Project">{reg.projectName}</Item>
                <Item label="Domain / track">{reg.domain}</Item>
                <Item label="College">{reg.collegeName}</Item>
                <Item label="Course">{reg.course} - {reg.branch}, {reg.yearOfStudy}</Item>
                <Item label="Mobile">{reg.mobileNumber}</Item>
                <Item label="Team size">{reg.teamSize}{reg.teamSize === 1 ? ' (solo)' : ''}</Item>
                <Item label="PPT"><ExtLink href={reg.pptLink} /></Item>
                <Item label="Prototype"><ExtLink href={reg.prototypeLink} /></Item>
                {reg.demoVideoLink && <Item label="Demo video"><ExtLink href={reg.demoVideoLink} /></Item>}
              </dl>
              <h3 className="mt-6 text-base font-bold">Team</h3>
              <ul className="mt-2 divide-y divide-white/10 text-sm">
                <li className="py-2">{reg.fullName} ({reg.email}) <span className="text-muted">- team leader</span></li>
                {reg.teamMembers.map((m) => <li key={m.email} className="py-2">{m.name} ({m.email})</li>)}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
