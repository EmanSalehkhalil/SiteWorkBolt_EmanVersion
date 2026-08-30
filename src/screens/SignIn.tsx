import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';

type Notice = 'idle' | 'success' | 'error';

const benefits = [
  { icon: ShieldCheck, label: 'Enterprise Security' },
  { icon: Check, label: 'Precision Tracking' },
  { icon: Building2, label: 'Scalable Solutions' },
  { icon: Building2, label: 'Site Optimized' },
];

function SignIn({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState('alex.manager@sitesphere.com');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<Notice>('idle');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setNotice('error');
      return;
    }
    onSignIn();
  }

  return (
    <main className="auth-shell">
      <section className="brand-panel" aria-label="SiteSphere overview">
        <img className="brand-photo" src="https://images.pexels.com/photos/17770160/pexels-photo-17770160.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="" aria-hidden="true" />
        <div className="blueprint-grid" />
        <div className="tower tower-one" />
        <div className="tower tower-two" />
        <div className="sun-glow" />
        <div className="brand-content">
          <div className="brand-lockup">
            <span className="brand-mark"><span /></span>
            <span>SiteSphere</span>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Construction intelligence platform</p>
            <h1>Professional<br />Commissioning &amp;<br />Construction Tracking.</h1>
            <p className="hero-description">
              Empowering construction teams with real-time insights, interactive checklists,
              and robust issue management for successful project delivery.
            </p>
          </div>
          <div className="benefits-grid">
            {benefits.map(({ icon: Icon, label }) => (
              <div className="benefit" key={label}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="trusted">Trusted by leading global construction and engineering firms since 2018.</p>
        </div>
      </section>

      <section className="form-panel" aria-labelledby="welcome-heading">
        <div className="form-inner">
          <div className="mobile-brand brand-lockup">
            <span className="brand-mark"><span /></span>
            <span>SiteSphere</span>
          </div>
          <div className="welcome-copy">
            <h2 id="welcome-heading">Welcome Back</h2>
            <p>Please enter your enterprise credentials to access your projects.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="email">Corporate Email Address</label>
              <div className="input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setNotice('idle'); }}
                  autoComplete="email"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="field-group password-group">
              <div className="label-row">
                <label htmlFor="password">Security Password</label>
                <button className="forgot-button" type="button" onClick={() => setNotice('success')}>Forgot password?</button>
              </div>
              <div className="input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setNotice('idle'); }}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <button className="visibility-button" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <label className="remember-row">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span className="custom-check"><Check size={13} /></span>
              <span>Remember this device for 30 days</span>
            </label>

            <button className="submit-button" type="submit">
              <span>{notice === 'success' ? 'Access Granted' : 'Sign In to Dashboard'}</span>
              {notice === 'success' ? <Check size={19} /> : <ArrowRight size={19} />}
            </button>
            {notice === 'error' && <p className="form-notice error-notice">Please enter both your corporate email and password.</p>}
            {notice === 'success' && <p className="form-notice success-notice">Your credentials are ready to be verified.</p>}
          </form>

          <div className="access-divider"><span>Authorized Access Only</span></div>
          <p className="account-prompt">Don&apos;t have an account? <button type="button" onClick={() => setNotice('success')}>Contact Administrator</button></p>
          <div className="security-note">
            <ShieldCheck size={17} />
            <strong>Secure Server 256-Bit AES</strong>
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.<br />Usage is monitored for security and compliance purposes.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SignIn;
