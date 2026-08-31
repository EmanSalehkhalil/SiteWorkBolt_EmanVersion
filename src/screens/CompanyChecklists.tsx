import { useState } from 'react';
import { Bell, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, ClipboardCheck, Download, FileText, ChartBar as FileBarChart, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, MessageSquare, Paperclip, RefreshCw, Search, Settings2, TestTube as TestTube2, Users, Wrench } from 'lucide-react';

type Phase = { level: string; title: string; status: string; active?: boolean; complete?: boolean };
type Task = { text: string; meta: string; result: 'PASSED' | 'FAILED' | 'N/A'; issue?: boolean };

const phases: Phase[] = [
  { level: 'L1', title: 'Factory Acceptance', status: 'Completed', complete: true },
  { level: 'L2', title: 'Delivery & Installation', status: 'In Progress', active: true },
  { level: 'L3', title: 'Pre-Functional / Commissioning', status: 'Not Started' },
  { level: 'L4', title: 'Functional Performance', status: 'Not Started' },
  { level: 'L5', title: 'IST (Integrated Testing)', status: 'Not Started' },
];

const deliveryTasks: Task[] = [
  { text: 'Verify shipping manifest and Bill of Lading match actual delivery items.', meta: '1 updates   0 comments   2 files', result: 'PASSED' },
  { text: 'Inspect equipment for any transit damage, surface scratches, or dents.', meta: '4 updates   2 comments   8 files', result: 'PASSED' },
  { text: 'Confirm all technical manuals, spare fuses, and keys are included.', meta: '0 updates   1 comments   1 files', result: 'N/A' },
];

const installationTasks: Task[] = [
  { text: 'Verify physical integrity and nameplate data matches design specifications.', meta: '2 updates   1 comments   3 files', result: 'PASSED' },
  { text: 'Check mounting bolt torque and leveling as per manufacturer guidelines.', meta: '3 updates   0 comments   1 files', result: 'PASSED' },
  { text: 'Confirm proper clearance around the breaker as per NEC/IEC requirements.', meta: '1 updates   4 comments   2 files', result: 'FAILED', issue: true },
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
  { label: 'Issues', icon: CircleAlert },
  { label: 'Checklist Stats', icon: ClipboardCheck },
  { label: 'Company Checklists', icon: FolderKanban, active: true },
  { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function ResultButtons({ task }: { task: Task }) {
  return <div className="company-result-buttons"><button className={task.result === 'PASSED' ? 'selected-pass' : ''}><Check size={10} /> PASSED</button><button className={task.result === 'FAILED' ? 'selected-fail' : ''}>FAILED</button><button className={task.result === 'N/A' ? 'selected-na' : ''}>N/A</button></div>;
}

function TaskRow({ task }: { task: Task }) {
  return <div className="company-task-row"><div><strong>{task.text}</strong><small><RefreshCw size={10} /> {task.meta.split('   ')[0]} <MessageSquare size={10} /> {task.meta.split('   ')[1]} <Paperclip size={10} /> {task.meta.split('   ')[2]}</small>{task.issue && <em className="linked-issue"><CircleAlert size={10} /> 1 linked issue</em>}</div><ResultButtons task={task} /></div>;
}

function CompanyChecklists({ onBackToProject, onOpenReports, onOpenSubmittals, onSignOut }: { onBackToProject: () => void; onOpenReports: () => void; onOpenSubmittals: () => void; onSignOut: () => void }) {
  const [selectedPhase, setSelectedPhase] = useState('L2');
  const [expanded, setExpanded] = useState(true);

  return <div className="company-checklist-screen">
    <aside className="company-checklist-sidebar">
      <button className="company-checklist-brand" onClick={onBackToProject}><span className="company-checklist-mark"><span /></span><strong>SiteSphere</strong></button>
      <div className="company-sidebar-label">MAIN NAVIGATION</div>
      <nav className="company-checklist-nav">{navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={label === 'Reports' ? onOpenReports : label === 'Submittals' ? onOpenSubmittals : undefined}><Icon size={16} /><span>{label}</span></button>)}</nav>
      <div className="company-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={16} /> Switch Project</button><button onClick={onSignOut}><LogOut size={16} /> Sign Out</button></div>
    </aside>

    <div className="company-checklist-main">
      <header className="company-checklist-topbar"><button className="company-mobile-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="company-project-crumb" onClick={onBackToProject}><FolderKanban size={13} /> Data Center Alpha <ChevronRight size={13} /></button><label className="company-search"><Search size={14} /><input placeholder="Search site data..." /></label><div className="company-user"><button aria-label="Notifications"><Bell size={17} /><i /></button><span className="company-divider" /><span><strong>Marcus Thorne</strong><small>Project Manager</small></span><b>MT</b></div></header>

      <main className="company-checklist-content">
        <div className="company-checklist-title"><div><div className="company-kicker"><button onClick={onBackToProject}><ChevronLeft size={14} /></button> Subcontractor <span>REF: DC-ALPHA-SE-092</span></div><h1>Schneider Electric: Commissioning Checklist</h1></div><div className="company-title-actions"><button><Settings2 size={13} /> Filters</button><button className="company-report-button"><Download size={13} /> Export L1-L5 Report</button></div></div>

        <section className="company-summary-grid"><div><span className="summary-icon blue"><ClipboardCheck size={15} /></span><small>OVERALL PROGRESS</small><strong>64% <em>64%</em></strong><i><b /></i></div><div><span className="summary-icon green"><Check size={15} /></span><small>PASSED TASKS</small><strong>142</strong></div><div><span className="summary-icon red"><CircleAlert size={15} /></span><small>FAILED / ISSUES</small><strong>12</strong></div><div><span className="summary-icon orange"><RefreshCw size={15} /></span><small>PENDING REVIEW</small><strong>28</strong></div></section>

        <section className="company-filter-bar"><label>ASSIGNED TO<select><option>All Field Engineers</option></select></label><label>EQUIPMENT<select><option>MasterPact MTZ2 Br...</option></select></label><label>STATUS<select><option>All Statuses</option></select></label><label>TYPE<select><option>Level-2 QA/QC</option></select></label><label>DISCIPLINE<select><option>Electrical</option></select></label><label>PHASE<select><option>Delivery & Installation</option></select></label><button aria-label="Add filter">+</button></section>

        <nav className="company-phase-tabs">{phases.map((phase) => <button className={`${phase.active ? 'active' : ''} ${phase.complete ? 'complete' : ''}`} key={phase.level} onClick={() => setSelectedPhase(phase.level)}><span>{phase.level} <em>{phase.status}</em></span><strong>{phase.title}</strong></button>)}</nav>

        <div className="company-equipment-heading"><div><h2>Equipment List for {selectedPhase} <span>1</span></h2></div><button onClick={() => setExpanded(!expanded)}>{expanded ? 'Collapse products' : 'Expand products'} <ChevronDown size={13} /></button></div>
        {expanded && <section className="equipment-card"><div className="equipment-header"><div><h3>MasterPact MTZ2 Air Circuit Breaker <span>Main Distribution</span></h3><p>High voltage circuit breaker for main distribution switchgear. SN: SE-ACB-901-22</p></div><div className="equipment-progress"><small>AVAILABLE IN: <b>L1</b> <b>L2</b> <b>L3</b></small><span><i /><strong>1/3 Completed</strong><ChevronDown size={12} /></span></div></div><div className="checklist-group"><div className="checklist-group-heading"><Wrench size={14} /><div><strong>DELIVERY</strong><small>Verify equipment arrival and physical condition</small></div><ChevronDown size={13} /></div>{deliveryTasks.map((task) => <TaskRow key={task.text} task={task} />)}</div><div className="checklist-group"><div className="checklist-group-heading"><ClipboardCheck size={14} /><div><strong>INSTALLATION / VERIFICATION</strong><small>Confirm proper positioning and structural mounting</small></div><ChevronDown size={13} /></div>{installationTasks.map((task) => <TaskRow key={task.text} task={task} />)}<button className="secondary-support"><span /> TBD: Secondary Support Verification <ChevronDown size={12} /></button></div><button className="add-inspection"><span>+</span> Add Custom Inspection Point</button></section>}
      </main>
      <footer className="company-checklist-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
    </div>
  </div>;
}

export default CompanyChecklists;
