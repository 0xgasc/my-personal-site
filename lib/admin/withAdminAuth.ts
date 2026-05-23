import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { isAuthed } from "./sessionAuth";

/**
 * Wraps a getServerSideProps to require an admin session. Redirects to
 * /admin/login if not authed.
 */
export function withAdminAuth<P extends object = Record<string, never>>(
  inner?: (
    ctx: GetServerSidePropsContext
  ) => Promise<GetServerSidePropsResult<P>>
) {
  const fn: GetServerSideProps = async (ctx) => {
    if (!isAuthed(ctx.req)) {
      return {
        redirect: { destination: "/admin/login", permanent: false },
      };
    }
    if (!inner) return { props: {} };
    const result = await inner(ctx);
    return result as GetServerSidePropsResult<{ [key: string]: unknown }>;
  };
  return fn;
}
