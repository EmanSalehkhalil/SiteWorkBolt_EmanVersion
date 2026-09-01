import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Bell, Check, ChevronDown, CircleCheck, CircleDot, Clock3, Download, FileText, Filter, History, List, MessageSquare, MoreVertical, Plus, Search, Settings2, ShieldCheck, Table2, UserRound, X } from 'lucide-react';

type ActivityStatus = 'Completed' | 'Returned' | 'In Progress';
type Activity = { id: string; title: string; description: string; status: ActivityStatus; user: string; role: string; date: string; tags: string[]; checklist: string; approved?: string; rejected?: string; unread?: string; };

const activities: Activity[] = [
  { id: 'CHG-2024-001', title: 'Main Breaker Installation - Section B', description: 'Successfully installed the 400A main breaker. Waiting for secondary inspection from the utility company.', status: 'Completed', user: 'Sarah Jenkins', role: 'Lead Electrical Engineer', date: '2024-05-20 10:30 AM', tags: ['GenSet-04 (Resolved 09:00 AM)', 'Power-Panel-B'], checklist: '2 Approved', approved: 'Completed' },
  { id: 'CHG-2024-002', title: 'HVAC Ducting Leakage Test', description: 'Conducted pressure test on newly installed ductwork in the server room. Minor leaks identified in joint 42-A.', status: 'Returned', user: 'Michael Chen', role: 'Mechanical Supervisor', date: '2024-05-20 11:15 AM', tags: ['Chiller-Unit-2 (Open)'], checklist: '2 Rejected', rejected: 'Returned', unread: '1 New Replies' },
  { id: 'CHG-2024-003', title: 'Foundation Slab Rebar Inspection', description: 'Rebar layout for Phase 2 foundation slab completed. Ready for structural engineer sign-off.', status: 'In Progress', user: 'Alex Rodriguez', role: 'Structural Lead', date: '2024-05-19 02:45 PM', tags: ['Excavator-XP', 'Concrete-Mixer-01'], checklist: '2 Approved', approved: 'In Progress' },
];

const metrics = [
  { label: 'TOTAL LOGS', value: '1,248', change: '+12%', icon: History, tone: 'blue' },
  { label: 'STARTED', value: '86', change: '+5%', icon: CircleDot, tone: 'dark' },
  { label: 'IN PROGRESS', value: '142', change: '-2%', icon: Clock3, tone: 'red' },
  { label: 'COMPLETED', value: '892', change: '+18%', icon: CircleCheck, tone: 'green' },
  { label: 'RETURNED', value: '24', change: '+4%', icon: AlertTriangle, tone: 'orange' },
  { label: 'OVERDUE', value: '12', change: '-30%', icon: AlertTriangle, tone: 'red' },
  { label: 'THIS WEEK', value: '156', change: '+20%', icon: Clock3, tone: 'gray' },
  { label: 'THIS MONTH', value: '642', change: '+8%', icon: History, tone: 'gray' },
];

function ChangeLog({ onBackToProject, onSignOut }: { onBackToProject: () => void; onSignOut: () => void }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'Timeline' | 'Table'>('Timeline');
  const [notice, setNotice] = useState('');
  const filtered = useMemo(() => activities.filter((item) => `${item.title} ${item.description} ${item.id} ${item.user}`.toLowerCase().includes(query.toLowerCase())), [query]);

  function notify(message: string): void { setNotice(message); window.setTimeout(() => setNotice(''), 2200); }

  return <div className="activity-screen">
    <header className="activity-header">
      <button className="activity-brand" onClick={onBackToProject}><span className="activity-logo"><span /></span><strong>SiteSphere <em>Pro</em></strong></button>
      <div className="activity-title"><h1>Change Log <small>v2.4</small></h1><button onClick={onBackToProject}>Project Alpha Expansion <ChevronDown size={12} /></button><span>›</span><small>Zone 4-B Industrial</small></div>
      <div className="activity-updated"><small>LAST UPDATED</small><strong>Today, 11:42 AM</strong></div>
      <div className="activity-header-actions"><button onClick={() => notify('Exporting change log')}><Download size={13} /> Export Logs</button><button onClick={() => notify('Report generation started')}><FileText size={13} /> Generate Report</button><button className="activity-primary" onClick={() => notify('New log entry opened')}><Plus size={14} /> Add Log Entry</button><button className="activity-notification" aria-label="Notifications"><Bell size={16} /><i /></button><span className="activity-avatar">AC</span><button className="activity-menu" aria-label="Account menu"><MoreVertical size={16} /></button></div>
    </header>

    <main className="activity-content">
      <section className="activity-metrics">{metrics.map(({ label, value, change, icon: Icon, tone }) => <article className="activity-metric" key={label}><div className="activity-metric-top"><span className={`activity-metric-icon ${tone}`}><Icon size={13} /></span><em className={change.startsWith('-') ? 'negative' : ''}>{change}</em></div><small>{label}</small><strong>{value}</strong></article>)}</section>

      <section className="activity-filters">
        <label className="activity-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Global search across all log parameters..." /></label>
        <button className="filter-chip danger" onClick={() => notify('Showing equipment issues')}><AlertTriangle size={13} /> Has Equipment Issues</button><button className="filter-chip blue" onClick={() => notify('Showing unread replies')}><MessageSquare size={13} /> Has Unread Replies</button><button className="filter-chip orange" onClick={() => notify('Showing checklist rejections')}><CircleCheck size={13} /> Checklist: Has Rejections</button>
        <div className="activity-filter-row"><button>Status: All <ChevronDown size={11} /></button><button>Phase: All <ChevronDown size={11} /></button><button>Discipline: All <ChevronDown size={11} /></button><button>Equipment: All <ChevronDown size={11} /></button><button>Category: All <ChevronDown size={11} /></button><button>Priority: All <ChevronDown size={11} /></button></div>
      </section>

      <section className="activity-workspace">
        <div className="activity-stream">
          <div className="activity-stream-heading"><div><h2><List size={15} /> Project Activity Stream</h2><p>Showing {filtered.length * 14} filtered results out of 1,248 total entries.</p></div><div className="activity-view-toggle"><button className={view === 'Timeline' ? 'active' : ''} onClick={() => setView('Timeline')}><List size={12} /> Timeline</button><button className={view === 'Table' ? 'active' : ''} onClick={() => setView('Table')}><Table2 size={12} /> Table</button></div></div>
          {view === 'Timeline' ? <div className="activity-timeline">{filtered.map((item, index) => <article className="activity-card" key={item.id}><div className={`activity-marker marker-${item.status.toLowerCase().replace(' ', '-')}`}>{item.status === 'Returned' ? <AlertTriangle size={15} /> : item.status === 'Completed' ? <Check size={14} /> : <Clock3 size={14} />}</div><div className="activity-card-content"><div className="activity-card-top"><span>{item.id}</span>{item.unread && <b className="reply-pill">{item.unread}</b>}<strong>{item.status}</strong></div><h3>{item.title}</h3><p>{item.description}</p><div className="activity-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="activity-checklist"><span>CHECKLIST:</span><b className={item.rejected ? 'check-rejected' : ''}>{item.checklist}</b>{item.rejected && <b className="check-na">1 N/A</b>}</div><div className="activity-author"><span className="author-avatar">{item.user.split(' ').map((name) => name[0]).join('')}</span><div><strong>{item.user}</strong><small>{item.role} • {item.date}</small></div><button onClick={() => notify(`Viewing details for ${item.id}`)}><List size={12} /> Details</button><MoreVertical size={15} /></div></div></article>)}</div> : <div className="activity-table">{filtered.map((item) => <div key={item.id}><span>{item.id}</span><strong>{item.title}</strong><em>{item.status}</em><small>{item.user}</small></div>)}</div>}
          <button className="activity-load" onClick={() => notify('Loading previous activities')}><History size={13} /> Load Previous Activities</button>
        </div>

        <aside className="activity-insights"><h2><BarChart3 size={15} /> Activity Insights</h2><section><h3>STATUS DISTRIBUTION</h3><div className="activity-donut"><span /></div><div className="activity-legend"><span><i className="legend-completed" />Completed <b>71%</b></span><span><i className="legend-progress" />In Progress <b>11%</b></span><span><i className="legend-started" />Started <b>7%</b></span><span><i className="legend-returned" />Returned <b>4%</b></span></div></section><section><h3>MONTHLY ACTIVITY TREND</h3><div className="activity-chart"><svg viewBox="0 0 300 130" role="img" aria-label="Monthly activity trend"><path d="M12 108 C40 118, 58 118, 75 108 S120 75, 145 66 S194 52, 220 37 S263 16, 290 5" /><circle cx="12" cy="108" r="2.5" /><circle cx="75" cy="108" r="2.5" /><circle cx="145" cy="66" r="2.5" /><circle cx="220" cy="37" r="2.5" /><circle cx="290" cy="5" r="2.5" /></svg><div><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div></section><section className="recent-interactions"><h2><MessageSquare size={14} /> Recent Interactions</h2>{['Sarah J. added a comment on CHG-2024-001', 'System marked overdue CHG-2024-005', 'Michael C. reopened log CHG-2024-002', 'Alex R. completed rebar audit CHG-2024-003'].map((item, index) => <p key={item}><span className={`interaction-avatar avatar-${index}`}>{['SJ', 'SY', 'MC', 'AR'][index]}</span><strong>{item}<small>{index === 0 ? '2m ago' : index === 1 ? '15m ago' : index === 2 ? '1h ago' : '3h ago'}</small></strong></p>)}<button className="view-feed" onClick={() => notify('Opening full activity feed')}>View Full Feed</button></section><section className="review-card"><span><UserRound size={17} /></span><strong>Review Required?</strong><p>Senior Management accounts have the authority to bypass "Returned" states and finalize logs manually.</p><button onClick={() => notify('High-level review requested')}>Request High-Level Review</button></section></aside>
      </section>
    </main>
    <footer className="activity-footer"><strong>SiteSphere Pro v2.4.1 Build 20240520</strong><div><span><FileText size={10} /> API Documentation</span><span><ShieldCheck size={10} /> Security Policy</span></div><div><span>System Operational</span><span>© 2024 SiteSphere Industrial Systems LLC.</span></div></footer>
    {notice && <div className="activity-toast">{notice}</div>}
  </div>;
}

export default ChangeLog;


