'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/firebase';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function TrainerHeader() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-card border-b p-4 flex justify-between items-center">
      <Link href="/trainer" className="flex items-center gap-2">
        <Image
          src="https://placehold.co/40x40.png"
          width={40}
          height={40}
          alt="TumbleBunnies Corporate Logo"
          data-ai-hint="corporate logo"
        />
        <span className="font-headline text-2xl font-bold">TumbleBunnies</span>
      </Link>
      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>
    </header>
  );
}
