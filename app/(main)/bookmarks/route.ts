'use server';
import { redirect } from 'next/navigation';
export async function GET() {
  redirect('/bookmarks/list');
}
