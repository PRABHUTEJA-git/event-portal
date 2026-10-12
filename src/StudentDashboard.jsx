
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import './StudentDashboard.css'

const initialRequests = []

const navigation = [
  { id: 'overview', label: 'Overview', icon: '⌂' },
  { id: 'requests', label: 'My Requests', icon: '▤' },
  { id: 'attendance', label: 'Attendance', icon: '◷' },
  { id: 'profile', label: 'My Profile', icon: '○' },
]

const categories = [
  'Hackathon',
  'Workshop',
  'Conference',
  'Technical Competition',
  'Industrial Visit',
  'Other',
]

function StudentDashboard({ userId, name, onLogout }) {
  const [activePage, setActivePage] = useState('overview')
  const [requests, setRequests] = useState(initialRequests)
  
useEffect(() => {
  async function loadRequests() {
    if (!userId) return

    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      console.log('Student request load:', { userId, data, error })

    if (error) {
      console.error('Error loading requests:', error)
      setError('Could not load your saved requests.')
      return
    }

    setRequests(data || [])
  }

  loadRequests()
}, [userId])

  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  const [form, setForm] = useState({
    event_title: '',
    organizer: '',
    category: 'Hackathon',
    venue: '',
    city: '',
    start_date: '',
    end_date: '',
    event_url: '',
    purpose: '',
  })

  const displayName = name?.includes('@')
    ? name.split('@')[0]
    : name || 'Student'

  const greetingName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1)

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = [
        request.event_title,
        request.organizer,
        request.category,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' || request.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [requests, search, statusFilter])

  const approved = requests.filter(
    (item) => item.status === 'Approved'
  ).length

  const pending = requests.filter(
    (item) =>
      !['Approved', 'Rejected', 'Withdrawn'].includes(item.status)
  ).length

  const rejected = requests.filter(
    (item) => item.status === 'Rejected'
  ).length

  function navigate(page) {
    setActivePage(page)
    setMobileMenu(false)
    setNotice('')
    setError('')
  }

  function updateField(event) {
    const { name: fieldName, value } = event.target

    setForm((previous) => ({
      ...previous,
      [fieldName]: value,
    }))
  }

  function openRequestForm() {
    setForm({
      event_title: '',
      organizer: '',
      category: 'Hackathon',
      venue: '',
      city: '',
      start_date: '',
      end_date: '',
      event_url: '',
      purpose: '',
    })

    setError('')
    setNotice('')
    setShowForm(true)
  }

  
async function submitRequest(event) {
  event.preventDefault()
  setError('')
  setNotice('')

  if (!userId) {
    setError('Please log in again before submitting.')
    return
  }

  if (form.end_date < form.start_date) {
    setError('The event end date cannot be before the start date.')
    return
  }

  if (
    form.event_url &&
    !/^https?:\/\/\S+$/i.test(form.event_url)
  ) {
    setError('Enter a valid URL beginning with http:// or https://.')
    return
  }

  const referenceNo = `CC-${Date.now()}`

  const { data, error: insertError } = await supabase
    .from('event_requests')
    .insert({
      reference_no: referenceNo,
      student_id: userId,
      event_title: form.event_title,
      organizer: form.organizer,
      category: form.category,
      venue: form.venue,
      city: form.city,
      start_date: form.start_date,
      end_date: form.end_date,
      event_url: form.event_url || null,
      purpose: form.purpose,
      status: 'Submitted',
    })
    .select()
    .single()

  if (insertError) {
    console.error('Request submission failed:', insertError)
    setError(`Could not save request: ${insertError.message}`)
    return
  }

  setRequests((previous) => [data, ...previous])
  setShowForm(false)
  setActivePage('requests')
  setSearch('')
  setStatusFilter('All')
  setNotice(`Request ${data.reference_no} submitted successfully!`)
}


  function renderRequests() {
    return (
      <>
        <div className="sd-toolbar">
          <div className="sd-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search event requests..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search event requests"
            />
          </div>

          <select
            className="sd-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter requests by status"
          >
            <option value="All">All statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Proctor Review">Under review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="sd-empty">
            <div className="sd-empty-icon">▤</div>
            <h3>
              {requests.length === 0
                ? 'No event requests yet'
                : 'No matching requests'}
            </h3>
            <p>
              {requests.length === 0
                ? 'Your event applications will appear here once you create them.'
                : 'Try another search term or status filter.'}
            </p>

            {requests.length === 0 && (
              <button
                className="sd-primary"
                type="button"
                onClick={openRequestForm}
              >
                + Create your first request
              </button>
            )}
          </div>
        ) : (
          <div className="sd-request-list">
            {filteredRequests.map((request) => (
              <article className="sd-request-card" key={request.id}>
                <div className="sd-request-symbol">✦</div>

                <div className="sd-request-info">
                  <span className="sd-eyebrow">
                    {request.category}
                  </span>
                  <h3>{request.event_title}</h3>
                  <p>
                    {request.organizer} · {request.city}
                  </p>
                  <small>
                    {request.start_date} — {request.end_date}
                  </small>
                </div>

                <span
                  className={`sd-status sd-status-${request.status
                    .toLowerCase()
                    .replaceAll(' ', '-')}`}
                >
                  {request.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </>
    )
  }

  function renderForm() {
    return (
      <section className="sd-panel">
        <div className="sd-panel-heading">
          <div>
            <span className="sd-eyebrow">EVENT APPLICATION</span>
            <h2>Request event permission</h2>
            <p>Enter the details of the event you want to attend.</p>
          </div>

          <button
            className="sd-secondary"
            type="button"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>

        <form className="sd-form" onSubmit={submitRequest}>
          <label>
            Event name *
            <input
              name="event_title"
              value={form.event_title}
              onChange={updateField}
              placeholder="e.g. National Tech Hackathon"
              maxLength={150}
              required
            />
          </label>

          <label>
            Organizer *
            <input
              name="organizer"
              value={form.organizer}
              onChange={updateField}
              placeholder="College or organization"
              maxLength={150}
              required
            />
          </label>

          <label>
            Event category *
            <select
              name="category"
              value={form.category}
              onChange={updateField}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Venue *
            <input
              name="venue"
              value={form.venue}
              onChange={updateField}
              placeholder="Event venue"
              maxLength={200}
              required
            />
          </label>

          <label>
            City *
            <input
              name="city"
              value={form.city}
              onChange={updateField}
              placeholder="City"
              maxLength={100}
              required
            />
          </label>

          <label>
            Start date *
            <input
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={updateField}
              required
            />
          </label>

          <label>
            End date *
            <input
              name="end_date"
              type="date"
              min={form.start_date || undefined}
              value={form.end_date}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Event website
            <input
              name="event_url"
              type="url"
              value={form.event_url}
              onChange={updateField}
              placeholder="https://example.com"
            />
          </label>

          <label className="sd-full">
            Why do you want to attend? *
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={updateField}
              placeholder="Describe the learning benefits and relevance to your studies..."
              minLength={10}
              maxLength={2000}
              rows={5}
              required
            />
          </label>

          {error && (
            <p className="sd-alert sd-alert-error sd-full" role="alert">
              {error}
            </p>
          )}

          <div className="sd-form-footer sd-full">
            <p>
              This is a frontend preview. The request will not be
              permanently saved yet.
            </p>

            <button className="sd-primary" type="submit">
              Submit preview request →
            </button>
          </div>
        </form>
      </section>
    )
  }

  return (
    <main className="sd-app">
      <aside className={`sd-sidebar ${mobileMenu ? 'sd-sidebar-open' : ''}`}>
        <a
          href="#dashboard"
          className="sd-brand"
          onClick={(event) => {
            event.preventDefault()
            navigate('overview')
          }}
        >
          <span className="sd-brand-icon">C</span>
          <span>
            Campus<span>Connect</span>
          </span>
        </a>

        <div className="sd-workspace">
          <span className="sd-workspace-dot" />
          STUDENT WORKSPACE
        </div>

        <span className="sd-nav-label">WORKSPACE</span>

        <nav className="sd-navigation" aria-label="Student navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sd-nav-item ${
                activePage === item.id ? 'sd-nav-active' : ''
              }`}
              onClick={() => navigate(item.id)}
            >
              <span className="sd-nav-icon">{item.icon}</span>
              {item.label}
              {activePage === item.id && (
                <span className="sd-nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-bottom">
          <div className="sd-help-card">
            <span className="sd-help-icon">✦</span>
            <strong>Need assistance?</strong>
            <p>Contact your college administrator for help with event approvals.</p>
          </div>

          <button
            type="button"
            className="sd-logout"
            onClick={onLogout}
          >
            <span>↪</span> Sign out
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          type="button"
          className="sd-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <section className="sd-main">
        <header className="sd-topbar">
          <button
            type="button"
            className="sd-menu-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div className="sd-breadcrumb">
            Workspace <span>/</span>{' '}
            {navigation.find((item) => item.id === activePage)?.label ||
              'Overview'}
          </div>

          <div className="sd-topbar-user">
            <div className="sd-user-details">
              <strong>{greetingName}</strong>
              <span>Student</span>
            </div>
            <div className="sd-avatar">
              {greetingName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="sd-content">
          {notice && (
            <div className="sd-alert sd-alert-success" role="status">
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

          {activePage === 'overview' && !showForm && (
            <>
              <section className="sd-welcome">
                <div>
                  <span className="sd-eyebrow">
                    YOUR CAMPUS, YOUR OPPORTUNITIES
                  </span>
                  <h1>
                    Your campus journey,
                    <br />
                    <span>all in one place.</span>
                  </h1>
                  <p>
                    Track event requests, monitor approvals, and
                    manage your participation.
                  </p>
                </div>

                <button
                  className="sd-primary"
                  type="button"
                  onClick={openRequestForm}
                >
                  + New event request
                </button>
              </section>

              <section className="sd-stats">
                <article className="sd-stat-card">
                  <div className="sd-stat-top">
                    <span>Total requests</span>
                    <span className="sd-stat-icon sd-purple">▤</span>
                  </div>
                  <strong>{requests.length}</strong>
                  <small>All submitted requests</small>
                </article>

                <article className="sd-stat-card">
                  <div className="sd-stat-top">
                    <span>Awaiting decision</span>
                    <span className="sd-stat-icon sd-orange">◷</span>
                  </div>
                  <strong>{pending}</strong>
                  <small>Not yet finalized</small>
                </article>

                <article className="sd-stat-card">
                  <div className="sd-stat-top">
                    <span>Approved</span>
                    <span className="sd-stat-icon sd-green">✓</span>
                  </div>
                  <strong>{approved}</strong>
                  <small>Approved requests</small>
                </article>

                <article className="sd-stat-card">
                  <div className="sd-stat-top">
                    <span>Rejected</span>
                    <span className="sd-stat-icon sd-red">×</span>
                  </div>
                  <strong>{rejected}</strong>
                  <small>Rejected requests</small>
                </article>
              </section>

              <section className="sd-attendance-card">
                <div className="sd-attendance-symbol">◷</div>
                <div className="sd-attendance-info">
                  <span className="sd-eyebrow">ATTENDANCE OVERVIEW</span>
                  <h2>Your attendance at a glance</h2>
                  <p>
                    Your verified attendance percentage will appear
                    here when attendance data is connected.
                  </p>
                </div>
                <span className="sd-unavailable">Not connected</span>
              </section>

              <section className="sd-panel">
                <div className="sd-panel-heading">
                  <div>
                    <h2>Recent event requests</h2>
                    <p>Review the latest activity in your applications.</p>
                  </div>

                  <button
                    className="sd-text-button"
                    type="button"
                    onClick={() => navigate('requests')}
                  >
                    View all →
                  </button>
                </div>

                {requests.length === 0 ? (
                  <div className="sd-empty sd-empty-compact">
                    <div className="sd-empty-icon">✦</div>
                    <h3>Your next opportunity starts here</h3>
                    <p>
                      You haven't created a request in this preview yet.
                    </p>
                    <button
                      className="sd-secondary"
                      type="button"
                      onClick={openRequestForm}
                    >
                      Create your first request
                    </button>
                  </div>
                ) : (
                  renderRequests()
                )}
              </section>
            </>
          )}

          {activePage === 'requests' && !showForm && (
            <>
              <section className="sd-page-heading">
                <div>
                  <span className="sd-eyebrow">EVENT MANAGEMENT</span>
                  <h1>My event requests</h1>
                  <p>Track your applications and review their statuses.</p>
                </div>

                <button
                  className="sd-primary"
                  type="button"
                  onClick={openRequestForm}
                >
                  + New request
                </button>
              </section>

              <section className="sd-panel">
                <div className="sd-panel-heading">
                  <div>
                    <h2>All requests</h2>
                    <p>{requests.length} request(s) in this preview.</p>
                  </div>
                </div>

                {renderRequests()}
              </section>
            </>
          )}

          {showForm && (
            <section className="sd-page-heading sd-form-page-heading">
              <div>
                <span className="sd-eyebrow">STUDENT APPLICATION</span>
                <h1>New event request</h1>
                <p>Complete the form to prepare your event application.</p>
              </div>
            </section>
          )}

          {showForm && renderForm()}

          {activePage === 'attendance' && (
            <>
              <section className="sd-page-heading">
                <div>
                  <span className="sd-eyebrow">ATTENDANCE RECORDS</span>
                  <h1>My attendance</h1>
                  <p>Review your verified attendance information.</p>
                </div>
              </section>

              <section className="sd-panel sd-attendance-page">
                <div className="sd-empty-icon">◷</div>
                <h2>Attendance data isn't connected yet</h2>
                <p>
                  Your attendance records and eligibility information
                  will be displayed here once the college attendance
                  data source is integrated.
                </p>
                <span className="sd-unavailable">Awaiting data integration</span>
              </section>
            </>
          )}

          {activePage === 'profile' && (
            <>
              <section className="sd-page-heading">
                <div>
                  <span className="sd-eyebrow">ACCOUNT SETTINGS</span>
                  <h1>My profile</h1>
                  <p>View your current account information.</p>
                </div>
              </section>

              <section className="sd-panel sd-profile-panel">
                <div className="sd-profile-avatar">
                  {greetingName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2>{greetingName}</h2>
                  <p>{name}</p>
                  <span className="sd-profile-role">Student account</span>
                </div>

                <div className="sd-profile-detail">
                  <span>Account ID</span>
                  <strong>{userId || 'Not available'}</strong>
                </div>

                <p className="sd-profile-note">
                  Account details are displayed for reference. Profile
                  editing will be added in a later step.
                </p>
              </section>
            </>
          )}

          <footer className="sd-footer">
            <span>© CampusConnect</span>
            <span>Student workspace · Frontend preview</span>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default StudentDashboard
