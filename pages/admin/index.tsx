import type { GetServerSideProps } from "next";
import { isAuthed } from "@/lib/admin/sessionAuth";

/**
 * /admin currently just routes to the upload page. The old scene-builder
 * UI (a full DB-backed gallery of FX configurations) was retired — the
 * site picks backgrounds from the NEXT_PUBLIC_BG_CLIPS env var instead.
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const authed = isAuthed(ctx.req);
  return {
    redirect: {
      destination: authed ? "/admin/upload" : "/admin/login",
      permanent: false,
    },
  };
};

export default function AdminIndexRedirect() {
  return null;
}
