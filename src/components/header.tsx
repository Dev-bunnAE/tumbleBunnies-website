'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/lib/firebase';
import { Rabbit, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const showCart = pathname !== '/';

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="flex items-center gap-2">
          <Rabbit className="h-10 w-10 text-primary" />
          <span className="font-headline text-2xl font-bold text-primary">
            TumbleBunnies
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {showCart && (
                <Link href="/cart" passHref>
                  <Button variant="ghost" size="icon" aria-label="Shopping Cart">
                    <div className="relative">
                      <ShoppingCart />
                      {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                          {items.length}
                        </span>
                      )}
                    </div>
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User Account">
                    <User />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push('/account')}>
                    Manage Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/#register">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/#register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
