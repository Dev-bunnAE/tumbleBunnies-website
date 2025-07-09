"use client";

import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchRegistration() {
      if (!id || typeof id !== "string") {
        setError("Invalid registration ID.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(db, "registrations", id));
        if (snap.exists()) {
          setRegistration({ id: snap.id, ...snap.data() });
        } else {
          setError("Registration not found.");
        }
      } catch (err) {
        setError("Failed to load registration.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRegistration();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id || typeof id !== "string") {
      setError("Invalid registration ID.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "registrations", id), {
        parentName: registration.parentName,
        parentEmail: registration.parentEmail,
        facilityName: registration.facilityName,
        children: registration.children,
      });
      router.push("/admin/registrations");
    } catch (err) {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setRegistration((reg: any) => ({ ...reg, [name]: value }));
  }

  function handleChildrenChange(idx: number, value: string) {
    setRegistration((reg: any) => {
      const children = Array.isArray(reg.children) ? [...reg.children] : [];
      children[idx] = value;
      return { ...reg, children };
    });
  }

  if (loading) return (
    <AdminAuthGuard>
      <div className="text-center py-12">Loading...</div>
    </AdminAuthGuard>
  );
  if (error) return (
    <AdminAuthGuard>
      <div className="text-center text-destructive py-12">{error}</div>
    </AdminAuthGuard>
  );
  if (!registration) return null;

  return (
    <AdminAuthGuard>
      <>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Edit Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block font-medium mb-1">Parent Name</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    name="parentName"
                    value={registration.parentName || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Parent Email</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    name="parentEmail"
                    value={registration.parentEmail || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Facility</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    name="facilityName"
                    value={registration.facilityName || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Children (one per line)</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    name="children"
                    value={Array.isArray(registration.children) ? registration.children.join("\n") : registration.children || ""}
                    onChange={e => setRegistration((reg: any) => ({ ...reg, children: e.target.value.split("\n") }))}
                    rows={Math.max(2, Array.isArray(registration.children) ? registration.children.length : 2)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => router.push("/admin/registrations")}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
                {error && <div className="text-destructive text-sm mt-2">{error}</div>}
              </form>
            </CardContent>
          </Card>
        </main>
      </>
    </AdminAuthGuard>
  );
} 