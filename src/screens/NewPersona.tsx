import { useState } from 'react';
import { CalendarDays, ChevronDown, Mail, Phone, Plus, Upload, User, X } from 'lucide-react';
import Personas from '@/screens/Personas';

const companies = ['Skyline Infra', 'BuildSafe Co', 'Volt Systems', 'Global Haul', 'Apex Mechanical', 'Vertex Civil'];
const roles = ['Project Lead', 'Site Engineer', 'Safety Supervisor', 'Electrical Foreman', 'Logistics Mgr', 'QA Inspector', 'Commissioning Agent'];

function NewPersona({ onBackToPersonas, onBackToProject, onSignOut }: { onBackToPersonas: () => void; onBackToProject: () => void; onSignOut: () => void }) {
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [reportingTo, setReportingTo] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [avatarColor, setAvatarColor] = useState('blue');

  const colors: { id: string; bg: string }[] = [
    { id: 'blue', bg: 'linear-gradient(135deg,#288de8,#164474)' },
    { id: 'green', bg: 'linear-gradient(135deg,#32b781,#1e6550)' },
    { id: 'dark', bg: 'linear-gradient(135deg,#66727f,#26313c)' },
    { id: 'orange', bg: 'linear-gradient(135deg,#e48a44,#8f401d)' },
    { id: 'gold', bg: 'linear-gradient(135deg,#d99b2f,#68451a)' },
  ];

  const initials = fullName.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onBackToPersonas();
  }

  return (
    <div className="new-persona-screen">
      <Personas onBackToProject={onBackToProject} onSignOut={onSignOut} onOpenNewPersona={() => undefined} />

      <div className="new-persona-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onBackToPersonas(); }}>
        <section className="new-persona-dialog" role="dialog" aria-modal="true" aria-labelledby="new-persona-title">
          <div className="new-persona-dialog-heading">
            <div>
              <h2 id="new-persona-title">Add New Persona</h2>
              <p>Register a new project-affiliated individual and define their site access profile.</p>
            </div>
            <button onClick={onBackToPersonas} aria-label="Close dialog"><X size={16} /></button>
          </div>

          <div className="new-persona-avatar-section">
            <i className="new-persona-avatar" style={{ background: colors.find((c) => c.id === avatarColor)?.bg }}>{initials || <User size={26} />}</i>
            <div className="new-persona-avatar-controls">
              <label className="new-persona-upload">
                <Upload size={12} /> Upload Photo
                <input type="file" accept="image/*" hidden />
              </label>
              <div className="new-persona-color-picker">
                {colors.map((c) => <button type="button" key={c.id} className={avatarColor === c.id ? 'selected' : ''} style={{ background: c.bg }} onClick={() => setAvatarColor(c.id)} aria-label={`Color ${c.id}`} />)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="new-persona-field new-persona-full"><span>Full Name</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="e.g. Jordan Lee" required /></label>

            <div className="new-persona-field-grid">
              <label className="new-persona-field"><span>Job Title</span><span className="new-persona-select"><select value={jobTitle} onChange={(event) => setJobTitle(event.target.value)}><option value="">Select Role</option>{roles.map((role) => <option key={role}>{role}</option>)}</select><ChevronDown size={14} /></span></label>
              <label className="new-persona-field"><span>Company</span><span className="new-persona-select"><select value={company} onChange={(event) => setCompany(event.target.value)}><option value="">Select Company</option>{companies.map((comp) => <option key={comp}>{comp}</option>)}</select><ChevronDown size={14} /></span></label>
            </div>

            <div className="new-persona-field-grid">
              <label className="new-persona-field"><span>Email Address</span><span className="new-persona-input-icon"><Mail size={13} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required /></span></label>
              <label className="new-persona-field"><span>Phone Number</span><span className="new-persona-input-icon"><Phone size={13} /><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555-0100" /></span></label>
            </div>

            <div className="new-persona-field-grid">
              <label className="new-persona-field"><span>Start Date</span><span className="new-persona-date"><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /><CalendarDays size={14} /></span></label>
              <label className="new-persona-field"><span>Access Level</span><span className="new-persona-select"><select value={accessLevel} onChange={(event) => setAccessLevel(event.target.value)}><option value="">Select Access</option><option>Full Access</option><option>Restricted</option><option>View Only</option></select><ChevronDown size={14} /></span></label>
            </div>

            <div className="new-persona-field-grid">
              <label className="new-persona-field"><span>Reporting To</span><input value={reportingTo} onChange={(event) => setReportingTo(event.target.value)} placeholder="e.g. Marcus Thorne" /></label>
              <label className="new-persona-field"><span>Status</span><div className="new-persona-toggle"><button type="button" className={status === 'Active' ? 'active' : ''} onClick={() => setStatus('Active')}>Active</button><button type="button" className={status === 'Inactive' ? 'active' : ''} onClick={() => setStatus('Inactive')}>Inactive</button></div></label>
            </div>

            <label className="new-persona-field new-persona-full"><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Additional details, certifications, or site restrictions..." rows={3} /></label>

            <div className="new-persona-dialog-actions">
              <button type="button" onClick={onBackToPersonas}>Cancel</button>
              <button className="new-persona-create" type="submit"><Plus size={13} /> Add Persona</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default NewPersona;
