/* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/akool/session/route.ts
// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   const body = await req.json();
//   const token = process.env.ALOOK_API_KEY;
//   const host = process.env.AKOOL_OPENAPI_HOST || 'https://openapi.akool.com';

//   const resp = await fetch(`${host}/api/open/v4/liveAvatar/session/create`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//     body: JSON.stringify(body),
//   });
//   const json = await resp.json();
//   return NextResponse.json(json, { status: resp.status });
// }

// app/api/akool/session/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log(body);
    console.log("api called");
    const {
      avatarId,
      duration = 100,
      voiceId,
      language,
      modeType = 2,
      backgroundUrl,
      voiceParams,
      knowledgeID,
    } = body;

    const host = process.env.NEXT_PUBLIC_AKOOL_HOST;
    const token = process.env.NEXT_PUBLIC_AKOOL_TOKEN;
    console.log("avatarId" + avatarId);
    console.log(typeof avatarId);
    if (!host || !token) {
      return NextResponse.json(
        { ok: false, error: "Missing AKOOL env" },
        { status: 500 }
      );
    }
    // if (!avatarId || !avatarId.startsWith('avtr_')) {
    //   return NextResponse.json({ ok: false, error: 'Invalid avatarId (must start with "avtr_")' }, { status: 400 });
    // }

    if (typeof avatarId !== "string" || !avatarId.trim()) {
      return NextResponse.json(
        { ok: false, error: "Invalid avatarId" },
        { status: 400 }
      );
    }

    const resp = await fetch(`${host}/api/open/v4/liveAvatar/session/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        duration,
        ...(voiceId ? { voice_id: voiceId } : {}),
        ...(language ? { language } : {}),
        ...(modeType ? { mode_type: modeType } : {}),
        ...(backgroundUrl ? { background_url: backgroundUrl } : {}),
        ...(voiceParams ? { voice_params: voiceParams } : {}),
        ...(knowledgeID ? { knowledge_id: knowledgeID } : {}),
      }),
    });

    const json = await resp.json().catch(() => ({}));
    // Surface Akool errors cleanly
    if (!resp.ok || json.code !== 1000) {
      const msg = json?.msg || `Akool error: HTTP ${resp.status}`;
      return NextResponse.json(
        { ok: false, error: msg, raw: json },
        { status: 502 }
      );
    }

    // Some tenants get `data.credentials`, others `data.stream_urls`
    const data = json.data || {};
    const c = data.credentials || data.stream_urls || {};

    const appId = c.agora_app_id || c.app_id;
    const channel = c.agora_channel || c.channel;
    const tokenStr = c.agora_token || c.token;
    const uid = c.agora_uid ?? c.uid;

    if (!appId || !channel || !tokenStr || uid === undefined || uid === null) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing Agora credentials in Akool response",
          raw: json,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      credentials: { appId, channel, token: tokenStr, uid },
      // Optional: echo back anything else you want
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
