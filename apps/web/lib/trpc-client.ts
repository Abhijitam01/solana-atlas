import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpcClientOptions = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
};
