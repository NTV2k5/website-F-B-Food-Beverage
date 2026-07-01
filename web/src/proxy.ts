import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames and ignore internal files
  matcher: ['/', '/(vi|en|zh|ja)/:path*', '/((?!_next|_vercel|.*\\..*).*)', '/((?!api|_next/static|_next/image|favicon.ico).*)']
};
