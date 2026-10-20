// App shell: header with the Tenant/Manager toggle, then whichever page the URL points to.
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import ListingPage from './pages/ListingPage.jsx'
import ManagerPage from './pages/ManagerPage.jsx'
import ApplyPage from './pages/ApplyPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<ListingPage />} />
          <Route path="/property/:propertyId" element={<ListingPage />} />
          <Route path="/property/:propertyId/contact/:roomId" element={<ContactPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/property/:propertyId/apply/:roomId" element={<ApplyPage />} />
          <Route path="/manager" element={<ManagerPage />} />
        </Routes>
      </main>
    </div>
  )
}
