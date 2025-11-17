import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Array of paths where authenticated users should not access
const authPaths = ["/account/Login", "/account/Register", "/"];

async function verifyJWT(token, secret) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // Get the current URL path
    const path = request.nextUrl.pathname;
    let isAuthenticated = false;
    let userRole = null;

    //verify accessToken
    if (accessToken) {
      try {
        const decoded = await verifyJWT(
          accessToken,
          process.env.JWT_ACCESS_TOKEN_SECRET_KEY
        );
        if (decoded) {
          isAuthenticated = true;
          userRole = decoded.role;
        }
      } catch (error) {}
    }

    // use refresh token if access token is expired
    if (!isAuthenticated && refreshToken) {
      try {
        const decodedRefresh = await verifyJWT(
          refreshToken,
          process.env.JWT_REFRESH_TOKEN_SECRET_KEY
        );
        if (decodedRefresh) {
          isAuthenticated = true;
          userRole = decodedRefresh.role;
        }
      } catch (error) {}
    }

    // Redirect authenticated users away from login/register
    if (isAuthenticated) {
      // Redirect authenticated users away from login or registration pages
      if (authPaths.includes(path)) {
        if (userRole === "Admin") {
          return NextResponse.redirect(
            new URL("/user/admin/dashboard", request.nextUrl.origin)
          );
        } else if (userRole === "Student") {
          return NextResponse.redirect(
            new URL("/user/student/dashboard", request.nextUrl.origin)
          );
        }
      }

      // Role-based access control
      if (userRole === "Admin") {
        // Allow access to /user/admin paths only
        if (path.startsWith("/user/student")) {
          return NextResponse.redirect(
            new URL("/user/admin/dashboard", request.nextUrl.origin)
          );
        }
      } else if (userRole === "Student") {
        // Allow access to /user/student paths only
        if (path.startsWith("/user/admin")) {
          return NextResponse.redirect(
            new URL("/user/student/dashboard", request.nextUrl.origin)
          );
        }
      }
    }

    // If user is not authenticated and tries to access protected paths redirect to login
    if (!isAuthenticated && !authPaths.includes(path)) {
      return NextResponse.redirect(new URL("/account/Login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.next(); // Proceed with the request
  }
}

// the paths where the middleware will apply
export const config = {
  matcher: ["/user/:path*", "/account/Login", "/account/Register"],
};
