import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REFRESH_PATH = "/api/auth/refresh";
const LOGIN_PATH = "/account/Login";

function getReturnPath(requestUrl) {
  const requestedPath = requestUrl.searchParams.get("returnTo");

  if (!requestedPath || !requestedPath.startsWith("/") || requestedPath.startsWith("//")) {
    return "/";
  }

  const destination = new URL(requestedPath, requestUrl);

  if (
    destination.origin !== requestUrl.origin ||
    destination.pathname === REFRESH_PATH
  ) {
    return "/";
  }

  return `${destination.pathname}${destination.search}`;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const returnPath = getReturnPath(requestUrl);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend URL is not configured." },
      { status: 500 },
    );
  }

  let backendResponse;

  try {
    backendResponse = await fetch(
      `${backendUrl.replace(/\/+$/, "")}/users/me/role`,
      {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
        cache: "no-store",
        redirect: "manual",
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to contact the authentication service." },
      { status: 502 },
    );
  }

  const isUnauthorized = backendResponse.status === 401;

  if (!backendResponse.ok && !isUnauthorized) {
    return NextResponse.json(
      { error: "The authentication service could not refresh the session." },
      { status: 502 },
    );
  }

  const destination = isUnauthorized
    ? new URL(LOGIN_PATH, requestUrl)
    : new URL(returnPath, requestUrl);
  const response = NextResponse.redirect(destination);

  for (const cookie of backendResponse.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}