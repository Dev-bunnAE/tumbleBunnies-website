import { AdminHeader } from '@/components/admin/admin-header';
import Link from 'next/link';

export default function EditAttendance() {
  return (
    <div>
      <AdminHeader />
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Edit Attendance</h1>
        <form className="bg-card rounded-lg shadow-md p-6 space-y-4">
          <input className="w-full p-2 border rounded" placeholder="Class Name" disabled />
          <input className="w-full p-2 border rounded" placeholder="Date" disabled />
          <input className="w-full p-2 border rounded" placeholder="Attendees" disabled />
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold w-full" disabled>
            Save Changes
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/admin/attendance" className="text-primary hover:underline">Back to Attendance</Link>
        </div>
      </main>
    </div>
  );
} 