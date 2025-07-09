'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import { db, Merchandise } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminMerchandise() {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    async function fetchMerchandise() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'merchandise'));
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Merchandise[];
      setMerchandise(data);
      setLoading(false);
    }
    fetchMerchandise();
  }, []);

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this merchandise item?')) {
      await deleteDoc(doc(db, 'merchandise', id));
      setMerchandise(merchandise.filter(m => m.id !== id));
    }
  }

  async function handleToggle(id: string) {
    const item = merchandise.find(m => m.id === id);
    if (!item) return;
    
    await updateDoc(doc(db, 'merchandise', id), { enabled: !item.enabled });
    setMerchandise(merchandise.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  }

  // Filtering logic
  const filteredMerchandise = merchandise.filter(item => {
    // Status filter
    if (statusFilter !== 'all' && item.enabled !== (statusFilter === 'enabled')) {
      return false;
    }
    // Search filter
    const searchLower = search.toLowerCase();
    if (searchLower) {
      if (
        !item.name.toLowerCase().includes(searchLower) &&
        !item.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline font-bold text-primary">Manage Merchandise</h1>
            <Link href="/admin/merchandise/new" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Add Merchandise</Link>
          </div>
          
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold mb-1">Search</label>
              <input
                className="p-2 border rounded w-48"
                placeholder="Name, description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                className="p-2 border rounded"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="font-bold text-xl mb-4">Merchandise List</h2>
            {loading ? (
              <p>Loading...</p>
            ) : filteredMerchandise.length === 0 ? (
              <p className="text-muted-foreground mb-4">No merchandise found.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchandise.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">${item.price.toFixed(2)}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          className="bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                          onClick={() => router.push(`/admin/merchandise/${item.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-2 py-1 rounded ${
                            item.enabled 
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                          onClick={() => handleToggle(item.id)}
                        >
                          {item.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/80"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 