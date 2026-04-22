import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  
  // iOS Safari için OPTIONS preflight request'lerini handle et
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  // iOS Safari cache-busting için manifest.json'a timestamp ekle
  if (pathname === '/manifest.json') {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Vary', 'Accept-Encoding, User-Agent');
    return response;
  }

  // Eğer zaten /entry sayfasındaysa veya API route'undaysa, middleware'i atla
  if (
    pathname === '/entry' ||
    pathname === '/ankamall' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/')
  ) {
    return NextResponse.next();
  }

  // Ankamall slug kontrolü
  const slug = searchParams.get('slug');
  if (slug === 'ankamall' && pathname === '/') {
    const visitedCookie = request.cookies.get('ankamall_visited');
    
    // İlk ziyaret - /ankamall sayfasına yönlendir
    if (!visitedCookie) {
      const response = NextResponse.redirect(new URL('/ankamall', request.url));
      // Cookie'yi set et (4 saat geçerli)
      response.cookies.set('ankamall_visited', 'true', {
        maxAge: 60 * 60 * 4, // 4 saat
        path: '/',
      });
      return response;
    }
    
    // Daha önce ziyaret edilmiş - normal devam et
    return NextResponse.next();
  }

  // Eğer slug parametresi varsa, middleware'i atla (kullanıcı zaten yönlendirilmiş)
  if (slug) {
    return NextResponse.next();
  }

  // Eğer kök dizindeyse ve slug yoksa, direkt ankamall'a yönlendir
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('slug', 'ankamall');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
