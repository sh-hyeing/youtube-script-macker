import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
 const baseUrl = String(process.env.YTDLP_TRANSCRIPT_SERVER_URL || "").trim().replace(/\/+$/, "");

 if (!baseUrl) {
  return NextResponse.json({ error: "자막 서버 주소가 설정되지 않았습니다." }, { status: 500 });
 }

 return NextResponse.json(
  { baseUrl },
  {
   status: 200,
   headers: {
    "Cache-Control": "no-store",
   },
  },
 );
}
