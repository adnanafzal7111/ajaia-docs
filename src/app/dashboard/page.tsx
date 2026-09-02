'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Upload, LogOut, Share2, Clock } from 'lucide-react';

interface Doc {
  id: string;
  title: string;
  updatedAt: string;
  sharedBy?: { name: string; email: string };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [owned, setOwned] = useState<Doc[]>([]);
  const [shared, setShared] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchDocs();
  }, [status]);

  async function fetchDocs() {
    setLoading(true);
    const res = await fetch('/api/documents');
    const data = await res.json();
    setOwned(data.owned || []);
    setShared(data.shared || []);
    setLoading(false);
  }

  async function createDoc() {
    setCreating(true);
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled Document' }),
    });
    const doc = await res.json();
    setCreating(false);
    router.push(`/doc/${doc.id}`);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const doc = await res.json();
      router.push(`/doc/${doc.id}`);
    } else {
      const err = await res.json();
      alert(err.error || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileText className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">Ajaia Docs</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.name || session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={createDoc}
            disabled={creating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            <Plus size={18} /> {creating ? 'Creating...' : 'New Document'}
          </button>
          <label className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium cursor-pointer transition">
            <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload File'}
            <input type="file" accept=".txt,.md,.docx" onChange={handleUpload} className="hidden" />
          </label>
          <span className="text-xs text-gray-400">Supported: .txt, .md, .docx</span>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Documents</h2>
          {owned.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500">No documents yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {owned.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/doc/${doc.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition group"
                >
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 group-hover:bg-blue-100 transition">
                    <FileText className="text-blue-400" size={28} />
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={11} />{timeAgo(doc.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {shared.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Share2 size={18} /> Shared with Me
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {shared.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/doc/${doc.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-green-300 transition group"
                >
                  <div className="bg-green-50 rounded-lg p-3 mb-3 group-hover:bg-green-100 transition">
                    <FileText className="text-green-400" size={28} />
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={11} />{timeAgo(doc.updatedAt)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Shared by {doc.sharedBy?.name || doc.sharedBy?.email}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
