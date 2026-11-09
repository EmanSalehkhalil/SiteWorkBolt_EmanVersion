import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, Box, Check, ChevronLeft, ChevronRight, CircleAlert, Download, FileText, Flag, FolderKanban, Grid2x2X as Grid2X2, History, LayoutDashboard, List, LogOut, Menu, Pencil, Plus, Search, Settings2, ShieldCheck, Trash2, Users, Wrench, X } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';
import '../assets-equipment-actions.css';

type Asset = { id: string; equipmentId: string; name: string; category: string; subPackage: string; description: string; status: string; location: string; phaseStatus: string };
type ApiEquipment = { equipmentId: string; equipmentTag: string | null; equipmentName: string | null; equipmentType: string | null; package: string | null; subPackage: string | null; modelVariant: string | null; equipmentDescription: string | null; location: string | null; phaseStatus: string | null };
type EquipmentResponse = { data: ApiEquipment[]; total: number };
type CatalogItem = { package: string; subPackage: string; productRange: string; modelVariant: string; description: string | null };
type CatalogResponse = { data: CatalogItem[]; total: number };

const statusColorClasses: Record<string, string> = {
  'not started': 'maintenance',
  delivered: 'available',
  installed: 'in-use',
  'T&C': 'testing',
};

const displayStatus = (status: string) => status.replace(/\b\w/g, (letter) => letter.toUpperCase());

const toAsset = (equipment: ApiEquipment): Asset => ({
  id: equipment.equipmentTag || equipment.equipmentId,
  equipmentId: equipment.equipmentId,
  name: equipment.modelVariant || equipment.equipmentName || 'Unnamed equipment',
  category: equipment.equipmentType || equipment.package || 'Unclassified',
  subPackage: equipment.subPackage || '',
  description: equipment.equipmentDescription || '',
  status: equipment.phaseStatus || 'not started',
  location: equipment.location || '',
  phaseStatus: equipment.phaseStatus || 'not started',
});


const emptySelection = { equipmentId: '', package: '', subPackage: '', productRange: '', modelVariant: '', location: '' };

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
  { label: 'HSE', icon: ShieldCheck },
  { label: 'Issues', icon: CircleAlert },
  { label: 'Checklist', icon: FolderKanban },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileText },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench, active: true },
  { label: 'Change Log', icon: History },
];

function AssetsEquip({ projectId, onBackToProject, onNavigate, onSignOut }: { projectId: string | null; onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<Asset | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selection, setSelection] = useState(emptySelection);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState<Asset | null>(null);
  const [editLocation, setEditLocation] = useState('');
  const [editEquipmentId, setEditEquipmentId] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Asset | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('http://localhost:4000/equipment/catalog')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load equipment catalogue (${response.status}).`);
        return response.json() as Promise<CatalogResponse>;
      })
      .then((result) => { if (!cancelled) setCatalog(result.data); })
      .catch((error: unknown) => {
        if (!cancelled) setFormError(error instanceof Error ? error.message : 'Unable to load equipment catalogue.');
      });
    return () => { cancelled = true; };
  }, []);

  const packageOptions = useMemo(() => [...new Set(catalog.map((item) => item.package))], [catalog]);
  const subPackageOptions = useMemo(() => [...new Set(catalog.filter((item) => item.package === selection.package).map((item) => item.subPackage))], [catalog, selection.package]);
  const productRangeOptions = useMemo(() => [...new Set(catalog.filter((item) => item.package === selection.package && item.subPackage === selection.subPackage).map((item) => item.productRange))], [catalog, selection.package, selection.subPackage]);
  const modelOptions = useMemo(() => catalog.filter((item) => item.package === selection.package && item.subPackage === selection.subPackage && item.productRange === selection.productRange), [catalog, selection.package, selection.subPackage, selection.productRange]);
  const selectedItem = useMemo(() => modelOptions.find((item) => item.modelVariant === selection.modelVariant) || null, [modelOptions, selection.modelVariant]);

  const updateSelection = (field: keyof typeof emptySelection, value: string) => {
    setSelection((current) => {
      const next = { ...current, [field]: value };
      if (field === 'package') { next.subPackage = ''; next.productRange = ''; next.modelVariant = ''; }
      if (field === 'subPackage') { next.productRange = ''; next.modelVariant = ''; }
      if (field === 'productRange') { next.modelVariant = ''; }
      return next;
    });
  };

  const openEdit = (asset: Asset) => {
    setSelected(null);
    setEditing(asset);
    setEditLocation(asset.location);
    setEditEquipmentId(asset.id);    setEditError('');
  };

  const closeEdit = () => {
    setEditing(null);
    setEditError('');
  };

  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectId || !editing) return;
    setEditSaving(true);
    setEditError('');
    try {
      const response = await fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}/equipment/${encodeURIComponent(editing.equipmentId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: editLocation.trim(), equipmentTag: editEquipmentId.trim() }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string; equipmentTag?: string | null; location?: string | null };
      if (!response.ok) throw new Error(body.error || `Unable to update asset (${response.status}).`);
      setAssets((current) => current.map((asset) => asset.equipmentId === editing.equipmentId
        ? { ...asset, id: body.equipmentTag || asset.id, location: body.location || '' }
        : asset));
      closeEdit();
    } catch (error: unknown) {
      setEditError(error instanceof Error ? error.message : 'Unable to update asset.');
    } finally {
      setEditSaving(false);
    }
  };

  const openDelete = (asset: Asset) => {
    setSelected(null);
    setDeleteError('');
    setPendingDelete(asset);
  };

  const closeDelete = () => {
    setPendingDelete(null);
    setDeleteError('');
  };

  const deleteAsset = async (asset: Asset) => {
    if (!projectId) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}/equipment/${encodeURIComponent(asset.equipmentId)}`, { method: 'DELETE' });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || `Unable to delete asset (${response.status}).`);
      setAssets((current) => current.filter((item) => item.equipmentId !== asset.equipmentId));
      setSelected(null);
      setPendingDelete(null);
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete asset.');
    } finally {
      setDeleting(false);
    }
  };

  const closeAddForm = () => {
    setShowAdd(false);
    setSelection(emptySelection);
    setFormError('');
  };

  const createAsset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectId || !selectedItem) return;
    setSubmitting(true);
    setFormError('');
    try {
      const response = await fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentTag: selection.equipmentId.trim(),
          package: selectedItem.package,
          subPackage: selectedItem.subPackage,
          productRange: selectedItem.productRange,
          modelVariant: selectedItem.modelVariant,
          location: selection.location.trim() || undefined,
        }),
      });
      const body = await response.json().catch(() => ({})) as ApiEquipment & { error?: string };
      if (!response.ok) throw new Error(body.error || `Unable to create asset (${response.status}).`);
      setAssets((current) => [...current, toAsset(body)]);
      closeAddForm();
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Unable to create asset.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!projectId) {
      setAssets([]);
      setLoadError('Select a project to view its equipment.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');
    fetch(`http://localhost:4000/projects/${encodeURIComponent(projectId)}/equipment?pageSize=1000`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load project equipment (${response.status}).`);
        return response.json() as Promise<EquipmentResponse>;
      })
      .then((result) => {
        if (cancelled) return;
        setAssets(result.data.map(toAsset));
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load project equipment.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [projectId]);

  const filtered = useMemo(() => assets.filter((asset) =>
    `${asset.id} ${asset.name} ${asset.category}`.toLowerCase().includes(query.toLowerCase())
      && (!statusFilter || asset.status === statusFilter)
      && (!typeFilter || asset.category === typeFilter)
  ), [assets, query, statusFilter, typeFilter]);
  const statuses = [...new Set(assets.map((asset) => asset.status))];
  const types = [...new Set(assets.map((asset) => asset.category))];
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageAssets = filtered.slice((page - 1) * pageSize, page * pageSize);
  const installedCount = assets.filter((asset) => asset.status === 'installed').length;
  const commissionedCount = assets.filter((asset) => asset.status === 'T&C').length;
  const availableCount = assets.filter((asset) => asset.status === 'delivered').length;
  const maintenanceCount = assets.filter((asset) => asset.status === 'not started').length;

  return <div className="project-dashboard-screen">
      <aside className="project-dashboard-sidebar">
        <button className="project-dashboard-brand" onClick={onBackToProject}><span className="project-dashboard-mark"><span /></span><strong>SiteSphere</strong></button>
        <div className="project-sidebar-label">MAIN NAVIGATION</div>
        <nav className="project-dashboard-nav">
          {navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={16} /><span>{label}</span></button>)}
        </nav>
        <div className="project-sidebar-bottom"><button onClick={onBackToProject}><Settings2 size={16} /> Switch Project</button><button className="project-signout" onClick={onSignOut}><LogOut size={16} /> Sign Out</button></div>
      </aside>

      <div className="project-dashboard-main">
        <header className="project-dashboard-topbar">
          <button className="project-dashboard-menu" aria-label="Open navigation"><Menu size={19} /></button>
          <button className="project-dashboard-crumb" onClick={onBackToProject}><span><FolderKanban size={13} /> Data Center Alpha</span><b>›</b><strong>Equipment</strong></button>
          <label className="project-dashboard-search"><Search size={14} /><input placeholder="Search site data..." /></label>
          <div className="project-dashboard-user"><button className="project-dashboard-bell" aria-label="Notifications"><Bell size={17} /><i /></button><span className="project-user-divider" /><span className="project-user-copy"><strong>Alex Construction</strong><small>Project Manager</small></span><span className="project-user-avatar">AC</span></div>
        </header>

        <main className="project-dashboard-content">
          <div className="project-dashboard-heading"><div><h1>Equipment Inventory</h1><p>{loading ? 'Loading' : `${assets.length} items`}</p></div><div className="project-dashboard-actions">{/* <button className="project-download"><Download size={14} /> Export Excel</button><button className="project-download"><Plus size={14} /> Import Bulk</button> */}<button className="project-new-issue" onClick={() => setShowAdd(true)}><Plus size={15} /> New Asset</button></div></div>
<section className="assets-metrics"><Metric icon={<Box size={18} />} label="TOTAL EQUIPMENT" value={String(assets.length)} tone="neutral" /><Metric icon={<Check size={18} />} label="INSTALLED" value={String(installedCount)} tone="in-use" /><Metric icon={<Activity size={19} />} label="T&C" value={String(commissionedCount)} tone="testing" /><Metric icon={<Wrench size={18} />} label="DELIVERED" value={String(availableCount)} tone="available" /><Metric icon={<CircleAlert size={18} />} label="NOT STARTED" value={String(maintenanceCount)} tone="maintenance" /></section>
        <section className="assets-filter-area"><div className="assets-search-row"><label className="assets-search"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by equipment ID, name, or type..." /></label></div><div className="assets-chips"><label className="assets-chip-filter">STATUS<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="">ALL</option>{statuses.map((status) => <option key={status} value={status}>{displayStatus(status).toUpperCase()}</option>)}</select></label><label className="assets-chip-filter">TYPE<select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }}><option value="">ALL</option>{types.map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}</select></label><button className="assets-clear" onClick={() => { setQuery(''); setStatusFilter(''); setTypeFilter(''); setPage(1); }}>Clear All</button></div></section>
      <section className="assets-inventory"><div className="assets-inventory-heading"><div><h2><Box size={17} /> Project Equipment</h2><p>{loading ? 'Loading equipment…' : loadError || `${filtered.length} of ${assets.length} project equipment records`}</p></div><div className="assets-view-toggle"><button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><List size={14} /> Table View</button><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Grid2X2 size={14} /> Grid View</button></div></div>{loading ? <div className="assets-empty">Loading project equipment…</div> : loadError ? <div className="assets-empty">{loadError}</div> : view === 'table' ? <AssetTable assets={pageAssets} onSelect={setSelected} onEdit={openEdit} onDelete={openDelete} /> : <div className="assets-grid">{pageAssets.map((asset) => <AssetCard key={asset.id} asset={asset} onSelect={setSelected} />)}</div>}<div className="assets-pagination"><span>Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={12} /> Previous</button><span>{page} / {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight size={12} /></button></div></div></section></main>
    <footer className="project-dashboard-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
      </div>
      {selected && <div className="assets-detail-backdrop" onClick={() => setSelected(null)}><aside className="assets-detail" onClick={(event) => event.stopPropagation()}><button className="assets-close" onClick={() => setSelected(null)}><X size={16} /></button><span className="assets-detail-icon"><Box size={24} /></span><small>{selected.id}</small><h2>{selected.name}</h2><em className={`assets-status ${statusColorClasses[selected.status] || 'maintenance'}`}>{displayStatus(selected.status)}</em><dl><dt>Type</dt><dd>{selected.category}</dd><dt>Sub-package</dt><dd>{selected.subPackage || '—'}</dd><dt>Description</dt><dd>{selected.description || '—'}</dd><dt>Location</dt><dd>{selected.location || '—'}</dd><dt>Project status</dt><dd>{displayStatus(selected.phaseStatus)}</dd></dl>{deleteError && <p className="assets-action-error">{deleteError}</p>}<div className="assets-detail-actions"><button className="assets-blue-button" onClick={() => openEdit(selected)}>Edit Asset</button><button className="assets-danger-button" disabled={deleting} onClick={() => openDelete(selected)}><Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}</button></div></aside></div>}
    {showAdd && <div className="assets-detail-backdrop assets-add-backdrop" onClick={closeAddForm}><form className="assets-add-form" onClick={(event) => event.stopPropagation()} onSubmit={createAsset}><div><h2>New Asset</h2><button type="button" onClick={closeAddForm}><X size={16} /></button></div><label>EQUIPMENT ID *<input required value={selection.equipmentId} onChange={(event) => updateSelection('equipmentId', event.target.value)} placeholder="e.g. UPS-01" /></label><label>PACKAGE *<select required value={selection.package} onChange={(event) => updateSelection('package', event.target.value)}><option value="">Select package</option>{packageOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>SUB-PACKAGE *<select required disabled={!selection.package} value={selection.subPackage} onChange={(event) => updateSelection('subPackage', event.target.value)}><option value="">Select sub-package</option>{subPackageOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>PRODUCT RANGE *<select required disabled={!selection.subPackage} value={selection.productRange} onChange={(event) => updateSelection('productRange', event.target.value)}><option value="">Select product range</option>{productRangeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>MODELS / VARIANTS *<select required disabled={!selection.productRange} value={selection.modelVariant} onChange={(event) => updateSelection('modelVariant', event.target.value)}><option value="">Select model / variant</option>{modelOptions.map((option) => <option key={option.modelVariant} value={option.modelVariant}>{option.modelVariant}</option>)}</select></label>{selectedItem && <div className="assets-add-description"><small>DESCRIPTION</small><p>{selectedItem.description || 'No description available.'}</p></div>}<label>LOCATION (OPTIONAL)<input value={selection.location} onChange={(event) => updateSelection('location', event.target.value)} placeholder="e.g. Mechanical Room A" /></label>{formError && <p className="assets-add-error">{formError}</p>}<div className="assets-add-actions"><button type="button" onClick={closeAddForm}>Cancel</button><button className="assets-blue-button" type="submit" disabled={!selectedItem || !selection.equipmentId.trim() || submitting}>{submitting ? 'Creating…' : 'Create Equipment'}</button></div></form></div>}
    {pendingDelete && <div className="assets-detail-backdrop assets-add-backdrop" onClick={closeDelete}><div className="assets-add-form assets-delete-form" role="alertdialog" aria-labelledby="assets-delete-title" onClick={(event) => event.stopPropagation()}><div><h2 id="assets-delete-title">Delete Equipment</h2><button type="button" aria-label="Close" onClick={closeDelete}><X size={16} /></button></div><div className="assets-delete-warning"><CircleAlert size={18} /><p><strong>{pendingDelete.id}</strong> ({pendingDelete.name}) will be removed from this project.</p></div><p>All checklist results associated with this equipment in this project will be deleted automatically. This action cannot be undone.</p>{deleteError && <p className="assets-add-error">{deleteError}</p>}<div className="assets-add-actions"><button type="button" onClick={closeDelete}>Cancel</button><button type="button" className="assets-danger-solid" disabled={deleting} onClick={() => deleteAsset(pendingDelete)}>{deleting ? 'Deleting…' : 'Delete Equipment'}</button></div></div></div>}
    {editing && <div className="assets-detail-backdrop assets-add-backdrop" onClick={closeEdit}><form className="assets-add-form" onClick={(event) => event.stopPropagation()} onSubmit={saveEdit}><div><h2>Edit Asset</h2><button type="button" onClick={closeEdit}><X size={16} /></button></div><p className="assets-form-context">{editing.name} · {editing.category}</p><label>EQUIPMENT ID *<input required value={editEquipmentId} onChange={(event) => setEditEquipmentId(event.target.value)} /></label><label>LOCATION (OPTIONAL)<input value={editLocation} onChange={(event) => setEditLocation(event.target.value)} placeholder="e.g. Mechanical Room A" /></label>{editError && <p className="assets-add-error">{editError}</p>}<div className="assets-add-actions"><button type="button" onClick={closeEdit}>Cancel</button><button className="assets-blue-button" type="submit" disabled={editSaving}>{editSaving ? 'Saving…' : 'Save Changes'}</button></div></form></div>}
  </div>;
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) { return <article className={`assets-metric assets-metric-${tone}`}><span className={`assets-metric-icon ${tone}`}>{icon}</span><small>{label}</small><strong>{value}</strong></article>; }
function AssetTable({ assets, onSelect, onEdit, onDelete }: { assets: Asset[]; onSelect: (asset: Asset) => void; onEdit: (asset: Asset) => void; onDelete: (asset: Asset) => void }) { return <div className="assets-table"><div className="assets-table-head assets-eq-grid"><span>Equipment ID</span><span>Name</span><span>Type</span><span>Sub-package</span><span>Description</span><span>Location</span><span>Status</span><span>Actions</span></div>{assets.map((asset) => <div className="assets-row assets-eq-grid" role="button" tabIndex={0} key={asset.id} onClick={() => onSelect(asset)} onKeyDown={(event) => { if (event.key === 'Enter') onSelect(asset); }}><span><b>{asset.id}</b></span><span><strong>{asset.name}</strong></span><span>{asset.category}</span><span>{asset.subPackage || '—'}</span><span className="assets-row-description" title={asset.description}>{asset.description || '—'}</span><span className="assets-row-description" title={asset.location}>{asset.location || '—'}</span><span><em className={`assets-status ${statusColorClasses[asset.status] || 'maintenance'}`}>{displayStatus(asset.status)}</em></span><span className="assets-row-actions"><button type="button" aria-label={`Edit ${asset.id}`} title="Edit" onClick={(event) => { event.stopPropagation(); onEdit(asset); }}><Pencil size={13} /></button><button type="button" className="assets-row-delete" aria-label={`Delete ${asset.id}`} title="Delete" onClick={(event) => { event.stopPropagation(); onDelete(asset); }}><Trash2 size={13} /></button></span></div>)}{assets.length === 0 && <div className="assets-empty">No project equipment matches these filters.</div>}</div>; }
function AssetCard({ asset, onSelect }: { asset: Asset; onSelect: (asset: Asset) => void }) { return <button className="assets-card" onClick={() => onSelect(asset)}><span className="assets-detail-icon"><Box size={20} /></span><div><strong>{asset.name}</strong><small>{asset.id}</small></div><em className={`assets-status ${statusColorClasses[asset.status] || 'maintenance'}`}>{displayStatus(asset.status)}</em><p>{asset.category} · {asset.subPackage || 'No sub-package'}</p></button>; }
export default AssetsEquip;
