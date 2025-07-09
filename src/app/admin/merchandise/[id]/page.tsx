'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import { db, Merchandise } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditMerchandise() {
  const [merchandise, setMerchandise] = useState<Merchandise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    enabled: true,
  });
  const params = useParams();
  const router = useRouter();
  const merchandiseId = params?.id as string;

  useEffect(() => {
    async function fetchMerchandise() {
      if (!merchandiseId) return;
      
      setLoading(true);
      try {
        const merchandiseDoc = await getDoc(doc(db, 'merchandise', merchandiseId));
        if (merchandiseDoc.exists()) {
          const data = { id: merchandiseDoc.id, ...merchandiseDoc.data() } as Merchandise;
          setMerchandise(data);
          setForm({
            name: data.name,
            description: data.description,
            price: data.price,
            enabled: data.enabled,
          });
        } else {
          alert('Merchandise not found');
          router.push('/admin/merchandise');
        }
      } catch (error) {
        console.error('Error fetching merchandise:', error);
        alert('Error loading merchandise');
      } finally {
        setLoading(false);
      }
    }

    fetchMerchandise();
  }, [merchandiseId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchandise || !form.name || form.price <= 0) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'merchandise', merchandiseId), {
        name: form.name,
        description: form.description,
        price: form.price,
        enabled: form.enabled,
      });
      alert('Merchandise updated successfully');
      router.push('/admin/merchandise');
    } catch (error) {
      console.error('Error updating merchandise:', error);
      alert('Error updating merchandise');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminAuthGuard>
        <div>
          <AdminHeader />
          <main className="container mx-auto px-4 py-12 max-w-xl">
            <div className="text-center">Loading...</div>
          </main>
        </div>
      </AdminAuthGuard>
    );
  }

  if (!merchandise) {
    return (
      <AdminAuthGuard>
        <div>
          <AdminHeader />
          <main className="container mx-auto px-4 py-12 max-w-xl">
            <div className="text-center">Merchandise not found</div>
          </main>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Edit Merchandise</h1>
          
          <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full p-2 border rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Merchandise name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input
                className="w-full p-2 border rounded"
                type="number"
                step="0.01"
                min="0.01"
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Price must be greater than $0.00</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                id="enabled"
              />
              <label htmlFor="enabled">Enabled</label>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold flex-1 hover:bg-primary/90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Update Merchandise'}
              </button>
              <Link
                href="/admin/merchandise"
                className="bg-gray-500 text-white px-4 py-2 rounded font-semibold flex-1 text-center hover:bg-gray-600"
              >
                Cancel
              </Link>
            </div>
          </form>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 