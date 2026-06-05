const trimTrailingSlashes = (value) => value.replace(/\/+$/, "");

export function getTranscriptServerBaseUrl() {
 const value = String(process.env.YTDLP_TRANSCRIPT_SERVER_URL || "").trim();

 if (!value) {
  throw new Error("MISSING_TRANSCRIPT_SERVER_URL");
 }

 return trimTrailingSlashes(value);
}

export function buildTranscriptServerUrl(pathname) {
 return `${getTranscriptServerBaseUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function getProxyBaseUrl(request) {
 return new URL("/api/transcript-audio/", request.url).toString();
}

export function rewriteAudioUrlForProxy(audioUrl, request) {
 if (typeof audioUrl !== "string" || !audioUrl.trim()) {
  return "";
 }

 try {
  const url = new URL(audioUrl);
  const match = url.pathname.match(/\/audio\/([^/]+)$/i);

  if (!match?.[1]) {
   return audioUrl;
  }

  return `${getProxyBaseUrl(request)}${match[1]}`;
 } catch {
  return audioUrl;
 }
}

export function getJsonErrorMessage(error, fallbackMessage) {
 return error instanceof Error && error.message ? error.message : fallbackMessage;
}
