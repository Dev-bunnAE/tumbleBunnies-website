'use client';

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
    sessionLengths: [] as number[],
    classIds: [] as string[],
    pricing: {} as { [classId: string]: { [sessionLength: string]: number } },
  });
  const [classOptions, setClassOptions] = useState<{id: string, name: string}[]>([]);
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
                                value={form.pricing[classId]?.[session] ?? ''}
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
            {saving ? 'Saving...' : 'Save Facility'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/admin/facilities" className="text-primary hover:underline">Back to Facilities</Link>
        </div>
      </main>
    </div>
  );
} 