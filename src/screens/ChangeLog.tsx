import { useMemo, useState } from 'react';
import { Bell, ChevronDown, CircleAlert, Download, FileText, Filter, FolderKanban, History, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, SlidersHorizontal, TrendingUp, Users, Wrench, Zap } from 'lucide-react';

type ChangeType = 'Issue' | 'Checklist' | 'Submittal' | 'Milestone' | 'Asset' | 'Persona';
type ChangeStatus = 'Created' | 'Updated' | 'Resolved' | 'Deleted' | 'Approved';
type ChangeEntry = {
  id: string;
  title: string;
  type: ChangeType;
  status: ChangeStatus;
  user: string;
  initials: string;
  detail: string;
  timestamp: string;
  ref: string;
  impact: 'High' | 'Medium' | 'Low';
};

const entries: ChangeEntry[] = [
  { id: 'CL-2041', title: 'Critical issue resolved on CRAC Unit #4', type: 'Issue', status: 'Resolved', user: 'Mark Wilson', initials: 'MW', detail: 'Modbus gateway communication restored after firmware reflash and cable replacement on Sector 4 BMS loop.', timestamp: '2 hours ago', ref: 'ISS-4201', impact: 'High' },
  { id: 'CL-2040', title: 'L2 Delivery checklist updated for Switchgear', type: 'Checklist', status: 'Updated', user: 'Sarah Chen', initials: 'SC', detail: 'Added torque verification step for mounting bolts on MasterPact MTZ2 breaker installation.', timestamp: '5 hours ago', ref: 'L2-CHK-092', impact: 'Medium' },
  { id: 'CL-2039', title: 'New submittal uploaded: LV Switchgear RAMS', type: 'Submittal', status: 'Created', user: 'Sarah Chen', initials: 'SC', detail: 'Revision v1.2 of risk assessment method statement submitted for manager review.', timestamp: 'Yesterday', ref: 'SUB-RAMS-004', impact: 'Medium' },
  { id: 'CL-2038', title: 'Milestone "Energization" marked complete', type: 'Milestone', status: 'Approved', user: 'Alex Construction', initials: 'AC', detail: 'Phase 2 energization milestone approved by project sponsor after final inspection walkdown.', timestamp: 'Yesterday', ref: 'MST-014', impact: 'High' },
  { id: 'CL-2037', title: 'Asset record updated: Generator GEN-02-B', type: 'Asset', status: 'Updated', user: 'David Miller', initials: 'DM', detail: 'Updated serial number and commissioning date after factory acceptance test completion.', timestamp: '2 days ago', ref: 'AST-GEN-02', impact: 'Low' },
  { id: 'CL-2036', title: 'New persona added: Commissioning Engineer', type: 'Persona', status: 'Created', user: 'Alex Construction', initials: 'AC', detail: 'Created persona profile for field commissioning engineer role with L3 testing permissions.', timestamp: '3 days ago', ref: 'PER-008', impact: 'Low' },
  { id: 'CL-2035', title: 'Submittal approved: Generator Commissioning RAMS', type: 'Submittal', status: 'Approved', user: 'Mark Wilson', initials: 'MW', detail: 'Revision v3.0 of generator commissioning RAMS approved for execution.', timestamp: '3 days ago', ref: 'SUB-RAMS-005', impact: 'Medium' },
  { id: 'CL-2034', title: 'Checklist item failed: Clearance verification', type: 'Checklist', status: 'Updated', user: 'Sarah Chen', initials: 'SC', detail: 'NEC/IEC clearance verification failed during installation check — linked issue created.', timestamp: '4 days ago', ref: 'L2-CHK-092', impact: 'High' },
];

const typeFilters: ChangeType[] = ['Issue', 'Checklist', 'Submittal', 'Milestone', 'Asset', 'Persona'];
const statusFilters: ChangeStatus[] = ['Created', 'Updated', 'Resolved', 'Deleted', 'Approved'];
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard }, { label: 'Submittals', icon: FileText }, { label: 'Issues', icon: CircleAlert },
  { label: 'Checklist Stats', icon: SlidersHorizontal }, { label: 'Company Checklists', icon: FolderKanban },
  { label: 'Testing Workflow', icon: Zap }, { label: 'Milestones', icon: TrendingUp }, { label: 'Reports', icon: FileText },
  { label: 'Personas', icon: Users }, { label: 'Assets & Equipment', icon: Wrench }, { label: 'Change Log', icon: History, active: true },
];

function typeIcon(type: ChangeType) {
  if (type === 'Issue') return <CircleAlert size={14} />;
  if (type === 'Checklist') return <SlidersHorizontal size={14} />;
  if (type === 'Submittal') return <FileText size={14} />;
  if (type === 'Milestone') return <TrendingUp size={14} />;
  if (type === 'Asset') return <Wrench size={14} />;
  return <Users size={14} />;
}

function statusClass(status: ChangeStatus): string {
  return `cl-status cl-${status.toLowerCase()}`;
}

function ChangeLog({ onBackToProject, onSignOut }: { onBackToProject: () => void; onSignOut: () => void }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Statuses');
  const [selectedId, setSelectedId] = useState('CL-2041');
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => entries.filter((item) => {
    const matchesQuery = `${item.title} ${item.id} ${item.ref} ${item.user}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === 'All Types' || item.type === type;
    const matchesStatus = status === 'All Statuses' || item.status === status;
    return matchesQuery && matchesType && matchesStatus;
  }), [query, status, type]);

  const selected = entries.find((item) => item.id === selectedId) ?? entries[0];

  function notify(message: string): void { setNotice(message); window.setTimeout(() => setNotice(''), 2200); }

  return <div className="cl-screen">
    <aside className="cl-sidebar">
      <button className="cl-brand" onClick={onBackToProject}><span className="cl-mark"><span /></span><strong>SiteSphere</strong></button>
      <div className="cl-sidebar-label">MAIN NAVIGATION</div>
      <nav className="cl-nav">{navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label}><Icon size={15} /><span>{label}</span></button>)}</nav>
      <div className="cl-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={15} /> Switch Project</button><button onClick={onSignOut}><LogOut size={15} /> Sign Out</button></div>
    </aside>
    <div className="cl-main">
      <header className="cl-topbar">
        <button className="cl-menu" aria-label="Open navigation"><Menu size={18} /></button>
        <button className="cl-crumb" onClick={onBackToProject}><FolderKanban size={14} /> Data Center Alpha <ChevronDown size={12} /></button>
        <span className="cl-crumb-divider">›</span>
        <strong>Change Log</strong>
        <label className="cl-global-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search changes, refs, or users..." /></label>
        <div className="cl-user"><button aria-label="Notifications"><Bell size={17} /><i /></button><span /><div><strong>Alex Construction</strong><small>Project Manager</small></div><b>AC</b></div>
      </header>
      <main className="cl-content">
        <div className="cl-heading">
          <div><h1>Change Log</h1><p>A complete audit trail of every change made across the project.</p></div>
          <div className="cl-heading-actions">
            <button onClick={() => notify('Exporting change log')}><Download size={13} /> Export Log</button>
            <button className="cl-primary" onClick={() => notify('New entry form opened')}><Plus size={13} /> New Entry</button>
          </div>
        </div>

        <section className="cl-stat-grid">
          <div className="cl-stat"><span className="cl-stat-icon blue"><History size={16} /></span><small>TOTAL CHANGES</small><strong>2,041</strong><em>+47 this week</em></div>
          <div className="cl-stat"><span className="cl-stat-icon green"><TrendingUp size={16} /></span><small>APPROVED</small><strong>1,856</strong><em>91% approval rate</em></div>
          <div className="cl-stat"><span className="cl-stat-icon amber"><CircleAlert size={16} /></span><small>HIGH IMPACT</small><strong>128</strong><em>Requires attention</em></div>
          <div className="cl-stat"><span className="cl-stat-icon purple"><Users size={16} /></span><small>ACTIVE CONTRIBUTORS</small><strong>24</strong><em>Across 6 teams</em></div>
        </section>

        <div className="cl-workspace">
          <section className="cl-timeline-panel">
            <div className="cl-filter-bar">
              <label>TYPE<select value={type} onChange={(event) => setType(event.target.value)}><option>All Types</option>{typeFilters.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>STATUS<select value={status} onChange={(event) => setStatus(event.target.value)}><option>All Statuses</option>{statusFilters.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>IMPACT<select><option>All Impact</option><option>High</option><option>Medium</option><option>Low</option></select></label>
              <label>USER<select><option>All Users</option></select></label>
              <button className="cl-filter-apply" onClick={() => notify(`${filtered.length} changes found`)}><Filter size={13} /> Apply</button>
            </div>

            <div className="cl-timeline">
              {filtered.map((item, index) => <article className={`cl-entry ${item.id === selectedId ? 'selected' : ''}`} key={item.id} onClick={() => setSelectedId(item.id)}>
                <div className="cl-entry-marker">
                  <span className={`cl-entry-dot cl-dot-${item.status.toLowerCase()}`} />
                  {index < filtered.length - 1 && <i className="cl-entry-line" />}
                </div>
                <div className="cl-entry-body">
                  <div className="cl-entry-head">
                    <span className={`cl-entry-type cl-type-${item.type.toLowerCase()}`}>{typeIcon(item.type)} {item.type}</span>
                    <em className={statusClass(item.status)}>{item.status}</em>
                    <em className={`cl-impact cl-impact-${item.impact.toLowerCase()}`}>{item.impact}</em>
                    <small className="cl-entry-time">{item.timestamp}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <div className="cl-entry-meta">
                    <span className="cl-entry-user"><i>{item.initials}</i> {item.user}</span>
                    <span className="cl-entry-ref">Ref: {item.ref}</span>
                    <span className="cl-entry-id">{item.id}</span>
                  </div>
                </div>
              </article>)}
              {!filtered.length && <div className="cl-empty"><History size={24} /><strong>No changes match these filters</strong><span>Try clearing a filter or searching for another term.</span></div>}
            </div>
          </section>

          <aside className="cl-detail-panel">
            <div className="cl-detail-head">
              <span className="cl-detail-id">{selected.id}</span>
              <strong>{selected.title}</strong>
            </div>
            <div className="cl-detail-status-row">
              <div><small>STATUS</small><em className={statusClass(selected.status)}>{selected.status}</em></div>
              <div><small>IMPACT</small><em className={`cl-impact cl-impact-${selected.impact.toLowerCase()}`}>{selected.impact}</em></div>
              <div><small>TYPE</small><span className="cl-detail-type">{selected.type}</span></div>
            </div>
            <div className="cl-detail-section">
              <small>DESCRIPTION</small>
              <p>{selected.detail}</p>
            </div>
            <div className="cl-detail-section">
              <small>CHANGED BY</small>
              <div className="cl-detail-user"><i>{selected.initials}</i><div><strong>{selected.user}</strong><small>Project Manager</small></div></div>
            </div>
            <div className="cl-detail-section">
              <small>REFERENCE</small>
              <span className="cl-detail-ref">{selected.ref}</span>
            </div>
            <div className="cl-detail-section">
              <small>TIMESTAMP</small>
              <span className="cl-detail-time">{selected.timestamp}</span>
            </div>
            <div className="cl-detail-actions">
              <button onClick={() => notify('Change reverted')}><History size={13} /> Revert</button>
              <button className="cl-approve" onClick={() => notify('Change approved')}><TrendingUp size={13} /> Approve</button>
            </div>
          </aside>
        </div>
      </main>
      <footer className="cl-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
    </div>
    {notice && <div className="cl-toast">{notice}</div>}
  </div>;
}

export default ChangeLog;
