import Image from 'next/image'

export default function Photography() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8">

      <h2 className="text-xl font-semibold mb-4">coined moments:</h2>
      <p className="mb-6">
        i explore light, story, and composition through photography &mdash; from street shots to abstract scenes. Here&apos;s some of my latest pieces on Zora:
      </p>

      <div className="flex flex-wrap md:flex-nowrap gap-8 mb-8">
        {/* First piece */}
        <div>
          <Image
            src="https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:2666/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWRmbDM0dHlxZWh2eXhhbnJ5M3R5bHB0N2dmcmN0bmJoeW5xaWNjMmZhMjdxZndyNXh2dG0"
            alt="Photography artwork Higher"
            width={200}
            height={266}
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">higher</h3>
            <a
              href="https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/4?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              View and Collect on Zora
            </a>
          </div>
        </div>

        {/* Second piece */}
        <div>
          <Image
            src="https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:2614/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWc0ZHRqZGd3d2FoeGwycHRzNXZsbGoyeng0d3Z1emM3ZGNqNGl2Y3Uyc3V1ejZvbG5majQ"
            alt="Photography artwork Coined Moment"
            width={200}
            height={196}
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">rflxns</h3>
            <a
              href="https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/3?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              View and Collect on Zora
            </a>
          </div>
        </div>

        {/* Atitlán piece */}
        <div>
          <Image
            src="https://f8n-production-collection-assets.imgix.net/rodeo/8453/0x98e116FDAF8dC4D324BC69FA7aE41f588113D3FC/1/QmYVZaaUQWdoacXDEjJqiSAGRRAQWPiUoMwufMNajq9Yyb/nft.jpeg?auto=format%2Ccompress&q=70&cs=srgb&w=1480&dpr=2&contentHash=ipfs%3A%2F%2FQmYVZaaUQWdoacXDEjJqiSAGRRAQWPiUoMwufMNajq9Yyb&fnd_key=v1"
            alt="atitlán 12.22.24"
            width={200}
            height={200}
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">atitlán 12.22.24</h3>
            <a
              href="https://rodeo.club/post/0x98e116FDAF8dC4D324BC69FA7aE41f588113D3FC/1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              View and Collect on Rodeo
            </a>
          </div>
        </div>
      </div>

      {/* Stretch Studies Section */}
      <h2 className="text-xl font-semibold mb-4">stretch studies:</h2>
      <p className="mb-6">a series of quick, experimental shots exploring form and texture made from living moments.</p>

      <div className="flex flex-wrap md:flex-nowrap gap-8 mb-4">
        <div className="flex-shrink-0">
          <Image
            src="https://arweave.net/cISz_3-jt60B7F1vMPUFbfO-03pRx33hn3fjr8T7PV4"
            alt="Stretch Study 1"
            width={200}
            height={200}
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">bound blight</h3>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Image
            src="https://arweave.net/Fle1sUx_Ms8RSs4-KvjcDwlij8GWUKR-WAG2cM1NvII"
            alt="Stretch Study 2"
            width={200}
            height={200}
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">is fearr ar domhan</h3>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Image
            src="https://arweave.net/NiUDZK_LNI5XhpYWeYyzUTq4EgotCfry7r3LuvqcJqg"
            alt="dreams"
            width={200}
            height={200}
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">dreams</h3>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 italic mb-10">minting soon on a custom manifold contract.</p>

      {/* Music Section */}
      <h2 className="text-xl font-semibold mb-4">music:</h2>
      <p className="text-sm text-gray-600 italic mb-10">coming soon...</p>

      {/* Back link */}
      <button
        onClick={() => window.history.back()}
        className="text-blue-600 underline cursor-pointer mt-4"
      >
        ← Go back
      </button>
    </div>
  )
}
