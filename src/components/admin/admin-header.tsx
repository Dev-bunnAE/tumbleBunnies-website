"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/firebase";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/facilities", label: "Facilities" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/registrations", label: "Registrations" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="bg-primary/90 text-primary-foreground sticky top-0 z-50 shadow border-b">
      <nav className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-headline text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            Admin
          </Link>
          <div className="hidden md:flex gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${pathname === link.href ? "bg-primary-foreground text-primary" : "hover:bg-primary-foreground/10"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Account">
                <User />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email || "Admin"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      {/* Mobile nav */}
      <nav className="md:hidden flex gap-2 px-4 pb-2 pt-1 bg-primary/95 border-t">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 text-center py-2 rounded-md font-medium text-sm transition-colors ${pathname === link.href ? "bg-primary-foreground text-primary" : "hover:bg-primary-foreground/10"}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
