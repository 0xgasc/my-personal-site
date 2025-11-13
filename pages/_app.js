// pages/_app.js
import Layout from '@/components/components/layout'
import { AppProvider } from '@/contexts/AppContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  )
}
