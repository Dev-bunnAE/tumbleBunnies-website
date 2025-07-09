'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { db, Facility } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchFacilities() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'facilities'));
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Facility[];
      setFacilities(data);
      setLoading(false);
    }
    fetchFacilities();
  }, []);

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this facility?')) {
      await deleteDoc(doc(db, 'facilities', id));
      setFacilities(facilities.filter(f => f.id !== id));
    }
  }

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-primary">Manage Facilities</h1>
          <Link href="/admin/facilities/new" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Add Facility</Link>
        </div>
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="font-bold text-xl mb-4">Facilities List</h2>
          {loading ? (
            <p>Loading...</p>
          ) : facilities.length === 0 ? (
            <p className="text-muted-foreground mb-4">No facilities found.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Address</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Registration Code</th>
                  <th className="text-left p-2">Session Lengths</th>
                  <th className="text-left p-2">Classes</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map(facility => (
                  <tr key={facility.id} className="border-t">
                    <td className="p-2">{facility.name}</td>
                    <td className="p-2">{facility.address}</td>
                    <td className="p-2">{facility.phone}</td>
                    <td className="p-2">{facility.registrationCode}</td>
                    <td className="p-2">{facility.sessionLengths?.join(', ')}</td>
                    <td className="p-2">{facility.classIds?.join(', ')}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                        onClick={() => router.push(`/admin/facilities/${facility.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/80"
                        onClick={() => handleDelete(facility.id)}
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