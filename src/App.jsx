import { useState } from 'react'
import Login from './Login'
import './App.css'
function App() {
    const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return <Login onBack={() => setShowLogin(false)} />
  }
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">C</span>
          <span>Campus<span className="brand-accent">Connect</span></span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#roles">User Roles</a>
          <a href="#workflow">How It Works</a>
        </nav>

        <a
  className="nav-link"
  href="#login"
  onClick={(event) => {
    event.preventDefault()
    setShowLogin(true)
  }}
>
  Explore Portal ↗
</a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot"></span>
              SMART CAMPUS MANAGEMENT
            </div>

            <h1>
              Your next big
              <br />
              opportunity starts
              <br />
              <span>with permission.</span>
            </h1>

            <p>
              One simple platform to manage technical event requests,
              verify student attendance, and make approval decisions
              transparent.
            </p>

            <div className="hero-actions">
              <a
  className="primary-btn"
  href="#login"
  onClick={(event) => {
    event.preventDefault()
    setShowLogin(true)
  }}
>
  Explore the Portal <span>→</span>
</a>
              <a className="secondary-btn" href="#workflow">
                See How It Works
              </a>
            </div>

            <div className="hero-note">
              <span>✓</span> Student requests
              <span>✓</span> Attendance verification
              <span>✓</span> Transparent approvals
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow"></div>

            <div className="preview-card">
              <div className="preview-heading">
                <div>
                  <span className="preview-label">PORTAL OVERVIEW</span>
                  <h3>Event Activity</h3>
                </div>
                <span className="preview-icon">✦</span>
              </div>

              <div className="preview-stat">
                <div>
                  <span className="muted-text">Approval workflow</span>
                  <h2>One clear process.</h2>
                </div>
                <span className="preview-check">✓</span>
              </div>

              <div className="preview-line">
                <div className="line-icon student-icon">01</div>
                <div className="line-text">
                  <strong>Student request</strong>
                  <span>Submit event details</span>
                </div>
                <span className="line-arrow">→</span>
              </div>

              <div className="preview-line">
                <div className="line-icon proctor-icon">02</div>
                <div className="line-text">
                  <strong>Proctor review</strong>
                  <span>Check and recommend</span>
                </div>
                <span className="line-arrow">→</span>
              </div>

              <div className="preview-line">
                <div className="line-icon admin-icon">03</div>
                <div className="line-text">
                  <strong>Final decision</strong>
                  <span>Approve or reject</span>
                </div>
                <span className="decision-tag">FINAL</span>
              </div>

              <div className="preview-footer">
                <span className="footer-dot"></span>
                Designed for transparent decisions
              </div>
            </div>

            <div className="floating-note">
              <span className="floating-icon">✓</span>
              <div>
                <strong>Attendance-aware</strong>
                <span>Eligibility verification</span>
              </div>
            </div>
          </div>
        </section>

        <section className="roles-section" id="roles">
          <div className="section-heading">
            <span className="section-label">BUILT FOR YOUR CAMPUS</span>
            <h2>Three roles. One connected system.</h2>
            <p>
              Every person has a clear responsibility in the event approval
              process.
            </p>
          </div>

          <div className="role-grid">
            <article className="role-card student-card">
              <div className="role-icon">01</div>
              <span className="role-kicker">FOR STUDENTS</span>
              <h3>Request & Track</h3>
              <p>
                Apply to attend hackathons, workshops, conferences, and
                technical competitions. Track every decision in one place.
              </p>
              <div className="role-bottom">
                <span>Event applications</span>
                <span>→</span>
              </div>
            </article>

            <article className="role-card proctor-card">
              <div className="role-icon">02</div>
              <span className="role-kicker">FOR PROCTORS</span>
              <h3>Review & Recommend</h3>
              <p>
                Check assigned students' attendance, examine event details,
                and record a recommendation with remarks.
              </p>
              <div className="role-bottom">
                <span>Student-level review</span>
                <span>→</span>
              </div>
            </article>

            <article className="role-card admin-card">
              <div className="role-icon">03</div>
              <span className="role-kicker">FOR EVENT IN-CHARGE</span>
              <h3>Verify & Decide</h3>
              <p>
                Import attendance data, configure eligibility rules, and
                make the final approval decision.
              </p>
              <div className="role-bottom">
                <span>Final authority</span>
                <span>→</span>
              </div>
            </article>
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div>
            <span className="section-label">SIMPLE. TRACEABLE. FAIR.</span>
            <h2>From application to decision.</h2>
            <p>
              Each request follows a clear process, with a recorded status
              and a responsible reviewer at every stage.
            </p>
          </div>

          <div className="workflow-steps">
            <div><span>01</span> Submit request</div>
            <span className="step-arrow">→</span>
            <div><span>02</span> Verify attendance</div>
            <span className="step-arrow">→</span>
            <div><span>03</span> Proctor review</div>
            <span className="step-arrow">→</span>
            <div><span>04</span> Final decision</div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">C</span>
          <span>Campus<span className="brand-accent">Connect</span></span>
        </a>
        <p>Technical Event Participation Approval Portal</p>
        <a href="#home">Back to top ↑</a>
      </footer>
    </div>
  )
}

export default App