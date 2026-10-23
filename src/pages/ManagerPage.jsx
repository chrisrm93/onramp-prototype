// Property Manager side: a portfolio snapshot, a switcher to pick a property,
// then one tab for each part of running that house. Clicking a tenant's name opens their profile.
import { useCallback, useState } from 'react'
import { useData } from '../data/store.js'
import { CURRENT_MONTH } from '../constants.js'
import PortfolioSummary from '../components/PortfolioSummary.jsx'
import OperationsSummary from '../components/OperationsSummary.jsx'
import PropertySwitcher from '../components/PropertySwitcher.jsx'
import ComingSoonPanel from '../components/ComingSoonPanel.jsx'
import Inbox from '../components/Inbox.jsx'
import Applications from '../components/Applications.jsx'
import ToursList from '../components/ToursList.jsx'
import LeasesList from '../components/LeasesList.jsx'
import RentRoll from '../components/RentRoll.jsx'
import MaintenanceList from '../components/MaintenanceList.jsx'
import HomebuyerPipeline from '../components/HomebuyerPipeline.jsx'
import TenantProfile from '../components/TenantProfile.jsx'

// The tabs, in the order a manager would work through them.
const TABS = [
  { id: 'inbox', label: 'Inbox', Panel: Inbox },
  { id: 'applications', label: 'Applications', Panel: Applications },
  { id: 'tours', label: 'Tours', Panel: ToursList },
  { id: 'leases', label: 'Leases', Panel: LeasesList },
  { id: 'rent', label: 'Rent roll', Panel: RentRoll },
  { id: 'maintenance', label: 'Maintenance', Panel: MaintenanceList },
]

export default function ManagerPage() {
  const [data] = useData()
  const [propertyId, setPropertyId] = useState(() => data.properties.find((p) => p.status === 'live')?.id)
  const [tabId, setTabId] = useState('inbox')
  const [profileId, setProfileId] = useState(null)
  // Which chat the Inbox should open, plus a timestamp so asking again reopens it.
  const [threadRequest, setThreadRequest] = useState(null)
  const property = data.properties.find((p) => p.id === propertyId) ?? data.properties[0]
  const tab = TABS.find((t) => t.id === tabId)
  const counts = tabCounts(data, property.id)
  const closeProfile = useCallback(() => setProfileId(null), [])

  // From a tenant's profile: jump to the Inbox with their conversation open.
  function openThread(threadId) {
    setThreadRequest({ threadId, at: Date.now() })
    setTabId('inbox')
    setProfileId(null)
  }

  return (
    <div className="page">
      <div className="manager-title">
        <h1>Property management</h1>
      </div>

      <PortfolioSummary data={data} />
      <OperationsSummary data={data} />
      <HomebuyerPipeline data={data} onOpenTenant={setProfileId} />
      <PropertySwitcher properties={data.properties} selectedId={property.id} onSelect={setPropertyId} />

      {property.status === 'live' ? (
        <>
          <nav className="manager-tabs" aria-label="Manager sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={t.id === tabId ? 'manager-tab active' : 'manager-tab'}
                onClick={() => setTabId(t.id)}
              >
                {t.label}
                {counts[t.id] > 0 && <span className={`tab-count ${t.id === 'rent' ? 'red' : ''}`}>{counts[t.id]}</span>}
              </button>
            ))}
          </nav>
          <tab.Panel
            key={tab.id === 'inbox' ? threadRequest?.at ?? 'inbox' : tab.id}
            propertyId={property.id}
            onOpenTenant={setProfileId}
            threadId={threadRequest?.threadId}
          />
        </>
      ) : (
        <ComingSoonPanel property={property} />
      )}

      {profileId && <TenantProfile tenantId={profileId} onClose={closeProfile} onOpenThread={openThread} />}
    </div>
  )
}

// The little number on each tab: what needs the manager's attention right now.
function tabCounts(data, propertyId) {
  const here = (item) => item.propertyId === propertyId
  const tenantIds = data.tenants.filter(here).map((t) => t.id)
  return {
    inbox: data.inquiries.filter((i) => here(i) && i.status === 'new').length,
    applications: data.applicants.filter((a) => here(a) && a.status === 'submitted').length,
    tours: data.tours.filter((t) => here(t) && t.status === 'scheduled').length,
    leases: data.tenants.filter((t) => here(t) && !data.leases.some((l) => l.tenantId === t.id)).length,
    rent: data.payments.filter((p) => tenantIds.includes(p.tenantId) && p.month === CURRENT_MONTH && p.status === 'late').length,
    maintenance: data.maintenance.filter((m) => here(m) && m.status !== 'done').length,
  }
}
