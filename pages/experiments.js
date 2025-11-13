import Image from 'next/image'
import { useApp } from '@/contexts/AppContext'
import { useTranslation } from '@/lib/translations'

export default function Photography() {
  const { darkMode, language } = useApp()
  const t = useTranslation(language)

  return (
    <div className="w-full">

      {/* Bespoke Applications Section */}
      <h2 className="text-xl font-semibold mb-4">{t.experiments.bespokeApps}</h2>
      <p className="mb-6">
        {t.experiments.bespokeDesc}
      </p>
      <ul className="mb-10 space-y-2">
        <li>
          <a
            href="https://umoarchive.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {t.experiments.umo}
          </a>
          {' '}- {t.experiments.umoDesc}
        </li>
        <li>
          <a
            href="https://flyinguate.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {t.experiments.flyinguate}
          </a>
          {' '}- {t.experiments.flyinguateDesc}
        </li>
        <li>
          <a
            href="https://stablepay-nine.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {t.experiments.stablepay}
          </a>
          {' '}- {t.experiments.stablepayDesc}
        </li>
        <li>
          <a
            href="https://tiqueteo.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {t.experiments.tiqueteo}
          </a>
          {' '}- {t.experiments.tiqueteoDesc}
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-4">{t.experiments.coinedMoments}</h2>
      <p className="mb-6">
        {t.experiments.coinedDesc}
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
            <h3 className="font-semibold">{t.experiments.higher}</h3>
            <a
              href="https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/4?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              {t.experiments.viewCollect}
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
            <h3 className="font-semibold">{t.experiments.rflxns}</h3>
            <a
              href="https://zora.co/collect/zora:0x2000c459b2b41d0311c9f57518d4a69294268590/3?referrer=0xd573becb6a6b0a0d43065d468d07787ca65daf8a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              {t.experiments.viewCollect}
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
            <h3 className="font-semibold">{t.experiments.atitlan}</h3>
            <a
              href="https://rodeo.club/post/0x98e116FDAF8dC4D324BC69FA7aE41f588113D3FC/1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              {t.experiments.viewCollectRodeo}
            </a>
          </div>
        </div>
      </div>

      {/* Stretch Studies Section */}
      <h2 className="text-xl font-semibold mb-4">{t.experiments.stretchStudies}</h2>
      <p className="mb-6">{t.experiments.stretchDesc}</p>

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
            <h3 className="font-semibold">{t.experiments.boundBlight}</h3>
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
            <h3 className="font-semibold">{t.experiments.isFearr}</h3>
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
            <h3 className="font-semibold">{t.experiments.dreams}</h3>
          </div>
        </div>
      </div>

      <p className={`text-sm italic mb-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.experiments.mintingSoon}</p>

      {/* Music Section */}
      <h2 className="text-xl font-semibold mb-4">{t.experiments.music}</h2>
      <p className={`text-sm italic mb-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.experiments.comingSoon}</p>

      {/* Back link */}
      <button
        onClick={() => window.history.back()}
        className="text-blue-600 underline cursor-pointer mt-4"
      >
        {t.experiments.goBack}
      </button>
    </div>
  )
}
