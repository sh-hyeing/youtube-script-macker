import { NextResponse } from "next/server";
import { buildTranscriptServerUrl, getJsonErrorMessage, rewriteAudioUrlForProxy } from "@/lib/transcriptServerProxy";

export const runtime = "nodejs";

const rewriteJobResult = (payload, request) => {
 if (!payload || typeof payload !== "object" || !payload.result || typeof payload.result !== "object") {
  return payload;
 }

 const result = payload.result;
 const audioUrl = rewriteAudioUrlForProxy(result.audioUrl, request);
 const audioSegments = Array.isArray(result.audioSegments)
  ? result.audioSegments.map((segment) =>
     segment && typeof segment === "object"
      ? {
         ...segment,
         url: rewriteAudioUrlForProxy(segment.url, request),
        }
      : segment,
    )
  : result.audioSegments;

 return {
  ...payload,
  result: {
   ...result,
   audioUrl,
   audioSegments,
  },
 };
};

export async function GET(request, context) {
 try {
  const params = await context.params;
  const jobId = String(params?.jobId || "").trim();

  if (!jobId) {
   return NextResponse.json({ ok: false, error: "JOB_ID_REQUIRED" }, { status: 400 });
  }

  const upstreamResponse = await fetch(buildTranscriptServerUrl(`/transcript-job/${jobId}`), {
   method: "GET",
   cache: "no-store",
  });

  const rawText = await upstreamResponse.text();
  let payload = rawText;

  try {
   const parsed = rawText ? JSON.parse(rawText) : {};
   payload = JSON.stringify(rewriteJobResult(parsed, request));
  } catch {}

  return new NextResponse(payload, {
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
    error: "TRANSCRIPT_JOB_STATUS_FAILED",
    details: getJsonErrorMessage(error, "자막 작업 상태를 확인하지 못했습니다."),
   },
   { status: 500 },
  );
 }
}
