import { percentBar } from '../utils/format'

export default function ProgressBar({ label, current, goal, percent, unit = '' }) {
  return (
    <div className="progress-block">
      <div className="progress-head">
        <span>
          {label}
        </span>
        <span>
          {current}
          {unit} / {goal}
          {unit} · {percentBar(percent)}
        </span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: percentBar(percent) }} />
      </div>
    </div>
  )
}
