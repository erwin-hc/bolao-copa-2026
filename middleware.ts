import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Só proteger APIs
  if (pathname.startsWith("/api/")) {
    const publicApiPaths = ["/api/auth/login", "/api/auth/register"];

    if (publicApiPaths.includes(pathname)) {
      return NextResponse.next();
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  // Para páginas, permitir todas (a verificação é feita no cliente)
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/:path*"],
};
