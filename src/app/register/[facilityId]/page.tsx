"use client";

import { StorefrontHeader } from "@/components/storefront-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { db, useAuth } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterFacilityPage() {
  const params = useParams();
  const facilityId = Array.isArray(params?.facilityId) ? params.facilityId[0] : params?.facilityId;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [facility, setFacility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    parentName: "",
    parentPhone: "",
    parentEmail: user?.email || "",
    password: "",
    confirmPassword: "",
    numChildren: 1,
    children: [""],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchFacility() {
      if (!facilityId) return;
      setLoading(true);
      const snap = await getDoc(doc(db, "facilities", facilityId));
      if (snap.exists()) {
        setFacility({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }
    fetchFacility();
  }, [facilityId]);

  useEffect(() => {
    // Adjust children array when numChildren changes
    setForm(f => {
      const children = [...(f.children || [])];
      if (f.numChildren > children.length) {
        for (let i = children.length; i < f.numChildren; i++) children.push("");
      } else if (f.numChildren < children.length) {
        children.length = f.numChildren;
      }
      return { ...f, children };
    });
  }, [form.numChildren]);

  function formatPhoneNumber(value: string) {
    const digits = value.replace(/\D/g, '');
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
    if (name === "numChildren") {
      setForm(f => ({ ...f, numChildren: Number(value) }));
    } else if (name === "parentPhone") {
      setForm(f => ({ ...f, parentPhone: formatPhoneNumber(value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleChildChange(idx: number, value: string) {
    setForm(f => {
      const children = [...f.children];
      children[idx] = value;
      return { ...f, children };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validate passwords
    if (form.password !== form.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
      });
      return;
    }
    
    if (form.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // Create Firebase Auth user account
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const userCredential = await createUserWithEmailAndPassword(
        (await import("@/lib/firebase")).auth,
        form.parentEmail,
        form.password
      );
      
      // Save registration data to Firestore
      await addDoc(collection(db, "registrations"), {
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        parentEmail: form.parentEmail,
        facilityId,
        facilityName: facility?.name || "",
        children: form.children,
        createdAt: Date.now(),
        userId: userCredential.user.uid,
      });
      
      toast({
        title: "Registration Successful!",
        description: "Your account has been created and you're registered. Redirecting to your classes...",
      });
      
      setTimeout(() => {
        router.replace(`/classes/${facilityId}`);
      }, 2000);
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!facility) return <div className="text-center text-destructive">Facility not found.</div>;

  return (
    <>
      <StorefrontHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl flex flex-col items-center justify-center text-center">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl mb-2 text-center">Register for {facility.name}</CardTitle>
            <div className="text-muted-foreground mb-2 text-center">Facility Code: <span className="font-mono">{facility.registrationCode}</span></div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 flex flex-col items-center justify-center text-center" onSubmit={handleSubmit}>
              <Input
                name="parentName"
                placeholder="Parent Name"
                value={form.parentName}
                onChange={handleChange}
                required
                className="text-center"
              />
              <Input
                name="parentPhone"
                placeholder="Phone Number"
                value={form.parentPhone}
                onChange={handleChange}
                required
                className="text-center"
              />
              <Input
                name="parentEmail"
                placeholder="Email Address"
                value={form.parentEmail}
                onChange={handleChange}
                required
                type="email"
                className="text-center"
              />
              <Input
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                type="password"
                className="text-center"
              />
              <Input
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                type="password"
                className="text-center"
              />
              <div className="w-full flex flex-col items-center">
                <label className="block mb-1 font-medium text-center">Number of Children Attending</label>
                <select
                  name="numChildren"
                  value={form.numChildren}
                  onChange={handleChange}
                  className="w-32 p-2 border rounded text-center mx-auto"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              {form.children.map((child, idx) => (
                <Input
                  key={idx}
                  placeholder={`Child ${idx + 1} Name`}
                  value={child}
                  onChange={e => handleChildChange(idx, e.target.value)}
                  required
                  className="text-center"
                />
              ))}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating Account..." : "Create Account & Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
} 