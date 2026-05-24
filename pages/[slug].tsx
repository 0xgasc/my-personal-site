import type { GetServerSideProps } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import { getPage, listSectionsForPage, type Section, type PageRow } from "@/lib/cms/store";
import SectionsRenderer from "@/components/cms/SectionsRenderer";

interface Props {
  page: PageRow;
  sections: Section[];
}

const RESERVED_TOP_LEVEL = new Set([
  "admin",
  "api",
  "preview",
  "career",
  "collection",
  "experiments",
  "music",
  "pdf",
  "tip",
  "favicon.svg",
  "favicon.ico",
  "robots.txt",
]);

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug;
  if (typeof slug !== "string" || RESERVED_TOP_LEVEL.has(slug)) {
    return { notFound: true };
  }
  try {
    const page = await getPage(slug);
    if (!page || !page.isPublic) return { notFound: true };
    const sections = await listSectionsForPage(slug, false);
    return {
      props: {
        page: JSON.parse(JSON.stringify(page)),
        sections: JSON.parse(JSON.stringify(sections)),
      },
    };
  } catch (err) {
    console.error("[/[slug]]", err);
    return { notFound: true };
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CustomPage({ page, sections }: Props) {
  return (
    <>
      <Head>
        <title>{page.title || page.slug}</title>
      </Head>
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        {page.title && <h1>{page.title}</h1>}
        <SectionsRenderer page={page.slug} initial={sections} />
      </motion.div>
    </>
  );
}
