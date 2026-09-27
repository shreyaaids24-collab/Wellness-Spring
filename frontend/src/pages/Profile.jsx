import { useEffect, useState } from 'react'
import LoadingState from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services'

export default function Profile() {
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data } = await profileService.get()
        if (!cancelled) {
          setForm({
            name: data.name || '',
            age: data.age ?? '',
            height_cm: data.height_cm ?? '',
            weight_kg: data.weight_kg ?? '',
          })
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        name: form.name.trim(),
        age: form.age === '' ? null : Number(form.age),
        height_cm: form.height_cm === '' ? null : Number(form.height_cm),
        weight_kg: form.weight_kg === '' ? null : Number(form.weight_kg),
      }
      await profileService.update(payload)
      await refreshProfile()
      setSuccess('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading profile…" />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your basic details used across the tracker.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="panel" style={{ maxWidth: 560 }}>
        <div className="form-row" style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input value={user?.email || ''} disabled />
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input id="name" required minLength={2} value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
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

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
