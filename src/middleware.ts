import { NextResponse, type NextRequest } from "next/server";
import { currentRetreatEdition } from "@/data/retreat-editions";
import { isLoneStarRetreatHost } from "@/lib/domain-routing";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;

  if (isLoneStarRetreatHost(host) && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = currentRetreatEdition.publicPath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|admin/|images/|favicon.ico).*)"],
};
