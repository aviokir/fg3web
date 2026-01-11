import '@/styles/globals.css'
import Navbar from '@/components/Navbar'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <div className="pt-20"> {/* Espacio para que el navbar no tape el contenido */}
        <Component {...pageProps} />
      </div>
    </>
  )
}