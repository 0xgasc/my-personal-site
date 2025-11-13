import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Hi, I&apos;m Gabriel</h1>

      <p className="text-lg mb-6" style={{ textAlign: 'justify' }}>
        Welcome to my personal site.
      </p>

      <p className="text-lg mb-6" style={{ textAlign: 'justify' }}>
        I&apos;m a creative explorer, passionate about building things and sharing ideas.
      </p>

      <p className="text-lg mb-6" style={{ textAlign: 'justify' }}>
        I have a{' '}
        <Link href="/career" className="text-blue-600 underline">
          background
        </Link>{' '}
        in engineering and I'm passionate about using public decentralized technologies to pursue{' '}
        <Link href="/experiments" className="text-blue-600 underline">
          experimental work
        </Link>
        . I've built projects like{' '}
        <a href="https://tiqueteo.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          tiqueteo.xyz
        </a>
        , a p2p ticket swapping platform.
      </p>

      <p className="text-lg mb-12" style={{ textAlign: 'justify' }}>
        I also enjoy collecting digital artifacts across multiple blockchains. You can explore my curated{' '}
        <Link href="/collection" className="text-blue-600 underline">
          collections and galleries
        </Link>
        . I’ve also linked some art you may find enjoyable via ArtTab below.
      </p>

      <div className="rounded-lg overflow-hidden border shadow-lg max-w-4xl mx-auto">
        <iframe
          src="https://arttab.xyz/"
          title="ArtTab Live Preview"
          className="w-full"
          style={{ height: '500px', border: 'none' }}
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  )
}
