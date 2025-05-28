import Image from 'next/image'

export default function Automation() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8">
      <h1 className="text-3xl font-bold mb-6">Automation & Consulting</h1>

      <div className="mb-6">
        <Image
          src="https://www.augmentir.com/wp-content/uploads/2023/04/augmentir-for-sap-plant-maintenance.jpg"
          alt="Augmentir for SAP Plant Maintenance"
          width={300}
          height={200} // approximate height since original was auto, you can adjust this
          className="rounded-md shadow-md"
        />
      </div>

      <p className="mb-4">
        I had the exciting opportunity to consult for Colgate&apos;s global engineering and automation team, helping them innovate workflows and drive efficiency at scale.
      </p>

      <p className="mb-6">
        Partnering with{' '}
        <a
          href="https://www.augmentir.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Augmentir
        </a>
        , we empowered connected workers by integrating AI-driven solutions into SAP Plant Maintenance.{' '}
        This cutting-edge connected worker platform enhances frontline productivity and safety by delivering real-time guidance and intelligent insights right at the point of work.
      </p>

      <p>
        This collaboration is part of a broader wave of digital transformation in industrial operations&mdash;where AI and automation meet human expertise to redefine how maintenance and engineering teams operate worldwide.
      </p>

      <p className="mt-8 text-sm text-gray-600 italic">
        Learn more here:{' '}
        <a
          href="https://www.augmentir.com/news/augmentir-brings-ai-to-sap-plant-maintenance-with-its-connected-worker-solution"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Augmentir Brings AI to SAP Plant Maintenance
        </a>
      </p>
    </div>
  )
}
