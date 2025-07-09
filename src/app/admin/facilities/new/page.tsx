'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_OPTIONS = [5, 6, 7, 8];

export default function AddFacility() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    registrationCode: '',
    availablePairs: [] as { classId: string, sessionLength: number }[],
    pricing: {} as { [classId: string]: { [sessionLength: string]: number } },
  });
  const [classOptions, setClassOptions] = useState<{id: string, name: string}[]>([]);
  const [pairToAdd, setPairToAdd] = useState<{classId: string, sessionLength: number}>({ classId: '', sessionLength: 5 });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchClasses() {
      const snapshot = await getDocs(collection(db, 'classes'));
      const classList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as {id: string, name: string}));
      classList.sort((a, b) => a.name.localeCompare(b.name));
      setClassOptions(classList);
    }
    fetchClasses();
  }, []);

  function formatPhoneNumber(value: string) {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as (123) 456-6788
    const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    let formatted = '';
    if (match[1]) {
      formatted = `(${match[1]}`;
    }
    if (match[2]) {
      formatted += match[2].length === 3 ? `) ${match[2]}` : match[2];
    }
    if (match[3]) {
      formatted += match[3] ? `-${match[3]}` : '';
    }
    return formatted;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name === 'sessionLengths') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => ({
        ...f,
        sessionLengths: checked
          ? [...f.sessionLengths, Number(value)]
          : f.sessionLengths.filter(v => v !== Number(value)),
      }));
    } else if (type === 'checkbox' && name === 'classIds') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => ({
        ...f,
        classIds: checked
          ? [...f.classIds, value]
          : f.classIds.filter(id => id !== value),
      }));
    } else if (name === 'phone') {
      setForm(f => ({ ...f, phone: formatPhoneNumber(value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handlePricingChange(classId: string, sessionLength: number, value: string) {
    const price = value === '' ? '' : Number(value);
    setForm(f => ({
      ...f,
      pricing: {
        ...f.pricing,
        [classId]: {
          ...(f.pricing[classId] || {}),
          [sessionLength]: price,
        },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, 'facilities'), form);
      await router.push('/admin/facilities');
    } catch (err) {
      // Optionally, show a toast or alert here
      alert('Failed to save facility. Please try again.');
      setSaving(false);
    }
  }

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Add Facility</h1>
          <form className="bg-card rounded-lg shadow-md p-6 space-y-4" onSubmit={handleSubmit}>
            <input className="w-full p-2 border rounded" name="name" placeholder="Facility Name" value={form.name} onChange={handleChange} required />
            <input className="w-full p-2 border rounded" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
            <input className="w-full p-2 border rounded" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
            <input className="w-full p-2 border rounded" name="registrationCode" placeholder="Registration Code" value={form.registrationCode} onChange={handleChange} required />
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
              {saving ? 'Saving...' : 'Save Facility'}
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