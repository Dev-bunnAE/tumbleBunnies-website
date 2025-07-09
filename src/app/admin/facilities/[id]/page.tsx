'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { db, Facility } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_OPTIONS = [5, 6, 7, 8];

export default function EditFacility() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [form, setForm] = useState<Facility | null>(null);
  const [classOptions, setClassOptions] = useState<{id: string, name: string}[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchFacility() {
      if (!id) return;
      const docRef = doc(db, 'facilities', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setForm({ id: snap.id, ...snap.data() } as Facility);
      }
    }
    fetchFacility();
  }, [id]);

  useEffect(() => {
    async function fetchClasses() {
      const snapshot = await getDocs(collection(db, 'classes'));
      const classList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as {id: string, name: string}));
      classList.sort((a, b) => a.name.localeCompare(b.name));
      setClassOptions(classList);
    }
    fetchClasses();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (!form) return;
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name === 'sessionLengths') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => f && ({
        ...f,
        sessionLengths: checked
          ? [...f.sessionLengths, Number(value)]
          : f.sessionLengths.filter(v => v !== Number(value)),
      }));
    } else if (type === 'checkbox' && name === 'classIds') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => f && ({
        ...f,
        classIds: checked
          ? [...f.classIds, value]
          : f.classIds.filter(id => id !== value),
      }));
    } else {
      setForm(f => f && ({ ...f, [name]: value }));
    }
  }

  function handlePricingChange(classId: string, sessionLength: number, value: string) {
    if (!form) return;
    const price = value === '' ? '' : Number(value);
    setForm(f => f && ({
      ...f,
      pricing: {
        ...((f && f.pricing) || {}),
        [classId]: {
          ...((f && f.pricing && f.pricing[classId]) || {}),
          [sessionLength]: price,
        },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const { id, ...data } = form;
    await updateDoc(doc(db, 'facilities', id), data);
    setSaving(false);
    router.push('/admin/facilities');
  }

  if (!form) {
    return (
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Edit Facility</h1>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Edit Facility</h1>
        <form className="bg-card rounded-lg shadow-md p-6 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full p-2 border rounded" name="name" placeholder="Facility Name" value={form.name} onChange={handleChange} required />
          <input className="w-full p-2 border rounded" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
          <input className="w-full p-2 border rounded" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
          <input className="w-full p-2 border rounded" name="registrationCode" placeholder="Registration Code" value={form.registrationCode} onChange={handleChange} required />
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Session Lengths</span>
            <div className="flex gap-4">
              {SESSION_OPTIONS.map(opt => (
                <label key={opt} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="sessionLengths"
                    value={opt}
                    checked={form.sessionLengths.includes(opt)}
                    onChange={handleChange}
                  />
                  {opt} weeks
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Classes</span>
            <div className="flex gap-4 flex-wrap">
              {classOptions.length === 0 ? (
                <span className="text-muted-foreground">No classes found.</span>
              ) : (
                classOptions.map(opt => (
                  <label key={opt.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="classIds"
                      value={opt.id}
                      checked={form.classIds.includes(opt.id)}
                      onChange={handleChange}
                    />
                    {opt.name}
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Pricing Matrix</span>
            {form.classIds.length === 0 || form.sessionLengths.length === 0 ? (
              <span className="text-muted-foreground">Select at least one class and session length to set pricing.</span>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr>
                      <th className="p-2 border-b bg-muted">Class \ Session</th>
                      {form.sessionLengths.map(session => (
                        <th key={session} className="p-2 border-b bg-muted">{session} weeks</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.classIds.map(classId => {
                      const className = classOptions.find(c => c.id === classId)?.name || classId;
                      return (
                        <tr key={classId}>
                          <td className="p-2 border-r font-semibold">{className}</td>
                          {form.sessionLengths.map(session => (
                            <td key={session} className="p-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-24 p-1 border rounded"
                                placeholder="$"
                                value={form.pricing?.[classId]?.[session] ?? ''}
                                onChange={e => handlePricingChange(classId, session, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold w-full disabled:opacity-50"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/admin/facilities" className="text-primary hover:underline">Back to Facilities</Link>
        </div>
      </main>
    </div>
  );
} 