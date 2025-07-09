import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Admin Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <Link href="/admin/facilities" className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h2 className="font-bold text-xl mb-2">Facilities</h2>
              <p>Manage facilities, codes, sessions, and classes.</p>
            </Link>
            <Link href="/admin/classes" className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h2 className="font-bold text-xl mb-2">Classes</h2>
              <p>Manage class types, images, and skill levels.</p>
            </Link>
            <Link href="/admin/orders" className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h2 className="font-bold text-xl mb-2">Orders</h2>
              <p>View and manage all orders and payments.</p>
            </Link>
            <Link href="/admin/registrations" className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h2 className="font-bold text-xl mb-2">Registrations</h2>
              <p>View and manage parent/child registrations.</p>
            </Link>
            <Link href="/admin/attendance" className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h2 className="font-bold text-xl mb-2">Attendance</h2>
              <p>Track and manage class attendance.</p>
            </Link>
            <Link href="/admin/merchandise" className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h2 className="font-bold text-xl mb-2">Merchandise</h2>
              <p>Manage merchandise items for the storefront.</p>
            </Link>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 