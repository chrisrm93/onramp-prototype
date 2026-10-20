// Property Manager side. For now it's just the Inbox; the rest
// (switcher, summary, applications, rent roll, maintenance) comes later.
import { useData } from '../data/store.js'
import Inbox from '../components/Inbox.jsx'

export default function ManagerPage() {
  const [data] = useData()
  const newCount = data.inquiries.filter((i) => i.status === 'new').length

  return (
    <div className="page">
      <div className="manager-title">
        <h1>Inbox</h1>
        {newCount > 0 && <span className="badge orange">{newCount} new</span>}
      </div>
      <Inbox />
    </div>
  )
}
