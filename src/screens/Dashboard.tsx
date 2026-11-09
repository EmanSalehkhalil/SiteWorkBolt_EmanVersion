import { Activity, Bell, CircleCheck as CheckCircle2, CircleAlert, ClipboardCheck, Download, FileText, ChartBar as FileBarChart, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, Search, Settings2, ShieldCheck, SlidersHorizontal, TestTube as TestTube2, Users, Wrench, Zap } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Submittals', icon: FileText },
    { label: 'HSE', icon: ShieldCheck },
  { label: 'Issues', icon: CircleAlert },
  // { label: 'Checklist Stats', icon: ClipboardCheck },
  { label: 'Checklist', icon: FolderKanban },
  // { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

const issueCards = [
  { label: 'CAT A ISSUES', total: '12', resolved: '2', rate: '16.7%', change: '+3', color: 'red' },
  { label: 'CAT B ISSUES', total: '45', resolved: '12', rate: '26.7%', change: '+8', color: 'blue' },
  { label: 'SAFETY ISSUES (HSE)', total: '5', resolved: '1', rate: '20.0%', change: '+1', color: 'green' },
];

function Dashboard({ projectId, onBackToProjects, onNavigate, onSignOut }: { projectId: string | null; onBackToProjects: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  const [personnel, setPersonnel] = useState<{ name: string; members: { role: string; isActive: boolean }[] } | null>(null);
  const [personnelError, setPersonnelError] = useState('');
  useEffect(() => {
    let cancelled = false;
    setPersonnel(null); setPersonnelError('');
    if (!projectId) { setPersonnelError('Select a project to view personnel.'); return; }
    fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}`)
      .then(async (r) => { const body = await r.json(); if (!r.ok) throw new Error(body.error || 'Unable to load personnel.'); return body; })
      .then((p) => { if (!cancelled) setPersonnel({ name: p.projectName, members: p.members }); })
      .catch((error) => { if (!cancelled) setPersonnelError(error instanceof Error ? error.message : 'Unable to load personnel.'); });
    return () => { cancelled = true; };
  }, [projectId]);
  const active = personnel?.members.filter((m) => m.isActive) || [];
  const agents = active.filter((m) => m.role === 'commissioning agent').length;
  const engineers = active.filter((m) => m.role === 'engineer').length;
  const other = active.length - agents - engineers;
  return (
    <div className="project-dashboard-screen">
      <aside className="project-dashboard-sidebar">
        <button className="project-dashboard-brand" onClick={onBackToProjects}><span className="project-dashboard-mark"><span /></span><strong>SiteSphere</strong></button>
        <div className="project-sidebar-label">MAIN NAVIGATION</div>
        <nav className="project-dashboard-nav">
          {navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={16} /><span>{label}</span></button>)}
        </nav>
        <div className="project-sidebar-bottom"><button><Settings2 size={16} /> Switch Project</button><button className="project-signout" onClick={onSignOut}><LogOut size={16} /> Sign Out</button></div>
      </aside>

      <div className="project-dashboard-main">
        <header className="project-dashboard-topbar">
          <button className="project-dashboard-menu" aria-label="Open navigation"><Menu size={19} /></button>
          <button className="project-dashboard-crumb" onClick={onBackToProjects}><span><FolderKanban size={13} /> {personnel?.name || 'Project'}</span></button>
          <label className="project-dashboard-search"><Search size={14} /><input placeholder="Search site data..." /></label>
          <div className="project-dashboard-user"><button className="project-dashboard-bell" aria-label="Notifications"><Bell size={17} /><i /></button><span className="project-user-divider" /><span className="project-user-copy"><strong>Alex Construction</strong><small>Project Manager</small></span><span className="project-user-avatar">AC</span></div>
        </header>

        <main className="project-dashboard-content">
          <div className="project-dashboard-heading"><div><h1>Project Dashboard</h1><p>Real-time commissioning metrics and construction health.</p></div><div className="project-dashboard-actions"><button className="project-download"><Download size={14} /> Download Report</button><button className="project-new-issue"><CircleAlert size={14} /> Log New Issue</button></div></div>

          <section className="project-metric-grid">
            <div className="project-metric-card"><span className="metric-icon"><CircleAlert size={17} /></span><small>Construction Issues</small><strong>12 <em>↗ +45</em></strong><p>8% Resolved this week</p></div>
            <div className="project-metric-card"><span className="metric-icon"><ClipboardCheck size={17} /></span><small>Checklist Completion</small><strong>68.4% <em>↗ +12%</em></strong><p>800 Total items tracked</p></div>
            <div className="project-metric-card"><span className="metric-icon"><Zap size={17} /></span><small>Pending Tests</small><strong>25</strong><p>12 High priority remaining</p></div>
            <div className="project-metric-card"><span className="metric-icon"><ShieldCheck size={17} /></span><small>Project Health Score</small><strong>A-</strong><p>Stable since last update</p></div>
          </section>

          <section className="project-main-grid">
            <div className="project-panel checklist-panel"><div className="project-panel-heading"><div><h2>Project Checklist Progress</h2><p>Overall completion across all commissioning levels</p></div><strong>53% Completed</strong></div><div className="checklist-progress-body"><div className="checklist-donut"><span>53%<small>TOTAL DONE</small></span></div><div className="checklist-stages"><div><span>Delivered</span><b>420 Items</b><i><em style={{ width: '82%' }} /></i></div><div><span>Commissioned</span><b>150 Items</b><i><em style={{ width: '47%' }} /></i></div><div><span>Installed</span><b>230 Items</b><i><em style={{ width: '63%' }} /></i></div><div><span>Energized</span><b>85 Items</b><i><em style={{ width: '29%' }} /></i></div><small className="last-synced"><Activity size={11} /> LAST SYNCHRONIZED: 14 MINS AGO</small></div></div></div>
            <div className="project-panel personnel-panel"><div className="project-panel-heading personnel-heading"><div><h2><Users size={16} /> Project Personnel</h2><p>Active memberships in this project</p></div></div>
              {personnelError ? <p role="alert">{personnelError}</p> : !personnel ? <p>Loading personnel…</p> : <>
                <div className="headcount"><strong>{active.length}</strong><small>ACTIVE HEADCOUNT</small></div>
                <div className="personnel-list"><div><Wrench size={13} /><span>Commissioning agents</span><b>{agents}</b></div><div><Zap size={13} /><span>Engineers</span><b>{engineers}</b></div><div><ShieldCheck size={13} /><span>Managers / other roles</span><b>{other}</b></div></div>
              </>}
            </div>
          </section>

          <section className="issues-section"><div className="issues-heading"><div><h2>Construction Issues Breakdown</h2><p>Workflow distribution and corrective action status</p></div><div><strong>84.2%</strong><span>GLOBAL RESOLUTION RATE</span></div><button>View All Issues ›</button></div><div className="issue-card-grid">{issueCards.map((issue) => <article className={`issue-card issue-${issue.color}`} key={issue.label}><div className="issue-card-top"><small>{issue.label}</small><em>{issue.rate} Resolved</em></div><div className="issue-total"><strong>{issue.total}</strong><span>↗ {issue.change}</span></div><small className="issue-caption">TOTAL ISSUES</small><div className="issue-resolved"><span>Resolved This Week</span><b>{issue.resolved}</b></div><div className="issue-sparkline"><i /><i /><i /><i /><i /></div></article>)}</div></section>
        </main>
        <footer className="project-dashboard-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
      </div>
    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from 'react';
