import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Bell, Building2, CalendarDays, Check, CircleCheck as CheckCircle2, CircleAlert, ClipboardCheck, FileText, ChartBar as FileBarChart, Flag, FolderKanban, History, LayoutDashboard, Link2, LogOut, Menu, Paperclip, Search, TestTube as TestTube2, UserRound, Users, Wrench, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
  { label: 'Issues', icon: CircleAlert, active: true },
  // { label: 'Checklist Stats', icon: ClipboardCheck },
  { label: 'Company Checklists', icon: FolderKanban },
  // { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function NewIssue({ onBackToIssues, onSignOut }: { onBackToIssues: () => void; onSignOut: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('NCR');
  const [priority, setPriority] = useState('Medium');
  const [equipment, setEquipment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [checklist, setChecklist] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? [], (file) => file.name));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !equipment.trim() || !dueDate) {
      setShowErrors(true);
      setSubmitted(false);
      return;
    }
    setShowErrors(false);
    setSubmitted(true);
  }

  return (
    <div className="new-issue-screen">
      <div className="new-issue-background" aria-hidden="true">
        <aside className="new-issue-sidebar">
          <div className="new-issue-ghost-brand"><span className="new-issue-ghost-mark" /> SiteSphere</div>
          <small>MAIN NAVIGATION</small>
          {navItems.map(({ label, icon: Icon, active }) => <div className={`new-issue-ghost-nav ${active ? 'active' : ''}`} key={label}><Icon size={15} /> {label}</div>)}
        </aside>
        <div className="new-issue-ghost-main">
          <header className="new-issue-ghost-topbar"><strong><Building2 size={14} /> Data Center Alpha</strong><div><Search size={14} /> Search site data, assets, issues...</div><span>Alex Construction</span></header>
          <div className="new-issue-ghost-content"><div className="ghost-heading"><span /><i /><i /></div><div className="ghost-cards"><i /><i /><i /><i /></div><div className="ghost-table"><i /><i /><i /><i /><i /></div></div>
        </div>
      </div>
      <div className="new-issue-backdrop" />

      <aside className="new-issue-mobile-sidebar" aria-hidden="true"><Menu size={18} /></aside>
      <section className="new-issue-dialog" role="dialog" aria-modal="true" aria-labelledby="new-issue-title">
        <header className="new-issue-dialog-header">
          <div className="new-issue-title-group"><span className="new-issue-title-icon"><CircleAlert size={16} /></span><h1 id="new-issue-title">Report New Issue</h1></div>
          <button className="new-issue-close" type="button" onClick={onBackToIssues} aria-label="Close report issue form"><X size={18} /></button>
        </header>

        <form className="new-issue-form" onSubmit={handleSubmit} noValidate>
          <div className="new-issue-fields">
            <label className="new-issue-field new-issue-full"><span>ISSUE TITLE</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="E.g. Electrical panel wiring loose..." /></label>

            <fieldset className="new-issue-fieldset"><legend>CATEGORY</legend><div className="new-issue-segmented">{['NCR', 'Punch List', 'Safety'].map((item) => <button type="button" className={category === item ? 'selected' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></fieldset>
            <fieldset className="new-issue-fieldset"><legend>PRIORITY</legend><div className="new-issue-segmented">{['Low', 'Medium', 'High', 'Critical'].map((item) => <button type="button" className={priority === item ? 'selected' : ''} key={item} onClick={() => setPriority(item)}>{item === 'Medium' ? 'Med' : item === 'Critical' ? 'Crit' : item}</button>)}</div></fieldset>

            <label className={`new-issue-field ${showErrors && !equipment.trim() ? 'invalid' : ''}`}><span>LINKED EQUIPMENT <b>*</b></span><div className="new-issue-input-icon"><Building2 size={14} /><input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="Search equipment ID..." /></div></label>
            <label className={`new-issue-field ${showErrors && !dueDate ? 'invalid' : ''}`}><span>DUE DATE <b>*</b></span><div className="new-issue-input-icon"><CalendarDays size={14} /><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div></label>

            <label className="new-issue-field"><span>ASSIGNEE (PERSON OR COMPANY)</span><div className="new-issue-input-icon"><UserRound size={14} /><input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Select person or contractor..." /></div></label>
            <label className="new-issue-field"><span>LINKED CHECKLIST (OPTIONAL)</span><div className="new-issue-input-icon"><ClipboardCheck size={14} /><input value={checklist} onChange={(event) => setChecklist(event.target.value)} placeholder="Select existing checklist..." /></div></label>

            <label className="new-issue-field new-issue-full"><span>DESCRIPTION</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Provide full details about the issue, observed failure, and potential impact..." rows={4} /></label>

            <div className="new-issue-attachment new-issue-full"><span>ATTACHMENTS</span><label className="new-issue-dropzone"><input type="file" multiple accept="image/*,.pdf,.cad,.dwg" onChange={handleFiles} /><Paperclip size={19} /><strong>Drag and drop files or <em>click to browse</em></strong><small>Images, PDF, or CAD files (Max 20MB)</small></label>{files.length > 0 && <div className="new-issue-files">{files.map((file) => <span key={file}><Paperclip size={11} /> {file}</span>)}</div>}</div>
          </div>
          {showErrors && <p className="new-issue-error"><CircleAlert size={13} /> Add an issue title, linked equipment, and due date before submitting.</p>}
          {submitted && <p className="new-issue-success"><CheckCircle2 size={13} /> Issue report submitted successfully.</p>}
          <footer className="new-issue-dialog-footer"><div className="new-issue-reporter"><span className="new-issue-reporter-avatar">AC</span><strong>Reporter: Alex Construction <small>(Project Manager)</small></strong></div><div className="new-issue-actions"><button type="button" className="new-issue-cancel" onClick={onBackToIssues}>Cancel</button><button type="submit" className="new-issue-submit">{submitted ? <><Check size={14} /> Submitted</> : <>Submit Report <Link2 size={13} /></>}</button></div></footer>
        </form>
      </section>
      <button className="new-issue-signout" type="button" onClick={onSignOut} aria-label="Sign out"><LogOut size={14} /></button>
    </div>
  );
}

export default NewIssue;
