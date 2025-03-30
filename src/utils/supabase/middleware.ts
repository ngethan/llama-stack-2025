import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Business } from "@/types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: businessData, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", user?.id)
    .single();
  if (error) console.error(error);

  if (businessData) {
    const route = KYB(
      businessData as Business,
      request.nextUrl.pathname.toLowerCase(),
    );

    if (route) return NextResponse.redirect(new URL(route, request.url));
  }

  return supabaseResponse;
}

function KYB(b: Business, requestUrl: string): string | undefined {
  const required = [
    b.id,
    b.legalName,
    b.website,
    b.description,
    b.ein,
    b.address,
    b.phone,
    b.industryMccCode,
    b.averageTransactionSize,
    b.averageMonthlyTransactionVolume,
    b.maximumTransactionSize,
    b.acceptTermsOfService,
    b.email,
    b.businessType,
  ];

  if (requestUrl.startsWith("/auth/login")) return;
  else if (!requestUrl.startsWith("/kyb-intake") && required.some((r) => !r)) {
    return "/kyb-intake";
  } else if (
    requestUrl.startsWith("/kyb-intake") &&
    !required.some((r) => !r)
  ) {
    return "/dashboard";
  }
  return;
}
