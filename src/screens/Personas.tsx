import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell, CalendarDays, ClipboardCheck, FolderKanban, History, LayoutDashboard,
  LogOut, Menu, Search, Settings2, ShieldCheck, Users, Wrench, Zap, Flag,
  CircleAlert, FileText, Users as UsersIcon, CircleCheck, Cog, Clock,
} from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

type PersonaOptions = { segments: string[]; domains: string[]; profiles: string[] };
type ProjectEquipment = { projectEquipmentId: string; equipmentId: string; equipmentName: string | null; equipmentTag: string | null; equipmentType: string | null };
const DEFAULT_SCHEDULE = { days: 5, hrs: 8 };
type SchedKey = 'default' | '5x8' | '5x10' | '6x8' | '6x10';
const OPTIONS: { k: SchedKey; days?: number; hrs?: number }[] = [
  { k: 'default' }, { k: '5x8', days: 5, hrs: 8 }, { k: '5x10', days: 5, hrs: 10 },
  { k: '6x8', days: 6, hrs: 8 }, { k: '6x10', days: 6, hrs: 10 },
];
const optLabel = (o: { k: SchedKey; days?: number; hrs?: number }, project = DEFAULT_SCHEDULE) => o.k === 'default'
  ? `Project standard (${project.days * project.hrs} h)` : `${o.days} d × ${o.hrs} h`;
const schedOf = (k: SchedKey, project = DEFAULT_SCHEDULE) => {
  const o = OPTIONS.find((x) => x.k === k) || OPTIONS[0];
  return o.k === 'default' ? project : { days: o.days!, hrs: o.hrs! };
};
const empWeek = (e: Employee) => (e.active ? schedOf(e.sched, e.projectSchedule).days * schedOf(e.sched, e.projectSchedule).hrs : 0);
const schedLabel = (e: Employee) => e.sched === 'default' ? 'Project standard' : `${schedOf(e.sched).days} d × ${schedOf(e.sched).hrs} h`;

type StdTimes = { travelStartIn: string; travelStartOut: string; lunchStart: string; lunchEnd: string; travelFinishIn: string; travelFinishOut: string };
const emptyStd: StdTimes = { travelStartIn: '', travelStartOut: '', lunchStart: '', lunchEnd: '', travelFinishIn: '', travelFinishOut: '' };

type Employee = {
  id: number; sched: SchedKey; name: string; email: string; type: 'Schneider Electric' | 'Subcontractor';
  firstName?: string; lastName?: string;
  sesa: string; company: string; job: string; segment: string; profile: string; domain: string;
  eq: string[]; active: boolean; std?: StdTimes;
  projectSchedule?: { days: number; hrs: number };
  projectId?: number;
};
type TsEntry = { id: number; from: string; to: string; hours: number; off: boolean };
type DayEntry = {
  date: string; off: boolean; travelStart: string | null; workIn: string | null; lunchStart: string | null;
  lunchEnd: string | null; workOut: string | null; travelFinish: string | null; activity: string | null;
  hours: number; st: number; ot: number; eot: number;
};
type DayDraft = { off: boolean; hours: string; travelStart: string; workIn: string; lunchStart: string; lunchEnd: string; workOut: string; travelFinish: string; activity: string };
type DayTimeField = 'travelStart' | 'workIn' | 'lunchStart' | 'lunchEnd' | 'workOut' | 'travelFinish';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
    { label: 'HSE', icon: ShieldCheck },
  { label: 'Issues', icon: CircleAlert },
  { label: 'Checklist', icon: FolderKanban },
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
  const sc = schedOf(emp.sched, emp.projectSchedule); let days = 0; let planned = 0;
  for (let d = parse(from); d <= parse(to); d.setDate(d.getDate() + 1)) { days++; if (isWorkDay(d, sc.days)) planned += sc.hrs; }
  return { days, planned: emp.active && !off ? planned : 0 };
};

const r2 = (n: number) => Math.round(n * 100) / 100;
// Days without a saved row start from the employee's standard travel and lunch times.
const toDraft = (e?: DayEntry, std: StdTimes = emptyStd): DayDraft => e
  ? {
    off: e.off, hours: String(e.hours), travelStart: e.travelStart ?? '', workIn: e.workIn ?? '', lunchStart: e.lunchStart ?? '',
    lunchEnd: e.lunchEnd ?? '', workOut: e.workOut ?? '', travelFinish: e.travelFinish ?? '', activity: e.activity ?? '',
  }
  : {
    off: false, hours: '', travelStart: std.travelStartIn, workIn: std.travelStartOut, lunchStart: std.lunchStart,
    lunchEnd: std.lunchEnd, workOut: std.travelFinishIn, travelFinish: std.travelFinishOut, activity: '',
  };
// Total entered hours include travel and lunch.
const draftHours = (d: DayDraft): number | null => {
  if (d.off) return 0;
  const hours = Number(d.hours);
  return d.hours !== '' && Number.isFinite(hours) && hours >= 0 && hours <= 24 ? r2(hours) : null;
};

function Personas({ projectId, onBackToProject, onNavigate, onSignOut }: { projectId: string | null; onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  const [emps, setEmps] = useState<Employee[]>([]);
  const [PROJECT, setProjectSchedule] = useState(DEFAULT_SCHEDULE);
  const scopeQuery = `projectId=${encodeURIComponent(projectId || '')}`;
  const currentProject = useRef(projectId);
  currentProject.current = projectId;
  const employeeEmailRef = useRef<HTMLInputElement>(null);
  const [segments, setSegments] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [projectEquipments, setProjectEquipments] = useState<ProjectEquipment[]>([]);
  const [ts, setTs] = useState<Record<number, TsEntry[]>>({});
  const [isSavingTs, setIsSavingTs] = useState(false);
  const [editingTsId, setEditingTsId] = useState<number | null>(null);
  const [tsRevision, setTsRevision] = useState(0);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
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
  const [fFirstName, setFFirstName] = useState('');
  const [fLastName, setFLastName] = useState('');
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
  const [fStd, setFStd] = useState<StdTimes>(emptyStd);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // timesheet state
  const [tsFrom, setTsFrom] = useState('');
  const [tsExportMonth, setTsExportMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [tsTo, setTsTo] = useState('');
  const [tsHours, setTsHours] = useState('');
  const [tsOff, setTsOff] = useState(false);
  const [tsView, setTsView] = useState<'range' | 'days'>('range');
  const [tsDayMonth, setTsDayMonth] = useState(() => iso(new Date()).slice(0, 7));
  const [tsDays, setTsDays] = useState<Record<string, DayEntry>>({});
  const [tsDayDrafts, setTsDayDrafts] = useState<Record<string, DayDraft>>({});
  const [savingDay, setSavingDay] = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2200); };

  useEffect(() => {
    let cancelled = false;
    setEmps([]); setTs({}); setTsDays({}); setTsDayDrafts({});
    setTsModal(false); setEmpModal(false); setTsEmpId(null);
    setProjectEquipments([]);
    if (!projectId) return;

    fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}`)
      .then(async (r) => { if (!r.ok) throw new Error('Unable to load project schedule.'); return r.json(); })
      .then((p) => { if (!cancelled) setProjectSchedule({ days: p.workingDaysPerWeek, hrs: p.workingHoursPerDay }); })
      .catch((error: unknown) => { if (!cancelled) showToast(error instanceof Error ? error.message : 'Unable to load project schedule.'); });

fetch(`http://localhost:4000/users/employees?projectId=${encodeURIComponent(projectId)}`)
      .then(async (r) => { if (!r.ok) throw new Error(`Employees request failed (${r.status}).`); return r.json() as Promise<Employee[]>; })
      .then((employees) => { if (!cancelled) setEmps(employees); })
      .catch((error: unknown) => { if (!cancelled) showToast(error instanceof Error ? error.message : 'Unable to load saved employees.'); });

    fetch('http://localhost:4000/users/persona-options')
      .then(async (r) => { if (!r.ok) throw new Error(`Persona options request failed (${r.status}).`); return r.json() as Promise<PersonaOptions>; })
      .then((options) => {
        if (cancelled) return;
        setSegments(options.segments);
        setDomains(options.domains);
        setProfiles(options.profiles);
      })
      .catch((error: unknown) => console.error('Unable to load persona dropdown options:', error));

    fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}/equipment?pageSize=1000`)
      .then(async (r) => { if (!r.ok) throw new Error(`Equipment request failed (${r.status}).`); return r.json() as Promise<{ data: ProjectEquipment[] }>; })
      .then((equipmentResult) => { if (!cancelled) setProjectEquipments(equipmentResult.data); })
      .catch((error: unknown) => console.error('Unable to load project equipment for Personas:', error));

    return () => { cancelled = true; };
  }, [projectId]);

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
    setFFirstName(e?.firstName ?? e?.name.split(/\s+/)[0] ?? '');
    setFLastName(e?.lastName ?? e?.name.split(/\s+/).slice(1).join(' ') ?? '');
    setFEmail(e?.email ?? '');
    setFSesa(e?.sesa ?? '');
    setFCompany(e?.company ?? '');
    setFJob(e?.job ?? '');
    setFSegment(e?.segment ?? '');
    setFProfile(e && profiles.includes(e.profile) ? e.profile : e ? 'Other' : '');
    setFOther(e && !profiles.includes(e.profile) ? e.profile : '');
    setFDomain(e?.domain ?? '');
    setFTypeVal(e?.type || 'Schneider Electric');
    setFActive(e?.active ?? true);
    setFSched(e?.sched ?? 'default');
    setFEq(e ? [...e.eq] : []);
    setFStd(e?.std ? { ...e.std } : emptyStd);
    setErrors({});
    setEmpModal(true);
  };

  const onSegment = (seg: string) => {
    setFSegment(seg);
  };

  const toggleEq = (id: string) => setFEq((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const lookupEmployee = async () => {
    if (editing || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEmail.trim())) return;
    const email = fEmail;
    try {
      const response = await fetch(`http://localhost:4000/users/identities?email=${encodeURIComponent(email.trim())}`);
      if (!response.ok) return;
      const known = await response.json();
      if (!known || employeeEmailRef.current?.value !== email) return;
      setFFirstName(known.firstName);
      setFLastName(known.lastName);
      if (known.type === 'Schneider Electric' || known.type === 'Subcontractor') setFTypeVal(known.type);
      setFSesa(known.sesa || ''); setFCompany(known.company || '');
      showToast('Known identity reused; only this project membership will be added.');
    } catch { showToast('Identity lookup unavailable. Existing identities will still be reused on save.'); }
  };

  const saveEmp = async () => {
    if (!projectId) { showToast('Select a project first.'); return; }
    const requestedProject = projectId;
    const errs: Record<string, boolean> = {};
    if (!fFirstName.trim() || fFirstName.trim().length > 100) errs.fFirstName = true;
    if (!fLastName.trim() || fLastName.trim().length > 100) errs.fLastName = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEmail.trim())) errs.fEmail = true;
    if (fTypeVal === 'Schneider Electric' && !fSesa.trim()) errs.fSesa = true;
    if (fTypeVal === 'Subcontractor' && !fCompany.trim()) errs.fCompany = true;
    if (!/^WO-\d{6,}$/i.test(fJob.trim())) errs.fJob = true;
    if (!fSegment) errs.fSegment = true;
    if (!fProfile) errs.fProfile = true;
    if (fProfile === 'Other' && !fOther.trim()) errs.fOther = true;
    if (!fDomain) errs.fDomain = true;
    if ((!!fStd.lunchStart) !== (!!fStd.lunchEnd) || (fStd.lunchStart && fStd.lunchEnd && fStd.lunchEnd <= fStd.lunchStart)) errs.fLunch = true;
    setErrors(errs);
    if (Object.keys(errs).length) { showToast('Please complete the highlighted fields'); return; }
    const rec: Employee = {
      id: editing?.id ?? 0,
      firstName: fFirstName.trim(),
      lastName: fLastName.trim(),
      name: `${fFirstName.trim()} ${fLastName.trim()}`,
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
      std: { ...fStd },
    };
    setIsSavingEmployee(true);
    try {
      const response = await fetch(editing ? `http://localhost:4000/users/employees/${editing.id}` : 'http://localhost:4000/users/employees', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rec, projectId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save employee.');
      if (currentProject.current !== requestedProject) return;

      const savedEmployee = result as Employee;
      if (editing) {
        setEmps((prev) => prev.map((e) => (e.id === editing.id ? savedEmployee : e)));
        setEmpModal(false);
        showToast('Employee updated');
        return;
      }

      setEmps((prev) => [...prev, savedEmployee]);
      setEmpModal(false);
      showToast(`Employee added – planned hours: ${empWeek(savedEmployee)} h/week`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save employee.');
    } finally {
      setIsSavingEmployee(false);
    }
  };

  // ---------- Timesheet ----------
  const tsEmp = tsEmpId !== null ? emps.find((e) => e.id === tsEmpId) ?? null : null;
  const tsList = tsEmp ? ts[tsEmp.id] || [] : [];

  const conflictsOf = (f: string, t: string) => tsList.filter((e) => e.id !== editingTsId && !(t < e.from || f > e.to));

  const nextDay = (k: string) => { const d = parse(k); d.setDate(d.getDate() + 1); return iso(d); };

  const loadTs = async (id: number, advance = false) => {
    if (!projectId) return;
    const requestedProject = projectId;
    try {
      const response = await fetch(`http://localhost:4000/users/${id}/timesheet?${scopeQuery}`);
      if (!response.ok) throw new Error(`Timesheet request failed (${response.status}).`);
      const entries = (await response.json()) as TsEntry[];
      if (currentProject.current !== requestedProject) return;
      setTs((prev) => ({ ...prev, [id]: entries }));
      const emp = emps.find((x) => x.id === id);
      if (advance && emp?.active && entries.length) setTsFrom(nextDay(entries.map((e) => e.to).sort().pop()!));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to load timesheet.');
    }
  };

  const openTs = (id: number) => {
    setTsEmpId(id);
    setEditingTsId(null);
    setTsFrom(''); setTsTo(''); setTsHours(''); setTsOff(false);
    setTsDays({}); setTsDayDrafts({});
    setTsModal(true);
    loadTs(id, true);
  };


  const quick = (k: 'last' | 'this' | '2w' | 'month') => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
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
      tsPreview.text = (<span><b>⚠ Date collision.</b> These dates overlap {cf.length > 1 ? cf.length + ' existing entries' : 'an existing entry'}:<br />{cf.map((e) => fmt(e.from) + ' → ' + fmt(e.to) + ' (' + (e.off ? 'OFF' : e.hours + ' h') + ')').join(', ')}<br />Edit the existing entry or change the dates.</span>);
    } else {
      const h = parseFloat(tsHours);
      tsPreview.text = (<span>{fmt(tsFrom)} → {fmt(tsTo)} · <b>{r.days} day{r.days > 1 ? 's' : ''}</b> · Planned hours: <b>{r.planned} h</b>{tsOff ? ' (OFF – planned hours set to 0)' : ' · Maximum 24 hours per scheduled working day'}{!tsOff && !isNaN(h) ? <> · Variance: <b>{(h - r.planned > 0 ? '+' : '')}{r2(h - r.planned)} h</b></> : ''}</span>);
    }
  }

  const tsTotals = tsList.reduce((acc, e) => {
    const r = rangeInfo(e.from, e.to, e.off, tsEmp!);
    acc.P += r.planned; acc.A = r2(acc.A + e.hours); if (e.off) acc.O++;
    return acc;
  }, { P: 0, A: 0, O: 0 });

  const addEntry = async () => {
    if (!projectId || !tsEmp || !tsEmp.active || isSavingTs) return;
    const requestedProject = projectId;
    if (!tsFrom) { showToast('Pick a From date'); return; }
    let t = tsTo; if (!t) t = tsFrom; setTsTo(t);
    if (parse(t) < parse(tsFrom)) { showToast("'To date' must be on or after 'From date'"); return; }
    if (!tsOff && (tsHours === '' || parseFloat(tsHours) < 0)) { showToast('Write the hours worked or tick OFF'); return; }
    if (conflictsOf(tsFrom, t).length) { showToast('Dates overlap – edit the existing entry instead'); return; }

    setIsSavingTs(true);
    try {
      const response = await fetch(`http://localhost:4000/users/${tsEmp.id}/timesheet${editingTsId ? `/${editingTsId}` : ''}?${scopeQuery}`, {
        method: editingTsId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: tsFrom, to: t, off: tsOff, hours: tsOff ? 0 : parseFloat(tsHours) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save timesheet entry.');
      if (currentProject.current !== requestedProject) return;

      const entry = result as TsEntry;
      const list = [...(ts[tsEmp.id] || []).filter((e) => e.id !== entry.id), entry].sort((a, b) => (a.from < b.from ? -1 : 1));
      setTs((prev) => ({ ...prev, [tsEmp.id]: list }));
      setTsFrom(nextDay(t)); setTsTo(''); setTsHours(''); setTsOff(false);
      setEditingTsId(null);
      setTsDays({}); setTsDayDrafts({});
      setTsRevision((value) => value + 1);
      showToast(`Saved – ${entry.off ? 'OFF' : entry.hours + ' h'} for ${fmt(entry.from)} → ${fmt(entry.to)}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save timesheet entry.');
    } finally {
      setIsSavingTs(false);
    }
  };

  const exportTsPdf = () => {
    if (!tsEmp || !projectId) return;
    if (!tsExportMonth) { showToast('Pick a month to export'); return; }
    const url = `http://localhost:4000/users/${tsEmp.id}/timesheet/report?projectId=${encodeURIComponent(projectId)}&month=${encodeURIComponent(tsExportMonth)}`;
    window.open(url, '_blank');
  };

  const delEntry = async (entry: TsEntry) => {
    if (!projectId || !tsEmp) return;
    const requestedProject = projectId;
    try {
      const response = await fetch(`http://localhost:4000/users/${tsEmp.id}/timesheet/${entry.id}?${scopeQuery}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to delete timesheet entry.');
      if (currentProject.current !== requestedProject) return;

      setTs((prev) => ({ ...prev, [tsEmp.id]: (prev[tsEmp.id] || []).filter((e) => e.id !== entry.id) }));
      if (editingTsId === entry.id) setEditingTsId(null);
      setTsDays({}); setTsDayDrafts({});
      setTsRevision((value) => value + 1);
      showToast('Entry deleted');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to delete timesheet entry.');
    }
  };

  // ---------- Day-by-day timesheet ----------
  const dayRows = (() => {
    const [y, m] = tsDayMonth.split('-').map(Number);
    return Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => iso(new Date(y, m - 1, i + 1)));
  })();

  const dayTotals = Object.values(tsDays).reduce((acc, d) => {
    acc.H += d.hours; acc.ST += d.st; acc.OT += d.ot; acc.EOT += d.eot;
    if (d.off) acc.O++; else if (d.hours > 0) acc.W++;
    return acc;
  }, { H: 0, ST: 0, OT: 0, EOT: 0, O: 0, W: 0 });

  useEffect(() => {
    if (!tsModal || tsEmpId === null || tsView !== 'days') return;
    let cancelled = false;
    fetch(`http://localhost:4000/users/${tsEmpId}/timesheet/days?${scopeQuery}&month=${encodeURIComponent(tsDayMonth)}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load day timesheet.');
        return result as DayEntry[];
      })
      .then((list) => {
        if (!cancelled) setTsDays(Object.fromEntries(list.map((d) => [d.date, d])));
      })
      .catch((error) => {
        if (!cancelled) showToast(error instanceof Error ? error.message : 'Unable to load day timesheet.');
      });
    return () => { cancelled = true; };
  }, [tsModal, tsEmpId, tsView, tsDayMonth, tsRevision, scopeQuery]);

  const tsStd = tsEmp?.std ?? emptyStd;

  const getDayDraft = (date: string): DayDraft => tsDayDrafts[date] ?? toDraft(tsDays[date], tsStd);

  const setDayDraft = (date: string, patch: Partial<DayDraft>) =>
    setTsDayDrafts((prev) => ({ ...prev, [date]: { ...(prev[date] ?? toDraft(tsDays[date], tsStd)), ...patch } }));

  const isDayDirty = (date: string) => {
    const draft = tsDayDrafts[date];
    if (!draft) return false;
    const saved = toDraft(tsDays[date], tsStd);
    return (Object.keys(saved) as (keyof DayDraft)[]).some((k) => draft[k] !== saved[k]);
  };

  const revertDay = (date: string) =>
    setTsDayDrafts((prev) => { const next = { ...prev }; delete next[date]; return next; });

  const saveDay = async (date: string) => {
    if (!projectId || !tsEmp || savingDay) return;
    const requestedProject = projectId;
    const d = getDayDraft(date);
    setSavingDay(date);
    try {
      const response = await fetch(`http://localhost:4000/users/${tsEmp.id}/timesheet/days/${date}?${scopeQuery}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ off: d.off, hours: d.off ? 0 : d.hours, travelStart: d.travelStart, workIn: d.workIn, lunchStart: d.lunchStart, lunchEnd: d.lunchEnd, workOut: d.workOut, travelFinish: d.travelFinish, activity: d.activity }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save day.');
      if (currentProject.current !== requestedProject) return;

      const saved = result as DayEntry;
      setTsDays((prev) => ({ ...prev, [date]: saved }));
      revertDay(date);
      await loadTs(tsEmp.id);
      showToast(`Saved ${fmt(date)} – ${saved.off ? 'OFF' : saved.hours + ' h'}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save day.');
    } finally {
      setSavingDay(null);
    }
  };

  const clearDay = async (date: string) => {
    if (!projectId || !tsEmp) return;
    const requestedProject = projectId;
    try {
      const response = await fetch(`http://localhost:4000/users/${tsEmp.id}/timesheet/days/${date}?${scopeQuery}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to clear day.');
      if (currentProject.current !== requestedProject) return;

      setTsDays((prev) => { const next = { ...prev }; delete next[date]; return next; });
      revertDay(date);
      await loadTs(tsEmp.id);
      showToast(`Cleared ${fmt(date)}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to clear day.');
    }
  };

  const exportDayPdf = (date: string) => {
    if (!tsEmp || !projectId) return;
    window.open(`http://localhost:4000/users/${tsEmp.id}/timesheet/days/${date}/report?projectId=${encodeURIComponent(projectId)}`, '_blank');
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
            <FolderKanban size={16} /> Data Center Alpha <span className="ppl-crumb-sep">›</span> <strong>Personas</strong>
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
              <select value={fSeg} onChange={(e) => setFSeg(e.target.value)}><option value="">All segments</option>{segments.map((s) => <option key={s}>{s}</option>)}</select>
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
                      <td>{e.eq.length} / {projectEquipments.length}</td>
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
              <div className="ppl-note">{editing
                ? 'Names, email, employee type, company and SESA are shared across all projects. Other fields and equipment only change this project membership.'
                : 'Existing email identities are reused across projects without overwriting their identity. Enter an email and leave the field to look up known names.'}</div>
              <div className="ppl-grid">
                <div className="ppl-field"><label htmlFor="employee-first-name">First name <span className="req">*</span></label><input id="employee-first-name" maxLength={100} value={fFirstName} onChange={(e) => setFFirstName(e.target.value)} placeholder="e.g. Ahmed" className={errors.fFirstName ? 'err' : ''} />{errors.fFirstName && <div className="ppl-err on">First name is required (maximum 100 characters)</div>}</div>
                <div className="ppl-field"><label htmlFor="employee-last-name">Last name <span className="req">*</span></label><input id="employee-last-name" maxLength={100} value={fLastName} onChange={(e) => setFLastName(e.target.value)} placeholder="e.g. Hassan" className={errors.fLastName ? 'err' : ''} />{errors.fLastName && <div className="ppl-err on">Last name is required (maximum 100 characters)</div>}</div>
                <div className="ppl-field"><label>Employee email <span className="req">*</span></label><input ref={employeeEmailRef} type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} onBlur={lookupEmployee} placeholder="name@company.com" className={errors.fEmail ? 'err' : ''} />{errors.fEmail && <div className="ppl-err on">Enter a valid email</div>}</div>
                <div className="full ppl-field"><label>Employee type <span className="req">*</span></label>
                  <div className="ppl-seg">{(['Schneider Electric', 'Subcontractor'] as const).map((v) => (<button key={v} className={fTypeVal === v ? 'on' : ''} onClick={() => setFTypeVal(v)}>{v === 'Schneider Electric' ? 'Schneider Electric employee' : 'Subcontractor'}</button>))}</div>
                </div>
                {fTypeVal === 'Schneider Electric' ? (
                  <div className="ppl-field"><label>SESA <span className="req">*</span></label><input value={fSesa} onChange={(e) => setFSesa(e.target.value)} placeholder="e.g. SESA759801" className={errors.fSesa ? 'err' : ''} />{errors.fSesa && <div className="ppl-err on">Required</div>}</div>
                ) : (
                  <div className="ppl-field"><label>Company <span className="req">*</span></label><input value={fCompany} onChange={(e) => setFCompany(e.target.value)} placeholder="Subcontractor company name" className={errors.fCompany ? 'err' : ''} />{errors.fCompany && <div className="ppl-err on">Required</div>}</div>
                )}
                <div className="ppl-field"><label>Job Ref / SO # <span className="req">*</span></label><input value={fJob} onChange={(e) => setFJob(e.target.value)} placeholder="WO-13576612" className={errors.fJob ? 'err' : ''} />{errors.fJob && <div className="ppl-err on">Format: WO-12345678</div>}</div>
                <div className="ppl-field"><label>Segment <span className="req">*</span></label><select value={fSegment} onChange={(e) => onSegment(e.target.value)} className={errors.fSegment ? 'err' : ''}><option value="">Select…</option>{segments.map((s) => <option key={s}>{s}</option>)}</select>{errors.fSegment && <div className="ppl-err on">Required</div>}</div>
                <div className="ppl-field"><label>Job profile <span className="req">*</span></label><select value={fProfile} onChange={(e) => setFProfile(e.target.value)} className={errors.fProfile ? 'err' : ''}><option value="">Select…</option>{profiles.map((p) => <option key={p}>{p}</option>)}</select>{errors.fProfile && <div className="ppl-err on">Required</div>}<div className="ppl-sub-inline">List pending confirmation from Sami Ismail (placeholder values).</div></div>
                {fProfile === 'Other' && <div className="full ppl-field"><label>New job profile name <span className="req">*</span></label><input value={fOther} onChange={(e) => setFOther(e.target.value)} placeholder="Type the new job profile" className={errors.fOther ? 'err' : ''} />{errors.fOther && <div className="ppl-err on">Required</div>}</div>}
                <div className="ppl-field"><label>Domain <span className="req">*</span></label><select value={fDomain} onChange={(e) => setFDomain(e.target.value)} className={errors.fDomain ? 'err' : ''}><option value="">Select…</option>{domains.map((d) => <option key={d}>{d}</option>)}</select>{errors.fDomain && <div className="ppl-err on">Required</div>}</div>
                <div className="ppl-field"><label>Status</label><div className="ppl-tgl"><button className={`ppl-sw ${fActive ? 'on' : ''}`} onClick={() => setFActive((v) => !v)} aria-label="Toggle status" /><b>{fActive ? 'Active' : 'Inactive'}</b></div></div>
                <div className="full ppl-field"><label>Planned hours per week</label>
                  <div className="ppl-chips">{OPTIONS.map((o) => <button key={o.k} type="button" className={`ppl-chip ${fSched === o.k ? 'on' : ''}`} disabled={!fActive} onClick={() => setFSched(o.k)}>{optLabel(o, PROJECT)}</button>)}</div>
                  <div className="ppl-sub-inline">
                    {!fActive ? <>Inactive – planned hours per week: <b>0 h</b></> : <>Project default: <b>{PROJECT.days} days × {PROJECT.hrs} h = {PROJECT.days * PROJECT.hrs} h per week</b>{fSched !== 'default' ? <> · Selected: <b>{schedOf(fSched).days} d × {schedOf(fSched).hrs} h = {schedOf(fSched).days * schedOf(fSched).hrs} h/week</b></> : null}</>}
                  </div>
                </div>
                <div className="full ppl-field"><label>Standard travel and lunch times</label><div className="ppl-note">Used to pre-fill the timesheet for worked days. Lunch needs both start and end.</div></div>
                <div className="ppl-field"><label>Travel start in</label><input type="time" value={fStd.travelStartIn} onChange={(e) => setFStd({ ...fStd, travelStartIn: e.target.value })} /></div>
                <div className="ppl-field"><label>Travel start out</label><input type="time" value={fStd.travelStartOut} onChange={(e) => setFStd({ ...fStd, travelStartOut: e.target.value })} /></div>
                <div className="ppl-field"><label>Lunch start</label><input type="time" value={fStd.lunchStart} onChange={(e) => setFStd({ ...fStd, lunchStart: e.target.value })} /></div>
                <div className="ppl-field"><label>Lunch end</label><input type="time" value={fStd.lunchEnd} onChange={(e) => setFStd({ ...fStd, lunchEnd: e.target.value })} /></div>
                <div className="ppl-field"><label>Travel finish in</label><input type="time" value={fStd.travelFinishIn} onChange={(e) => setFStd({ ...fStd, travelFinishIn: e.target.value })} /></div>
                <div className="ppl-field"><label>Travel finish out</label><input type="time" value={fStd.travelFinishOut} onChange={(e) => setFStd({ ...fStd, travelFinishOut: e.target.value })} /></div>
                {errors.fLunch && <div className="full ppl-err on">Enter both lunch start and lunch end, with lunch end after lunch start.</div>}
                <div className="full ppl-field"><label>Equipment access</label>
                  {projectEquipments.length > 0 ? (
                    <div>
                      <div className="ppl-eq-list">
                        {projectEquipments.map((equipment) => (
                          <label key={equipment.projectEquipmentId} className={`ppl-eq ${fEq.includes(equipment.projectEquipmentId) ? 'sel' : ''}`}><input type="checkbox" checked={fEq.includes(equipment.projectEquipmentId)} onChange={() => toggleEq(equipment.projectEquipmentId)} />{equipment.equipmentName || equipment.equipmentTag || `Equipment ${equipment.equipmentId}`}{equipment.equipmentName && equipment.equipmentTag ? ` (${equipment.equipmentTag})` : ''}</label>
                        ))}
                      </div>
                      <div className="ppl-note">Only equipment assigned to this project is available.</div>
                    </div>
                  ) : <div className="ppl-note">No equipment has been assigned to this project yet.</div>}
                </div>
              </div>
            </div>
            <div className="ppl-mf"><button className="ppl-btn s" onClick={() => setEmpModal(false)}>Cancel</button><button className="ppl-btn p" onClick={saveEmp} disabled={isSavingEmployee}>{isSavingEmployee ? 'Saving…' : 'Save employee'}</button></div>
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
              <div className="ppl-quick" style={{ marginBottom: 12 }}>
                <span className="ppl-sub-t">View:</span>
                <button className={`ppl-chip sm ${tsView === 'range' ? 'on' : ''}`} onClick={() => setTsView('range')}>Date range</button>
                <button className={`ppl-chip sm ${tsView === 'days' ? 'on' : ''}`} onClick={() => { setTsView('days'); setEditingTsId(null); }}>Day by day</button>
              </div>
              {tsView === 'range' && (<>
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
                  <div className="ppl-field"><label>&nbsp;</label><button className="ppl-btn p" disabled={!tsEmp.active || tsPreview.blocked || isSavingTs} onClick={addEntry}>{isSavingTs ? 'Saving…' : editingTsId ? 'Update range' : 'Save'}</button></div>
                  {editingTsId && <button className="ppl-btn s" onClick={() => { setEditingTsId(null); setTsFrom(''); setTsTo(''); setTsHours(''); setTsOff(false); }}>Cancel edit</button>}
                </div>
                <div className="ppl-note">Hours include travel and lunch and are split across scheduled working days. Updating a range redistributes its daily hours; saved times and activities are retained.</div>
                {tsPreview.text && <div className={`ppl-note ${tsPreview.warn ? 'warn' : ''}`} style={{ marginTop: 12 }}>{tsPreview.text}</div>}
              </div>
              <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#667085', textTransform: 'uppercase' }}>Recorded entries</h2>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                <table className="ppl-ts-table">
                  <thead><tr><th>From</th><th>To</th><th>Days</th><th>Planned</th><th>Worked</th><th>Variance</th><th></th></tr></thead>
                  <tbody>
                    {tsList.map((e) => {
                      const r = rangeInfo(e.from, e.to, e.off, tsEmp); const v = e.hours - r.planned;
                      return (
                        <tr key={e.id} className={e.off ? 'off' : ''}>
                          <td>{fmt(e.from)}</td><td>{fmt(e.to)}</td><td>{r.days}</td>
                          <td><b>{r.planned} h</b></td>
                          <td>{e.off ? <span className="ppl-pill ina">OFF</span> : <b>{e.hours} h</b>}</td>
                          <td><span className={v >= 0 ? 'ppl-var-pos' : 'ppl-var-neg'}>{v > 0 ? '+' : ''}{v} h</span></td>
                          <td><button className="ppl-btn s sm" disabled={!tsEmp.active || isSavingTs} onClick={() => { setEditingTsId(e.id); setTsFrom(e.from); setTsTo(e.to); setTsHours(String(e.hours)); setTsOff(e.off); }}>Edit</button>{' '}<button className="ppl-btn s sm" onClick={() => delEntry(e)}>Delete</button></td>
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
              </>)}
              {tsView === 'days' && (<>
                <div className="ppl-quick" style={{ marginBottom: 10 }}>
                  <span className="ppl-sub-t">Month:</span>
                  <input type="month" value={tsDayMonth} onChange={(e) => e.target.value && setTsDayMonth(e.target.value)} />
                  <span className="ppl-sub-t">Edit daily hours and times, then Save. Total hours include travel and lunch and update the date-range total.</span>
                </div>
                <div style={{ maxHeight: 420, overflow: 'auto' }}>
                  <table className="ppl-ts-table ppl-day-table">
                    <thead><tr><th>Date</th><th>OFF</th><th>Travel start in</th><th>Travel start out</th><th>Lunch in</th><th>Lunch out</th><th>Travel finish in</th><th>Travel finish out</th><th>Activity</th><th>Total hours</th><th>ST</th><th>OT</th><th>EOT</th><th></th></tr></thead>
                    <tbody>
                      {dayRows.map((date) => {
                        const saved = tsDays[date];
                        const dirty = isDayDirty(date);
                        const d = getDayDraft(date);
                        const dow = parse(date).getDay();
                        const locked = !tsEmp.active || savingDay !== null;
                        const hours = dirty ? draftHours(d) : (saved ? saved.hours : null);
                        const timeCell = (key: DayTimeField) => (
                          <td><input type="time" value={d[key]} disabled={locked || d.off} onChange={(e) => setDayDraft(date, { [key]: e.target.value } as Partial<DayDraft>)} /></td>
                        );
                        return (
                          <tr key={date} className={[dow === 0 || dow === 6 ? 'wk' : '', dirty ? 'dirty' : '', d.off ? 'off' : ''].join(' ')}>
                            <td style={{ whiteSpace: 'nowrap' }}><b>{parse(date).toLocaleDateString('en-GB', { weekday: 'short' })}</b> {fmt(date)}</td>
                            <td><input type="checkbox" checked={d.off} disabled={locked} onChange={(e) => setDayDraft(date, { off: e.target.checked })} /></td>
                            {timeCell('travelStart')}{timeCell('workIn')}{timeCell('lunchStart')}{timeCell('lunchEnd')}{timeCell('workOut')}{timeCell('travelFinish')}
                            <td><input type="text" maxLength={500} value={d.activity} disabled={locked} onChange={(e) => setDayDraft(date, { activity: e.target.value })} /></td>
                            <td><input aria-label={`Total hours for ${date}`} type="number" min={0} max={24} step={0.01} value={d.off ? '0' : d.hours} disabled={locked || d.off} onChange={(e) => setDayDraft(date, { hours: e.target.value })} />{hours !== null && <span className="ppl-sub-t">{hours} h</span>}</td>
                            <td>{!dirty && saved ? saved.st : '—'}</td>
                            <td>{!dirty && saved ? saved.ot : '—'}</td>
                            <td>{!dirty && saved ? saved.eot : '—'}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <button className="ppl-btn p sm" disabled={!dirty || locked} onClick={() => saveDay(date)}>{savingDay === date ? 'Saving…' : 'Save'}</button>{' '}
                              {dirty && <button className="ppl-btn s sm" disabled={locked} onClick={() => revertDay(date)}>Revert</button>}
                              {saved && !dirty && (<>
                                <button className="ppl-btn s sm" disabled={locked} onClick={() => clearDay(date)}>Clear</button>{' '}
                                <button className="ppl-btn s sm" disabled={!projectId} onClick={() => exportDayPdf(date)}>PDF</button>
                              </>)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="ppl-sumbar">
                  <div><b>{r2(dayTotals.H)} h</b><span>Total hours</span></div>
                  <div><b>{r2(dayTotals.ST)} h</b><span>ST</span></div>
                  <div><b>{r2(dayTotals.OT)} h</b><span>OT</span></div>
                  <div><b>{r2(dayTotals.EOT)} h</b><span>EOT</span></div>
                  <div><b>{dayTotals.W}</b><span>Days worked</span></div>
                  <div><b>{dayTotals.O}</b><span>OFF days</span></div>
                </div>
              </>)}
            </div>
            <div className="ppl-mf" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {tsView === 'range' && (<>
              <div className="ppl-field" style={{ maxWidth: 170 }}><label>Export month</label><input type="month" value={tsExportMonth} onChange={(e) => setTsExportMonth(e.target.value)} /></div>
              <button className="ppl-btn s" disabled={!tsExportMonth} onClick={exportTsPdf}>Export PDF</button>
              </>)}
              <span style={{ flex: 1 }} />
              <button className="ppl-btn p" onClick={() => setTsModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ppl-toast show">{toast}</div>}
    </div>
  );
}

export default Personas;
