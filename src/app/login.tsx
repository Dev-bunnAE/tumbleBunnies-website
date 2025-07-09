import Link from 'next/link';

export default function Login() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-xl">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Login</h1>
      <form className="bg-card rounded-lg shadow-md p-6 space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Email Address" disabled />
        <input className="w-full p-2 border rounded" placeholder="Password" type="password" disabled />
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold w-full" disabled>
          Log In
        </button>
      </form>
      <div className="text-center mt-4">
        <Link href="/register" className="text-primary hover:underline">Need an account? Register</Link>
      </div>
    </main>
  );
} 