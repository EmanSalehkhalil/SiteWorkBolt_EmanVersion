import { useMemo, useState } from 'react';
import { Activity, Bell, CalendarDays, Check, ChevronDown, ChevronRight, CircleAlert, ClipboardCheck, Download, ChartBar as FileBarChart, FileText, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, Printer, Search, Settings2, Share2, ShieldCheck, SlidersHorizontal, TestTube as TestTube2, TrendingUp, Users, Wrench, X } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

type ReportRow = { id: string; subject: string; company: string; priority: 'High' | 'Critical' | 'Medium' | 'Low'; status: string; date: string };

const reportTypes = ['Checklist Progress', 'Test Performance', 'Issue Trends', 'Equipment Usage', 'Milestone Status'];
const phases = ['Level 1: Factory Acceptance', 'Level 2: Field Component', 'Level 3: Terminal Testing', 'Level 4: Functional Performance', 'Level 5: Integrated Systems'];
const equipments = ['HVAC Sensors', 'Main Switchgear', 'Secondary Containment', 'L3 Network Racks'];
const rows: ReportRow[] = [
  { id: 'ISS-4012', subject: 'HVAC Sensor Calibration', company: 'Schneider', priority: 'High', status: 'Under Correction', date: '2024-11-10' },
  { id: 'ISS-3988', subject: 'Main Switchgear Busbar Alignment', company: 'ABB', priority: 'Critical', status: 'Open', date: '2024-11-08' },
  { id: 'ISS-4005', subject: 'Secondary Containment Leak', company: 'Vertiv', priority: 'Medium', status: 'Closed', date: '2024-11-09' },
  { id: 'ISS-3972', subject: 'L3 Network Rack Grounding', company: 'Siemens', priority: 'Low', status: 'Accepted', date: '2024-11-05' },
  { id: 'ISS-4021', subject: 'BMS Integration Lag - Sector 4', company: 'Schneider', priority: 'High', status: 'Ready for Reset', date: '2024-11-12' },
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
    { label: 'HSE', icon: ShieldCheck },
  { label: 'Issues', icon: CircleAlert },
  // { label: 'Checklist Stats', icon: ClipboardCheck },
  { label: 'Checklist', icon: FolderKanban },
  // { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileBarChart, active: true },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function Reports({ onBackToProject, onNavigate, onSignOut }: { onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  const [selectedType, setSelectedType] = useState('Issue Trends');
  const [selectedPhases, setSelectedPhases] = useState<string[]>([phases[3], phases[4]]);
  const [selectedEquipments, setSelectedEquipments] = useState(equipments);
  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState(false);

  function toggleValue(value: string, values: string[], setValues: (next: string[]) => void) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  const filteredRows = useMemo(() => rows.filter((row) => `${row.id} ${row.subject} ${row.company}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="reports-screen">
      <aside className="reports-sidebar">
        <button className="reports-brand" onClick={onBackToProject}><span className="reports-brand-mark"><span /></span><strong>SiteSphere</strong><ChevronRight size={14} /></button>
        <div className="reports-sidebar-label">MAIN NAVIGATION</div>
        <nav className="reports-nav">{navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={15} /><span>{label}</span></button>)}</nav>
        <div className="reports-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={15} /> Switch Project</button><button className="reports-signout" onClick={onSignOut}><LogOut size={15} /> Sign Out</button></div>
      </aside>

      <aside className="reports-config">
        <div className="reports-config-heading"><SlidersHorizontal size={15} /><div><strong>Report Config</strong><small>Customize your report parameters and filters below.</small></div></div>
        <div className="reports-config-body">
          <fieldset className="reports-config-group"><legend>REPORT TYPE</legend>{reportTypes.map((type) => <button className={selectedType === type ? 'selected' : ''} key={type} onClick={() => setSelectedType(type)}>{type === 'Issue Trends' ? <CircleAlert size={13} /> : type === 'Test Performance' ? <Activity size={13} /> : type === 'Checklist Progress' ? <Check size={13} /> : type === 'Equipment Usage' ? <FolderKanban size={13} /> : <Flag size={13} />}{type}</button>)}</fieldset>
          <fieldset className="reports-config-group"><legend>TIME PERIOD</legend><label className="reports-date-input"><CalendarDays size={13} /><input type="text" value="Oct 01, 2024" readOnly /></label><label className="reports-date-input"><CalendarDays size={13} /><input type="text" value="Nov 15, 2024" readOnly /></label></fieldset>
          <fieldset className="reports-config-group"><legend>PROJECT PHASES</legend>{phases.map((phase) => <label className="reports-check-row" key={phase}><input type="checkbox" checked={selectedPhases.includes(phase)} onChange={() => toggleValue(phase, selectedPhases, setSelectedPhases)} /><span><Check size={10} /></span>{phase}</label>)}</fieldset>
          <fieldset className="reports-config-group"><legend>INVOLVED EQUIPMENTS</legend>{equipments.map((company) => <label className="reports-check-row" key={company}><input type="checkbox" checked={selectedEquipments.includes(company)} onChange={() => toggleValue(company, selectedEquipments, setSelectedEquipments)} /><span><Check size={10} /></span>{company}</label>)}</fieldset>
        </div>
        <button className={`reports-apply ${applied ? 'applied' : ''}`} onClick={() => setApplied(true)}>{applied ? <><Check size={14} /> Parameters Applied</> : <><Activity size={14} /> Apply Parameters</>}</button>
      </aside>

      <main className="reports-main">
        <header className="reports-topbar"><button className="reports-mobile-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="reports-project" onClick={onBackToProject}><FolderKanban size={13} /> Data Center Alpha</button><label className="reports-global-search"><Search size={13} /><input placeholder="Search site data..." /></label><div className="reports-user"><button aria-label="Notifications"><Bell size={16} /><i /></button><span /><div><strong>Alex Construction</strong><small>Project Manager</small></div><b>AC</b></div></header>
        <div className="reports-content">
          <div className="reports-heading"><div><div className="reports-heading-icon"><CircleAlert size={18} /></div><div><h1>{selectedType} Report</h1><p>Open vs Closed issues over the project timeline.<br />Generating summary for Data Center Alpha project across L3-L5 phases.</p></div></div><div className="reports-heading-actions"><button><Share2 size={13} /> Share</button><button><FileText size={13} /> Export Excel</button><button className="reports-export"><Download size={13} /> Export PDF</button></div></div>
          <section className="reports-summary"><h2>Execution Summary</h2><div className="reports-metric-grid"><div className="reports-metric"><span className="reports-metric-icon blue"><FileText size={14} /></span><small>Total Issues Logged</small><strong>1,284</strong><em className="metric-up">+12%</em></div><div className="reports-metric"><span className="reports-metric-icon blue"><CalendarDays size={14} /></span><small>Avg. Resolution Time</small><strong>4.2 Days</strong><em className="metric-down">-0.5d</em></div><div className="reports-metric"><span className="reports-metric-icon blue"><CircleAlert size={14} /></span><small>Critical Blockers</small><strong>18</strong><em className="metric-down">-4</em></div><div className="reports-metric"><span className="reports-metric-icon blue"><TrendingUp size={14} /></span><small>Completion Rate</small><strong>88.4%</strong><em className="metric-up">+2.1%</em></div></div></section>
          <section className="reports-chart-card"><div className="reports-chart-heading"><div><h2>Historical Trend Analysis</h2><p>Visualizing open vs closed issues over the selected reporting window.</p></div><div><span>7 Day Average</span><button aria-label="Print report"><Printer size={13} /></button></div></div><div className="reports-chart"><div className="chart-y-axis"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div><svg viewBox="0 0 760 220" role="img" aria-label="Historical trend analysis chart"><defs><linearGradient id="reportArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ff5d5d" stopOpacity=".18" /><stop offset="1" stopColor="#ff5d5d" stopOpacity="0" /></linearGradient></defs><path className="chart-grid-line" d="M0 20H760 M0 65H760 M0 110H760 M0 155H760 M0 200H760" /><path className="chart-area" d="M0 105 C70 78 98 75 155 88 S230 100 280 70 S350 58 405 72 S480 95 535 130 S630 145 760 145 V200 H0 Z" /><path className="chart-open-line" d="M0 105 C70 78 98 75 155 88 S230 100 280 70 S350 58 405 72 S480 95 535 130 S630 145 760 145" /><path className="chart-closed-line" d="M0 145 C100 123 180 103 280 88 S390 78 470 55 S610 22 760 0" /></svg><div className="chart-x-axis"><span>Oct 01</span><span>Oct 08</span><span>Oct 15</span><span>Oct 22</span><span>Oct 29</span><span>Nov 05</span><span>Nov 12</span></div><div className="reports-chart-legend"><span><i className="open-dot" /> Open Issues</span><span><i className="closed-dot" /> Closed Issues</span></div></div></section>
          <section className="reports-table-section"><div className="reports-table-heading"><h2>Granular Data Table</h2><div><label><Search size={12} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter rows by ID or Title..." /></label><button>Columns <ChevronDown size={12} /></button></div></div><div className="reports-table-wrap"><div className="reports-table reports-table-header"><span>Issue ID</span><span>Subject / Description</span><span>Responsibility</span><span>Priority</span><span>Status</span><span>Log Date</span></div>{filteredRows.map((row) => <div className="reports-table" key={row.id}><span className="report-id">{row.id}</span><strong>{row.subject}</strong><span className="report-company">{row.company}</span><span><em className={`report-priority report-${row.priority.toLowerCase()}`}>{row.priority}</em></span><span><em className={`report-status report-status-${row.status.toLowerCase().replace(/ /g, '-')}`}>{row.status}</em></span><span>{row.date}</span></div>)}<div className="reports-table-footer"><span>Showing {filteredRows.length} of 1,284 issues matching report criteria.</span><div><button disabled>Previous</button><button className="current">1</button><button>2</button><button>3</button><button>Next</button></div></div></div></section>
          <aside className="reports-note"><FileText size={17} /><div><strong>Report Generation Note</strong><p>This preview represents a real-time snapshot of the database. Final exported PDFs will include full audit logs, signature blocks for verification, and attached photographic evidence for closed items.</p></div></aside>
        </div>
        <footer className="reports-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
      </main>
    </div>
  );
}

export default Reports;
