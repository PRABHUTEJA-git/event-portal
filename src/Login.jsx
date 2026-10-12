
import { useState } from 'react'
import { supabase } from './lib/supabase'
import StudentDashboard from './StudentDashboard'
import './Login.css'
import ProctorDashboard from './ProctorDashboard'
import EventInChargeDashboard from './EventInChargeDashboard'
const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Submit event requests and track approvals',
    icon: '🎓',
  },
  {
    id: 'proctor',
    title: 'Proctor',
    description: 'Review requests from assigned students',
    icon: '📋',
  },
  {
    id: 'incharge',
    title: 'Event In-Charge',
    description: 'Manage attendance and final decisions',
    icon: '🛡️',
  },
]

function Login({ onBack }) {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signedIn, setSignedIn] = useState(null)

  const selectedRole = roles.find((item) => item.id === role)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    setSignedIn(null)

    let authenticatedUser = null

    try {
      // Authenticate the user with Supabase
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (authError) {
        throw authError
      }

      authenticatedUser = data.user

      if (!authenticatedUser) {
        throw new Error('Unable to verify your account. Please sign in again.')
      }

      // Retrieve the trusted role from the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', authenticatedUser.id)
        .single()

      if (profileError || !profile) {
        throw new Error(
          'Your user profile could not be loaded. Please contact the administrator.'
        )
      }

      const validRoles = ['student', 'proctor', 'incharge']

      if (!validRoles.includes(profile.role)) {
        throw new Error(
          'Your account has an invalid role. Please contact the administrator.'
        )
      }

      // The selected role must match the database role
      if (profile.role !== role) {
        throw new Error(
          `Your account is registered as ${profile.role}. Please select the matching role.`
        )
      }

      // Save the verified user and role
      setSignedIn({
        id: authenticatedUser.id,
        name: profile.full_name || authenticatedUser.email,
        role: profile.role,
      })
    } catch (err) {
      // If sign-in occurred but verification failed, sign out
      if (authenticatedUser) {
        await supabase.auth.signOut()
      }

      setError(err.message || 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setError('')

    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      setError(logoutError.message)
      return
    }

    setSignedIn(null)
    setPassword('')
  }

  
  // Show the Student Dashboard after successful student login
  if (signedIn?.role === 'student') {
    return (
      <StudentDashboard
        userId={signedIn.id}
        name={signedIn.name}
        onLogout={handleLogout}
      />
    )
  }

  // Show the Proctor Dashboard
  if (signedIn?.role === 'proctor') {
    return (
      <ProctorDashboard
        name={signedIn.name}
        onLogout={handleLogout}
      />
    )
  }

  // Show the Event In-Charge Dashboard
  if (signedIn?.role === 'incharge') {
    return (
      <EventInChargeDashboard
        name={signedIn.name}
        onLogout={handleLogout}
      />
    )
  }

  // Fallback for any other verified role
  if (signedIn) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h1>Welcome, {signedIn.name}!</h1>
          <p>Verified role: {signedIn.role}</p>
          <button
            className="login-submit"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </section>
      </main>
    )
  }



if (signedIn) {
  const roleTitle =
    roles.find((item) => item.id === signedIn.role)?.title ||
    signedIn.role

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Welcome!</h1>
        <p>Account: {signedIn.name}</p>
        <p>Verified role: {roleTitle}</p>
        <p className="login-notice">
          The dashboard for this role will be added next.
        </p>
        <button
          className="login-submit"
          type="button"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </section>
    </main>
  )
}


  // Temporary screen for the other verified roles
  if (signedIn) {
    const roleTitle =
      roles.find((item) => item.id === signedIn.role)?.title ||
      signedIn.role

    return (
      <main className="login-page">
        <section className="login-card" aria-live="polite">
          <a className="login-brand" href="#home" onClick={onBack}>
            <span className="brand-icon">C</span>
            <span>
              Campus<span className="brand-accent">Connect</span>
            </span>
          </a>

          <div className="login-heading">
            <span className="section-label">SIGN-IN SUCCESSFUL</span>
            <h1>Welcome!</h1>
            <p>You are authenticated with Supabase.</p>
          </div>

          <p>
            <strong>Account:</strong> {signedIn.name}
          </p>
          <p>
            <strong>Verified role:</strong> {roleTitle}
          </p>

          <p className="login-notice">
            Your account is verified. The dashboard for this role
            will be added in a later step.
          </p>

          {error && (
            <p className="login-feedback" role="alert">
              {error}
            </p>
          )}

          <button
            className="login-submit"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </section>
      </main>
    )
  }

  // Login form
  return (
    <main className="login-page">
      <button
        className="back-button"
        onClick={onBack}
        type="button"
      >
        ← Back to homepage
      </button>

      <section className="login-card">
        <a className="login-brand" href="#home" onClick={onBack}>
          <span className="brand-icon">C</span>
          <span>
            Campus<span className="brand-accent">Connect</span>
          </span>
        </a>

        <div className="login-heading">
          <span className="section-label">
            YOUR CAMPUS, CONNECTED
          </span>
          <h1>Welcome back.</h1>
          <p>Choose your role and sign in to the portal.</p>
        </div>

        <div className="role-options">
          {roles.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`role-option ${
                role === item.id ? 'role-selected' : ''
              }`}
              onClick={() => {
                setRole(item.id)
                setError('')
              }}
              aria-pressed={role === item.id}
            >
              <span className="role-option-icon">
                {item.icon}
              </span>

              <span className="role-option-text">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>

              <span className="role-radio">
                {role === item.id ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">College email</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@college.edu"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && (
            <p className="login-feedback" role="alert">
              {error}
            </p>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : `Continue as ${selectedRole.title} →`}
          </button>
        </form>

        <p className="login-notice">
          Sign in using your registered account. Your role is
          verified against your database profile.
        </p>
      </section>
    </main>
  )
}

export default Login
