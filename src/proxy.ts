import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATH_PREFIXES = [
  "/auth",
  "/contact",
  "/faq",
  "/howto",
  "/install",
  "/lp",
  "/privacy",
  "/terms",
  "/tokusho",
];

const PUBLIC_FILE_PATTERN = /\.(?:avif|css|gif|ico|jpg|jpeg|js|json|map|png|svg|webmanifest|webp|woff2?)$/i;

function shouldSkipProxy(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/stickman-assets") ||
    pathname.startsWith("/抽象画像") ||
    pathname.startsWith("/その他素材") ||
    PUBLIC_PATH_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    PUBLIC_FILE_PATTERN.test(pathname)
  );
}

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => {
    return name.startsWith("sb-") && name.includes("auth-token");
  });
}

export async function proxy(request: NextRequest) {
  if (shouldSkipProxy(request.nextUrl.pathname) || !hasSupabaseAuthCookie(request)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|api|favicon\\.ico|icon-.*\\.png|manifest\\.webmanifest|.*\\.(?:avif|css|gif|ico|jpg|jpeg|js|json|map|png|svg|webmanifest|webp|woff2?)$).*)",
  ],
};
