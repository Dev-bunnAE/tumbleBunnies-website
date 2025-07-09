'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { StorefrontHeader } from '@/components/storefront-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db, Facility, Registration, useAuth } from '@/lib/firebase';
import { updateEmail, updatePassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Building2, Edit, Key, Mail, MapPin, Phone, User, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangeFacility, setShowChangeFacility] = useState(false);
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    parentName: '',
    parentPhone: '',
    children: [] as string[],
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Email form
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  });
  
  // Facility change form
  const [facilityForm, setFacilityForm] = useState({
    registrationCode: '',
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        router.replace('/');
        return;
      }
      
      setLoading(true);
      try {
        // Get registration from Firestore
        const registrationsRef = collection(db, "registrations");
        const q = query(registrationsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Registration));
          
          // Get the most recent registration
          docs.sort((a, b) => b.createdAt - a.createdAt);
          const reg = docs[0];
          setRegistration(reg);
          
          // Initialize profile form
          setProfileForm({
            parentName: reg.parentName,
            parentPhone: reg.parentPhone,
            children: reg.children,
          });
          
          // Fetch facility details
          if (reg.facilityId) {
            const facSnap = await getDoc(doc(db, "facilities", reg.facilityId));
            if (facSnap.exists()) {
              setFacility({ id: facSnap.id, ...facSnap.data() } as Facility);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        toast({
          title: "Error",
          description: "Failed to load account information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) fetchData();
  }, [user, authLoading, router, toast]);

  const handleUpdateProfile = async () => {
    if (!registration || !user) return;
    
    setSaving(true);
    try {
      // Update registration in Firestore
      await updateDoc(doc(db, "registrations", registration.id), {
        parentName: profileForm.parentName,
        parentPhone: profileForm.parentPhone,
        children: profileForm.children,
      });
      
      // Update local state
      setRegistration({
        ...registration,
        parentName: profileForm.parentName,
        parentPhone: profileForm.parentPhone,
        children: profileForm.children,
      });
      
      setShowEditProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      await updatePassword(user, passwordForm.newPassword);
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateEmail(user, emailForm.newEmail);
      setShowChangeEmail(false);
      setEmailForm({ newEmail: '', password: '' });
      toast({
        title: "Success",
        description: "Email updated successfully!",
      });
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeFacility = async () => {
    if (!facilityForm.registrationCode) return;
    
    setSaving(true);
    try {
      // Find facility by registration code
      const facilitiesRef = collection(db, "facilities");
      const q = query(facilitiesRef, where("registrationCode", "==", facilityForm.registrationCode));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          title: "Error",
          description: "Invalid registration code.",
          variant: "destructive",
        });
        return;
      }
      
      const facilityDoc = querySnapshot.docs[0];
      const newFacility = { id: facilityDoc.id, ...facilityDoc.data() } as Facility;
      
      // Update registration with new facility
      if (registration) {
        await updateDoc(doc(db, "registrations", registration.id), {
          facilityId: newFacility.id,
          facilityName: newFacility.name,
        });
        
        setRegistration({
          ...registration,
          facilityId: newFacility.id,
          facilityName: newFacility.name,
        });
        setFacility(newFacility);
      }
      
      setShowChangeFacility(false);
      setFacilityForm({ registrationCode: '' });
      toast({
        title: "Success",
        description: "Facility changed successfully!",
      });
    } catch (error) {
      console.error('Error changing facility:', error);
      toast({
        title: "Error",
        description: "Failed to change facility.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addChild = () => {
    setProfileForm({
      ...profileForm,
      children: [...profileForm.children, ''],
    });
  };

  const removeChild = (index: number) => {
    setProfileForm({
      ...profileForm,
      children: profileForm.children.filter((_, i) => i !== index),
    });
  };

  const updateChild = (index: number, name: string) => {
    const newChildren = [...profileForm.children];
    newChildren[index] = name;
    setProfileForm({
      ...profileForm,
      children: newChildren,
    });
  };

  if (loading || authLoading) return <LoadingSpinner fullScreen />;
  if (!user || !registration) {
    router.replace('/');
    return null;
  }

  return (
    <>
      <StorefrontHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-headline font-bold text-primary mb-4">
              My Account
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your profile, registration details, and account settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Parent Name</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={registration.parentName} disabled />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditProfile(!showEditProfile)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={user.email || ''} disabled />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangeEmail(!showChangeEmail)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={registration.parentPhone} disabled />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditProfile(!showEditProfile)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Children ({registration.children.length})</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={registration.children.join(', ')} 
                      disabled 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditProfile(!showEditProfile)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facility Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Facility Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Facility</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={facility?.name || 'Unknown'} disabled />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangeFacility(!showChangeFacility)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {facility && (
                  <>
                    <div>
                      <Label>Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{facility.address}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Phone</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{facility.phone}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile Modal */}
          {showEditProfile && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Parent Name</Label>
                  <Input
                    value={profileForm.parentName}
                    onChange={(e) => setProfileForm({ ...profileForm, parentName: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={profileForm.parentPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, parentPhone: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Children</Label>
                  <div className="space-y-2">
                    {profileForm.children.map((child, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={child}
                          onChange={(e) => updateChild(index, e.target.value)}
                          placeholder={`Child ${index + 1} name`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeChild(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addChild}>
                      <Users className="w-4 h-4 mr-2" />
                      Add Child
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Change Password Modal */}
          {showChangePassword && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowChangePassword(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Change Email Modal */}
          {showChangeEmail && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Change Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>New Email</Label>
                  <Input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleChangeEmail} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Email'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowChangeEmail(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Change Facility Modal */}
          {showChangeFacility && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Change Facility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>New Registration Code</Label>
                  <Input
                    value={facilityForm.registrationCode}
                    onChange={(e) => setFacilityForm({ registrationCode: e.target.value })}
                    placeholder="Enter the new facility's registration code"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleChangeFacility} disabled={saving}>
                    {saving ? 'Updating...' : 'Change Facility'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowChangeFacility(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="justify-start"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowChangeEmail(!showChangeEmail)}
                  className="justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Change Email
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowChangeFacility(!showChangeFacility)}
                  className="justify-start"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Change Facility
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/orders')}
                  className="justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
} 