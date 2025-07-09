'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddMerchandise() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    
    if (!form.name || form.price <= 0) {
      console.log('Validation failed:', { name: form.name, price: form.price });
      alert('Please fill in all required fields and ensure price is greater than 0');
      return;
    }

    setSaving(true);
    try {
      console.log('Adding merchandise to Firestore...');
      const docRef = await addDoc(collection(db, 'merchandise'), {
        ...form,
        createdAt: Date.now(),
      });
      console.log('Merchandise added successfully with ID:', docRef.id);
      alert('Merchandise added successfully!');
      router.push('/admin/merchandise');
    } catch (error) {
      console.error('Error adding merchandise:', error);
      alert('Error adding merchandise: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Add Merchandise</h1>
          
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
                {saving ? 'Saving...' : 'Add Merchandise'}
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