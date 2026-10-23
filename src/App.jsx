// App shell: header with the Tenant/Manager toggle, whichever page the URL points to,
// and the footer with the demo reset button. Tenant pages share the journey sidebar.
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import TenantLayout from './components/TenantLayout.jsx'
import ListingPage from './pages/ListingPage.jsx'
import ManagerPage from './pages/ManagerPage.jsx'
import ApplyPage from './pages/ApplyPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import MoveInPage from './pages/MoveInPage.jsx'
import MyHomePage from './pages/MyHomePage.jsx'

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route element={<TenantLayout />}>
            <Route path="/" element={<ListingPage />} />
            <Route path="/property/:propertyId" element={<ListingPage />} />
            <Route path="/property/:propertyId/contact/:roomId" element={<ContactPage />} />
            <Route path="/property/:propertyId/apply/:roomId" element={<ApplyPage />} />
            <Route path="/move-in" element={<MoveInPage />} />
            <Route path="/home" element={<MyHomePage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Route>
          <Route path="/manager" element={<ManagerPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
