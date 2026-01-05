import React, { useState, useEffect, useMemo } from 'react';
import { getSubmissionsByContest } from '../services/SubmissionsService';

const PAGE_SIZE = 8;

const SubmissionsPanel = ({ contestId }) => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');

  useEffect(() => { setPage(1); }, [usernameFilter, verdictFilter]);

  useEffect(() => {
    if (!contestId) return setSubs([]);
    setLoading(true);
    (async () => {
      try {
        const data = await getSubmissionsByContest(contestId);
        setSubs(data || []);
      } catch (err) {
        console.error('Failed to load submissions:', err);
        setSubs([]);
      } finally { setLoading(false); }
    })();
  }, [contestId]);

  const filtered = useMemo(() => {
    return subs.filter(s => {
      if (usernameFilter && !(s.username || s.user_id || '').toLowerCase().includes(usernameFilter.toLowerCase())) return false;
      if (verdictFilter && !(s.verdict || s.result?.verdict || '').toLowerCase().includes(verdictFilter.toLowerCase())) return false;
      return true;
    });
  }, [subs, usernameFilter, verdictFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const downloadCSV = () => {
    const header = ['submission_id','username','user_id','problem_index','verdict','status','time','memory','created_at'];
    const lines = [header.join(',')];
    filtered.forEach(s => {
      const row = [s.id, (s.username || '').replace(/"/g,'""'), s.user_id || '', s.problem_index ?? s.problemIndex ?? '', s.verdict || '', s.status || '', s.time ?? '', s.memory ?? '', s.created_at || s.createdAt || ''];
      lines.push(row.map(c => `"${String(c).replace(/"/g,'""') }"`).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `submissions_${contestId || 'contest'}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  if (!contestId) return <div className="p-4 text-sm text-gray-600">No contest context provided. Submissions are only available within a contest.</div>;
  if (loading) return <div className="p-4 text-sm text-gray-600">Loading submissions...</div>;
  if (!subs || subs.length === 0) return <div className="p-4 text-sm text-gray-600">No submissions yet for this contest.</div>;

  return (
    <div className="p-4 text-sm text-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <input placeholder="Filter by username" value={usernameFilter} onChange={e=>setUsernameFilter(e.target.value)} className="px-3 py-1 border rounded" />
        <input placeholder="Filter by verdict" value={verdictFilter} onChange={e=>setVerdictFilter(e.target.value)} className="px-3 py-1 border rounded" />
        <button onClick={downloadCSV} className="ml-auto px-3 py-1 bg-blue-600 text-white rounded">Export CSV</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {pageItems.map(s => (
          <div key={s.id} className="p-3 rounded border bg-white">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{s.username || s.user_id || 'unknown'}</div>
              <div className="text-xs text-gray-500">{new Date(s.created_at || s.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-xs text-gray-600 mt-2">Problem #{s.problem_index ?? s.problemIndex ?? 0} • {s.verdict || s.result?.verdict || '—'}</div>
            <pre className="mt-2 font-mono text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">{(s.code || '').slice(0, 1000)}</pre>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-gray-600">Showing {filtered.length} results</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 border rounded">Prev</button>
          <div className="text-xs">Page {page} / {totalPages}</div>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPanel;
