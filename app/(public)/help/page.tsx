import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <h1>Help</h1>
      <Button>
        <Link href="/bookmarks/list">return to home</Link>
      </Button>
    </>
  );
}
