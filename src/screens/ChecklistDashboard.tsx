import { Bell, Building2, CircleCheck as CheckCircle2, ChevronRight, CircleAlert, ClipboardCheck, Clock3, Download, FileText, ChartBar as FileBarChart, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, Search, Settings2, ShieldCheck, SlidersHorizontal, TestTube as TestTube2, Users, Wrench } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

type Company = { name: string; tasks: string; verified: string; progress: number; status: 'On Track' | 'Delayed' | 'Ahead' };

const companies: Company[] = [
  { name: 'Schneider Electric', tasks: '1240', verified: '892', progress: 72, status: 'On Track' },
  { name: 'ABB Systems', tasks: '980', verified: '745', progress: 76, status: 'On Track' },
  { name: 'Siemens Energy', tasks: '850', verified: '412', progress: 48, status: 'Delayed' },
  { name: 'Vertiv Group', tasks: '620', verified: '590', progress: 95, status: 'Ahead' },
  { name: 'Johnson Controls', tasks: '450', verified: '120', progress: 26, status: 'Delayed' },
];

const navItems: { label: string; icon: typeof LayoutDashboard; active?: boolean }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
    { label: 'HSE', icon: ShieldCheck },
  { label: 'Issues', icon: CircleAlert },
  // { label: 'Checklist Stats', icon: ClipboardCheck, active: true },
  { label: 'Checklist', icon: FolderKanban },
  // { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function ChecklistDashboard({ onBackToProject, onNavigate, onSignOut }: { onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  return (
    <div className="dashboard-screen">
      <aside className="dashboard-sidebar">
        <div className="sidebar-label">MAIN NAVIGATION</div>
        <nav className="dashboard-nav">
          {navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={17} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={17} /> Switch Project</button><button className="signout-link" onClick={onSignOut}><LogOut size={17} /> Sign Out</button></div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-mobile-menu" aria-label="Open navigation"><Menu size={19} /></button>
          <button className="dashboard-brand" onClick={onBackToProject}><span className="dashboard-logo"><span /></span><strong>SiteSphere</strong><ChevronRight size={16} /></button>
          <button className="project-crumb" onClick={onBackToProject}><FolderKanban size={14} /> Hyperscale Data Center - Phase 1</button>
          <label className="dashboard-search"><Search size={15} /><input placeholder="Search site data..." /></label>
          <div className="dashboard-user"><button className="dashboard-bell" aria-label="Notifications"><Bell size={19} /><i /></button><span className="dashboard-user-divider" /><span className="dashboard-user-copy"><strong>Alex Construction</strong><small>Project Manager</small></span><span className="dashboard-avatar">AC</span></div>
        </header>

        <main className="dashboard-content">
          <div className="dashboard-heading"><div><h1>Checklist Analytics</h1><p>Comprehensive tracking of commissioning tasks and vendor performance.</p></div><div className="dashboard-heading-actions"><button className="dashboard-filter"><SlidersHorizontal size={15} /> Filter View</button><button className="dashboard-export"><Download size={15} /> Export PDF</button></div></div>
          <section className="dashboard-stat-grid">
            <div className="dashboard-stat"><div><small>Total Checklist Items</small><strong>4,582</strong><p>Global project scope</p></div><span><ClipboardCheck size={18} /></span></div>
            <div className="dashboard-stat"><div><small>Completed Items</small><strong>2,841</strong><p>Successfully verified</p></div><span><CheckCircle2 size={18} /></span><em>↗ +12% this week</em></div>
            <div className="dashboard-stat"><div><small>In Progress</small><strong>942</strong><p>Currently testing</p></div><span><Clock3 size={18} /></span></div>
            <div className="dashboard-stat completion-stat"><div><small>Overall Completion</small><strong>62%</strong><p>Target: 75% by EOM</p></div><div className="completion-ring"><span>↗</span></div></div>
          </section>
          <section className="analytics-grid">
            <div className="analytics-card phase-card"><div className="analytics-card-heading"><div><h2>Progress by Commissioning Phase</h2><p>Completion percentage across L1 to L5 levels.</p></div></div><div className="chart-legend"><span className="legend-complete" /> Completed <span className="legend-remaining" /> Remaining</div><div className="phase-chart"><div className="phase-row"><label>L1: Factory</label><div><span className="phase-bar phase-green" style={{ width: '95%' }} /></div></div><div className="phase-row"><label>L2: Component</label><div><span className="phase-bar phase-blue" style={{ width: '82%' }} /></div></div><div className="phase-row"><label>L3: System</label><div><span className="phase-bar phase-dark" style={{ width: '63%' }} /></div></div><div className="phase-row"><label>L4: Integrated</label><div><span className="phase-bar phase-dark" style={{ width: '42%' }} /></div></div><div className="phase-row"><label>L5: Performance</label><div><span className="phase-bar phase-dark" style={{ width: '15%' }} /></div></div></div></div>
            <div className="analytics-card distribution-card"><div className="analytics-card-heading"><h2>Task Distribution</h2><p>By participating companies.</p></div><div className="donut-chart"><div /></div><div className="donut-legend"><span><i className="dot-blue" /> Schneider Electric</span><span><i className="dot-green" /> ABB Systems</span><span><i className="dot-black" /> Siemens Energy</span><span><i className="dot-black" /> Vertiv Group</span></div><div className="contractor-total"><span>Active Contractors</span><strong>12 Companies</strong></div></div>
          </section>
          <section className="company-section"><div className="company-heading"><div><h2>Company Performance Breakdown</h2><p>Detailed status and workload by primary vendor.</p></div><button>View All Companies <ChevronRight size={15} /></button></div><div className="company-table-wrap"><div className="company-table company-table-header"><span>Company Name</span><span>Total Tasks</span><span>Verified</span><span>Progress</span><span>Current Status</span><span>Action</span></div>{companies.map((company) => <div className="company-table" key={company.name}><span className="company-name"><i><Building2 size={14} /></i>{company.name}</span><span>{company.tasks}</span><span>{company.verified}</span><span className="company-progress"><small>{company.progress}%</small><i><b style={{ width: `${company.progress}%` }} /></i></span><span><em className={`company-status status-${company.status.toLowerCase().replace(' ', '-')}`}>{company.status}</em></span><span className="table-action">•••</span></div>)}</div></section>
        </main>
        <footer className="dashboard-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
      </div>
    </div>
  );
}

export default ChecklistDashboard;
