import { useMemo, useState } from 'react';
import {
  Bell, CalendarDays, ClipboardCheck, FolderKanban, History, LayoutDashboard,
  LogOut, Menu, Search, Settings2, ShieldCheck, Users, Wrench, Zap, Flag,
  CircleAlert, FileText, ChevronLeft, Users as UsersIcon, CircleCheck, Cog, Clock,
} from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

// ---------- Static domain data (mirrors the HTML demo) ----------
const SEGMENTS = ['Electrical', 'Automation', 'Mechanical', 'Project Management Support'];
const DOMAINS = ['Power Systems', 'Secure Power'];
const PROFILES = ['Site Manager', 'Quality Manager', 'Commissioning Engineer', 'Electrical Technician', 'Mechanical Technician', 'Automation Engineer', 'Project Coordinator', 'HSE Officer', 'Other'];
const GROUPS = ['Mechanical', 'Electrical', 'Automation'];
type EquipItem = { id: string; n: string; g: string };
const EQUIP: EquipItem[] = [
  { id: 'CH-01', n: 'Chiller CH-01', g: 'Mechanical' }, { id: 'CT-01', n: 'Cooling Tower CT-01', g: 'Mechanical' },
  { id: 'P-101', n: 'Pump Skid P-101', g: 'Mechanical' }, { id: 'AHU-02', n: 'Air Handler AHU-02', g: 'Mechanical' },
  { id: 'MVS-01', n: 'MV Switchgear MVS-01', g: 'Electrical' }, { id: 'LVS-02', n: 'LV Switchboard LVS-02', g: 'Electrical' },
  { id: 'TR-01', n: 'Transformer TR-01', g: 'Electrical' }, { id: 'UPS-01', n: 'UPS Module UPS-01', g: 'Electrical' },
  { id: 'PLC-01', n: 'PLC Panel PLC-01', g: 'Automation' }, { id: 'SCD-01', n: 'SCADA Server SCD-01', g: 'Automation' },
  { id: 'BMS-01', n: 'BMS Controller BMS-01', g: 'Automation' }, { id: 'PR-01', n: 'Protection Relay PR-01', g: 'Automation' },
];
const ACCESS: Record<string, string[]> = {
  Mechanical: ['Mechanical'],
  Electrical: ['Electrical'],
  Automation: ['Automation'],
  'Project Management Support': ['Mechanical', 'Electrical', 'Automation'],
};
const PROJECT = { days: 5, hrs: 8 };
type SchedKey = 'default' | '5x8' | '5x10' | '6x8' | '6x10';
const OPTIONS: { k: SchedKey; days?: number; hrs?: number }[] = [
  { k: 'default' }, { k: '5x8', days: 5, hrs: 8 }, { k: '5x10', days: 5, hrs: 10 },
  { k: '6x8', days: 6, hrs: 8 }, { k: '6x10', days: 6, hrs: 10 },
];
const optLabel = (o: { k: SchedKey; days?: number; hrs?: number }) => o.k === 'default'
  ? `Project standard (${PROJECT.days * PROJECT.hrs} h)` : `${o.days} d × ${o.hrs} h`;
const schedOf = (k: SchedKey) => {
  const o = OPTIONS.find((x) => x.k === k) || OPTIONS[0];
  return o.k === 'default' ? { days: PROJECT.days, hrs: PROJECT.hrs } : { days: o.days!, hrs: o.hrs! };
};
const empWeek = (e: Employee) => (e.active ? schedOf(e.sched).days * schedOf(e.sched).hrs : 0);
const schedLabel = (e: Employee) => e.sched === 'default' ? 'Project standard' : `${schedOf(e.sched).days} d × ${schedOf(e.sched).hrs} h`;

type Employee = {
  id: number; sched: SchedKey; name: string; email: string; type: 'Schneider Electric' | 'Subcontractor';
  sesa: string; company: string; job: string; segment: string; profile: string; domain: string;
  eq: string[]; active: boolean;
};
type TsEntry = { from: string; to: string; hours: number; off: boolean };

const seedEmployees: Employee[] = [
  { id: 1, sched: 'default', name: 'Karen Maged', email: 'karen.maged@se.com', type: 'Schneider Electric', sesa: 'SESA812345', company: '', job: 'WO-13576612', segment: 'Project Management Support', profile: 'Site Manager', domain: 'Power Systems', eq: EQUIP.map((e) => e.id), active: true },
  { id: 2, sched: '6x10', name: 'Ahmed Elshahat', email: 'ahmed.elshahat@se.com', type: 'Schneider Electric', sesa: 'SESA759801', company: '', job: 'WO-13576612', segment: 'Electrical', profile: 'Commissioning Engineer', domain: 'Power Systems', eq: ['MVS-01', 'LVS-02', 'TR-01'], active: true },
  { id: 3, sched: '6x8', name: 'Omar Fathy', email: 'omar.fathy@coolserve.com', type: 'Subcontractor', sesa: '', company: 'CoolServe Mechanical', job: 'WO-13576612', segment: 'Mechanical', profile: 'Mechanical Technician', domain: 'Secure Power', eq: ['CH-01', 'CT-01', 'P-101'], active: true },
  { id: 4, sched: 'default', name: 'Doha Aboubakr', email: 'doha.aboubakr@se.com', type: 'Schneider Electric', sesa: 'SESA640221', company: '', job: 'WO-13576612', segment: 'Automation', profile: 'Automation Engineer', domain: 'Secure Power', eq: ['PLC-01', 'SCD-01', 'BMS-01'], active: true },
  { id: 5, sched: '5x10', name: 'Youssef Nabil', email: 'y.nabil@voltpro.com', type: 'Subcontractor', sesa: '', company: 'VoltPro Contracting', job: 'WO-13576612', segment: 'Electrical', profile: 'Electrical Technician', domain: 'Power Systems', eq: ['UPS-01', 'LVS-02'], active: false },
  { id: 6, sched: 'default', name: 'Mariam Adel', email: 'mariam.adel@se.com', type: 'Schneider Electric', sesa: 'SESA700918', company: '', job: 'WO-13576612', segment: 'Mechanical', profile: 'Quality Manager', domain: 'Power Systems', eq: ['AHU-02', 'P-101'], active: true },
];
const seedTs: Record<number, TsEntry[]> = {
  1: [{ from: '2026-10-26', to: '2026-10-30', hours: 40, off: false }],
  2: [{ from: '2026-10-26', to: '2026-10-31', hours: 43, off: false }],
  3: [{ from: '2026-10-26', to: '2026-10-27', hours: 16, off: false }, { from: '2026-10-28', to: '2026-10-28', hours: 0, off: true }, { from: '2026-10-29', to: '2026-10-31', hours: 24, off: false }],
  4: [{ from: '2026-10-26', to: '2026-10-29', hours: 32, off: false }, { from: '2026-10-30', to: '2026-10-30', hours: 0, off: true }],
  6: [{ from: '2026-10-26', to: '2026-10-30', hours: 40, off: false }],
};

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
  { label: 'Issues', icon: CircleAlert },
  { label: 'Company Checklists', icon: FolderKanban },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: ClipboardCheck },
  { label: 'Personas', icon: Users, active: true },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

const fmt = (k: string) => {
  const [a, b, c] = k.split('-').map(Number);
  return new Date(a, b - 1, c).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const parse = (s: string) => {
  const [a, b, c] = s.split('-').map(Number);
  return new Date(a, b - 1, c);
};
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const isWorkDay = (d: Date, days: number) => { const w = d.getDay(); return w >= 1 && w <= days; };

type RangeInfo = { days: number; planned: number };
const rangeInfo = (from: string, to: string, off: boolean, emp: Employee): RangeInfo => {
  const sc = schedOf(emp.sched); let days = 0; let planned = 0;
  for (let d = parse(from); d <= parse(to); d.setDate(d.getDate() + 1)) { days++; if (isWorkDay(d, sc.days)) planned += sc.hrs; }
  return { days, planned: emp.active && !off ? planned : 0 };
};

function Personas({ onBackToProject, onNavigate, onSignOut }: { onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  const [emps, setEmps] = useState<Employee[]>(seedEmployees);
  const [ts, setTs] = useState<Record<number, TsEntry[]>>(seedTs);
  const [nextId, setNextId] = useState(7);
  const [query, setQuery] = useState('');
  const [fType, setFType] = useState('');
  const [fSeg, setFSeg] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [toast, setToast] = useState('');
  const [empModal, setEmpModal] = useState(false);
  const [tsModal, setTsModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [tsEmpId, setTsEmpId] = useState<number | null>(null);

  // form state
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fSesa, setFSesa] = useState('');
  const [fCompany, setFCompany] = useState('');
  const [fJob, setFJob] = useState('');
  const [fSegment, setFSegment] = useState('');
  const [fProfile, setFProfile] = useState('');
  const [fOther, setFOther] = useState('');
  const [fDomain, setFDomain] = useState('');
  const [fTypeVal, setFTypeVal] = useState<'Schneider Electric' | 'Subcontractor'>('Schneider Electric');
  const [fActive, setFActive] = useState(true);
  const [fSched, setFSched] = useState<SchedKey>('default');
  const [fEq, setFEq] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // timesheet state
  const [tsFrom, setTsFrom] = useState('');
  const [tsTo, setTsTo] = useState('');
  const [tsHours, setTsHours] = useState('');
  const [tsOff, setTsOff] = useState(false);

  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2200); };

  const filtered = useMemo(() => emps.filter((e) => {
    const t = fType === '' || e.type === fType;
    const s = fSeg === '' || e.segment === fSeg;
    const st = fStatus === '' || (e.active ? 'Active' : 'Inactive') === fStatus;
    const q = query === '' || [e.name, e.email, e.sesa, e.company, e.job].join(' ').toLowerCase().includes(query.toLowerCase());
    return t && s && st && q;
  }), [emps, fType, fSeg, fStatus, query]);

  const kTotal = emps.length;
  const kActive = emps.filter((e) => e.active).length;
  const kSE = emps.filter((e) => e.type === 'Schneider Electric').length;
  const kSub = emps.filter((e) => e.type === 'Subcontractor').length;
  const kHrs = emps.reduce((a, e) => a + empWeek(e), 0);

  // ---------- Add/Edit ----------
  const openEmp = (id: number | null) => {
    const e = id ? emps.find((x) => x.id === id) ?? null : null;
    setEditing(e);
    setFName(e?.name ?? '');
    setFEmail(e?.email ?? '');
    setFSesa(e?.sesa ?? '');
    setFCompany(e?.company ?? '');
    setFJob(e?.job ?? '');
    setFSegment(e?.segment ?? '');
    setFProfile(e && PROFILES.includes(e.profile) ? e.profile : e ? 'Other' : '');
    setFOther(e && !PROFILES.includes(e.profile) ? e.profile : '');
    setFDomain(e?.domain ?? '');
    setFTypeVal(e?.type ?? 'Schneider Electric');
    setFActive(e?.active ?? true);
    setFSched(e?.sched ?? 'default');
    setFEq(e ? [...e.eq] : []);
    setErrors({});
    setEmpModal(true);
  };

  const onSegment = (seg: string) => {
    setFSegment(seg);
    const allowed = ACCESS[seg] || [];
    setFEq((prev) => prev.filter((id) => allowed.includes(EQUIP.find((e) => e.id === id)!.g)));
  };

  const toggleEq = (id: string) => setFEq((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const allowedGroups = (seg: string) => ACCESS[seg];

  const saveEmp = () => {
    const errs: Record<string, boolean> = {};
    if (!fName.trim()) errs.fName = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEmail.trim())) errs.fEmail = true;
    if (fTypeVal === 'Schneider Electric' && !fSesa.trim()) errs.fSesa = true;
    if (fTypeVal === 'Subcontractor' && !fCompany.trim()) errs.fCompany = true;
    if (!/^WO-\d{6,}$/i.test(fJob.trim())) errs.fJob = true;
    if (!fSegment) errs.fSegment = true;
    if (!fProfile) errs.fProfile = true;
    if (fProfile === 'Other' && !fOther.trim()) errs.fOther = true;
    if (!fDomain) errs.fDomain = true;
    setErrors(errs);
    if (Object.keys(errs).length) { showToast('Please complete the highlighted fields'); return; }
    const rec: Employee = {
      id: editing?.id ?? nextId,
      name: fName.trim(),
      email: fEmail.trim(),
      type: fTypeVal,
      sesa: fTypeVal === 'Schneider Electric' ? fSesa.trim().toUpperCase() : '',
      company: fTypeVal === 'Subcontractor' ? fCompany.trim() : '',
      job: fJob.trim().toUpperCase(),
      segment: fSegment,
      profile: fProfile === 'Other' ? fOther.trim() : fProfile,
      domain: fDomain,
      eq: [...fEq],
      active: fActive,
      sched: fSched,
    };
    if (editing) setEmps((prev) => prev.map((e) => (e.id === editing.id ? rec : e)));
    else { setEmps((prev) => [...prev, rec]); setNextId((n) => n + 1); }
    setEmpModal(false);
    showToast(editing ? 'Employee updated' : `Employee added – planned hours: ${empWeek(rec)} h/week`);
  };

  // ---------- Timesheet ----------
  const tsEmp = tsEmpId !== null ? emps.find((e) => e.id === tsEmpId) ?? null : null;
  const tsList = tsEmp ? ts[tsEmp.id] || [] : [];

  const conflictsOf = (f: string, t: string) => tsList.filter((e) => !(t < e.from || f > e.to));

  const lastEnd = () => { const l = tsList; return l.length ? l.map((e) => e.to).sort().pop()! : null; };
  const nextDay = (k: string) => { const d = parse(k); d.setDate(d.getDate() + 1); return iso(d); };

  const openTs = (id: number) => {
    setTsEmpId(id);
    setTsFrom(''); setTsTo(''); setTsHours(''); setTsOff(false);
    const e = emps.find((x) => x.id === id)!;
    if (e.active && lastEnd()) setTsFrom(nextDay(lastEnd()!));
    setTsModal(true);
  };

  const quick = (k: 'last' | 'this' | '2w' | 'month') => {
    const now = new Date(2026, 10, 1); now.setHours(0, 0, 0, 0);
    const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    let a: Date; let z: Date;
    if (k === 'this') { a = mon; z = new Date(mon); z.setDate(mon.getDate() + 6); }
    else if (k === 'last') { a = new Date(mon); a.setDate(mon.getDate() - 7); z = new Date(mon); z.setDate(mon.getDate() - 1); }
    else if (k === '2w') { a = new Date(mon); a.setDate(mon.getDate() - 14); z = new Date(mon); z.setDate(mon.getDate() - 1); }
    else { a = new Date(now.getFullYear(), now.getMonth(), 1); z = new Date(now.getFullYear(), now.getMonth() + 1, 0); }
    setTsFrom(iso(a)); setTsTo(iso(z));
  };

  const tsPreview: { warn: boolean; text: React.ReactNode; blocked: boolean } = { warn: false, text: '', blocked: false };
  if (tsEmp && !tsEmp.active) { tsPreview.warn = true; tsPreview.text = 'Inactive – planned hours are 0.'; }
  else if (!tsFrom || !tsTo) { tsPreview.text = (<span>① Pick the dates → ② Type the hours worked → ③ Press <b>Save</b>.</span>); }
  else if (parse(tsTo) < parse(tsFrom)) { tsPreview.warn = true; tsPreview.text = "'To date' must be on or after 'From date'."; }
  else if (tsEmp) {
    const r = rangeInfo(tsFrom, tsTo, tsOff, tsEmp);
    const cf = conflictsOf(tsFrom, tsTo);
    if (cf.length) {
      tsPreview.warn = true; tsPreview.blocked = true;
      tsPreview.text = (<span><b>⚠ Date collision.</b> These dates overlap {cf.length > 1 ? cf.length + ' existing entries' : 'an existing entry'}:<br />{cf.map((e) => fmt(e.from) + ' → ' + fmt(e.to) + ' (' + (e.off ? 'OFF' : e.hours + ' h') + ')').join(', ')}<br />Please delete the existing entry first or change the dates.</span>);
    } else {
      const h = parseFloat(tsHours);
      tsPreview.text = (<span>{fmt(tsFrom)} → {fmt(tsTo)} · <b>{r.days} day{r.days > 1 ? 's' : ''}</b> · Planned hours: <b>{r.planned} h</b>{tsOff ? ' (OFF – planned hours set to 0)' : (r.planned ? <> · Enter up to <b>{r.planned} h</b></> : '')}{!tsOff && !isNaN(h) ? <> · Variance: <b>{(h - r.planned > 0 ? '+' : '')}{h - r.planned} h</b></> : ''}</span>);
    }
  }

  const tsTotals = tsList.reduce((acc, e) => {
    const r = rangeInfo(e.from, e.to, e.off, tsEmp!);
    acc.P += r.planned; acc.A += e.hours; if (e.off) acc.O++;
    return acc;
  }, { P: 0, A: 0, O: 0 });

  const addEntry = () => {
    if (!tsEmp || !tsEmp.active) return;
    if (!tsFrom) { showToast('Pick a From date'); return; }
    let t = tsTo; if (!t) t = tsFrom; setTsTo(t);
    if (parse(t) < parse(tsFrom)) { showToast("'To date' must be on or after 'From date'"); return; }
    if (!tsOff && (tsHours === '' || parseFloat(tsHours) < 0)) { showToast('Write the hours worked or tick OFF'); return; }
    if (conflictsOf(tsFrom, t).length) { showToast('Dates overlap – delete the existing entry first'); return; }
    const entry: TsEntry = { from: tsFrom, to: t, off: tsOff, hours: tsOff ? 0 : parseFloat(tsHours) };
    const list = [...(ts[tsEmp.id] || []), entry].sort((a, b) => (a.from < b.from ? -1 : 1));
    setTs((prev) => ({ ...prev, [tsEmp.id]: list }));
    setTsFrom(nextDay(t)); setTsTo(''); setTsHours(''); setTsOff(false);
    showToast(`Saved – ${tsOff ? 'OFF' : entry.hours + ' h'} for ${fmt(tsFrom)} → ${fmt(t)}`);
  };

  const delEntry = (i: number) => {
    if (!tsEmp) return;
    setTs((prev) => {
      const list = [...(prev[tsEmp.id] || [])];
      list.splice(i, 1);
      return { ...prev, [tsEmp.id]: list };
    });
    showToast('Entry deleted');
  };

  return (
    <div className="ppl-screen">
      <aside className="ppl-side">
        <button className="ppl-brand" onClick={onBackToProject}>
          <i><svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4-8 4zM4 12l8 4 8-4M4 16l8 4 8-4" /></svg></i>
          SiteSphere
        </button>
        <div className="ppl-navlbl">MAIN NAVIGATION</div>
        <nav className="ppl-nav">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button className={active ? 'on' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="ppl-side-bottom">
          <button onClick={() => showToast('Demo only')}><Settings2 size={18} /> Switch Project</button>
          <button onClick={onSignOut}><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>

      <div className="ppl-main">
        <header className="ppl-topbar">
          <div className="ppl-crumb">
            <FolderKanban size={16} /> Data Center Alpha <span className="ppl-crumb-sep">›</span>
          </div>
          <div className="ppl-tright">
            <div className="ppl-tsearch">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              <input placeholder="Search site data..." />
            </div>
            <button className="ppl-bell" aria-label="Notifications"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg></button>
            <div className="ppl-who">
              <div><b>Marcus Thorne</b><small>Project Manager</small></div>
              <div className="ppl-av">MT</div>
            </div>
          </div>
        </header>

        <main className="ppl-content">
          <div className="ppl-ph">
            <div>
              <div className="ppl-tags">
                <button className="ppl-back" onClick={onBackToProject} aria-label="Back"><ChevronLeft size={14} /></button>
                <span>Project access</span>
                <span className="ppl-ref">REF: DC-ALPHA-SE-092</span>
              </div>
              <h1>Personas</h1>
            </div>
            <div className="ppl-acts">
              <button className="ppl-btn p" onClick={() => openEmp(null)}>+ Add Employee</button>
            </div>
          </div>

          <section className="ppl-card">
            <h2>Project default schedule</h2>
            <div className="ppl-row">
              <div><span className="ppl-sub-t">Working days / week</span><div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{PROJECT.days} days</div></div>
              <div><span className="ppl-sub-t">Working hours / day</span><div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{PROJECT.hrs} hours</div></div>
              <div><span className="ppl-sub-t">Project default planned hours / week</span><div className="ppl-planned" style={{ marginTop: 4 }}>{PROJECT.days * PROJECT.hrs} h</div></div>
              <div className="ppl-sub-t" style={{ maxWidth: 340 }}>Set once at project level. New employees inherit it unless a different schedule is chosen for them.</div>
            </div>
          </section>

          <section className="ppl-kpis">
            <div className="ppl-kpi"><div className="ppl-ico b"><UsersIcon size={20} /></div><span>Total personas</span><b>{kTotal}</b></div>
            <div className="ppl-kpi"><div className="ppl-ico g"><CircleCheck size={20} /></div><span>Active</span><b>{kActive}</b></div>
            <div className="ppl-kpi"><div className="ppl-ico b"><Cog size={20} /></div><span>Schneider employees</span><b>{kSE}</b></div>
            <div className="ppl-kpi"><div className="ppl-ico o"><Wrench size={20} /></div><span>Subcontractors</span><b>{kSub}</b></div>
            <div className="ppl-kpi"><div className="ppl-ico p"><Clock size={20} /></div><span>Planned h / week</span><b>{kHrs}</b></div>
          </section>

          <section className="ppl-card">
            <h2>People with access</h2>
            <div className="ppl-toolbar">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, SESA, company…" />
              <select value={fType} onChange={(e) => setFType(e.target.value)}><option value="">All types</option><option>Schneider Electric</option><option>Subcontractor</option></select>
              <select value={fSeg} onChange={(e) => setFSeg(e.target.value)}><option value="">All segments</option>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</select>
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select>
            </div>
            <div className="ppl-table-wrap">
              <table className="ppl-table">
                <thead><tr><th>Employee</th><th>Type</th><th>Job Ref / SO #</th><th>Segment</th><th>Job profile</th><th>Domain</th><th>Equipment</th><th>Status</th><th>Planned h/wk</th><th></th></tr></thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id}>
                      <td><b>{e.name}</b><div className="ppl-sub-t">{e.email}</div></td>
                      <td><span className={`ppl-pill ${e.type === 'Subcontractor' ? 'sub' : 'se'}`}>{e.type}</span><div className="ppl-sub-t">{e.type === 'Subcontractor' ? e.company : e.sesa}</div></td>
                      <td>{e.job}</td>
                      <td>{e.segment}</td>
                      <td>{e.profile}</td>
                      <td>{e.domain}</td>
                      <td>{e.eq.length} / {EQUIP.length}</td>
                      <td><span className={`ppl-pill ${e.active ? 'act' : 'ina'}`}>{e.active ? 'Active' : 'Inactive'}</span></td>
                      <td><b>{empWeek(e)} h</b><div className="ppl-sub-t">{e.active ? schedLabel(e) : 'Inactive'}</div></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="ppl-btn s sm" onClick={() => openTs(e.id)}>Timesheet</button>{' '}
                        <button className="ppl-btn s sm" onClick={() => openEmp(e.id)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={10} className="ppl-sub-t" style={{ textAlign: 'center', padding: 24 }}>No employees match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Add / Edit Employee modal */}
      {empModal && (
        <div className="ppl-modal-bg show">
          <div className="ppl-modal">
            <div className="ppl-mh"><h3>{editing ? 'Edit Employee' : 'Add Employee'}</h3><button className="ppl-x" onClick={() => setEmpModal(false)}>×</button></div>
            <div className="ppl-mb">
              <div className="ppl-grid">
                <div className="ppl-field"><label>Employee name <span className="req">*</span></label><input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Ahmed Hassan" className={errors.fName ? 'err' : ''} />{errors.fName && <div className="ppl-err on">Required</div>}</div>
                <div className="ppl-field"><label>Employee email <span className="req">*</span></label><input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="name@company.com" className={errors.fEmail ? 'err' : ''} />{errors.fEmail && <div className="ppl-err on">Enter a valid email</div>}</div>
                <div className="full ppl-field"><label>Employee type <span className="req">*</span></label>
                  <div className="ppl-seg">{(['Schneider Electric', 'Subcontractor'] as const).map((v) => (<button key={v} className={fTypeVal === v ? 'on' : ''} onClick={() => setFTypeVal(v)}>{v === 'Schneider Electric' ? 'Schneider Electric employee' : 'Subcontractor'}</button>))}</div>
                </div>
                {fTypeVal === 'Schneider Electric' ? (
                  <div className="ppl-field"><label>SESA <span className="req">*</span></label><input value={fSesa} onChange={(e) => setFSesa(e.target.value)} placeholder="e.g. SESA759801" className={errors.fSesa ? 'err' : ''} />{errors.fSesa && <div className="ppl-err on">Required</div>}</div>
                ) : (
                  <div className="ppl-field"><label>Company <span className="req">*</span></label><input value={fCompany} onChange={(e) => setFCompany(e.target.value)} placeholder="Subcontractor company name" className={errors.fCompany ? 'err' : ''} />{errors.fCompany && <div className="ppl-err on">Required</div>}</div>
                )}
                <div className="ppl-field"><label>Job Ref / SO # <span className="req">*</span></label><input value={fJob} onChange={(e) => setFJob(e.target.value)} placeholder="WO-13576612" className={errors.fJob ? 'err' : ''} />{errors.fJob && <div className="ppl-err on">Format: WO-12345678</div>}</div>
                <div className="ppl-field"><label>Segment <span className="req">*</span></label><select value={fSegment} onChange={(e) => onSegment(e.target.value)} className={errors.fSegment ? 'err' : ''}><option value="">Select…</option>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</select>{errors.fSegment && <div className="ppl-err on">Required</div>}</div>
                <div className="ppl-field"><label>Job profile <span className="req">*</span></label><select value={fProfile} onChange={(e) => setFProfile(e.target.value)} className={errors.fProfile ? 'err' : ''}><option value="">Select…</option>{PROFILES.map((p) => <option key={p}>{p}</option>)}</select>{errors.fProfile && <div className="ppl-err on">Required</div>}<div className="ppl-sub-inline">List pending confirmation from Sami Ismail (placeholder values).</div></div>
                {fProfile === 'Other' && <div className="full ppl-field"><label>New job profile name <span className="req">*</span></label><input value={fOther} onChange={(e) => setFOther(e.target.value)} placeholder="Type the new job profile" className={errors.fOther ? 'err' : ''} />{errors.fOther && <div className="ppl-err on">Required</div>}</div>}
                <div className="ppl-field"><label>Domain <span className="req">*</span></label><select value={fDomain} onChange={(e) => setFDomain(e.target.value)} className={errors.fDomain ? 'err' : ''}><option value="">Select…</option>{DOMAINS.map((d) => <option key={d}>{d}</option>)}</select>{errors.fDomain && <div className="ppl-err on">Required</div>}</div>
                <div className="ppl-field"><label>Status</label><div className="ppl-tgl"><button className={`ppl-sw ${fActive ? 'on' : ''}`} onClick={() => setFActive((v) => !v)} aria-label="Toggle status" /><b>{fActive ? 'Active' : 'Inactive'}</b></div></div>
                <div className="full ppl-field"><label>Planned hours per week</label>
                  <div className="ppl-chips">{OPTIONS.map((o) => <button key={o.k} type="button" className={`ppl-chip ${fSched === o.k ? 'on' : ''}`} disabled={!fActive} onClick={() => setFSched(o.k)}>{optLabel(o)}</button>)}</div>
                  <div className="ppl-sub-inline">
                    {!fActive ? <>Inactive – planned hours per week: <b>0 h</b></> : <>Project default: <b>{PROJECT.days} days × {PROJECT.hrs} h = {PROJECT.days * PROJECT.hrs} h per week</b>{fSched !== 'default' ? <> · Selected: <b>{schedOf(fSched).days} d × {schedOf(fSched).hrs} h = {schedOf(fSched).days * schedOf(fSched).hrs} h/week</b></> : null}</>}
                  </div>
                </div>
                <div className="full ppl-field"><label>Equipment access</label>
                  {fSegment && allowedGroups(fSegment) ? (
                    <div>
                      {GROUPS.filter((g) => allowedGroups(fSegment).includes(g)).map((g) => (
                        <div className="ppl-eq-group" key={g}><h4>{g}</h4><div className="ppl-eq-list">
                          {EQUIP.filter((e) => e.g === g).map((e) => (
                            <label key={e.id} className={`ppl-eq ${fEq.includes(e.id) ? 'sel' : ''}`}><input type="checkbox" checked={fEq.includes(e.id)} onChange={() => toggleEq(e.id)} />{e.n}</label>
                          ))}
                        </div></div>
                      ))}
                      <div className="ppl-note">{fSegment === 'Project Management Support' ? 'Project Management Support can be granted access to equipment from all activities.' : `${fSegment} personnel only see equipment relevant to ${fSegment.toLowerCase()} activities.`}</div>
                    </div>
                  ) : <div className="ppl-note">Select a segment to see the equipment you can grant access to.</div>}
                </div>
              </div>
            </div>
            <div className="ppl-mf"><button className="ppl-btn s" onClick={() => setEmpModal(false)}>Cancel</button><button className="ppl-btn p" onClick={saveEmp}>Save employee</button></div>
          </div>
        </div>
      )}

      {/* Timesheet modal */}
      {tsModal && tsEmp && (
        <div className="ppl-modal-bg show">
          <div className="ppl-modal wide">
            <div className="ppl-mh"><div><h3>Timesheet – {tsEmp.name}</h3><div className="ppl-sub-t">{tsEmp.job} · {tsEmp.segment} · {tsEmp.active ? schedLabel(tsEmp) : 'Inactive'} · planned {empWeek(tsEmp)} h/week</div></div><button className="ppl-x" onClick={() => setTsModal(false)}>×</button></div>
            <div className="ppl-mb">
              {!tsEmp.active && <div className="ppl-note warn" style={{ margin: '0 0 12px' }}>This employee is <b>inactive</b> – planned hours are 0 and timesheet entry is locked.</div>}
              <div className="ppl-card" style={{ background: '#fafcfb', marginBottom: 14 }}>
                <div className="ppl-quick"><span className="ppl-sub-t">Quick select:</span>
                  <button className="ppl-chip sm" disabled={!tsEmp.active} onClick={() => quick('last')}>Last week</button>
                  <button className="ppl-chip sm" disabled={!tsEmp.active} onClick={() => quick('this')}>This week</button>
                  <button className="ppl-chip sm" disabled={!tsEmp.active} onClick={() => quick('2w')}>Last 2 weeks</button>
                  <button className="ppl-chip sm" disabled={!tsEmp.active} onClick={() => quick('month')}>This month</button>
                </div>
                <div className="ppl-row" style={{ marginTop: 12 }}>
                  <div className="ppl-field" style={{ maxWidth: 170 }}><label>From</label><input type="date" value={tsFrom} disabled={!tsEmp.active} onChange={(e) => { setTsFrom(e.target.value); if (e.target.value && (!tsTo || tsTo < e.target.value)) setTsTo(e.target.value); }} /></div>
                  <div className="ppl-field" style={{ maxWidth: 170 }}><label>To</label><input type="date" value={tsTo} disabled={!tsEmp.active} onChange={(e) => setTsTo(e.target.value)} /></div>
                  <div className="ppl-field" style={{ maxWidth: 170 }}><label>Hours worked</label><input type="number" min={0} step={0.5} placeholder={tsOff ? 'OFF' : 'e.g. 40'} value={tsOff ? '' : tsHours} disabled={!tsEmp.active || tsOff} onChange={(e) => setTsHours(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addEntry(); }} /></div>
                  <div className="ppl-field"><label>&nbsp;</label><label className="ppl-ts-off"><input type="checkbox" checked={tsOff} disabled={!tsEmp.active} onChange={(e) => setTsOff(e.target.checked)} /> OFF</label></div>
                  <div className="ppl-field"><label>&nbsp;</label><button className="ppl-btn p" disabled={!tsEmp.active || tsPreview.blocked} onClick={addEntry}>Save</button></div>
                </div>
                {tsPreview.text && <div className={`ppl-note ${tsPreview.warn ? 'warn' : ''}`} style={{ marginTop: 12 }}>{tsPreview.text}</div>}
              </div>
              <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#667085', textTransform: 'uppercase' }}>Recorded entries</h2>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                <table className="ppl-ts-table">
                  <thead><tr><th>From</th><th>To</th><th>Days</th><th>Planned</th><th>Worked</th><th>Variance</th><th></th></tr></thead>
                  <tbody>
                    {tsList.map((e, i) => {
                      const r = rangeInfo(e.from, e.to, e.off, tsEmp); const v = e.hours - r.planned;
                      return (
                        <tr key={i} className={e.off ? 'off' : ''}>
                          <td>{fmt(e.from)}</td><td>{fmt(e.to)}</td><td>{r.days}</td>
                          <td><b>{r.planned} h</b></td>
                          <td>{e.off ? <span className="ppl-pill ina">OFF</span> : <b>{e.hours} h</b>}</td>
                          <td><span className={v >= 0 ? 'ppl-var-pos' : 'ppl-var-neg'}>{v > 0 ? '+' : ''}{v} h</span></td>
                          <td><button className="ppl-btn s sm" onClick={() => delEntry(i)}>Delete</button></td>
                        </tr>
                      );
                    })}
                    {tsList.length === 0 && <tr><td colSpan={7} className="ppl-sub-t" style={{ textAlign: 'center', padding: 18 }}>No timesheet entries yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="ppl-sumbar">
                <div><b>{tsTotals.P} h</b><span>Total planned</span></div>
                <div><b>{tsTotals.A} h</b><span>Total worked</span></div>
                <div><b style={{ color: tsTotals.A - tsTotals.P < 0 ? '#d64545' : '#1a9d4b' }}>{tsTotals.A - tsTotals.P > 0 ? '+' : ''}{tsTotals.A - tsTotals.P} h</b><span>Variance</span></div>
                <div><b>{tsTotals.O}</b><span>OFF entries</span></div>
              </div>
            </div>
            <div className="ppl-mf"><button className="ppl-btn p" onClick={() => setTsModal(false)}>Done</button></div>
          </div>
        </div>
      )}

      {toast && <div className="ppl-toast show">{toast}</div>}
    </div>
  );
}

export default Personas;
