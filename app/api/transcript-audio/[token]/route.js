import { NextResponse } from "next/server";
import { buildTranscriptServerUrl, getJsonErrorMessage } from "@/lib/transcriptServerProxy";

export const runtime = "nodejs";

const passthroughHeaders = ["content-type", "content-length", "content-disposition", "cache-control", "accept-ranges"];

export async function GET(_request, context) {
 try {
  const params = await context.params;
  const token = String(params?.token || "").trim();

  if (!token) {
   return NextResponse.json({ ok: false, error: "AUDIO_TOKEN_REQUIRED" }, { status: 400 });
  }

  const upstreamResponse = await fetch(buildTranscriptServerUrl(`/audio/${token}`), {
   method: "GET",
   cache: "no-store",
  });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
   const rawText = await upstreamResponse.text();

   return new NextResponse(rawText, {
    status: upstreamResponse.status,
    headers: {
     "Content-Type": upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
     "Cache-Control": "no-store",
    },
   });
  }

  const headers = new Headers();

  for (const headerName of passthroughHeaders) {
   const headerValue = upstreamResponse.headers.get(headerName);
   if (headerValue) {
    headers.set(headerName, headerValue);
   }
  }

  headers.set("Cache-Control", "no-store");

  return new NextResponse(upstreamResponse.body, {
   status: upstreamResponse.status,
   headers,
  });
 } catch (error) {
  return NextResponse.json(
   {
    ok: false,
    error: "TRANSCRIPT_AUDIO_FETCH_FAILED",
    details: getJsonErrorMessage(error, "오디오 파일을 가져오지 못했습니다."),
   },
   { status: 500 },
  );
 }
}
