'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { db, Registration } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRegistrations() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'registrations'));
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Registration[];
      setRegistrations(data);
      setLoading(false);
    }
    fetchRegistrations();
  }, []);

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this registration?')) {
      await deleteDoc(doc(db, 'registrations', id));
      setRegistrations(registrations.filter(r => r.id !== id));
    }
  }

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-primary">Manage Registrations</h1>
          <Link href="/admin/registrations/new" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Add Registration</Link>
        </div>
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="font-bold text-xl mb-4">Registrations List</h2>
          {loading ? (
            <p>Loading...</p>
          ) : registrations.length === 0 ? (
            <p className="text-muted-foreground mb-4">No registrations found.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Parent</th>
                  <th className="text-left p-2">Child</th>
                  <th className="text-left p-2">Facility</th>
                  <th className="text-left p-2">Class</th>
                  <th className="text-left p-2">Session</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id} className="border-t">
                    <td className="p-2">{reg.parentName}</td>
                    <td className="p-2">{reg.childName}</td>
                    <td className="p-2">{reg.facilityId}</td>
                    <td className="p-2">{reg.classId}</td>
                    <td className="p-2">{reg.sessionLength} weeks</td>
                    <td className="p-2">{reg.status}</td>
                    <td className="p-2">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                        onClick={() => router.push(`/admin/registrations/${reg.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/80"
                        onClick={() => handleDelete(reg.id)}
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
  );
} 