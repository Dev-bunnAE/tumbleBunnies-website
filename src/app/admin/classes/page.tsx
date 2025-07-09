'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import { Class, db } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Baby, Dumbbell, Hand, Heart, Music, Palette, PersonStanding, Rabbit, Smile, Sparkles } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchClasses() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'classes'));
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Class[];
      data.sort((a, b) => a.name.localeCompare(b.name));
      setClasses(data);
      setLoading(false);
    }
    fetchClasses();
  }, []);

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this class?')) {
      await deleteDoc(doc(db, 'classes', id));
      setClasses(classes.filter(c => c.id !== id));
    }
  }

  // Helper to pick an icon for each class
  const classIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("ballet") || lower.includes("dance") || lower.includes("hip hop")) return <PersonStanding className="h-8 w-8 text-primary" />;
    if (lower.includes("gymnastics")) return <Dumbbell className="h-8 w-8 text-primary" />;
    if (lower.includes("cheer")) return <Sparkles className="h-8 w-8 text-primary" />;
    if (lower.includes("karate")) return <Hand className="h-8 w-8 text-primary" />;
    if (lower.includes("art")) return <Palette className="h-8 w-8 text-primary" />;
    if (lower.includes("music")) return <Music className="h-8 w-8 text-primary" />;
    if (lower.includes("yoga")) return <Heart className="h-8 w-8 text-primary" />;
    if (lower.includes("zumba")) return <Smile className="h-8 w-8 text-primary" />;
    if (lower.includes("all*sports") || lower.includes("sports")) return <Baby className="h-8 w-8 text-primary" />;
    return <Rabbit className="h-8 w-8 text-primary" />;
  };

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline font-bold text-primary">Manage Classes</h1>
            <Link href="/admin/classes/new" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Add Class</Link>
          </div>
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="font-bold text-xl mb-4">Classes List</h2>
            {loading ? (
              <p>Loading...</p>
            ) : classes.length === 0 ? (
              <p className="text-muted-foreground mb-4">No classes found.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Image</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(cls => (
                    <tr key={cls.id} className="border-t">
                      <td className="p-2">{cls.name}</td>
                      <td className="p-2">{cls.description || <span className='text-muted-foreground'>No description</span>}</td>
                      <td className="p-2">
                        {classIcon(cls.name)}
                      </td>
                      <td className="p-2 flex gap-2">
                        <button
                          className="bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                          onClick={() => router.push(`/admin/classes/${cls.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/80"
                          onClick={() => handleDelete(cls.id)}
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