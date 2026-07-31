import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import type { ServiceAvailabilitySlot } from '../types'

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

interface DayRow {
  enabled: boolean
  start_time: string
  end_time: string
}

function buildInitialRows(existing: ServiceAvailabilitySlot[]): Record<number, DayRow> {
  const rows: Record<number, DayRow> = {}
  for (const day of DAYS) {
    const match = existing.find((slot) => slot.is_recurring && slot.day_of_week === day.value)
    rows[day.value] = match
      ? { enabled: true, start_time: match.start_time.slice(0, 5), end_time: match.end_time.slice(0, 5) }
      : { enabled: false, start_time: '09:00', end_time: '17:00' }
  }
  return rows
}

interface AvailabilityEditorProps {
  existing: ServiceAvailabilitySlot[]
  onSave: (slots: ServiceAvailabilitySlot[]) => Promise<void>
}

export function AvailabilityEditor({ existing, onSave }: AvailabilityEditorProps) {
  const [rows, setRows] = useState<Record<number, DayRow>>(() => buildInitialRows(existing))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const setRow = (day: number, patch: Partial<DayRow>) =>
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))

  const handleSave = async () => {
    setError(null)
    const enabledDays = DAYS.filter((d) => rows[d.value].enabled)
    if (!enabledDays.length) {
      setError('Enable at least one day.')
      return
    }
    for (const day of enabledDays) {
      const row = rows[day.value]
      if (row.start_time >= row.end_time) {
        setError(`${day.label}: end time must be after start time.`)
        return
      }
    }

    const slots: ServiceAvailabilitySlot[] = enabledDays.map((day) => ({
      day_of_week: day.value,
      specific_date: null,
      start_time: rows[day.value].start_time,
      end_time: rows[day.value].end_time,
      is_recurring: true,
      staff_id: null,
    }))

    setSaving(true)
    try {
      await onSave(slots)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={1.5} sx={{ maxWidth: 480 }}>
      <Typography variant="caption" color="text.secondary">
        Weekly recurring hours. Saving replaces your entire schedule.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {DAYS.map((day) => {
        const row = rows[day.value]
        return (
          <Stack key={day.value} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Checkbox
              checked={row.enabled}
              onChange={(e) => setRow(day.value, { enabled: e.target.checked })}
            />
            <Typography variant="body2" sx={{ width: 100 }}>
              {day.label}
            </Typography>
            <TextField
              type="time"
              size="small"
              value={row.start_time}
              onChange={(e) => setRow(day.value, { start_time: e.target.value })}
              disabled={!row.enabled}
            />
            <Typography variant="body2" color="text.secondary">
              to
            </Typography>
            <TextField
              type="time"
              size="small"
              value={row.end_time}
              onChange={(e) => setRow(day.value, { end_time: e.target.value })}
              disabled={!row.enabled}
            />
          </Stack>
        )
      })}
      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ alignSelf: 'flex-start', mt: 1 }}>
        Save availability
      </Button>
    </Stack>
  )
}
