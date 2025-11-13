import Image from 'next/image'
import { useRouter } from 'next/router'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Experiments() {
  const router = useRouter()
  const { darkMode, language } = useApp()
  const t = useTranslation(language)

  return (
    <div className="w-full">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-8">{t.collection.title}</h1>

      {/* Gallery Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t.collection.galleryRandom}{' '}
          <a
            href="https://opensea.io/gallery/0xd573becb6a6b0a0d43065d468d07787ca65daf8a/0ede10101eb1468b9a3978a9da1eca28"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            (link)
          </a>
        </h2>
        <p className="mb-4 max-w-4xl">
          {t.collection.galleryRandomDesc}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl">
          <GalleryImage
            href="https://opensea.io/item/ethereum/0x8b7fb2b5aee1f48e354e5e81605864319ec19039/8"
            src="https://i2.seadn.io/ethereum/0x8b7fb2b5aee1f48e354e5e81605864319ec19039/09367d84cf3a65eae29447b8b8f271/6409367d84cf3a65eae29447b8b8f271.jpeg?w=1000"
            alt="the great purge by slimesunday"
          />
          <GalleryImage
            href="https://opensea.io/item/zora/0xf604c8204c4ca417635080c45f4ace8d0a7cf3ca/1"
            src="https://i2.seadn.io/zora/0xf604c8204c4ca417635080c45f4ace8d0a7cf3ca/9995f9ea5f489e0355e01375828e7f/bc9995f9ea5f489e0355e01375828e7f.jpeg?w=1000"
            alt="(don&apos;t) Leave me alone by fabrii2k"
          />
          <GalleryImage
            href="https://opensea.io/item/zora/0x2e3112987df0b0beb942203701abc0efb6c572d0/21"
            src="https://i2.seadn.io/zora/0x2e3112987df0b0beb942203701abc0efb6c572d0/32a01b58ee3ce33a0d918c9b27a3dc/4332a01b58ee3ce33a0d918c9b27a3dc.png?w=1000"
            alt="a tale about how a dragon feels by thisisgonz"
          />
        </div>
      </div>

      {/* Tezos Evergreen Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t.collection.galleryEvergreen}{' '}
          <a
            href="https://objkt.com/curations/objkt/exploring-the-evergreen-b3fe55e2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            (link)
          </a>
        </h2>
        <p className="mb-4 max-w-4xl">
          {t.collection.galleryEvergreenDesc}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl">
          <GalleryImage
            href="https://objkt.com/tokens/KT1Sfvkj5boovQCRRFSroE6SAecPHnLed7uD/11"
            src="https://assets.objkt.media/file/assets-003/QmNhHb86j57AQ6RvM1uHzfsBBh7cMoYYpUDyP5PkxbQRBw/artifact"
            alt="Digital Footprints by Ribela"
          />
          <GalleryImage
            href="https://objkt.com/tokens/KT1PoKNmnMeuf4ReHSYNwhJdELZkMcYKfL6K/43"
            src="https://assets.objkt.media/file/assets-003/QmXZgkNBU98bUZVhyNnFJeTGAVv44mnCiwo4JZkQgq2Tom/artifact"
            alt="Jellyfish by Gogolitus"
          />
          <GalleryImage
            href="https://objkt.com/tokens/KT1A9SuKGSj1YYx35kY1LKmHwYRoN3N7Gv51/5"
            src="https://assets.objkt.media/file/assets-003/Qme2FDRj7V9PsHu3tVzEcfjCgoDPpbRFLKBnPXGyexRtMF/artifact"
            alt="GM_ɢᴀʀʙᴀɢᴇ by Slava3ngl"
          />
        </div>
      </div>

      {/* Vault Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t.collection.vaultMemetic}{' '}
          <a
            href="https://opensea.io/0x69c8c2923005d26eaeea9500d7602eff8c81c848"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            (link)
          </a>
        </h2>
        <p className="mb-4 max-w-4xl">
          {t.collection.vaultMemeticDesc}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl">
          <GalleryImage
            href="https://opensea.io/item/ethereum/0x942bc2d3e7a589fe5bd4a5c6ef9727dfd82f5c8a/12686"
            src="https://art-blocks-explorations-mainnet.s3.amazonaws.com/12686.png"
            alt="Friendship Bracelet by Alexis Andre and Snowfro"
          />
          <GalleryImage
            href="https://opensea.io/item/ethereum/0x8585103b49286a40d61f4c8286aab516601f6786/18"
            src="https://i2.seadn.io/ethereum/0x8585103b49286a40d61f4c8286aab516601f6786/1c88d763ca63bd325e7c8b6bc864644c.jpeg?w=1000"
            alt="Fiat Dude by Alejandro Peters"
          />
          <GalleryImage
            href="https://opensea.io/item/ethereum/0x232a68a51d6e07357ae025d2a459c16077327102/14"
            src="https://i2.seadn.io/ethereum/0x232a68a51d6e07357ae025d2a459c16077327102/d8ec1c65324b53f9cbeca81514d63b/02d8ec1c65324b53f9cbeca81514d63b.gif?w=1000"
            alt="Max Pain v2 by Alpha Centaury Kid"
          />
          <GalleryImage
            href="https://opensea.io/item/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/3"
            src="https://raw2.seadn.io/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/579216d77a7580dd8cf08db689324f/10579216d77a7580dd8cf08db689324f.jpeg"
            alt="Uncle Seize, 6529er"
          />
          <GalleryImage
            href="https://opensea.io/item/ethereum/0x68930072647a0d79e601d5ee3914833ae9148247/878"
            src="https://i2.seadn.io/ethereum/0x68930072647a0d79e601d5ee3914833ae9148247/463e210b12cfda412a6f84ef12d74801.png?w=1000"
            alt="Wavelength by Kaleb Johnston"
          />
          <GalleryImage
            href="https://opensea.io/item/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/37"
            src="https://i2.seadn.io/ethereum/0x33fd426905f149f8376e227d0c9d3340aad17af1/870b0bfc37bd9e6294fb2d955aad2d/df870b0bfc37bd9e6294fb2d955aad2d.jpeg?w=1000"
            alt="Sgt Pepe by Ars0nic"
          />
        </div>
      </div>

      <button
        onClick={() => router.back()}
        className={`mt-6 px-5 py-2 rounded transition ${
          darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
      >
        {t.collection.goBack}
      </button>

      <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {t.collection.clickImage}
      </p>
    </div>
  )
}

// Helper component
function GalleryImage({ href, src, alt }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className="rounded-lg shadow-md hover:opacity-90 transition-opacity"
      />
    </a>
  )
}
