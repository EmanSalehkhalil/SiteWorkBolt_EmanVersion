import { useState } from 'react';
import { CalendarDays, ChevronDown, Plus, X } from 'lucide-react';
import Milestones from '@/screens/Milestones';

const initialChecklists = ['Schneider Galaxy V', 'Liebert EXL S1', 'ATS Series 7000'];

function NewMilestone({ onBackToMilestones, onBackToProject, onSignOut }: { onBackToMilestones: () => void; onBackToProject: () => void; onSignOut: () => void }) {
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('');
  const [owner, setOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [checklists, setChecklists] = useState(initialChecklists);

  function removeChecklist(checklist: string) {
    setChecklists((current) => current.filter((item) => item !== checklist));
  }

  return (
    <div className="new-milestone-screen">
      <Milestones onBackToProject={onBackToProject} onSignOut={onSignOut} onOpenNewMilestone={() => undefined} />
      <div className="new-milestone-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onBackToMilestones(); }}>
        <section className="new-milestone-dialog" role="dialog" aria-modal="true" aria-labelledby="new-milestone-title">
          <div className="new-milestone-dialog-heading"><div><h2 id="new-milestone-title">New Project Milestone</h2><p>Map new milestones to construction phases and define<br />requirements.</p></div><button onClick={onBackToMilestones} aria-label="Close dialog"><X size={15} /></button></div>
          <form onSubmit={(event) => { event.preventDefault(); onBackToMilestones(); }}>
            <label className="new-milestone-field new-milestone-full"><span>Milestone Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g., L3 UPS Performance Test" /></label>
            <div className="new-milestone-field-grid"><label className="new-milestone-field"><span>Phase</span><span className="new-milestone-select"><select value={phase} onChange={(event) => setPhase(event.target.value)}><option value="">Select Phase</option><option>L1: Factory Acceptance</option><option>L2: Critical Power Install</option><option>L3: Functional Testing</option><option>L4: System Integration</option></select><ChevronDown size={14} /></span></label><label className="new-milestone-field"><span>Owner</span><span className="new-milestone-select"><select value={owner} onChange={(event) => setOwner(event.target.value)}><option value="">Select Project Engineer</option><option>Alex Construction</option><option>Jordan Lee</option><option>Sam Rivera</option></select><ChevronDown size={14} /></span></label></div>
            <div className="new-milestone-field-grid"><label className="new-milestone-field"><span>Start Date</span><span className="new-milestone-date"><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /><CalendarDays size={14} /></span></label><label className="new-milestone-field"><span>End Date</span><span className="new-milestone-date"><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /><CalendarDays size={14} /></span></label></div>
            <fieldset className="new-milestone-associations"><legend>Associated Product Checklists</legend><div className="new-milestone-checklist-box">{checklists.map((checklist) => <div className="new-milestone-checklist" key={checklist}><span>{checklist}</span><button type="button" onClick={() => removeChecklist(checklist)}>Remove</button></div>)}<button className="new-milestone-add-checklist" type="button" onClick={() => setChecklists((current) => [...current, 'New Checklist'])}><Plus size={12} /> Add Checklist Association</button></div></fieldset>
            <div className="new-milestone-dialog-actions"><button type="button" onClick={onBackToMilestones}>Cancel</button><button className="new-milestone-create" type="submit">Create Milestone</button></div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default NewMilestone;
