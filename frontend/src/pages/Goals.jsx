import { useEffect, useState } from 'react'
import LoadingState from '../components/LoadingState'
import { goalService } from '../services'

const defaults = {
  steps_goal: 8000,
  exercise_minutes_goal: 30,
  water_litres_goal: 2,
  sleep_hours_goal: 8,
  screen_time_hours_goal: 6,
}

export default function Goals() {
  const [active, setActive] = useState(null)
  const [form, setForm] = useState(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data } = await goalService.active()
        if (!cancelled) {
          setActive(data)
          setForm({
            steps_goal: data.steps_goal,
            exercise_minutes_goal: data.exercise_minutes_goal,
            water_litres_goal: Number(data.water_litres_goal),
            sleep_hours_goal: Number(data.sleep_hours_goal),
            screen_time_hours_goal: Number(data.screen_time_hours_goal),
          })
        }
      } catch {
        // No active goal — keep defaults
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
    const payload = {
      steps_goal: Number(form.steps_goal),
      exercise_minutes_goal: Number(form.exercise_minutes_goal),
      water_litres_goal: Number(form.water_litres_goal),
      sleep_hours_goal: Number(form.sleep_hours_goal),
      screen_time_hours_goal: Number(form.screen_time_hours_goal),
    }

    try {
      if (active?.id) {
        const { data } = await goalService.update(active.id, payload)
        setActive(data)
        setSuccess('Goals updated.')
      } else {
        const { data } = await goalService.create(payload)
        setActive(data)
        setSuccess('Goals created.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading goals…" />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Daily Goals</h1>
          <p>Set targets for steps, exercise, water, sleep, and screen time.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="panel" style={{ maxWidth: 640 }}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="steps_goal">Steps goal</label>
            <input id="steps_goal" type="number" min={1000} max={100000} required value={form.steps_goal} onChange={(e) => update('steps_goal', e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="exercise_goal">Exercise goal (minutes)</label>
            <input id="exercise_goal" type="number" min={5} max={300} required value={form.exercise_minutes_goal} onChange={(e) => update('exercise_minutes_goal', e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="water_goal">Water goal (litres)</label>
            <input id="water_goal" type="number" min={0.5} max={10} step="0.1" required value={form.water_litres_goal} onChange={(e) => update('water_litres_goal', e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="sleep_goal">Sleep goal (hours)</label>
            <input id="sleep_goal" type="number" min={4} max={14} step="0.1" required value={form.sleep_hours_goal} onChange={(e) => update('sleep_hours_goal', e.target.value)} />
          </div>
          <div className="form-row">
            <label htmlFor="screen_goal">Screen time limit (hours)</label>
            <input id="screen_goal" type="number" min={1} max={16} step="0.1" required value={form.screen_time_hours_goal} onChange={(e) => update('screen_time_hours_goal', e.target.value)} />
            <small style={{ color: 'var(--muted)' }}>Lower is better — full score when you stay at or below this limit.</small>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save goals'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
