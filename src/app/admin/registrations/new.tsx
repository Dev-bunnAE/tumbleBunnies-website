'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_OPTIONS = [5, 6, 7, 8];
const STATUS_OPTIONS = ['active', 'cancelled', 'completed'];

export default function AddRegistration() {
  const [form, setForm] = useState({
    parentName: '',
    childName: '',
    facilityId: '',
    classId: '',
    sessionLength: SESSION_OPTIONS[0],
    status: STATUS_OPTIONS[0],
  });
  const [facilities, setFacilities] = useState<{id: string, name: string}[]>([]);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchOptions() {
      const facSnap = await getDocs(collection(db, 'facilities'));
      setFacilities(facSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as {id: string, name: string})));
      const classSnap = await getDocs(collection(db, 'classes'));
      setClasses(classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as {id: string, name: string})));
    }
    fetchOptions();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'sessionLength' ? Number(value) : value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    await addDoc(collection(db, 'registrations'), {
      ...form,
      createdAt: Date.now(),
    });
    setSaving(false);
    router.push('/admin/registrations');
  }

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Add Registration</h1>
        <form className="bg-card rounded-lg shadow-md p-6 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full p-2 border rounded" name="parentName" placeholder="Parent Name" value={form.parentName} onChange={handleChange} required />
          <input className="w-full p-2 border rounded" name="childName" placeholder="Child Name" value={form.childName} onChange={handleChange} required />
          <select className="w-full p-2 border rounded" name="facilityId" value={form.facilityId} onChange={handleChange} required>
            <option value="">Select Facility</option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <select className="w-full p-2 border rounded" name="classId" value={form.classId} onChange={handleChange} required>
            <option value="">Select Class</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="w-full p-2 border rounded" name="sessionLength" value={form.sessionLength} onChange={handleChange} required>
            {SESSION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt} weeks</option>
            ))}
          </select>
          <select className="w-full p-2 border rounded" name="status" value={form.status} onChange={handleChange} required>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold w-full disabled:opacity-50"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Registration'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/admin/registrations" className="text-primary hover:underline">Back to Registrations</Link>
        </div>
      </main>
    </div>
  );
} 