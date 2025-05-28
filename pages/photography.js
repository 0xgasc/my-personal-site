import Image from 'next/image'

export default function Photography() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8">
      <h1 className="text-3xl font-bold mb-4">Photography</h1>
      <p className="mb-6">capturing how life makes me feel.</p>

      <h2 className="text-xl font-semibold mb-4">coined moments:</h2>
      <p>
        i explore light, story, and composition through photography &mdash; from street shots to abstract scenes. Here&apos;s some of my latest pieces on Zora:
      </p>

      <div className="flex gap-8 mb-8">
        {/* First piece */}
        <div>
          <Image
            src="https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:2666/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWU2NzJkbmJ2NTZmM3gzYW5iaXRhZjRja2VoZnltZ3Z0aDR6ejVhemdoMjZwNHB4M2U1ZnE"
            alt="Photography artwork Higher"
            width={200}
            height={266} // approximate height, keep aspect ratio
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">Title: Higher</h3>
            <p className="text-sm text-gray-600">a captivating exploration of light and shadow.</p>
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
            src="https://scontent-iad4-1.choicecdn.com/-/rs:fill:2000:1962/g:ce/f:webp/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWR4NWdqY2I2N29sb3hsbmg1Z2d5c2d2d3BtcmxqajNjMjJlemJ2NTd5aGd3NjdrZTRnYmE"
            alt="Photography artwork Coined Moment"
            width={200}
            height={196} // approximate height, keep aspect ratio
            className="rounded-lg shadow-md"
          />
          <div className="mt-2">
            <h3 className="font-semibold">Title: 10/13/24, 9:15 PM</h3>
            <p className="text-sm text-gray-600">reflections over the East River</p>
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
      </div>

      {/* Digital Collectibles Preview */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">digital collectibles:</h2>
        <p className="mb-6">
          i&apos;ve been fortunate enough to collect edition work from artists all over the world. here are some galleries:
        </p>
        {/* NEW SECTION: Random Collectibles */}
        <div className="mt-5">
          <a
            href="https://opensea.io/gallery/0xd573becb6a6b0a0d43065d468d07787ca65daf8a/0ede10101eb1468b9a3978a9da1eca28"
            target="_blank"
            rel="noopener noreferrer"
            className="text-l font-semibold text-blue-600 hover:underline block mb-6"
          >
            random collectibles – post 2022
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl">
          <a
            href="https://opensea.io/item/ethereum/0x8b7fb2b5aee1f48e354e5e81605864319ec19039/8"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
          >
            <Image
              src="https://i2.seadn.io/ethereum/0x8b7fb2b5aee1f48e354e5e81605864319ec19039/09367d84cf3a65eae29447b8b8f271/6409367d84cf3a65eae29447b8b8f271.jpeg?w=1000"
              alt="the great purge by slimesunday"
              width={300}
              height={300} // approximate size, you can adjust
              loading="lazy"
              className="w-full h-auto"
            />
          </a>

          <a
            href="https://opensea.io/item/zora/0xf604c8204c4ca417635080c45f4ace8d0a7cf3ca/1"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
          >
            <Image
              src="https://i2.seadn.io/zora/0xf604c8204c4ca417635080c45f4ace8d0a7cf3ca/9995f9ea5f489e0355e01375828e7f/bc9995f9ea5f489e0355e01375828e7f.jpeg?w=1000"
              alt="(don&apos;t) Leave me alone by fabrii2k"
              width={300}
              height={300}
              loading="lazy"
              className="w-full h-auto"
            />
          </a>

          <a
            href="https://opensea.io/item/zora/0x2e3112987df0b0beb942203701abc0efb6c572d0/21"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
          >
            <Image
              src="https://i2.seadn.io/zora/0x2e3112987df0b0beb942203701abc0efb6c572d0/32a01b58ee3ce33a0d918c9b27a3dc/4332a01b58ee3ce33a0d918c9b27a3dc.png?w=1000"
              alt="a tale about how a dragon feels when the smoke is not allowed bythisisgonz"
              width={300}
              height={300}
              loading="lazy"
              className="w-full h-auto"
            />
          </a>
        </div>

        <p className="mt-4 text-sm text-gray-600">Click any image to view it on OpenSea.</p>
      </div>
    </div>
  )
}
