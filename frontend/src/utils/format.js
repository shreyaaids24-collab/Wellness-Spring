export function formatDate(value) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function percentBar(percent) {
  const safe = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0
  return `${safe}%`
}

export function moodLabel(mood) {
  if (!mood) return 'Not logged'
  return mood.charAt(0).toUpperCase() + mood.slice(1)
}
