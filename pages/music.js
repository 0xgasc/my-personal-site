import { useApp } from '@/contexts/AppContext'

export default function Music() {
  const { darkMode } = useApp()

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4">Music</h1>
      <p>I create and produce music that blends texture, rhythm, and feeling — sometimes electronic, sometimes acoustic, always experimental.</p>
    </div>
  )
}
