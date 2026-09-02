'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Share2, Trash2, Check, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const TipTapEditor = dynamic(
  () => import('@/components/editor/TipTapEditor'),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 h-96 rounded-lg" /> }
);

interface Share { user: { id: string; name: string; email: string } }
interface Doc {
  id: string;
  title: string;
  content: string;
  role: 'owner' | 'shared';
  owner: { name: string; email: string };
  shares: Share[];
}

export default function DocPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [doc, setDoc] = useState<Doc | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') loadDoc();
  }, [status, id]);

  async function loadDoc() {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) { router.push('/dashboard'); return; }
    const data = await res.json();
    setDoc(data);
    setTitle(data.title);
    setContent(data.content);
  }

  const autoSave = useCallback(async (newContent: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  }, [id]);

  async function saveTitle() {
    if (!title.trim()) return;
    await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
  }

  async function shareDoc() {
    setShareError(''); setShareSuccess('');
    if (!shareEmail.trim()) return;
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: id, email: shareEmail }),
    });
    if (res.ok) {
      setShareSuccess(`Shared with ${shareEmail}`);
      setShareEmail('');
      loadDoc();
    } else {
      const err = await res.json();
      setShareError(err.error || 'Share failed');
    }
  }

  async function removeShare(userId: string) {
    await fetch('/api/share', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: id, userId }),
    });
    loadDoc();
  }

  async function deleteDoc() {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  }

  if (status === 'loading' || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-900 p-1 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            className="flex-1 text-lg font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 min-w-0"
            placeholder="Document title"
          />
          <div className="flex items-center gap-2 shrink-0">
            {saving && <span className="text-xs text-gray-400">Saving...</span>}
            {saved && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Check size={12} />Saved
              </span>
            )}
            {doc.role === 'shared' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Shared by {doc.owner.name || doc.owner.email}
              </span>
            )}
            {doc.role === 'owner' && (
              <>
                <button
                  onClick={() => setShowShare(!showShare)}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                >
                  <Share2 size={16} /> Share
                </button>
                <button
                  onClick={deleteDoc}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {showShare && doc.role === 'owner' && (
          <div className="max-w-5xl mx-auto mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Share this document</p>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={shareEmail}
                onChange={e => setShareEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && shareDoc()}
                placeholder="Enter email address (e.g. bob@ajaia.com)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={shareDoc}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Share
              </button>
            </div>
            {shareError && <p className="text-red-500 text-xs mb-2">{shareError}</p>}
            {shareSuccess && <p className="text-green-500 text-xs mb-2">{shareSuccess}</p>}
            {doc.shares.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Shared with:</p>
                <div className="space-y-1">
                  {doc.shares.map(s => (
                    <div key={s.user.id} className="flex items-center justify-between py-1 px-2 bg-white rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-700">
                        {s.user.name} <span className="text-gray-400">({s.user.email})</span>
                      </span>
                      <button
                        onClick={() => removeShare(s.user.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Remove access"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        <TipTapEditor
          content={content}
          onChange={newContent => {
            setContent(newContent);
            autoSave(newContent);
          }}
        />
      </main>
    </div>
  );
}
