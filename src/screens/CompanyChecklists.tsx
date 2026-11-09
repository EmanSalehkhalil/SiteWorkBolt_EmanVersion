import { useEffect, useState } from 'react';
import { Bell, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, ClipboardCheck, Download, FileText, ChartBar as FileBarChart, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, Search, Settings2, ShieldCheck, Users, Wrench } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';
import ChecklistAnswer, { type ChecklistAnswerValue } from '@/components/ChecklistAnswer';
import ChecklistActivity from '@/components/ChecklistActivity';

type Phase = { level: string; title: string };
type ChecklistItem = { checklistId: string; checklistText: string | null; checklistAnswerType: string };
type ChecklistSubsection = { subsectionId: string; subsectionNumber: number; subsectionName: string; items: ChecklistItem[] };
type ChecklistSection = { sectionId: string; sectionNumber: number; sectionName: string; subsections: ChecklistSubsection[] };
type ChecklistEquipment = { projectEquipmentId: string; equipmentId: string; equipmentName: string | null; sections: ChecklistSection[] };

const phases: Phase[] = [
  { level: 'L1', title: 'Factory Acceptance' },
  { level: 'L2', title: 'Delivery & Installation' },
  { level: 'L3', title: 'Pre-Functional / Commissioning' },
  { level: 'L4', title: 'Functional Performance' },
  { level: 'L5', title: 'IST (Integrated Testing)' },
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
    { label: 'HSE', icon: ShieldCheck },
  { label: 'Issues', icon: CircleAlert },
  // { label: 'Checklist Stats', icon: ClipboardCheck },
  { label: 'Checklist', icon: FolderKanban, active: true },
  // { label: 'Testing Workflow', icon: TestTube2 },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function CompanyChecklists({ projectId, onBackToProject, onNavigate, onSignOut }: { projectId: string | null; onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  const [selectedPhase, setSelectedPhase] = useState('L1');
  const [expanded, setExpanded] = useState(true);
  const [equipment, setEquipment] = useState<ChecklistEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswerValue>>({});

  useEffect(() => {
    const controller = new AbortController();
    setEquipment([]);
    setLoadError('');
    if (!projectId) {
      setLoading(false);
      setLoadError('Select a project to view its checklists.');
      return () => controller.abort();
    }
    setLoading(true);
    fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}/checklists?phase=${selectedPhase}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load checklists (${response.status}).`);
        return response.json() as Promise<{ data: ChecklistEquipment[] }>;
      })
      .then((result) => { if (!controller.signal.aborted) setEquipment(result.data); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : 'Unable to load checklists.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [projectId, selectedPhase]);

  const itemCount = equipment.reduce((total, entry) => total + entry.sections.reduce(
    (sectionTotal, section) => sectionTotal + section.subsections.reduce((subTotal, sub) => subTotal + sub.items.length, 0), 0), 0);

  return <div className="company-checklist-screen">
    <aside className="company-checklist-sidebar">
      <button className="company-checklist-brand" onClick={onBackToProject}><span className="company-checklist-mark"><span /></span><strong>SiteSphere</strong></button>
      <div className="company-sidebar-label">MAIN NAVIGATION</div>
      <nav className="company-checklist-nav">{navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={16} /><span>{label}</span></button>)}</nav>
      <div className="company-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={16} /> Switch Project</button><button onClick={onSignOut}><LogOut size={16} /> Sign Out</button></div>
    </aside>

    <div className="company-checklist-main">
      <header className="company-checklist-topbar"><button className="company-mobile-menu" aria-label="Open navigation"><Menu size={18} /></button><button className="company-project-crumb" onClick={onBackToProject}><FolderKanban size={13} /> Project {projectId} <ChevronRight size={13} /></button><label className="company-search"><Search size={14} /><input placeholder="Search site data..." /></label><div className="company-user"><button aria-label="Notifications"><Bell size={17} /><i /></button><span className="company-divider" /><span><strong>Marcus Thorne</strong><small>Project Manager</small></span><b>MT</b></div></header>

      <main className="company-checklist-content">
        <div className="company-checklist-title"><div><div className="company-kicker"><button onClick={onBackToProject}><ChevronLeft size={14} /></button> Project Checklist</div><h1>Commissioning Checklist</h1></div><div className="company-title-actions"><button><Settings2 size={13} /> Filters</button><button className="company-report-button"><Download size={13} /> Export L1-L5 Report</button></div></div>

        <section className="company-summary-grid"><div><span className="summary-icon blue"><ClipboardCheck size={15} /></span><small>{selectedPhase} CHECKLIST ITEMS</small><strong>{itemCount}</strong></div></section>

        <nav className="company-phase-tabs">{phases.map((phase) => <button className={selectedPhase === phase.level ? 'active' : ''} aria-pressed={selectedPhase === phase.level} key={phase.level} onClick={() => setSelectedPhase(phase.level)}><span>{phase.level}</span><strong>{phase.title}</strong></button>)}</nav>
        <p role="note">Answers are unsaved drafts only. They are not submitted and will be lost when you leave this screen or refresh.</p>

        <div className="company-equipment-heading"><div><h2>Equipment List for {selectedPhase} <span>{equipment.length}</span></h2></div><button onClick={() => setExpanded(!expanded)}>{expanded ? 'Collapse products' : 'Expand products'} <ChevronDown size={13} /></button></div>
        {loading && <p role="status">Loading {selectedPhase} checklists...</p>}
        {loadError && <p role="alert">{loadError}</p>}
        {!loading && !loadError && equipment.length === 0 && <p>No checklist items are configured for this project's equipment in {selectedPhase}.</p>}
        {expanded && !loading && !loadError && equipment.map((entry) => <section className="equipment-card" key={entry.projectEquipmentId}>
          <div className="equipment-header"><div><h3>{entry.equipmentName || `Equipment ${entry.equipmentId}`}</h3></div></div>
          {entry.sections.map((section) => <div className="checklist-group" key={section.sectionId}>
            <div className="checklist-group-heading"><ClipboardCheck size={14} /><div><strong>{section.sectionNumber}. {section.sectionName}</strong></div></div>
            {section.subsections.map((subsection) => <div key={subsection.subsectionId}>
              <h4>{section.sectionNumber}.{subsection.subsectionNumber} {subsection.subsectionName}</h4>
              {subsection.items.map((item) => {
                const answerKey = `${projectId}:${entry.projectEquipmentId}:${selectedPhase}:${item.checklistId}`;
                return <div key={item.checklistId}>
                  <div className="company-task-row">
                  <div className="checklist-item-copy"><strong>{item.checklistText}</strong><small>Response type: {item.checklistAnswerType}</small></div>
                  <ChecklistAnswer answerType={item.checklistAnswerType}
                    value={answers[answerKey] || { text: '', photo: null }}
                    onChange={(value) => setAnswers((current) => ({ ...current, [answerKey]: value }))} />
                  </div>
                  {projectId && <ChecklistActivity projectId={projectId} projectEquipmentId={entry.projectEquipmentId} checklistId={item.checklistId} />}
                </div>;
              })}
            </div>)}
          </div>)}
        </section>)}
      </main>
      <footer className="company-checklist-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
    </div>
  </div>;
}

export default CompanyChecklists;
