import { NextResponse } from 'next/server';
export const GET = () =>
  NextResponse.json({ error: 'Not Found' }, { status: 400 });
