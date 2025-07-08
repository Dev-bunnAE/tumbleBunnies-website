'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Dumbbell,
  Palette,
  Music,
  PersonStanding,
  Code,
  ChefHat,
  Sparkles,
  LogIn,
  UserPlus,
  Facebook,
  Instagram,
} from 'lucide-react';

import { useAuth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
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
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Header } from '@/components/header';

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

const classShowcase = [
  { name: 'Gymnastics', icon: Dumbbell, aiHint: 'gymnastics kids' },
  { name: 'Art', icon: Palette, aiHint: 'kids art class' },
  { name: 'Music', icon: Music, aiHint: 'toddler music' },
  { name: 'Dance', icon: PersonStanding, aiHint: 'children dance' },
  { name: 'Coding', icon: Code, aiHint: 'kids coding' },
  { name: 'Cooking', icon: ChefHat, aiHint: 'kids cooking' },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    signInWithEmailPassword,
    getRegistration,
    getPendingRegistration,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User is logged in, check for registrations
        const registration = getRegistration(user.uid);
        if (registration) {
          router.replace(`/classes/${registration.facilityId}`);
          return;
        }
        const pendingReg = getPendingRegistration(user.uid);
        if (pendingReg) {
          router.replace(`/register/${pendingReg.facilityId}`);
          return;
        }
      }
      setLoading(false);
    }
  }, [user, authLoading, router, getRegistration, getPendingRegistration]);

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
    const facilitiesString = localStorage.getItem('facilities');
    const facilities = facilitiesString ? JSON.parse(facilitiesString) : [];
    const facility = facilities.find(
      (f: { id: string }) => f.id.toLowerCase() === values.code.toLowerCase()
    );

    if (facility) {
      if (user) {
        const registration = getRegistration(user.uid);
        if (registration?.facilityId === facility.id) {
          router.push(`/classes/${facility.id}`);
        } else {
          // User is logged in but trying a new facility code
          // In a real app, you might ask them to confirm switching facilities.
          // For now, we'll just take them to the registration page for the new facility.
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
    await signInWithGoogle();
    // Successful login is handled by the useEffect
    setAuthActionLoading(false);
  }

  if (loading || authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary/10 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl animate-pulse-deep">
              Welcome to TumbleBunnies!
            </h1>
            <p className="mt-4 text-center text-2xl font-bold tracking-tight text-primary/90 sm:text-4xl font-headline">
              hop on in!
            </p>
            <div className="mt-4 flex justify-center">
              <Image
                src="https://placehold.co/100x100.png"
                width={100}
                height={100}
                alt="TumbleBunnies Easter Logo"
                data-ai-hint="bunny easter"
              />
            </div>
          </div>
        </section>

        {/* Login/Registration Section */}
        <section id="register" className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-md">
            <Card className="shadow-2xl">
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
                  <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">Returning Parent</CardTitle>
                    <CardDescription>Sign in to your account.</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                    <div className="relative my-4">
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
          <div className="container mx-auto px-4">
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
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline text-primary">
                A Class for Every Bunny
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                From gymnastics to art, we offer a variety of classes to spark your child&apos;s
                imagination and get them moving.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
              {classShowcase.map((cls) => (
                <div
                  key={cls.name}
                  className="p-4 bg-card rounded-lg shadow-md flex flex-col items-center justify-center gap-2"
                >
                  <cls.icon className="h-10 w-10 text-primary" />
                  <span className="font-semibold text-foreground">{cls.name}</span>
                </div>
              ))}
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
              <Facebook className="h-8 w-8 hover:opacity-80 transition-opacity" />
            </a>
            <a
              href="https://www.instagram.com/tumblebunnies/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TumbleBunnies on Instagram"
            >
              <Instagram className="h-8 w-8 hover:opacity-80 transition-opacity" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
