import type { GetServerSideProps } from "next";
import { isAuthed } from "@/lib/admin/sessionAuth";

/** Easy-to-remember way in: s-o-l-o.xyz/edit → sign in (if needed) → guestbook review. */
export const getServerSideProps: GetServerSideProps = async ({ req }) => ({
  redirect: {
    destination: isAuthed(req) ? "/admin/guestbook" : "/admin/login?next=/admin/guestbook",
    permanent: false,
  },
});

export default function Edit() {
  return null;
}
