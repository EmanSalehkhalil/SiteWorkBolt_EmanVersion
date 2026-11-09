import { useState } from 'react';
import { Bell, CircleCheck as CheckCircle2, ChevronDown, ChevronRight, CircleAlert, ClipboardCheck, FileText, ChartBar as FileBarChart, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, MoveHorizontal as MoreHorizontal, Paperclip, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, TestTube as TestTube2, UserRound, Users, Wrench, X } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

type Issue = { id: string; title: string; priority: 'Critical' | 'High' | 'Medium' | 'Low'; status: 'Open' | 'In Progress' | 'Under Review' | 'Closed'; assignee: string; initials: string; product: string; phase: string };

const issues: Issue[] = [
  { id: 'ISS-4201', title: 'L3 CRAC Unit #4', priority: 'Critical', status: 'Open', assignee: 'Mark Wilson', initials: 'MW', product: 'Cooling', phase: 'L3 - Functional Testing' },
  { id: 'ISS-4198', title: 'Incorrect label', priority: 'Medium', status: 'In Progress', assignee: 'Sarah Chen', initials: 'SC', product: 'MV', phase: 'L2 - Pre-Functional' },
  { id: 'ISS-4195', title: 'Emergency Lighting', priority: 'High', status: 'Under Review', assignee: 'David Miller', initials: 'DM', product: 'LV', phase: 'L4 - Performance' },
  { id: 'ISS-4190', title: 'Missing Fire Damper', priority: 'Low', status: 'Closed', assignee: 'Elena Rodriguez', initials: 'ER', product: 'Cooling', phase: 'L1 - Installation' },
  { id: 'ISS-4185', title: 'Grounding', priority: 'High', status: 'In Progress', assignee: 'Mark Wilson', initials: 'MW', product: 'Cooling', phase: 'L2 - Pre-Functional' },
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
    { label: 'HSE', icon: ShieldCheck },
  { label: 'Issues', icon: CircleAlert, active: true },
  // { label: 'Checklist Stats', icon: ClipboardCheck },
  { label: 'Checklist', icon: FolderKanban },
  // { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function Issues({ onBackToProject, onSignOut, onReportIssue, onNavigate }: { onBackToProject: () => void; onSignOut: () => void; onReportIssue: () => void; onNavigate: (destination: MainNavigationTarget) => void }) {
  const [selectedIssue, setSelectedIssue] = useState<Issue>(issues[0]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [resolved, setResolved] = useState(false);

  return <div className="issues-screen">
    <aside className="issues-sidebar">
      <button className="issues-brand" onClick={onBackToProject}><span className="issues-brand-mark"><span /></span><strong>SiteSphere</strong><ChevronRight size={15} /></button>
      <div className="issues-sidebar-label">MAIN NAVIGATION</div>
      <nav className="issues-nav">{navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={15} /><span>{label}</span></button>)}</nav>
      <div className="issues-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={15} /> Switch Project</button><button onClick={onSignOut}><LogOut size={15} /> Sign Out</button></div>
    </aside>

    <div className="issues-main">
      <header className="issues-topbar"><button className="issues-mobile-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="issues-project" onClick={onBackToProject}><FolderKanban size={13} /> Data Center Alpha</button><ChevronRight className="issues-project-arrow" size={13} /><label className="issues-global-search"><Search size={13} /><input placeholder="Search site data..." /></label><div className="issues-user"><button aria-label="Notifications"><Bell size={16} /><i /></button><span /><div><strong>Alex Construction</strong><small>Project Manager</small></div><b>AC</b></div></header>

      <main className="issues-content"><div className="issues-page-heading"><div><h1><CircleAlert size={17} /> Issues Management</h1></div><label className="issues-search"><Search size={13} /><input placeholder="Search issues, IDs, or users..." /></label><div className="issues-heading-actions"><button onClick={() => setFilterOpen(!filterOpen)}><SlidersHorizontal size={13} /> Filters</button><button>Sort <ChevronDown size={12} /></button><button className="issues-add" onClick={onReportIssue}><Plus size={13} /> Report Issue</button></div></div>{filterOpen && <div className="issues-filter-popover"><strong>Filter issues</strong><button>Priority <ChevronDown size={12} /></button><button>Status <ChevronDown size={12} /></button><button>Assignee <ChevronDown size={12} /></button></div>}

        <div className="issues-workspace"><section className="issues-table-panel"><div className="issues-table"><div className="issues-table-head"><span>Issue<br />ID</span><span>Title</span><span>Priority</span><span>Status</span><span>Assignee</span><span>Package</span><span>Phase</span></div>{issues.map((issue) => <button className={`issues-row ${selectedIssue.id === issue.id ? 'selected' : ''}`} key={issue.id} onClick={() => { setSelectedIssue(issue); setResolved(issue.status === 'Closed'); }}><span className="issue-id">{issue.id.replace('-', '-\n')}</span><span className="issue-title">{issue.title}</span><span><em className={`priority priority-${issue.priority.toLowerCase()}`}>{issue.priority}</em></span><span><em className={`issue-status status-${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</em></span><span className="issue-assignee"><i>{issue.initials}</i>{issue.assignee}</span><span>{issue.product}</span><span>{issue.phase}</span></button>)}</div><div className="issues-pagination"><span>Showing 5 of 128 issues</span><div><button>Previous</button><button>Next <ChevronRight size={12} /></button></div></div></section>

          <aside className="issue-detail-panel"><div className="issue-detail-heading"><span>{selectedIssue.id}</span><strong>{selectedIssue.title}</strong><button><MoreHorizontal size={14} /></button><button><X size={14} /></button></div><nav className="issue-detail-tabs"><button className="active">Overview</button><button>Comments <b>3</b></button><button>Media</button><button>History</button></nav><div className="issue-detail-body"><div className="detail-status-line"><div><small>STATUS</small><em className={`issue-status status-${resolved ? 'closed' : 'open'}`}>{resolved ? 'Closed' : selectedIssue.status}</em></div><div><small>PRIORITY</small><em className={`priority priority-${selectedIssue.priority.toLowerCase()}`}>{selectedIssue.priority}</em></div></div><div className="detail-description"><small>DESCRIPTION</small><p>The Modbus gateway for CRAC Unit #4 is not responding to polling requests from the BMS. Possible cabling issue or gateway configuration error.</p></div><div className="detail-pair-grid"><div><small>ASSIGNEE</small><strong><i>{selectedIssue.initials}</i>{selectedIssue.assignee}</strong><a>Change</a></div><div><small>PRODUCT</small><strong>{selectedIssue.product}</strong><span>Equipment Group</span></div></div><dl><div><dt>Phase</dt><dd>{selectedIssue.phase}</dd></div><div><dt>Created Date</dt><dd>2024-10-12</dd></div><div><dt>Reported By</dt><dd><i>AC</i> Alex Construction</dd></div></dl><div className="issue-detail-actions"><button className="resolve-button" onClick={() => setResolved(true)}><CheckCircle2 size={12} /> Mark as Resolved</button><button><UserRound size={12} /> Reassign</button></div></div><footer><span><Paperclip size={10} /> Last updated Oct 14, 2:45 PM</span><span>↻ Full Audit Log</span></footer></aside></div></main>
      <footer className="issues-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
    </div>
  </div>;
}

export default Issues;
