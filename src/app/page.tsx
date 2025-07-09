'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  LogIn,
  Mail,
  Sparkles,
  UserPlus
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Header } from '@/components/header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { auth, db, useAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

const facilityCodeSchema = z.object({
  code: z.string().min(1, 'Please enter a facility code.'),
});

const manualLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const philosophyPoints = [
  'A non-competitive, fun environment.',
  'Focus on safety and skill development.',
  'Building self-confidence and coordination.',
  'Experienced and caring instructors.',
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    signInWithEmailPassword,
    getRegistrationAsync,
    getPendingRegistration,
    logout,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  useEffect(() => {
    async function checkUserStatus() {
      if (!authLoading) {
        if (user) {
          // Custom admin/trainer redirect logic
          if (user.email && user.email.endsWith("@tumblebunnies.com")) {
            if (user.email === "trainers@tumblebunnies.com") {
              router.replace("/trainer/attendance");
              return;
            } else {
              router.replace("/admin");
              return;
            }
          }
          // User is logged in, check for registrations
          try {
            const registration = await getRegistrationAsync(user.uid);
            if (registration) {
              router.replace(`/classes/${registration.facilityId}`);
              return;
            }
          } catch (error) {
            console.error("Error checking registration:", error);
          }
          
          const pendingReg = getPendingRegistration(user.uid);
          if (pendingReg) {
            router.replace(`/register/${pendingReg.facilityId}`);
            return;
          }
        }
        setLoading(false);
      }
    }
    checkUserStatus();
  }, [user, authLoading, router, getRegistrationAsync, getPendingRegistration]);

  useEffect(() => {
    async function fetchClasses() {
      const snapshot = await getDocs(collection(db, 'classes'));
      setAvailableClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchClasses();
  }, []);

  const facilityCodeForm = useForm<z.infer<typeof facilityCodeSchema>>({
    resolver: zodResolver(facilityCodeSchema),
    defaultValues: { code: '' },
  });

  const loginForm = useForm<z.infer<typeof manualLoginSchema>>({
    resolver: zodResolver(manualLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onFacilityCodeSubmit(values: z.infer<typeof facilityCodeSchema>) {
    setAuthActionLoading(true);
    // Fetch facility from Firestore by registrationCode
    const q = query(collection(db, 'facilities'), where('registrationCode', '==', values.code));
    const snapshot = await getDocs(q);
    let facility = null;
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      facility = { id: doc.id, ...doc.data() };
    }

    if (facility) {
      if (user) {
        try {
          const registration = await getRegistrationAsync(user.uid);
          if (registration?.facilityId === facility.id) {
            router.push(`/classes/${facility.id}`);
          } else {
            router.push(`/register/${facility.id}`);
          }
        } catch (error) {
          console.error("Error checking registration:", error);
          router.push(`/register/${facility.id}`);
        }
      } else {
        router.push(`/register/${facility.id}`);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'That facility code was not found. Please try again.',
      });
      setAuthActionLoading(false);
    }
  }

  async function onManualLoginSubmit(values: z.infer<typeof manualLoginSchema>) {
    setAuthActionLoading(true);
    const result = await signInWithEmailPassword(values.email, values.password);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: result.error,
      });
    }
    // Successful login is handled by the useEffect
    setAuthActionLoading(false);
  }

  async function handleGoogleSignIn() {
    setAuthActionLoading(true);
    const result = await signInWithGoogle();
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: result.error,
      });
      setAuthActionLoading(false);
      return;
    }
    // Check registration immediately after sign-in
    const currentUser = auth.currentUser;
    if (currentUser) {
      // If admin, redirect and skip registration check
      if (currentUser.email && currentUser.email.endsWith("@tumblebunnies.com")) {
        if (currentUser.email === "trainers@tumblebunnies.com") {
          router.replace("/trainer/attendance");
        } else {
          router.replace("/admin");
        }
        setAuthActionLoading(false);
        return;
      }
      try {
        const registration = await getRegistrationAsync(currentUser.uid);
        if (!registration) {
          await logout();
          toast({
            variant: 'destructive',
            title: 'Registration Required',
            description: 'You must register before logging in. Please use the registration tab.',
          });
          // Switch to the registration tab
          const registerTab = document.querySelector('[data-state="register"]');
          if (registerTab) {
            (registerTab as HTMLElement).click();
          }
          setAuthActionLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking registration:", error);
        await logout();
        toast({
          variant: 'destructive',
          title: 'Registration Required',
          description: 'You must register before logging in. Please use the registration tab.',
        });
        setAuthActionLoading(false);
        return;
      }
    }
    setAuthActionLoading(false);
  }

  async function handleForgotPassword() {
    if (!forgotPasswordEmail) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address.',
      });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for a link to reset your password.',
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Password Reset Failed',
        description: errorMessage,
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  if (loading || authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-center">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center w-full min-h-[350px] md:min-h-[420px] bg-gradient-to-b from-primary/10 to-background py-10 md:py-20 overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary drop-shadow-lg mb-4 animate-bounce-slow">
              Jump, Dance, and Tumble Into Fun!
            </h1>
            <p className="mt-2 text-xl md:text-2xl font-semibold text-primary/90 max-w-2xl mx-auto mb-6">
              Discover joyful classes for every bunny—gymnastics, dance, art, and more!
            </p>
            <Button
              size="lg"
              className="mt-2 px-8 py-4 text-lg font-bold rounded-full shadow-lg bg-gradient-to-r from-primary to-pink-400 hover:from-pink-400 hover:to-primary transition-colors"
              onClick={() => {
                const regSection = document.getElementById('register');
                if (regSection) regSection.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Find Your Class
            </Button>
            <div className="mt-8 flex justify-center">
              <Image
                src="https://placehold.co/180x180.png"
                width={180}
                height={180}
                alt="TumbleBunnies Mascot"
                className="rounded-full border-4 border-primary shadow-xl bg-white animate-bounce"
                data-ai-hint="cute bunny mascot, playful, jumping"
              />
            </div>
          </div>
          {/* Decorative background shapes */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-200 rounded-full opacity-30 blur-2xl z-0" />
          <div className="absolute -bottom-16 right-0 w-64 h-64 bg-primary/20 rounded-full opacity-20 blur-3xl z-0" />
        </section>

        {/* Login/Registration Section */}
        <section id="register" className="py-6 md:py-8 flex flex-col items-center justify-center flex-1">
          <div className="container mx-auto px-4 max-w-md flex flex-col items-center justify-center text-center">
            <Card className="shadow-2xl w-full max-w-md mx-auto">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground animate-pulse"
                  >
                    New Registration
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="font-headline text-2xl">Returning Parent</CardTitle>
                    <CardDescription>Sign in to your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {!showForgotPassword ? (
                      <Form {...loginForm}>
                        <form
                          onSubmit={loginForm.handleSubmit(onManualLoginSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-center">Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-center">Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="link"
                              className="text-sm text-muted-foreground hover:text-primary px-0"
                              onClick={() => setShowForgotPassword(true)}
                            >
                              Forgot password?
                            </Button>
                          </div>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={authActionLoading}
                          >
                            {authActionLoading ? (
                              'Signing in...'
                            ) : (
                              <>
                                <LogIn className="mr-2 h-4 w-4" /> Sign In
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="font-headline text-lg font-semibold">Reset Password</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Enter your email to receive a password reset link.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-center block mb-2">Email</label>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setShowForgotPassword(false);
                                setForgotPasswordEmail('');
                              }}
                              disabled={forgotPasswordLoading}
                            >
                              Back to Login
                            </Button>
                            <Button
                              type="button"
                              className="flex-1"
                              onClick={handleForgotPassword}
                              disabled={forgotPasswordLoading}
                            >
                              {forgotPasswordLoading ? (
                                'Sending...'
                              ) : (
                                <>
                                  <Mail className="mr-2 h-4 w-4" /> Send Reset Link
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={authActionLoading}
                    >
                      Sign in with Google
                    </Button>
                  </CardContent>
                </TabsContent>

                {/* New Registration Tab */}
                <TabsContent value="register">
                  <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">New Parent</CardTitle>
                    <CardDescription>
                      Enter your facility code to get started.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...facilityCodeForm}>
                      <form
                        onSubmit={facilityCodeForm.handleSubmit(onFacilityCodeSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={facilityCodeForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">Facility Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Facility Code"
                                  {...field}
                                  className="text-center"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={authActionLoading}
                        >
                          {authActionLoading ? (
                            'Checking...'
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" /> Register
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </section>

        {/* Why TumbleBunnies? Section */}
        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-headline text-primary">
                Why TumbleBunnies?
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Our program is designed to develop your child&apos;s physical and social skills
                in a positive, high-energy, and super fun way!
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {philosophyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-8 w-8 text-primary/80" />
                  </div>
                  <p className="text-base text-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Class Showcase Section */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline text-primary">
                A Class for Every Bunny
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                From gymnastics to art, we offer a variety of classes to spark your child&apos;s
                imagination and get them moving.
              </p>
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              {availableClasses.length === 0 ? (
                <div className="text-muted-foreground">No classes available yet.</div>
              ) : (
                <div className="relative mx-auto my-8" style={{ width: 340, height: 340, maxWidth: '90vw', maxHeight: '90vw' }}>
                  {availableClasses.map((cls, idx) => {
                    const count = availableClasses.length;
                    const angle = (2 * Math.PI * idx) / count;
                    const radius = 140;
                    const center = 150;
                    const x = center + radius * Math.cos(angle) - 45;
                    const y = center + radius * Math.sin(angle) - 45;
                    return (
                      <div
                        key={cls.id}
                        className="absolute flex flex-col items-center justify-center w-[90px] h-[90px] p-2 bg-card rounded-xl shadow-xl transition-transform duration-200 hover:-translate-y-1 hover:scale-105 border-2 border-primary/20"
                        style={{ left: x, top: y }}
                      >
                        {cls.imageUrl ? (
                          <img src={cls.imageUrl} alt={cls.name} className="h-10 w-10 object-cover rounded-lg border-2 border-primary bg-white shadow-md" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border-2 border-primary text-primary font-bold text-xl">
                            {cls.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-foreground text-base mt-1 text-center truncate w-full" title={cls.name}>{cls.name}</span>
                      </div>
                    );
                  })}
                  {/* Optional: Add a bunny or logo in the center */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                    <img src="https://placehold.co/70x70.png" alt="Bunny Mascot" className="rounded-full border-2 border-primary bg-white shadow-md" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="flex gap-6">
            <a
              href="https://www.facebook.com/tumblebunnies/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TumbleBunnies on Facebook"
            >
              <svg className="h-8 w-8 hover:opacity-80 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
            </a>
            <a
              href="https://www.instagram.com/tumblebunnies/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TumbleBunnies on Instagram"
            >
              <svg className="h-8 w-8 hover:opacity-80 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.602.402 3.635 1.37 2.668 2.338 2.396 3.511 2.338 4.788.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.058 1.277.33 2.45 1.298 3.418.968.968 2.141 1.24 3.418 1.298C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 1.277-.058 2.45-.33 3.418-1.298.968-.968 1.24-2.141 1.298-3.418.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.058-1.277-.33-2.45-1.298-3.418-.968-.968-2.141-1.24-3.418-1.298C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
