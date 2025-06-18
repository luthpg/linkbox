import { Button } from '@/components/ui/button';
import { SignInButton } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'next/navigation';

export function LoginButton({ ...props }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <p>Loading...</p>;

  if (isAuthenticated) {
    return (
      <Button
        onClick={() => router.push('/bookmarks')}
        className="px-5 py-2.5 relative rounded group overflow-hidden font-medium bg-zinc-50 text-zinc-600 inline-block cursor-pointer"
        {...props}
      >
        <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-0 bg-zinc-600 group-hover:h-full opacity-90" />
        <span className="relative group-hover:text-white">ログイン</span>
      </Button>
    );
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl="/bookmarks" {...props}>
      <Button className="px-5 py-2.5 relative rounded group overflow-hidden font-medium bg-zinc-50 text-zinc-600 inline-block cursor-pointer">
        <span className="absolute top-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-0 bg-zinc-600 group-hover:h-full opacity-90" />
        <span className="relative group-hover:text-white">ログイン</span>
      </Button>
    </SignInButton>
  );
}
