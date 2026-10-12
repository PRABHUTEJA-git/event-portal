
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import './EventInChargeDashboard.css'
const sampleRequests = [
  {
    id: 'EVT-101',
    title: 'Technical Symposium',
    student: 'Arjun Kumar',
    department: 'CSE',
    date: '2026-11-10',
    venue: 'Seminar Hall',
    attendees: 150,
    description: 'Technical event with coding and project competitions.',
    status: 'Pending',
  },
  {
    id: 'EVT-102',
    title: 'Cultural Fest',
    student: 'Priya Sharma',
    department: 'ECE',
    date: '2026-11-15',
    venue: 'College Auditorium',
    attendees: 300,
    description: 'Music, dance and cultural performances.',
    status: 'Pending',
  },
  {
    id: 'EVT-103',
    title: 'Web Development Workshop',
    student: 'Rahul Reddy',
    department: 'IT',
    date: '2026-11-20',
    venue: 'Computer Lab 2',
    attendees: 60,
    description: 'A practical web development workshop.',
    status: 'Approved',
  },
]

export default function EventInChargeDashboard({
  name = 'Event In-Charge',
  onLogout,
}) {
  const [requests, setRequests] = useState([])
  
useEffect(() => {
  async function loadRequests() {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .order('created_at', { ascending: false })
      console.log('In-charge request load:', { data, error })

    if (error) {
      console.error('Error loading in-charge requests:', error)
      return
    }

    
const mappedRequests = (data || []).map((row) => ({
  id: row.id,
  referenceNo: row.reference_no,
  title: row.event_title,
  student: row.student_id,
  studentId: row.student_id,
  department: '—',
  year: '—',
  date: row.start_date,
  endDate: row.end_date,
  venue: row.venue,
  city: row.city,
  attendees: '—',
  description: row.purpose,
  organizer: row.organizer,
  category: row.category,
  status:
    row.status === 'Recommended for Approval'
      ? 'Pending'
      : row.status,
  recommendation: row.recommendation || '',
  remarks: row.remarks || '',
}))


    setRequests(mappedRequests)
  }

  loadRequests()
}, [])

  const [page, setPage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const pending = requests.filter((r) => r.status === 'Pending').length
  const approved = requests.filter((r) => r.status === 'Approved').length
  const rejected = requests.filter((r) => r.status === 'Rejected').length

  const visibleRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        `${r.title} ${r.student} ${r.id}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesFilter = filter === 'All' || r.status === filter

      const matchesPage =
        page !== 'History' ||
        r.status === 'Approved' ||
        r.status === 'Rejected'

      return matchesSearch && matchesFilter && matchesPage
    })
  }, [requests, search, filter, page])

 
async function updateStatus(id, status) {
  const { error } = await supabase
    .from('event_requests')
    .update({
      status,
    })
    .eq('id', id)

  if (error) {
    console.error('Failed to save final decision:', error)
    alert(`Could not save decision: ${error.message}`)
    return
  }

  setRequests((current) =>
    current.map((r) => (r.id === id ? { ...r, status } : r))
  )

  setSelected(null)
  setPage('Requests')
}


  const menuItems = ['Overview', 'Requests', 'History', 'Profile']

  return (
    <div className="ei-layout">
      <aside className="ei-sidebar">
        <div className="ei-brand">
          <span className="ei-brand-icon">C</span>
          <div>
            <strong>CampusConnect</strong>
            <small>Event Management</small>
          </div>
        </div>

        <p className="ei-menu-label">WORKSPACE</p>

        <nav className="ei-nav">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`ei-nav-item ${page === item ? 'active' : ''}`}
              onClick={() => {
                setPage(item)
                setSelected(null)
                setFilter('All')
              }}
            >
              <span>
                {{
                  Overview: '▦',
                  Requests: '▤',
                  History: '◷',
                  Profile: '♙',
                }[item]}
              </span>
              {item}
              {item === 'Requests' && pending > 0 && (
                <b className="ei-count">{pending}</b>
              )}
            </button>
          ))}
        </nav>

        <div className="ei-sidebar-bottom">
          <div className="ei-user-avatar">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="ei-user-info">
            <strong>{name}</strong>
            <small>Event In-Charge</small>
          </div>
          <button
            className="ei-logout"
            onClick={onLogout}
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </aside>

      <main className="ei-main">
        <header className="ei-topbar">
          <div>
            <p className="ei-eyebrow">CAMPUSCONNECT / WORKSPACE</p>
            <h1>{selected ? 'Review Event' : page}</h1>
          </div>
          <div className="ei-top-user">
            <span className="ei-status-dot" />
            {name}
          </div>
        </header>

        {selected ? (
          <section className="ei-detail-card">
            <button className="ei-back" onClick={() => setSelected(null)}>
              ← Back to requests
            </button>

            <div className="ei-detail-heading">
              <div>
                <span className="ei-request-id">{selected.id}</span>
                <h2>{selected.title}</h2>
                <p>Submitted by {selected.student}</p>
              </div>
              <span className={`ei-badge ${selected.status.toLowerCase()}`}>
                {selected.status}
              </span>
            </div>

            <div className="ei-detail-grid">
              <div><small>Department</small><strong>{selected.department}</strong></div>
              <div><small>Event date</small><strong>{selected.date}</strong></div>
              <div><small>Venue</small><strong>{selected.venue}</strong></div>
              <div><small>Expected attendees</small><strong>{selected.attendees}</strong></div>
            </div>

            <div className="ei-description">
              <h3>Event description</h3>
              <p>{selected.description}</p>
            </div>

            {selected.status === 'Pending' ? (
              <div className="ei-actions">
                <button
                  className="ei-reject"
                  onClick={() => updateStatus(selected.id, 'Rejected')}
                >
                  Reject Request
                </button>
                <button
                  className="ei-approve"
                  onClick={() => updateStatus(selected.id, 'Approved')}
                >
                  Approve Request
                </button>
              </div>
            ) : (
              <p className="ei-notice">
                This request has already been reviewed in this preview.
              </p>
            )}
          </section>
        ) : page === 'Overview' ? (
          <>
            <section className="ei-welcome">
              <div>
                <p>EVENT ADMINISTRATION</p>
                <h2>Welcome, {name}!</h2>
                <span>Review and manage campus event requests.</span>
              </div>
              <div className="ei-welcome-symbol">✦</div>
            </section>

            <section className="ei-stats">
              <Stat title="Total Requests" value={requests.length} note="All submitted events" />
              <Stat title="Pending Review" value={pending} note="Awaiting a decision" />
              <Stat title="Approved" value={approved} note="In this preview" />
              <Stat title="Rejected" value={rejected} note="In this preview" />
            </section>

            <section className="ei-panel">
              <div className="ei-panel-heading">
                <div>
                  <h2>Recent Event Requests</h2>
                  <p>Check requests that need your attention.</p>
                </div>
                <button className="ei-text-button" onClick={() => setPage('Requests')}>
                  View all →
                </button>
              </div>
              <RequestTable requests={requests} onSelect={setSelected} />
            </section>
          </>
        ) : page === 'Profile' ? (
          <section className="ei-panel ei-profile">
            <div className="ei-profile-avatar">{name.charAt(0).toUpperCase()}</div>
            <h2>{name}</h2>
            <p>Event In-Charge</p>
            <div className="ei-profile-row"><span>Account role</span><strong>Event In-Charge</strong></div>
            <div className="ei-profile-row"><span>Workspace</span><strong>CampusConnect</strong></div>
            <p className="ei-notice">Profile details will be connected to the backend later.</p>
          </section>
        ) : (
          <section className="ei-panel">
            <div className="ei-panel-heading">
              <div>
                <h2>{page === 'History' ? 'Reviewed Requests' : 'All Event Requests'}</h2>
                <p>Search for an event and select Review to see its details.</p>
              </div>
            </div>

            <div className="ei-filters">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search event, student or ID..."
              />
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option>All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <RequestTable requests={visibleRequests} onSelect={setSelected} />
            {visibleRequests.length === 0 && (
              <p className="ei-empty">No matching requests found.</p>
            )}
          </section>
        )}

        <footer className="ei-footer">
          CampusConnect · Event In-Charge Workspace · Frontend Preview
        </footer>
      </main>
    </div>
  )
}

function Stat({ title, value, note }) {
  return (
    <div className="ei-stat-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

function RequestTable({ requests, onSelect }) {
  return (
    <div className="ei-table-wrap">
      <table className="ei-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Submitted by</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td><strong>{r.title}</strong><small>{r.id}</small></td>
              <td>{r.student}</td>
              <td>{r.date}</td>
              <td><span className={`ei-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
              <td><button className="ei-review-button" onClick={() => onSelect(r)}>Review →</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
