import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { analyticsService } from '../services'
import { formatDate, moodLabel } from '../utils/format'

export default function Dashboard() {
  const { user } = useAuth()
  const [today, setToday] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [todayRes, weeklyRes] = await Promise.all([
          analyticsService.today(),
          analyticsService.weekly(),
        ])
        if (!cancelled) {
          setToday(todayRes.data)
          setWeekly(weeklyRes.data)
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

  if (loading) return <LoadingState message="Building your dashboard…" />
  if (error) return <div className="alert alert-error">{error}</div>

  const activity = today?.activity
  const score = today?.score
  const streak = today?.streak
  const progress = today?.progress
  const chartDays = (weekly?.days || []).map((d) => ({
    ...d,
    label: formatDate(d.date).split(',')[0],
    moodValue:
      { great: 5, good: 4, neutral: 3, low: 2, poor: 1 }[d.mood] || 0,
  }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hello, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p>Your daily wellness snapshot for {formatDate(today?.date)}.</p>
        </div>
        <Link className="btn btn-primary" to="/activity">
          {activity ? 'Edit today' : 'Log today'}
        </Link>
      </div>

      {!activity && (
        <div className="alert alert-info">
          No entry for today yet. Log your steps, sleep, water, and mood to unlock your score.
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <StatCard label="Steps" value={activity?.steps ?? 0} hint="Today" style={{ animationDelay: '0.05s' }} />
        <StatCard label="Exercise" value={`${activity?.exercise_minutes ?? 0} min`} hint="Active minutes" style={{ animationDelay: '0.1s' }} />
        <StatCard label="Water" value={`${activity?.water_litres ?? 0} L`} hint="Intake" style={{ animationDelay: '0.15s' }} />
        <StatCard label="Sleep" value={`${activity?.sleep_hours ?? 0} h`} hint="Rest" style={{ animationDelay: '0.2s' }} />
      </div>

      <div className="grid grid-3" style={{ marginBottom: '1rem' }}>
        <StatCard label="Screen time" value={`${activity?.screen_time_hours ?? 0} h`} />
        <StatCard label="Mood" value={moodLabel(activity?.mood)} />
        <StatCard
          label="Current streak"
          value={`${streak?.current_streak ?? 0} days`}
          hint={`Longest: ${streak?.longest_streak ?? 0} · Week: ${streak?.weekly_completion_percent ?? 0}%`}
        />
      </div>

      <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
        <section className="panel">
          <h2>Daily Wellness Score</h2>
          <p className="subtitle">Personal tracking only — not a medical assessment.</p>
          <div className="score-ring" style={{ '--score': score?.total ?? 0 }}>
            <strong>{score?.total ?? 0}/100</strong>
          </div>
          <div className="score-breakdown">
            <div className="score-row"><span>Steps</span><span>{score?.steps ?? 0}/20</span></div>
            <div className="score-row"><span>Exercise</span><span>{score?.exercise ?? 0}/20</span></div>
            <div className="score-row"><span>Water</span><span>{score?.water ?? 0}/20</span></div>
            <div className="score-row"><span>Sleep</span><span>{score?.sleep ?? 0}/20</span></div>
            <div className="score-row"><span>Screen time</span><span>{score?.screen_time ?? 0}/20</span></div>
          </div>
        </section>

        <section className="panel">
          <h2>Goal progress</h2>
          <p className="subtitle">How today compares with your active goals.</p>
          {progress ? (
            <>
              <ProgressBar label="Steps" current={progress.steps.current} goal={progress.steps.goal} percent={progress.steps.percent} />
              <ProgressBar label="Exercise" current={progress.exercise.current} goal={progress.exercise.goal} percent={progress.exercise.percent} unit=" min" />
              <ProgressBar label="Water" current={progress.water.current} goal={progress.water.goal} percent={progress.water.percent} unit=" L" />
              <ProgressBar label="Sleep" current={progress.sleep.current} goal={progress.sleep.goal} percent={progress.sleep.percent} unit=" h" />
              <ProgressBar label="Screen time" current={progress.screen_time.current} goal={progress.screen_time.goal} percent={progress.screen_time.percent} unit=" h" />
            </>
          ) : (
            <EmptyState title="No goals yet" message="Set daily goals to see progress bars here." action={<Link className="btn btn-secondary" to="/goals">Set goals</Link>} />
          )}
        </section>
      </div>

      <div className="grid grid-2">
        <section className="panel chart-panel">
          <h2>Weekly steps</h2>
          <p className="subtitle">Last 7 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e3da" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="steps" fill="#1b6b4a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <h2>Mood trend</h2>
          <p className="subtitle">5 = great · 1 = poor</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e3da" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="moodValue" stroke="#c45c26" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  )
}
