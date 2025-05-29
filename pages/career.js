export default function Career() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8">
      <h1 className="text-3xl font-bold mb-6">Career & Education</h1>

      <p className="mb-8 text-justify">
        With a background in Industrial Engineering from{" "}
        <a
          href="https://www.uvg.edu.gt/carreras/industrial/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          UVG
        </a>
        , an MBA from{" "}
        <a
          href="https://en.ufm.edu/maestrias/mba/pensum/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          UFM
        </a>
        , and ongoing studies in Blockchain and Digital Currency at{" "}
        <a
          href="https://www.unic.ac.cy/blockchain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          UNIC
        </a>
        , I’ve shaped my path around technology, operations, and systems thinking.
      </p>

      <p className="mb-8 text-justify">
        I work at the intersection of industrial design and modern technology. Recently, I supported a global{" "}
        <a
          href="https://www.slickcharts.com/symbol/CL"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          manufacturer
        </a>{" "}
        in rethinking its operations strategy and digital tooling approach.
      </p>

      <p className="mb-8 text-justify">
        I also partnered with a startup developing AI tools for frontline teams. Together, we built an integration that overlays intelligent guidance onto SAP Plant Maintenance, helping factory workers navigate complex procedures in real time. You can{" "}
        <a
          href="https://www.augmentir.com/news/augmentir-brings-ai-to-sap-plant-maintenance-with-its-connected-worker-solution"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          read more here
        </a>
        .
      </p>

      <p className="mb-8 text-justify">
        Im especially interested in how emerging tools like AI and connected systems can enable smarter, safer, and more adaptive environments. If you would like to learn more, here is{" "}
        <a
          href="https://docs.google.com/document/d/1dADh80WJbSXYeYvpU3jf9qtZU2A-seU1MaD4cu9P6ME/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          my resume
        </a>
        .
      </p>

      <button
        onClick={() => window.history.back()}
        className="text-blue-600 underline cursor-pointer"
      >
        ← Go back
      </button>
    </div>
  )
}
