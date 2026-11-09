import { useEffect, useState } from 'react';
import './checklist-activity.css';

type Comment = { commentId: string; parentCommentId: string | null; body: string; authorName: string; createdAt: string };
type Document = { documentId: string; originalName: string; byteSize: number; authorName: string; createdAt: string };
type Activity = { comments: Comment[]; documents: Document[]; members: { userId: string; name: string }[] };

async function checked(response: Response) {
  if (!response.ok) {
    const result: { error?: string } = await response.json();
    throw new Error(result.error || `Request failed (${response.status}).`);
  }
  return response;
}

function ActivityPanel({ baseUrl }: { baseUrl: string }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [authorId, setAuthorId] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState<Comment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${baseUrl}/activity`, { signal: controller.signal }).then(checked)
      .then((response) => response.json() as Promise<Activity>)
      .then((result) => { if (!controller.signal.aborted) setActivity(result); })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load comments and documents.'); });
    return () => controller.abort();
  }, [baseUrl]);

  const refresh = async () => {
    const response = await checked(await fetch(`${baseUrl}/activity`));
    setActivity(await response.json() as Activity);
  };

  const submit = async (kind: 'comment' | 'document') => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (!authorId) throw new Error('Select an active project member.');
      if (kind === 'document') {
        if (!file || file.size === 0 || file.size > 10 * 1024 * 1024) throw new Error('Select a nonempty document up to 10 MB.');
        await checked(await fetch(`${baseUrl}/documents?${new URLSearchParams({ authorId, name: file.name })}`, {
          method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file,
        }));
        setFile(null);
      } else {
        await checked(await fetch(`${baseUrl}/comments`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorId, body, parentCommentId: reply?.commentId || null }),
        }));
        setBody('');
        setReply(null);
      }
      setNotice(kind === 'comment' ? 'Comment saved.' : 'Document uploaded.');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save checklist activity.');
    } finally { setBusy(false); }
  };

  return <div className="checklist-activity-panel">
    {error && <p role="alert">{error} <button type="button" disabled={busy} onClick={() => {
      setError('');
      refresh().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to refresh activity.'));
    }}>Reload</button></p>}
    {notice && <p role="status">{notice}</p>}
    {!activity && !error && <p role="status">Loading comments and documents...</p>}
    {activity && <>
      <label>Post as (selected attribution, not verified sign-in)
        <select value={authorId} disabled={busy} onChange={(event) => setAuthorId(event.target.value)}>
          <option value="">Select active project member</option>
          {activity.members.map((member) => <option value={member.userId} key={member.userId}>{member.name}</option>)}
        </select>
      </label>
      {activity.members.length === 0 && <p>No active project members are available to post.</p>}
      <h5>Comments</h5>
      {activity.comments.length === 0 && <p>No comments yet.</p>}
      {activity.comments.map((comment) => <article key={comment.commentId} className={comment.parentCommentId ? 'checklist-comment reply' : 'checklist-comment'}>
        {comment.parentCommentId && <small>Reply to {activity.comments.find((parent) => parent.commentId === comment.parentCommentId)?.authorName || 'comment'} (#{comment.parentCommentId})</small>}
        <strong>{comment.authorName}</strong> <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>
        <p>{comment.body}</p>
        <button type="button" disabled={busy} onClick={() => setReply(comment)}>Reply</button>
      </article>)}
      <form onSubmit={(event) => { event.preventDefault(); void submit('comment'); }}>
        {reply && <p>Replying to {reply.authorName}: {reply.body} <button type="button" disabled={busy} onClick={() => setReply(null)}>Cancel reply</button></p>}
        <label>{reply ? 'Your reply' : 'New comment'}<textarea value={body} maxLength={5000} required disabled={busy} onChange={(event) => setBody(event.target.value)} /></label>
        <button type="submit" disabled={busy || !authorId || !body.trim()}>{busy ? 'Saving...' : reply ? 'Post reply' : 'Post comment'}</button>
      </form>
      <h5>Documents</h5>
      {activity.documents.length === 0 && <p>No documents attached.</p>}
      <ul>{activity.documents.map((document) => <li key={document.documentId}>
        <a href={`${baseUrl}/documents/${document.documentId}`}>{document.originalName}</a>
        {' '}({Math.ceil(document.byteSize / 1024)} KB) - {document.authorName}
        {' '}<time dateTime={document.createdAt}>{new Date(document.createdAt).toLocaleString()}</time>
      </li>)}</ul>
      <form onSubmit={(event) => { event.preventDefault(); void submit('document'); }}>
        <label>Attach document (maximum 10 MB)<input type="file" disabled={busy} onChange={(event) => {
          setFile(event.target.files?.[0] || null);
          event.target.value = '';
        }} /></label>
        {file && <p>Selected: {file.name}</p>}
        <button type="submit" disabled={busy || !authorId || !file}>Upload document</button>
      </form>
    </>}
  </div>;
}

export default function ChecklistActivity({ projectId, projectEquipmentId, checklistId }: {
  projectId: string; projectEquipmentId: string; checklistId: string;
}) {
  const [open, setOpen] = useState(false);
  const baseUrl = `http://localhost:4000/projects/${encodeURIComponent(projectId)}/equipment/${encodeURIComponent(projectEquipmentId)}/checklists/${encodeURIComponent(checklistId)}`;
  return <div className="checklist-activity">
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>Comments &amp; documents</button>
    {open && <ActivityPanel key={baseUrl} baseUrl={baseUrl} />}
  </div>;
}
