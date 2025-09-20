// app/api/akool/session/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const token = process.env.ALOOK_API_KEY;
  const host = process.env.AKOOL_OPENAPI_HOST || 'https://openapi.akool.com';

  const resp = await fetch(`${host}/api/open/v4/liveAvatar/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  return NextResponse.json(json, { status: resp.status });
}
