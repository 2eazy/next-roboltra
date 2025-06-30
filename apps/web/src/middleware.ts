import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, we'll skip middleware authentication checks
  // The actual auth check will happen in the page components
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};