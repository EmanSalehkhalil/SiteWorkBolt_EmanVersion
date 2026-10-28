import { useState, type ChangeEvent } from 'react';
import { Activity, Bell, Check, ChevronDown, CircleAlert, ClipboardCheck, Clock3, FileText, ChartBar as FileBarChart, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, MessageSquare, Paperclip, Search, Settings2, TestTube as TestTube2, Upload, UserRound, Users, Wrench, X } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

type Status = 'Passed' | 'In Progress' | 'Not Started' | 'Failed' | 'Passed with Exceptions' | 'Deferred Testing Requirements';
type Test = { id: string; name: string; assignee: string; status: Status; attempts: number };

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard }, { label: 'Submittals', icon: FileText }, { label: 'Issues', icon: CircleAlert },
  // { label: 'Checklist Stats', icon: ClipboardCheck },
   { label: 'Company Checklists', icon: FolderKanban },
  // { label: 'Testing Workflow', icon: TestTube2, active: true },
   { label: 'Milestones', icon: Flag }, { label: 'Reports', icon: FileBarChart },
  { label: 'Personas', icon: Users }, { label: 'Assets & Equipment', icon: Wrench }, { label: 'Change Log', icon: History },
];
const tests: Test[] = [
  { id: 'LVS-01-01', name: 'Visual Inspection & Grounding', assignee: 'Sarah Jenkins', status: 'Passed', attempts: 1 },
  { id: 'LVS-01-02', name: 'Dielectric Strength Test', assignee: 'Sarah Jenkins', status: 'In Progress', attempts: 2 },
  { id: 'LVS-01-03', name: 'Mechanical Operation Test', assignee: 'Mike Ross', status: 'Not Started', attempts: 0 },
  { id: 'UPS-01-01', name: 'Battery Discharge Test (15min)', assignee: 'David Chen', status: 'Failed', attempts: 3 },
  { id: 'UPS-01-02', name: 'Load Bank Transfer Test', assignee: 'David Chen', status: 'Passed with Exceptions', attempts: 2 },
  { id: 'UPS-01-03', name: 'Remote Monitoring Verification', assignee: 'David Chen', status: 'Deferred Testing Requirements', attempts: 0 },
];
const statusClass: Record<Status, string> = { Passed: 'testing-passed', 'In Progress': 'testing-progress', 'Not Started': 'testing-not-started', Failed: 'testing-failed', 'Passed with Exceptions': 'testing-exceptions', 'Deferred Testing Requirements': 'testing-deferred' };

function InventoryGroup({ title, items, selectedId, onSelect }: { title: string; items: Test[]; selectedId: string; onSelect: (id: string) => void }) {
  return <div className="testing-group"><strong>{title}<ChevronDown size={13} /></strong>{items.map((item) => <button className={item.id === selectedId ? 'selected' : ''} key={item.id} onClick={() => onSelect(item.id)}><span>{item.name}<small><UserRound size={9} /> {item.assignee}</small></span><em className={statusClass[item.status]}>{item.status}</em><i>{item.attempts} ATTEMPTS</i></button>)}</div>;
}

function Testing({ onBackToProject, onNavigate, onSignOut }: { onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  const [selectedId, setSelectedId] = useState('UPS-01-01');
  const [query, setQuery] = useState('');
  const [fileName, setFileName] = useState('measurement_logs.csv');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('Awaiting Approval');
  const [reviewNote, setReviewNote] = useState('');
  const selected = tests.find((item) => item.id === selectedId) ?? tests[3];
  const filtered = tests.filter((item) => `${item.name} ${item.assignee}`.toLowerCase().includes(query.toLowerCase()));
  const groupItems = (prefix: string) => filtered.filter((item) => item.id.startsWith(prefix));

  function handleFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (file) setFileName(file.name); }

  return <div className="testing-screen">
    <aside className="testing-sidebar"><button className="testing-brand" onClick={onBackToProject}><span className="testing-mark"><span /></span><strong>SiteSphere</strong><ChevronDown size={14} /></button><div className="testing-sidebar-label">MAIN NAVIGATION</div><nav className="testing-nav">{navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={15} /><span>{label}</span></button>)}</nav><div className="testing-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={15} /> Switch Project</button><button onClick={onSignOut}><LogOut size={15} /> Sign Out</button></div></aside>
    <div className="testing-main"><header className="testing-topbar"><button className="testing-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="testing-project" onClick={onBackToProject}><FolderKanban size={13} /> Data Center Alpha</button><label className="testing-global-search"><Search size={13} /><input placeholder="Search site data..." /></label><div className="testing-user"><button aria-label="Notifications"><Bell size={16} /><i /></button><span /><div><strong>Alex Construction</strong><small>Project Manager</small></div><b>AC</b></div></header>
      <main className="testing-content"><div className="testing-heading"><div><h1>System Testing &amp; Commissioning</h1><p>Execute, log, and approve site equipment performance tests.</p></div><div className="testing-actions"><button><Clock3 size={13} /> View History</button><button className="testing-primary"><Upload size={13} /> Bulk Upload Results</button></div></div>
        <section className="testing-summary"><div><span><Check size={15} /></span><small>TOTAL TESTS PASSED</small><strong>142</strong><p>+12 since yesterday</p><i><b style={{ width: '84%' }} /></i><em>84%</em></div><div><span className="red"><X size={15} /></span><small>ACTIVE FAILURES</small><strong>08</strong><p>Requires immediate attention</p><i><b style={{ width: '12%' }} /></i><em>12%</em></div><div><span className="amber"><Clock3 size={15} /></span><small>IN PROGRESS</small><strong>24</strong><p>Currently with field engineers</p><i><b style={{ width: '45%' }} /></i><em>45%</em></div><div><span className="blue"><CircleAlert size={15} /></span><small>DEFERRED REQUIREMENTS</small><strong>05</strong><p>Waiting for site conditions</p></div></section>
        <section className="testing-workspace"><aside className="testing-inventory"><div className="testing-inventory-head"><h2>Test Inventory</h2><b>Total: 179</b></div><label className="testing-filter"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by product or test..." /></label><InventoryGroup title="Low Voltage Switchgear - LVS-01" items={groupItems('LVS')} selectedId={selectedId} onSelect={setSelectedId} /><InventoryGroup title="Uninterruptible Power Supply - UPS-A" items={groupItems('UPS')} selectedId={selectedId} onSelect={setSelectedId} /><div className="testing-trend"><strong>WEEKLY PERFORMANCE TREND</strong><div><i /><i /><i /><i /><i /></div><small><b /> Passed <b className="red" /> Failed</small></div></aside>
          <article className="testing-detail"><header className="testing-detail-head"><div><small>CURRENT STATUS <em className={statusClass[selected.status]}>{selected.status}</em></small><h2>{selected.name}</h2><p>Uninterruptible Power Supply - UPS-A</p></div><button aria-label="More actions">•••</button></header><div className="testing-meta"><div><small>ASSIGNEE</small><strong><i>DC</i> {selected.assignee}</strong></div><div><small>ATTEMPTS</small><strong>{selected.attempts}</strong></div><div><small>PRIORITY</small><em>High Priority</em></div><div><small>LAST UPDATE</small><strong>2 hours ago</strong></div></div><section className="testing-section"><h3><ClipboardCheck size={14} /> Testing Protocol &amp; Requirements</h3><p>Verify all physical connections and grounding lug torque values. Ensure the dielectric barrier is intact and all phase-to-phase clearances meet the NEMA standard 3.2.1. Conduct the test using a calibrated megohmmeter set to 1000V DC for 1 minute.</p></section><section className="testing-section"><h3><TestTube2 size={14} /> Execution Log (Engineer)</h3><div className="testing-execution"><label><small>ATTEMPT SUMMARY</small><textarea defaultValue="Insulation resistance values dropped below 2.2M Ohms on Phase B. Suspected moisture ingress in the rear busbar compartment. Remediation required before re-test." /></label><div><small>EVIDENCE &amp; DOCUMENTATION</small><label className="testing-dropzone"><input type="file" onChange={handleFile} /><Upload size={17} /><span>Drag images or PDFs here</span><em>Max 10MB per file</em></label><span className="testing-file"><Paperclip size={10} /> {fileName} <X size={10} /></span></div></div><div className="testing-form-actions"><button onClick={() => setSaved(true)}>{saved ? <Check size={12} /> : null}{saved ? 'Saved' : 'Save Draft'}</button><button className="testing-primary" onClick={() => setSubmitted(true)}>{submitted ? <Check size={12} /> : null}{submitted ? 'Submitted for Review' : 'Submit for Manager Review'}</button></div></section><section className="testing-review"><div className="testing-review-head"><h3><Activity size={14} /> Manager Review Panel</h3><em>{reviewStatus}</em></div><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Add review comments, rejection reasons, or specific instructions for re-testing..." /><div className="testing-review-actions"><span><i>AC</i> Reviewing as Project Manager</span><button onClick={() => setReviewStatus('Request Sent')}>Request Info</button><button onClick={() => setReviewStatus('Rejected')}>Reject Test</button><button className="testing-approve" onClick={() => setReviewStatus('Approved')}><Check size={12} /> Approve Test</button></div></section><section className="testing-comments"><h3><MessageSquare size={14} /> Communication Thread</h3><p><b>Sarah Jenkins (Engineer)</b> <small>3 hours ago</small><br />Initial test failed due to thermal switch sensitivity. Adjusting settings to manufacturer specs for the next attempt.</p><p><b>Alex Construction (Manager)</b> <small>1 hour ago</small><br />Copy that, Sarah. Ensure the manufacturer recalibration certificate is attached to the attempt log.</p><label><input placeholder="Add a comment or mention @team..." /><Paperclip size={13} /></label></section></article></section></main><footer className="testing-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer></div>
  </div>;
}

export default Testing;
