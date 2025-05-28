import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8">
      <h1 className="text-4xl font-bold mb-4">Hi, I&apos;m [G]</h1>
      <p className="text-lg">Welcome to my personal site.</p>
      <p className="mt-2">I&apos;m a creative explorer, passionate about building things and sharing ideas.</p>

      <p className="mt-6 text-lg">
        I have a background in{' '}
        <Link href="/automation" className="text-blue-600 underline">
          automation and consulting
        </Link>{' '}
        and I am passionate about projects that leverage public decentralized technology to conduct{' '}
        <Link href="/experiments" className="text-blue-600 underline">
          experimental projects
        </Link>
        .
      </p>
      <p className="text-lg">
        I also enjoy{' '}
        <Link href="/photography" className="text-blue-600 underline">
          digital art &amp; photography
        </Link>
        , and play the drums and guitars — find my{' '}
        <Link href="/music" className="text-blue-600 underline">
          music
        </Link>{' '}
        here.
      </p>

      {/* Live ArtTab Preview */}
      <div className="mt-12">
        <p className="text-lg mb-4">Find some of the art I like via ArtTab below:</p>
        <div className="rounded-lg overflow-hidden border shadow-lg max-w-4xl">
          <iframe
            src="https://arttab.xyz/"
            title="ArtTab Live Preview"
            className="w-full"
            style={{ height: '500px', border: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}
