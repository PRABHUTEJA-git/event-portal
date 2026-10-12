
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import './ProctorDashboard.css'

const demoRequests = [
  {
    id: 'REQ-1001',
    student: 'Aarav Sharma',
    studentId: 'STU-2024-101',
    department: 'Computer Science',
    year: '3rd Year',
    event: 'National Tech Hackathon',
    category: 'Hackathon',
    organizer: 'Tech Innovators',
    venue: 'Engineering College Auditorium',
    city: 'Vijayawada',
    startDate: '2026-11-14',
    endDate: '2026-11-15',
    purpose:
      'I want to participate to improve my problem-solving skills and collaborate with other developers.',
    status: 'Pending Review',
    recommendation: '',
    remarks: '',
  },
  {
    id: 'REQ-1002',
    student: 'Priya Reddy',
    studentId: 'STU-2024-108',
    department: 'Information Technology',
    year: '3rd Year',
    event: 'AI and Machine Learning Workshop',
    category: 'Workshop',
    organizer: 'FutureTech Academy',
    venue: 'Innovation Centre',
    city: 'Hyderabad',
    startDate: '2026-11-20',
    endDate: '2026-11-20',
    purpose:
      'The workshop covers practical machine learning applications related to my academic interests.',
    status: 'Pending Review',
    recommendation: '',
    remarks: '',
  },
  {
    id: 'REQ-1003',
    student: 'Rahul Kumar',
    studentId: 'STU-2024-115',
    department: 'Computer Science',
    year: '2nd Year',
    event: 'Cloud Computing Conference',
    category: 'Conference',
    organizer: 'Cloud Community',
    venue: 'Convention Centre',
    city: 'Bengaluru',
    startDate: '2026-12-04',
    endDate: '2026-12-05',
    purpose:
      'I would like to learn about current cloud platforms and industry practices.',
    status: 'Pending Review',
    recommendation: '',
    remarks: '',
  },
  {
    id: 'REQ-1004',
    student: 'Sneha Patel',
    studentId: 'STU-2024-121',
    department: 'Electronics',
    year: '3rd Year',
    event: 'Student Innovation Challenge',
    category: 'Technical Competition',
    organizer: 'Innovation Network',
    venue: 'Technology Park',
    city: 'Chennai',
    startDate: '2026-10-28',
    endDate: '2026-10-29',
    purpose:
      'Our team will present a prototype and receive feedback from technical mentors.',
    status: 'Recommended',
    recommendation: 'Recommend Approval',
    remarks: 'The event appears relevant to the student academic programme.',
  },
  {
    id: 'REQ-1005',
    student: 'Kiran Rao',
    studentId: 'STU-2024-130',
    department: 'Computer Science',
    year: '2nd Year',
    event: 'Web Development Bootcamp',
    category: 'Workshop',
    organizer: 'Developer Community',
    venue: 'Learning Hub',
    city: 'Vijayawada',
    startDate: '2026-11-09',
    endDate: '2026-11-10',
    purpose:
      'I would like to strengthen my frontend development and teamwork skills.',
    status: 'Needs Correction',
    recommendation: '',
    remarks: 'Please provide the event registration link and complete venue details.',
  },
]

const filters = [
  'All Requests',
  'Pending Review',
  'Recommended',
  'Needs Correction',
]

function ProctorDashboard({ name = 'Proctor', onLogout }) {
  const [requests, setRequests] = useState([])
  const [activePage, setActivePage] = useState('overview')
  const [activeFilter, setActiveFilter] = useState('All Requests')
  const [search, setSearch] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  
useEffect(() => {
  async function loadRequests() {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading requests:', error)
      setActionError('Could not load student requests.')
      return
    }

    const mappedRequests = (data || []).map((row) => ({
      id: row.id,
      referenceNo: row.reference_no,
      student: row.student_id,
      studentId: row.student_id,
      department: '—',
      year: '—',
      event: row.event_title,
      category: row.category,
      organizer: row.organizer,
      venue: row.venue,
      city: row.city,
      startDate: row.start_date,
      endDate: row.end_date,
      purpose: row.purpose,
      status:
        row.status === 'Submitted'
          ? 'Pending Review'
          : row.status,
      recommendation: '',
      remarks: '',
    }))

    setRequests(mappedRequests)
  }

  loadRequests()
}, [])


  const displayName = name.includes('@')
    ? name.split('@')[0]
    : name

  const greetingName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1)

  const pendingCount = requests.filter(
    (request) => request.status === 'Pending Review'
  ).length

  const recommendedCount = requests.filter(
    (request) => request.status === 'Recommended'
  ).length

  const correctionCount = requests.filter(
    (request) => request.status === 'Needs Correction'
  ).length

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = [
        request.student,
        request.studentId,
        request.event,
        request.category,
        request.department,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesFilter =
        activeFilter === 'All Requests' ||
        request.status === activeFilter

      return matchesSearch && matchesFilter
    })
  }, [requests, search, activeFilter])

  function navigate(page) {
    setActivePage(page)
    setMobileMenu(false)
    setNotice('')
    setSelectedRequest(null)
    setActionError('')
  }

  function openReview(request) {
    setSelectedRequest(request)
    setRemarks(request.remarks || '')
    setActionError('')
    setNotice('')
  }

  
async function updateRequest(status, recommendation, successMessage) {
  if (!selectedRequest) return

  if (!remarks.trim()) {
    setActionError('Please enter remarks before submitting your review.')
    return
  }

  setActionError('')
  setNotice('')

  const databaseStatus =
    status === 'Recommended'
      ? 'Recommended for Approval'
      : 'Returned for Correction'

  const { data, error } = await supabase
    .from('event_requests')
    .update({
      status: databaseStatus,
recommendation: recommendation || null,
remarks: remarks.trim(),
reviewed_by: (await supabase.auth.getUser()).data.user?.id ?? null,
reviewed_at: new Date().toISOString(),
    })
    .eq('id', selectedRequest.id)
    .select()
    .single()

  if (error) {
    console.error('Failed to save proctor review:', error)
    setActionError(`Could not save review: ${error.message}`)
    return
  }

  setRequests((previous) =>
    previous.map((request) =>
      request.id === selectedRequest.id
        ? {
            ...request,
            status,
            recommendation: data.recommendation || '',
            remarks: data.remarks || '',
          }
        : request
    )
  )

  setSelectedRequest(null)
  setRemarks('')
  setActionError('')
  setNotice(`${successMessage} Review saved successfully!`)
}


  function statusClass(status) {
    if (status === 'Recommended') return 'pd-status-approved'
    if (status === 'Needs Correction') return 'pd-status-correction'
    return 'pd-status-pending'
  }

  function formatDate(value) {
    if (!value) return 'Not provided'

    return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function renderRequestList() {
    return (
      <>
        <div className="pd-toolbar">
          <label className="pd-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search students, IDs or events..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search student requests"
            />
          </label>

          <select
            className="pd-filter"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            aria-label="Filter requests"
          >
            {filters.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="pd-empty">
            <div className="pd-empty-icon">⌕</div>
            <h3>No matching requests</h3>
            <p>Try a different search term or filter.</p>
          </div>
        ) : (
          <div className="pd-request-list">
            {filteredRequests.map((request) => (
              <article className="pd-request-card" key={request.id}>
                <div className="pd-event-icon">✦</div>

                <div className="pd-request-info">
                  <span className="pd-eyebrow">{request.category}</span>
                  <h3>{request.event}</h3>
                  <p>
                    {request.student} · {request.studentId}
                  </p>
                  <small>
                    {formatDate(request.startDate)} –{' '}
                    {formatDate(request.endDate)}
                  </small>
                </div>

                <div className="pd-request-actions">
                  <span className={`pd-status ${statusClass(request.status)}`}>
                    {request.status}
                  </span>
                  <button
                    type="button"
                    className="pd-secondary"
                    onClick={() => openReview(request)}
                  >
                    Review details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </>
    )
  }

  function renderReview() {
    if (!selectedRequest) return null

    const request = selectedRequest

    return (
      <section className="pd-panel pd-review-panel">
        <div className="pd-panel-heading">
          <div>
            <span className="pd-eyebrow">REQUEST REVIEW</span>
            <h2>{request.event}</h2>
            <p>Reference: {request.id}</p>
          </div>

          <button
            className="pd-secondary"
            type="button"
            onClick={() => setSelectedRequest(null)}
          >
            ← Back
          </button>
        </div>

        <div className="pd-student-banner">
          <div className="pd-student-avatar">
            {request.student.charAt(0)}
          </div>
          <div>
            <strong>{request.student}</strong>
            <p>{request.studentId}</p>
            <small>
              {request.department} · {request.year}
            </small>
          </div>
        </div>

        <div className="pd-detail-grid">
          <div>
            <span>Event category</span>
            <strong>{request.category}</strong>
          </div>
          <div>
            <span>Organizer</span>
            <strong>{request.organizer}</strong>
          </div>
          <div>
            <span>Venue</span>
            <strong>{request.venue}</strong>
          </div>
          <div>
            <span>City</span>
            <strong>{request.city}</strong>
          </div>
          <div>
            <span>Start date</span>
            <strong>{formatDate(request.startDate)}</strong>
          </div>
          <div>
            <span>End date</span>
            <strong>{formatDate(request.endDate)}</strong>
          </div>
        </div>

        <div className="pd-purpose">
          <h3>Student's purpose</h3>
          <p>{request.purpose}</p>
        </div>

        <div className="pd-current-status">
          <span>Current review status</span>
          <span className={`pd-status ${statusClass(request.status)}`}>
            {request.status}
          </span>
        </div>

        <form
          className="pd-review-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="proctor-remarks">
            Review remarks *
          </label>
          <textarea
            id="proctor-remarks"
            rows={4}
            maxLength={1500}
            minLength={3}
            placeholder="Enter your review, recommendation, or requested corrections..."
            value={remarks}
            onChange={(event) => {
              setRemarks(event.target.value)
              setActionError('')
            }}
            required
          />

          {actionError && (
            <p className="pd-error" role="alert">
              {actionError}
            </p>
          )}

          <div className="pd-review-actions">
            <button
              className="pd-action-button pd-correction-button"
              type="button"
              onClick={() =>
                updateRequest(
                  'Needs Correction',
                  '',
                  'Correction request recorded.'
                )
              }
            >
              Request correction
            </button>

            <button
              className="pd-action-button pd-recommend-button"
              type="button"
              onClick={() =>
                updateRequest(
                  'Recommended',
                  'Recommend Approval',
                  'Approval recommendation recorded.'
                )
              }
            >
              ✓ Recommend approval
            </button>
          </div>

          <p className="pd-review-note">
            A recommendation is not a final approval. The Event
            In-Charge makes the final decision.
          </p>
        </form>
      </section>
    )
  }

  return (
    <main className="pd-app">
      <aside className={`pd-sidebar ${mobileMenu ? 'pd-sidebar-open' : ''}`}>
        <a
          href="#proctor"
          className="pd-brand"
          onClick={(event) => {
            event.preventDefault()
            navigate('overview')
          }}
        >
          <span className="pd-brand-icon">C</span>
          <span>
            Campus<span>Connect</span>
          </span>
        </a>

        <div className="pd-workspace">
          <span className="pd-workspace-dot" />
          PROCTOR WORKSPACE
        </div>

        <span className="pd-nav-label">FACULTY TOOLS</span>

        <nav className="pd-navigation" aria-label="Proctor navigation">
          <button
            type="button"
            className={`pd-nav-item ${
              activePage === 'overview' ? 'pd-nav-active' : ''
            }`}
            onClick={() => navigate('overview')}
          >
            <span>⌂</span> Overview
          </button>

          <button
            type="button"
            className={`pd-nav-item ${
              activePage === 'requests' ? 'pd-nav-active' : ''
            }`}
            onClick={() => navigate('requests')}
          >
            <span>▤</span> Assigned requests
          </button>

          <button
            type="button"
            className={`pd-nav-item ${
              activePage === 'history' ? 'pd-nav-active' : ''
            }`}
            onClick={() => navigate('history')}
          >
            <span>◷</span> Review history
          </button>

          <button
            type="button"
            className={`pd-nav-item ${
              activePage === 'profile' ? 'pd-nav-active' : ''
            }`}
            onClick={() => navigate('profile')}
          >
            <span>○</span> My profile
          </button>
        </nav>

        <div className="pd-sidebar-bottom">
          <div className="pd-help-card">
            <span className="pd-help-icon">✦</span>
            <strong>Review responsibly</strong>
            <p>Record clear remarks to help students understand your recommendations.</p>
          </div>

          <button
            type="button"
            className="pd-logout"
            onClick={onLogout}
          >
            <span>↪</span> Sign out
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="pd-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <section className="pd-main">
        <header className="pd-topbar">
          <button
            type="button"
            className="pd-menu-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div className="pd-breadcrumb">
            Faculty tools <span>/</span>{' '}
            {activePage === 'overview'
              ? 'Overview'
              : activePage === 'requests'
                ? 'Assigned requests'
                : activePage === 'history'
                  ? 'Review history'
                  : 'My profile'}
          </div>

          <div className="pd-topbar-user">
            <div>
              <strong>{greetingName}</strong>
              <span>Proctor</span>
            </div>
            <div className="pd-avatar">
              {greetingName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="pd-content">
          {notice && (
            <div className="pd-notice" role="status">
              {notice}
              <button
                type="button"
                onClick={() => setNotice('')}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {activePage === 'overview' && !selectedRequest && (
            <>
              <section className="pd-welcome">
                <div>
                  <span className="pd-eyebrow">FACULTY REVIEW CENTRE</span>
                  <h1>
                    Review. Recommend.
                    <br />
                    <span>Support students.</span>
                  </h1>
                  <p>
                    Review assigned event applications and provide
                    clear recommendations to the Event In-Charge.
                  </p>
                </div>

                <button
                  className="pd-primary"
                  type="button"
                  onClick={() => navigate('requests')}
                >
                  Review requests →
                </button>
              </section>

              <section className="pd-stats">
                <article className="pd-stat-card">
                  <div className="pd-stat-top">
                    <span>Assigned requests</span>
                    <span className="pd-stat-icon pd-purple">▤</span>
                  </div>
                  <strong>{requests.length}</strong>
                  <small>In this sample workspace</small>
                </article>

                <article className="pd-stat-card">
                  <div className="pd-stat-top">
                    <span>Awaiting review</span>
                    <span className="pd-stat-icon pd-orange">◷</span>
                  </div>
                  <strong>{pendingCount}</strong>
                  <small>Require your attention</small>
                </article>

                <article className="pd-stat-card">
                  <div className="pd-stat-top">
                    <span>Recommended</span>
                    <span className="pd-stat-icon pd-green">✓</span>
                  </div>
                  <strong>{recommendedCount}</strong>
                  <small>Recommendation recorded</small>
                </article>

                <article className="pd-stat-card">
                  <div className="pd-stat-top">
                    <span>Needs correction</span>
                    <span className="pd-stat-icon pd-red">!</span>
                  </div>
                  <strong>{correctionCount}</strong>
                  <small>Student details need updates</small>
                </article>
              </section>

              <section className="pd-panel">
                <div className="pd-panel-heading">
                  <div>
                    <h2>Requests requiring attention</h2>
                    <p>Open an application to review its details.</p>
                  </div>
                  <button
                    className="pd-text-button"
                    type="button"
                    onClick={() => navigate('requests')}
                  >
                    View all →
                  </button>
                </div>

                {renderRequestList()}
              </section>
            </>
          )}

          {activePage === 'requests' && !selectedRequest && (
            <>
              <section className="pd-page-heading">
                <div>
                  <span className="pd-eyebrow">STUDENT APPLICATIONS</span>
                  <h1>Assigned requests</h1>
                  <p>
                    Review event details and record your recommendations.
                  </p>
                </div>
              </section>

              <section className="pd-panel">
                <div className="pd-panel-heading">
                  <div>
                    <h2>Request queue</h2>
                    <p>{filteredRequests.length} matching request(s)</p>
                  </div>
                </div>
                {renderRequestList()}
              </section>
            </>
          )}

          {selectedRequest && renderReview()}

          {activePage === 'history' && !selectedRequest && (
            <>
              <section className="pd-page-heading">
                <div>
                  <span className="pd-eyebrow">PREVIOUS REVIEWS</span>
                  <h1>Review history</h1>
                  <p>See recommendations and correction requests recorded in this preview.</p>
                </div>
              </section>

              <section className="pd-panel">
                <div className="pd-panel-heading">
                  <div>
                    <h2>Reviewed applications</h2>
                    <p>Only requests with a recorded review are shown.</p>
                  </div>
                </div>

                {requests.filter(
                  (request) =>
                    request.status === 'Recommended' ||
                    request.status === 'Needs Correction'
                ).length === 0 ? (
                  <div className="pd-empty">
                    <div className="pd-empty-icon">◷</div>
                    <h3>No reviews yet</h3>
                    <p>Your recorded reviews will appear here.</p>
                  </div>
                ) : (
                  <div className="pd-request-list">
                    {requests
                      .filter(
                        (request) =>
                          request.status === 'Recommended' ||
                          request.status === 'Needs Correction'
                      )
                      .map((request) => (
                        <article className="pd-history-card" key={request.id}>
                          <div>
                            <h3>{request.event}</h3>
                            <p>{request.student} · {request.id}</p>
                            <small>{request.remarks}</small>
                          </div>
                          <span className={`pd-status ${statusClass(request.status)}`}>
                            {request.status}
                          </span>
                        </article>
                      ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activePage === 'profile' && !selectedRequest && (
            <>
              <section className="pd-page-heading">
                <div>
                  <span className="pd-eyebrow">ACCOUNT INFORMATION</span>
                  <h1>My profile</h1>
                  <p>Your proctor workspace information.</p>
                </div>
              </section>

              <section className="pd-panel pd-profile-panel">
                <div className="pd-profile-avatar">
                  {greetingName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{greetingName}</h2>
                  <p>Proctor account</p>
                  <span className="pd-profile-role">
                    Faculty reviewer
                  </span>
                </div>
                <p className="pd-profile-note">
                  This is a preview profile. Official faculty details
                  and assigned student lists will be loaded from the
                  backend in the integration phase.
                </p>
              </section>
            </>
          )}

          <footer className="pd-footer">
            <span>© CampusConnect</span>
            <span>Proctor workspace · Frontend preview</span>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default ProctorDashboard
