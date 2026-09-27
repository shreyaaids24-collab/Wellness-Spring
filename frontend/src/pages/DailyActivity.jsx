import { useEffect, useState } from 'react'
import { activityService } from '../services'
import { todayISO } from '../utils/format'

const emptyForm = {
  activity_date: todayISO(),
  steps: 0,
  exercise_minutes: 0,
  water_litres: 0,
  sleep_hours: 0,
  screen_time_hours: 0,
  mood: 'neutral',
  notes: '',
}

export default function DailyActivity() {
  const [form, setForm] = useState(emptyForm)
  const [existingId, setExistingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  async function loadForDate(dateValue) {
    setChecking(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await activityService.list({
        start_date: dateValue,
        end_date: dateValue,
      })
      if (data.length > 0) {
        const entry = data[0]
        setExistingId(entry.id)
        setForm({
          activity_date: entry.activity_date,
          steps: entry.steps,
          exercise_minutes: entry.exercise_minutes,
          water_litres: Number(entry.water_litres),
          sleep_hours: Number(entry.sleep_hours),
          screen_time_hours: Number(entry.screen_time_hours),
          mood: entry.mood,
          notes: entry.notes || '',
        })
      } else {
        setExistingId(null)
        setForm({
          ...emptyForm,
          activity_date: dateValue,
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    loadForDate(todayISO())
  }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleDateChange(value) {
    update('activity_date', value)
    await loadForDate(value)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const payload = {
      ...form,
      steps: Number(form.steps),
      exercise_minutes: Number(form.exercise_minutes),
      water_litres: Number(form.water_litres),
      sleep_hours: Number(form.sleep_hours),
      screen_time_hours: Number(form.screen_time_hours),
      notes: form.notes?.trim() || null,
    }

    try {
      if (existingId) {
        const { notes, activity_date, ...updatePayload } = payload
        const { data } = await activityService.update(existingId, {
          ...updatePayload,
          notes,
        })
        setForm({
          activity_date: data.activity_date,
          steps: data.steps,
          exercise_minutes: data.exercise_minutes,
          water_litres: Number(data.water_litres),
          sleep_hours: Number(data.sleep_hours),
          screen_time_hours: Number(data.screen_time_hours),
          mood: data.mood,
          notes: data.notes || '',
        })
        setSuccess('Activity updated successfully.')
      } else {
        const { data } = await activityService.create(payload)
        setExistingId(data.id)
        setSuccess('Activity logged successfully.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Daily Activity</h1>
          <p>Record steps, exercise, water, sleep, screen time, and mood for a chosen date.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="panel" style={{ maxWidth: 720 }}>
        {checking ? (
          <div className="loading-state">Loading entry for this date…</div>
        ) : (
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="activity_date">Date</label>
              <input
                id="activity_date"
                type="date"
                required
                max={todayISO()}
                value={form.activity_date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              <small style={{ color: 'var(--muted)' }}>
                {existingId
                  ? 'An entry already exists for this date — saving will update it.'
                  : 'No entry for this date yet — saving will create one.'}
              </small>
            </div>

            <div className="grid grid-2">
              <div className="form-row">
                <label htmlFor="steps">Steps</label>
                <input id="steps" type="number" min={0} max={100000} required value={form.steps} onChange={(e) => update('steps', e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="exercise">Exercise (minutes)</label>
                <input id="exercise" type="number" min={0} max={1440} required value={form.exercise_minutes} onChange={(e) => update('exercise_minutes', e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="water">Water (litres)</label>
                <input id="water" type="number" min={0} max={20} step="0.1" required value={form.water_litres} onChange={(e) => update('water_litres', e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="sleep">Sleep (hours)</label>
                <input id="sleep" type="number" min={0} max={24} step="0.1" required value={form.sleep_hours} onChange={(e) => update('sleep_hours', e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="screen">Screen time (hours)</label>
                <input id="screen" type="number" min={0} max={24} step="0.1" required value={form.screen_time_hours} onChange={(e) => update('screen_time_hours', e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="mood">Mood</label>
                <select id="mood" value={form.mood} onChange={(e) => update('mood', e.target.value)}>
                  <option value="great">Great</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="low">Low</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea id="notes" rows={3} maxLength={1000} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving…' : existingId ? 'Update entry' : 'Add entry'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
