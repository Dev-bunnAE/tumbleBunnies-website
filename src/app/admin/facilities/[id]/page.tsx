'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
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
  const [pairToAdd, setPairToAdd] = useState<{classId: string, sessionLength: number}>({ classId: '', sessionLength: 5 });

  useEffect(() => {
    async function fetchFacility() {
      if (!id) return;
      const docRef = doc(db, 'facilities', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setForm({ 
          id: snap.id, 
          ...data,
          availablePairs: data.availablePairs || [],
          pricing: data.pricing || {}
        } as Facility);
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
    const { name, value } = e.target;
    setForm(f => f && ({ ...f, [name]: value }));
  }

  function handlePricingChange(classId: string, sessionLength: number, value: string) {
    if (!form) return;
    const price = value === '' ? 0 : Number(value);
    setForm(f => {
      if (!f) return f;
      return {
        ...f,
        pricing: {
          ...f.pricing,
          [classId]: {
            ...f.pricing[classId],
            [sessionLength]: price,
          },
        },
      };
    });
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
      <AdminAuthGuard>
        <div>
          <AdminHeader />
          <main className="container mx-auto px-4 py-12 max-w-xl">
            <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Edit Facility</h1>
            <p>Loading...</p>
          </main>
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Edit Facility</h1>
          <form className="bg-card rounded-lg shadow-md p-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Facility Name</label>
              <input 
                className="w-full p-2 border rounded" 
                name="name" 
                placeholder="Enter facility name" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input 
                className="w-full p-2 border rounded" 
                name="address" 
                placeholder="Enter facility address" 
                value={form.address} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input 
                className="w-full p-2 border rounded" 
                name="phone" 
                placeholder="Enter phone number" 
                value={form.phone} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Registration Code</label>
              <input 
                className="w-full p-2 border rounded" 
                name="registrationCode" 
                placeholder="Enter registration code" 
                value={form.registrationCode} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Class-Session Pairs</span>
              <div className="space-y-2 mb-2">
                {form.availablePairs.length === 0 ? (
                  <span className="text-muted-foreground">No pairs added.</span>
                ) : (
                  form.availablePairs.map((pair, idx) => {
                    const className = classOptions.find(c => c.id === pair.classId)?.name || pair.classId;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span>{className} – {pair.sessionLength} weeks</span>
                        <button type="button" className="text-destructive underline text-xs" onClick={() => {
                          setForm(f => f && ({
                            ...f,
                            availablePairs: f.availablePairs.filter((p, i) => i !== idx),
                          }));
                        }}>Remove</button>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex gap-2 items-center">
                <select className="p-2 border rounded" value={pairToAdd.classId} onChange={e => setPairToAdd(p => ({ ...p, classId: e.target.value }))}>
                  <option value="" disabled>Select Class</option>
                  {classOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <select className="p-2 border rounded" value={pairToAdd.sessionLength} onChange={e => setPairToAdd(p => ({ ...p, sessionLength: Number(e.target.value) }))}>
                  {[5,6,7,8].map(opt => (
                    <option key={opt} value={opt}>{opt} weeks</option>
                  ))}
                </select>
                <button type="button" className="bg-primary text-primary-foreground px-2 py-1 rounded" onClick={() => {
                  if (!pairToAdd.classId || form.availablePairs.some(p => p.classId === pairToAdd.classId && p.sessionLength === pairToAdd.sessionLength)) return;
                  setForm(f => f && ({
                    ...f,
                    availablePairs: [...f.availablePairs, { ...pairToAdd }],
                  }));
                }}>Add Pair</button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Pricing Matrix</span>
              {form.availablePairs.length === 0 ? (
                <span className="text-muted-foreground">Add at least one class-session pair to set pricing.</span>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead>
                      <tr>
                        <th className="p-2 border-b bg-muted">Class</th>
                        <th className="p-2 border-b bg-muted">Session Length</th>
                        <th className="p-2 border-b bg-muted">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.availablePairs.map(pair => {
                        const className = classOptions.find(c => c.id === pair.classId)?.name || pair.classId;
                        return (
                          <tr key={pair.classId + '-' + pair.sessionLength}>
                            <td className="p-2 border-r font-semibold">{className}</td>
                            <td className="p-2 border-r">{pair.sessionLength} weeks</td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-24 p-1 border rounded"
                                  placeholder="0.00"
                                  value={form.pricing?.[pair.classId]?.[pair.sessionLength] ?? ''}
                                  onChange={e => handlePricingChange(pair.classId, pair.sessionLength, e.target.value)}
                                />
                              </div>
                            </td>
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
    </AdminAuthGuard>
  );
} 