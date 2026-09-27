import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import LoadingState from '../components/LoadingState'
import StatCard from '../components/StatCard'
import { analyticsService } from '../services'
import { formatDate } from '../utils/format'

export default function Analytics() {
  const [period, setPeriod] = useState('weekly')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = period === 'weekly'
          ? await analyticsService.weekly()
          : await analyticsService.monthly()
        if (!cancelled) setData(res.data)
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
  }, [period])

  if (loading) return <LoadingState message="Loading analytics…" />
  if (error) return <div className="alert alert-error">{error}</div>
  if (!data) return null

  const chartDays = (data.days || []).map((d) => ({
    ...d,
    label: formatDate(d.date).replace(/,.*/, ''),
    moodValue: { great: 5, good: 4, neutral: 3, low: 2, poor: 1 }[d.mood] || 0,
  }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>
            Trends from {formatDate(data.start_date)} to {formatDate(data.end_date)}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`btn btn-sm ${period === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <StatCard label="Avg steps" value={data.averages?.steps ?? 0} />
        <StatCard label="Avg exercise" value={`${data.averages?.exercise_minutes ?? 0} min`} />
        <StatCard label="Avg water" value={`${data.averages?.water_litres ?? 0} L`} />
        <StatCard label="Avg sleep" value={`${data.averages?.sleep_hours ?? 0} h`} />
      </div>

      <div className="grid grid-3" style={{ marginBottom: '1rem' }}>
        <StatCard label="Current streak" value={`${data.streak?.current_streak ?? 0} days`} />
        <StatCard label="Longest streak" value={`${data.streak?.longest_streak ?? 0} days`} />
        <StatCard label="Weekly completion" value={`${data.streak?.weekly_completion_percent ?? 0}%`} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
        <section className="panel chart-panel">
          <h2>Steps</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e3da" />
              <XAxis dataKey="label" hide={period === 'monthly'} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="steps" fill="#1b6b4a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <h2>Exercise (minutes)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e3da" />
              <XAxis dataKey="label" hide={period === 'monthly'} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="exercise_minutes" fill="#2f9a68" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
        <section className="panel chart-panel">
          <h2>Water & sleep</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e3da" />
              <XAxis dataKey="label" hide={period === 'monthly'} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="water_litres" name="Water (L)" stroke="#1b6b4a" strokeWidth={2} />
              <Line type="monotone" dataKey="sleep_hours" name="Sleep (h)" stroke="#c45c26" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <h2>Mood trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e3da" />
              <XAxis dataKey="label" hide={period === 'monthly'} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="moodValue" name="Mood" stroke="#245f46" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  )
}
