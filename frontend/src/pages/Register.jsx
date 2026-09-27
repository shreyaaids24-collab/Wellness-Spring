import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initial = {
  name: '',
  email: '',
  password: '',
  age: '',
  height_cm: '',
  weight_kg: '',
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      }
      if (form.age) payload.age = Number(form.age)
      if (form.height_cm) payload.height_cm = Number(form.height_cm)
      if (form.weight_kg) payload.weight_kg = Number(form.weight_kg)

      await register(payload)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ width: 'min(520px, 100%)' }}>
        <div className="brand-hero">
          <div className="logo">W</div>
          <h1>Join WellSpring</h1>
          <p className="lead">Create your account and start recording daily wellness activities.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Full name</label>
            <input id="name" required minLength={2} value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
            <small style={{ color: 'var(--muted)' }}>At least 8 characters, one uppercase letter, one digit.</small>
          </div>

          <div className="grid grid-3">
            <div className="form-row">
              <label htmlFor="age">Age</label>
              <input id="age" type="number" min={10} max={120} value={form.age} onChange={(e) => update('age', e.target.value)} />
            </div>
            <div className="form-row">
              <label htmlFor="height">Height (cm)</label>
              <input id="height" type="number" min={50} max={300} step="0.1" value={form.height_cm} onChange={(e) => update('height_cm', e.target.value)} />
            </div>
            <div className="form-row">
              <label htmlFor="weight">Weight (kg)</label>
              <input id="weight" type="number" min={20} max={400} step="0.1" value={form.weight_kg} onChange={(e) => update('weight_kg', e.target.value)} />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
