import { useMemo, useState } from 'react';
import { Bell, CalendarDays, ChevronRight, Download, FileText, Filter, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, SlidersHorizontal, TestTube as TestTube2, Users, Wrench } from 'lucide-react';

type MilestoneStatus = 'Done' | 'In Progress' | 'At Risk' | 'Not Started';

type Milestone = {
  id: number;
  phase: string;
  title: string;
  status: MilestoneStatus;
  date: string;
  dateRange?: string;
  checklists: number;
  health: number;
};

type Phase = {
  id: string;
  title: string;
  description: string;
  health: number;
  milestones: Milestone[];
};

const phases: Phase[] = [
  {
    id: 'L1',
    title: 'L1: FACTORY ACCEPTANCE',
    description: 'Equipment testing at manufacturer',
    health: 100,
    milestones: [{ id: 1, phase: 'L1', title: 'Schneider PDU FAT', status: 'Done', date: '3/1/2024', checklists: 1, health: 100 }],
  },
  {
    id: 'L2',
    title: 'L2: CRITICAL POWER INSTALL',
    description: 'Switchgear and UPS install',
    health: 60,
    milestones: [{ id: 2, phase: 'L2', title: 'Switchgear Energization', status: 'In Progress', date: '3/15/2024', checklists: 2, health: 60 }],
  },
  {
    id: 'L3',
    title: 'L3: FUNCTIONAL TESTING',
    description: 'Individual component startup',
    health: 15,
    milestones: [{ id: 3, phase: 'L3', title: 'Level 1 Critical Switchover', status: 'At Risk', date: '4/1/2024', dateRange: '4/5/2024', checklists: 1, health: 15 }],
  },
  {
    id: 'L4',
    title: 'L4: SYSTEM INTEGRATION',
    description: 'Sub-systems tied together',
    health: 0,
    milestones: [{ id: 4, phase: 'L4', title: 'Integrated Systems Test', status: 'Not Started', date: '5/1/2024', checklists: 0, health: 0 }],
  },
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Issues', icon: Flag },
  { label: 'Checklist Stats', icon: FileText },
  { label: 'Company Checklists', icon: FolderKanban },
  { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag, active: true },
  { label: 'Reports', icon: FileText },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function Milestones({ onBackToProject, onSignOut, onOpenNewMilestone }: { onBackToProject: () => void; onSignOut: () => void; onOpenNewMilestone: () => void }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showInProgress, setShowInProgress] = useState(true);
  const [showAtRisk, setShowAtRisk] = useState(true);

  const visiblePhases = useMemo(() => phases.map((phase) => ({
    ...phase,
    milestones: phase.milestones.filter((milestone) => {
      const matchesQuery = `${milestone.title} ${phase.title}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = milestone.status === 'Done' ? showCompleted : milestone.status === 'In Progress' ? showInProgress : milestone.status === 'At Risk' || milestone.status === 'Not Started' ? showAtRisk : true;
      return matchesQuery && matchesStatus;
    }),
  })), [query, showCompleted, showInProgress, showAtRisk]);

  function exportCsv() {
    const rows = phases.flatMap((phase) => phase.milestones.map((milestone) => [phase.id, phase.title, milestone.title, milestone.status, milestone.date, milestone.checklists]));
    const csv = [['Phase', 'Phase Name', 'Milestone', 'Status', 'Date', 'Associated Checklists'], ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'milestones.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="milestones-screen">
      <aside className="milestones-sidebar">
        <button className="milestones-brand" onClick={onBackToProject}><span className="milestones-mark"><span /></span><strong>SiteSphere</strong></button>
        <div className="milestones-sidebar-label">MAIN NAVIGATION</div>
        <nav className="milestones-nav">
          {navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={label === 'Dashboard' ? onBackToProject : undefined}><Icon size={15} /><span>{label}</span></button>)}
        </nav>
        <div className="milestones-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={15} /> Switch Project</button><button className="milestones-signout" onClick={onSignOut}><LogOut size={15} /> Sign Out</button></div>
      </aside>

      <main className="milestones-main">
        <header className="milestones-topbar"><button className="milestones-mobile-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="milestones-project" onClick={onBackToProject}><FolderKanban size={13} /> Data Center Alpha - Phase 2</button><label className="milestones-global-search"><Search size={13} /><input placeholder="Search site data..." /></label><div className="milestones-user"><button aria-label="Notifications"><Bell size={16} /><i /></button><span /><div><strong>Alex Construction</strong><small>Project Manager</small></div><b>AC</b></div></header>

        <div className="milestones-content">
          <div className="milestones-heading"><h1>Milestone<br />Setup</h1><div className="milestones-actions"><button onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'selected' : ''}><Filter size={13} /> Filters</button><button onClick={() => setShowConfiguration(!showConfiguration)} className={showConfiguration ? 'selected' : ''}><SlidersHorizontal size={13} /> Configuration</button><button onClick={exportCsv}><Download size={13} /> Export CSV</button><button className="milestones-primary" onClick={onOpenNewMilestone}><Plus size={14} /> Add Milestone</button></div></div>

          {(showFilters || showConfiguration) && <div className="milestones-toolbar-panel">
            {showFilters && <div className="milestones-filter-panel"><strong>Filter milestones</strong><label className="milestones-filter-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search milestones..." /></label><label><input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} /> Done</label><label><input type="checkbox" checked={showInProgress} onChange={(event) => setShowInProgress(event.target.checked)} /> In Progress</label><label><input type="checkbox" checked={showAtRisk} onChange={(event) => setShowAtRisk(event.target.checked)} /> At Risk / Not Started</label></div>}
            {showConfiguration && <div className="milestones-configuration"><strong>Board configuration</strong><span>Showing active project phases with health indicators and linked checklists.</span><button onClick={() => { setShowFilters(false); setShowConfiguration(false); }}>Done</button></div>}
          </div>}

          <section className="milestones-board" aria-label="Project milestones">
            {visiblePhases.map((phase) => <article className="milestone-phase" key={phase.id}><div className="milestone-phase-heading"><div><h2>{phase.title}</h2><p>{phase.description}</p></div>{phase.id === 'L3' && <span className="milestone-count">Milestones</span>}</div><div className="milestone-list">{phase.milestones.map((milestone) => <div className={`milestone-card milestone-${milestone.status.toLowerCase().replace(/ /g, '-')}`} key={milestone.id}><h3>{milestone.title}</h3><div className="milestone-status-row"><span className={`milestone-status milestone-status-${milestone.status.toLowerCase().replace(/ /g, '-')}`}>{milestone.status === 'At Risk' && '⚠ '}{milestone.status}</span>{milestone.status === 'At Risk' && <span className="milestone-dep">DEP</span>}</div><div className="milestone-date"><CalendarDays size={12} /><span>{milestone.date}{milestone.dateRange ? ` → ${milestone.dateRange}` : ''}</span></div><div className="milestone-progress"><span style={{ width: `${milestone.health}%` }} /></div><div className="milestone-checklists"><i /><span>{milestone.checklists} Associated<br />Checklists</span></div></div>)}{phase.milestones.length === 0 && <div className="milestone-empty">No matching milestones</div>}<button className="milestone-add" onClick={onOpenNewMilestone}><Plus size={13} /> Add to {phase.id}</button></div><div className="milestone-health"><span>PHASE HEALTH</span><b>{phase.health > 0 && phase.health < 100 ? `${phase.health}%` : ''}</b><i><em style={{ width: `${phase.health}%` }} /></i></div></article>)}
          </section>

          <div className="milestones-summary"><div><span>12 Completed</span><span><i className="summary-blue" />4 In Progress</span><span>2 At Risk</span></div><span>Project Completion Target: <b>Aug 15, 2024</b></span></div>
        </div>
        <footer className="milestones-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
      </main>

    </div>
  );
}

export default Milestones;

