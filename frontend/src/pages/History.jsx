import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { activityService } from '../services'
import { formatDate, moodLabel } from '../utils/format'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await activityService.list()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this activity entry?')) return
    try {
      await activityService.remove(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(item) {
    setEditing({
      id: item.id,
      steps: item.steps,
      exercise_minutes: item.exercise_minutes,
      water_litres: Number(item.water_litres),
      sleep_hours: Number(item.sleep_hours),
      screen_time_hours: Number(item.screen_time_hours),
      mood: item.mood,
      notes: item.notes || '',
    })
  }

  async function saveEdit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { id, ...payload } = editing
      const { data } = await activityService.update(id, {
        ...payload,
        steps: Number(payload.steps),
        exercise_minutes: Number(payload.exercise_minutes),
        water_litres: Number(payload.water_litres),
        sleep_hours: Number(payload.sleep_hours),
        screen_time_hours: Number(payload.screen_time_hours),
        notes: payload.notes?.trim() || null,
      })
      setItems((prev) => prev.map((item) => (item.id === id ? data : item)))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading activity history…" />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Activity History</h1>
          <p>Review, edit, or delete previous wellness entries.</p>
        </div>
        <Link className="btn btn-primary" to="/activity">
          Add entry
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="panel">
        {items.length === 0 ? (
          <EmptyState
            title="No entries yet"
            message="Start by logging today’s wellness activities."
            action={<Link className="btn btn-secondary" to="/activity">Log activity</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Steps</th>
                  <th>Exercise</th>
                  <th>Water</th>
                  <th>Sleep</th>
                  <th>Screen</th>
                  <th>Mood</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.activity_date)}</td>
                    <td>{item.steps}</td>
                    <td>{item.exercise_minutes} min</td>
                    <td>{item.water_litres} L</td>
                    <td>{item.sleep_hours} h</td>
                    <td>{item.screen_time_hours} h</td>
                    <td>
                      <span className={`badge mood-${item.mood}`}>{moodLabel(item.mood)}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <section className="panel" style={{ marginTop: '1rem', maxWidth: 720 }}>
          <h2>Edit entry</h2>
          <p className="subtitle">Update values for this logged day.</p>
          <form className="form-grid" onSubmit={saveEdit}>
            <div className="grid grid-2">
              <div className="form-row">
                <label>Steps</label>
                <input type="number" min={0} value={editing.steps} onChange={(e) => setEditing({ ...editing, steps: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Exercise (min)</label>
                <input type="number" min={0} value={editing.exercise_minutes} onChange={(e) => setEditing({ ...editing, exercise_minutes: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Water (L)</label>
                <input type="number" min={0} step="0.1" value={editing.water_litres} onChange={(e) => setEditing({ ...editing, water_litres: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Sleep (h)</label>
                <input type="number" min={0} step="0.1" value={editing.sleep_hours} onChange={(e) => setEditing({ ...editing, sleep_hours: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Screen time (h)</label>
                <input type="number" min={0} step="0.1" value={editing.screen_time_hours} onChange={(e) => setEditing({ ...editing, screen_time_hours: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Mood</label>
                <select value={editing.mood} onChange={(e) => setEditing({ ...editing, mood: e.target.value })}>
                  <option value="great">Great</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="low">Low</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <label>Notes</label>
              <textarea rows={3} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}
