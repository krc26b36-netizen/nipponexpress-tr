import SkipLink from '../components/SkipLink.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import LandingContent from '../components/Landing.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <div className="app-bg" />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1">
        <LandingContent />
      </main>
      <Footer />
    </div>
  )
}
