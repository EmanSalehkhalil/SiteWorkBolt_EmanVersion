import { useMemo, useState } from 'react';
import { Bell, Check, ChevronDown, CircleAlert, Download, FileCheck2, FileText, FolderKanban, LayoutDashboard, Link2, LogOut, Menu, MoveVertical as MoreVertical, Search, Settings2, ShieldCheck, TestTube as TestTube2, Upload, X } from 'lucide-react';

type SubmittalStatus = 'Approved' | 'Pending Review' | 'Active' | 'Inactive';
type Submittal = { id: string; title: string; group: string; status: SubmittalStatus; version: string; submittedBy?: string; date?: string; equipment?: string; };

const submittals: Submittal[] = [
  { id: 'SUB-HSE-001', title: 'HSE Management Plan (General)', group: 'HSE & Safety Plans', status: 'Approved', version: 'v2.4', submittedBy: 'John Smith', date: 'Oct 12, 2023' },
  { id: 'SUB-RAMS-004', title: 'LV Switchgear Installation RAMS', group: 'RAMS (Risk Assessment)', status: 'Pending Review', version: 'v1.2', equipment: 'SWG-01-A' },
  { id: 'SUB-RAMS-005', title: 'Generator Commissioning RAMS', group: 'RAMS (Risk Assessment)', status: 'Approved', version: 'v3.0', equipment: 'GEN-02-B' },
  { id: 'SUB-PERMIT-001', title: 'Hot Work Permit - Sector 4', group: 'Permits & Certificates', status: 'Active', version: 'P-2023-991', equipment: 'Welding Station A4' },
  { id: 'SUB-PERMIT-002', title: 'Excavation Permit - B1', group: 'Permits & Certificates', status: 'Inactive', version: 'P-2023-842', equipment: 'CAT 320 Excavator' },
];

const groups = ['HSE & Safety Plans', 'RAMS (Risk Assessment)', 'Permits & Certificates'];
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard }, { label: 'Submittals', icon: FileText, active: true },
  { label: 'Issues', icon: CircleAlert }, { label: 'Checklist Stats', icon: FileCheck2 }, { label: 'Company Checklists', icon: FolderKanban },
  { label: 'Testing Workflow', icon: TestTube2 }, { label: 'Milestones', icon: ShieldCheck },
];

function statusClass(status: SubmittalStatus): string { return `submittal-status submittal-${status.toLowerCase().replace(' ', '-')}`; }

function Submittals({ onBackToProject, onSignOut }: { onBackToProject: () => void; onSignOut: () => void }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Statuses');
  const [selectedId, setSelectedId] = useState('SUB-RAMS-004');
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => submittals.filter((item) => {
    const matchesQuery = `${item.title} ${item.id} ${item.equipment ?? ''}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === 'All Types' || item.group === type;
    const matchesStatus = status === 'All Statuses' || item.status === status;
    return matchesQuery && matchesType && matchesStatus;
  }), [query, status, type]);
  const selected = submittals.find((item) => item.id === selectedId) ?? submittals[1];

  function showNotice(message: string): void { setNotice(message); window.setTimeout(() => setNotice(''), 2200); }

  return <div className="submittals-screen">
    <aside className="submittals-sidebar">
      <button className="submittals-brand" onClick={onBackToProject}><span className="submittals-mark"><span /></span><strong>SiteSphere</strong></button>
      <div className="submittals-sidebar-label">MAIN NAVIGATION</div>
      <nav className="submittals-nav">{navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label}><Icon size={15} /><span>{label}</span></button>)}</nav>
      <div className="submittals-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={15} /> Settings</button><button onClick={onSignOut}><LogOut size={15} /> Sign Out</button></div>
    </aside>
    <div className="submittals-main">
      <header className="submittals-topbar"><button className="submittals-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="submittals-crumb" onClick={onBackToProject}><FolderKanban size={14} /> Data Center Alpha <ChevronDown size={12} /></button><span className="submittals-crumb-divider">›</span><strong>Project Submittals</strong><label className="submittals-global-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search submittals, tags, or equipment..." /></label><div className="submittals-user"><button aria-label="Notifications"><Bell size={17} /><i /></button><span /><div><strong>Marcus Thorne</strong><small>Project Manager</small></div><b>MT</b></div></header>
      <main className="submittals-content">
        <div className="submittals-heading"><div><h1>Project Submittals</h1><p>Manage and track technical documentation, safety plans, and equipment permits.</p></div><div className="submittals-heading-actions"><button onClick={() => showNotice('Preparing batch download')}><Download size={13} /> Batch Download</button><button className="submittals-primary" onClick={() => showNotice('New submittal form is ready')}><PlusIcon /> New Submittal</button></div></div>
        <section className="submittals-filter-card"><div><label>TYPE<select value={type} onChange={(event) => setType(event.target.value)}><option>All Types</option>{groups.map((group) => <option key={group}>{group}</option>)}</select></label><label>STATUS<select value={status} onChange={(event) => setStatus(event.target.value)}><option>All Statuses</option><option>Approved</option><option>Pending Review</option><option>Active</option><option>Inactive</option></select></label><label>ASSIGNED TO<select><option>All Users</option></select></label><label>EQUIPMENT<select><option>All Equipment</option></select></label><label>DISCIPLINE<select><option>All Disciplines</option></select></label></div><label className="submittals-phase-filter">PHASE<select><option>All Phases</option><option>Level 1: Factory Acceptance</option><option>Level 2: Field Component</option></select></label><button aria-label="Apply filters" onClick={() => showNotice(`${filtered.length} submittals found`)}><Settings2 size={14} /></button></section>
        {groups.map((group) => { const items = filtered.filter((item) => item.group === group); if (!items.length) return null; return <section className="submittal-group" key={group}><div className="submittal-group-heading"><div><span className={`submittal-group-icon group-${group.startsWith('HSE') ? 'hse' : group.startsWith('RAMS') ? 'rams' : 'permit'}`}><FileText size={15} /></span><h2>{group}</h2></div><span>{items.length} Record{items.length > 1 ? 's' : ''}</span></div>{group === 'Permits & Certificates' ? <div className="permit-grid">{items.map((item) => <PermitCard item={item} key={item.id} onSelect={() => setSelectedId(item.id)} />)}</div> : items.map((item) => <SubmittalRow item={item} key={item.id} selected={item.id === selectedId} onSelect={() => setSelectedId(item.id)} onAction={showNotice} />)}</section>; })}
        {!filtered.length && <div className="submittals-empty"><FileText size={24} /><strong>No submittals match these filters</strong><span>Try clearing a filter or searching for another document.</span></div>}
        <section className="drawings-section"><div className="submittal-group-heading"><div><span className="submittal-group-icon group-drawing"><FileCheck2 size={15} /></span><h2>Technical Drawings</h2></div><span>3 Records</span></div><div className="drawing-grid"><DrawingCard title="HV Single Line Diagram" label="Rev C" tone="dark" /><DrawingCard title="Switchgear Layout B-B" label="Rev 2" tone="paper" /><DrawingCard title="Earthing Grid Detail" label="Rev A" tone="blue" /></div></section>
      </main>
      <footer className="submittals-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
    </div>
    <aside className="submittal-detail"><h2>SUBMITTAL DETAILS</h2><div className="submittal-preview"><FileText size={34} /></div><small>TITLE</small><strong>{selected.title}</strong><div className="submittal-detail-meta"><div><small>ID</small><span>{selected.id}</span></div><div><small>STATUS</small><em className={statusClass(selected.status)}>{selected.status}</em></div></div><div className="detail-section"><h3><Link2 size={14} /> LINKED ITEMS</h3><div className="linked-item"><span><FolderKanban size={14} /></span><strong>SWG-01-A<small>MasterPact MTZ2 Breaker</small></strong></div><div className="linked-item"><span className="linked-green"><Check size={14} /></span><strong>L2 Checklist #092<small>Delivery &amp; Installation</small></strong></div><button className="link-more" onClick={() => showNotice('Link item picker opened')}>+ &nbsp; Link More</button></div><div className="detail-section activity-section"><h3>◷ &nbsp; ACTIVITY LOG</h3><p><i className="activity-dot green" /><strong>Revision v1.2 Uploaded<small>By Sarah Chen • 2h ago</small></strong></p><p><i className="activity-dot" /><strong>Comments Added<small>By Project Lead • Oct 14</small></strong></p></div><div className="detail-actions"><button onClick={() => showNotice('Submittal rejected')}><X size={13} /> Reject</button><button onClick={() => showNotice('Submittal approved')}><Check size={13} /> Approve</button></div></aside>
    {notice && <div className="submittal-toast">{notice}</div>}
  </div>;
}

function SubmittalRow({ item, selected, onSelect, onAction }: { item: Submittal; selected: boolean; onSelect: () => void; onAction: (message: string) => void }) { return <article className={`submittal-row ${selected ? 'selected' : ''}`} onClick={onSelect}><div><h3>{item.title} <em className={statusClass(item.status)}>{item.status}</em></h3><p><span>◈ {item.version}</span><span>◉ Submitted by {item.submittedBy ?? 'Sarah Chen'}</span><span>▣ {item.date ?? 'Oct 14, 2023'}</span></p></div><div className="submittal-row-actions"><button onClick={(event) => { event.stopPropagation(); onAction('Downloading document'); }}><Download size={13} /> Download</button><button onClick={(event) => { event.stopPropagation(); onAction('Revision form opened'); }}>New Revision</button><MoreVertical size={16} /></div></article>; }
function PermitCard({ item, onSelect }: { item: Submittal; onSelect: () => void }) { return <article className="permit-card" onClick={onSelect}><div className="permit-card-heading"><h3>{item.title}</h3><em className={statusClass(item.status)}>{item.status}</em></div><p>Permit Ref: {item.version}</p><div><span>Linked Product:</span><strong>{item.equipment}</strong></div><div><span>Expiry Date:</span><strong className={item.status === 'Active' ? 'expiry-warning' : ''}>{item.status === 'Active' ? 'Oct 28, 2023' : 'Sep 15, 2023'}</strong></div><button>{item.status === 'Active' ? 'RENEW' : 'ARCHIVED'}</button></article>; }
function DrawingCard({ title, label, tone }: { title: string; label: string; tone: string }) { return <article className="drawing-card"><div className={`drawing-thumb drawing-${tone}`}><span>⌁</span></div><div><strong>{title}</strong><em>{label}</em></div></article>; }
function PlusIcon() { return <span className="plus-icon">+</span>; }
export default Submittals;
