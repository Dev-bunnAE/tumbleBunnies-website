import { AdminHeader } from '@/components/admin/admin-header';
import Link from 'next/link';

export default function AdminAttendance() {
  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-primary">Manage Attendance</h1>
          <Link href="/admin/attendance/new" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Add Attendance</Link>
        </div>
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="font-bold text-xl mb-4">Attendance List</h2>
          <div className="text-muted-foreground text-center">(Attendance list coming soon!)</div>
        </div>
      </main>
    </div>
  );
} 