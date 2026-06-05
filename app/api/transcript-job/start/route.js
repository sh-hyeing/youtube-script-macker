import { NextResponse } from "next/server";
import { buildTranscriptServerUrl, getJsonErrorMessage } from "@/lib/transcriptServerProxy";

export const runtime = "nodejs";

export async function POST(request) {
 try {
  const body = await request.text();
  const upstreamResponse = await fetch(buildTranscriptServerUrl("/transcript-job/start"), {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
   cache: "no-store",
   body,
  });

  const rawText = await upstreamResponse.text();

  return new NextResponse(rawText, {
   status: upstreamResponse.status,
   headers: {
    "Content-Type": upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
    "Cache-Control": "no-store",
   },
  });
 } catch (error) {
  return NextResponse.json(
   {
    ok: false,
    error: "TRANSCRIPT_JOB_START_FAILED",
    details: getJsonErrorMessage(error, "자막 작업을 시작하지 못했습니다."),
   },
   { status: 500 },
  );
 }
}
