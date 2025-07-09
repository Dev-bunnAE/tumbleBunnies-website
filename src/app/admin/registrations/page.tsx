"use client";

import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line
  }, []);

  async function fetchRegistrations() {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, "registrations"));
      setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, userId?: string) {
    if (!window.confirm("Are you sure you want to delete this registration? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "registrations", id));
      setRegistrations(registrations => registrations.filter(r => r.id !== id));
      if (userId) {
        const res = await fetch("/api/admin/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: userId }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert("Registration deleted, but failed to delete user: " + (data.error || res.statusText));
        }
      }
    } catch (err) {
      alert("Failed to delete registration.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminAuthGuard>
      <>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">All Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : error ? (
                <div className="text-center text-destructive py-8">{error}</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No registrations found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 border-b text-left">Parent Name</th>
                        <th className="px-4 py-2 border-b text-left">Email</th>
                        <th className="px-4 py-2 border-b text-left">Facility</th>
                        <th className="px-4 py-2 border-b text-left">Children</th>
                        <th className="px-4 py-2 border-b text-left">Created</th>
                        <th className="px-4 py-2 border-b text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map(reg => (
                        <tr key={reg.id} className="even:bg-muted/30">
                          <td className="px-4 py-2 border-b">{reg.parentName}</td>
                          <td className="px-4 py-2 border-b">{reg.parentEmail}</td>
                          <td className="px-4 py-2 border-b">{reg.facilityName || reg.facilityId}</td>
                          <td className="px-4 py-2 border-b">
                            {Array.isArray(reg.children)
                              ? reg.children.join(", ")
                              : reg.childName || "-"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {reg.createdAt ? new Date(reg.createdAt).toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-2 border-b flex gap-2">
                            <Link href={`/admin/registrations/${reg.id}`}>
                              <Button size="sm" variant="outline">Edit</Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(reg.id, reg.userId)}
                              disabled={deletingId === reg.id}
                            >
                              {deletingId === reg.id ? "Deleting..." : "Delete"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </>
    </AdminAuthGuard>
  );
} 