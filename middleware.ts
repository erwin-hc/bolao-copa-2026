import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Apenas proteger APIs, páginas são abertas
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const publicApiPaths = ["/api/auth/login", "/api/auth/register"];

    if (publicApiPaths.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  // Páginas: sempre permitir (a segurança é feita no frontend)
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
