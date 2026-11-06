// Career copy, shared by /career and the printable /pdf page.
// Text lives in lib/translations.js under `career`.

export const RESUME_URL = '/gabriel-solomon-cv.pdf'

export default function CareerText({ t, pClassName, linkClassName, external = true }) {
  const c = t.career
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  const A = ({ href, children, ...rest }) => (
    <a href={href} className={linkClassName} {...ext} {...rest}>
      {children}
    </a>
  )

  return (
    <>
      <p className={pClassName}>
        {c.p1a}
        <A href="https://www.uvg.edu.gt/carreras/industrial/">UVG</A>
        {c.p1b}
        <A href="https://en.ufm.edu/maestrias/mba/pensum/">UFM</A>
        {c.p1c}
        <A href="https://www.unic.ac.cy/blockchain">{c.unic}</A>
        {c.p1d}
      </p>

      <p className={pClassName}>
        {c.p2} (
        <A href="https://www.augmentir.com/news/augmentir-brings-ai-to-sap-plant-maintenance-with-its-connected-worker-solution">
          {c.readMore}
        </A>
        ).
      </p>

      <p className={pClassName}>
        {c.p3a}
        <A href="https://offsetworks.xyz">Offset Works</A>
        {c.p3b}
        <A href="https://flyinguate.com">FlyIn Guatemala</A>
        {c.p3c}
        <A href="https://umo-live.xyz">UMO Live</A>
        {c.p3d}
      </p>

      <p className={pClassName}>
        {c.p4}{' '}
        <A href={RESUME_URL}>{c.myResume}</A>.
      </p>
    </>
  )
}
