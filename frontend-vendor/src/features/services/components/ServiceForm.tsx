import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { useCategories } from '../../categories/hooks/useCategories'
import { flattenCategories } from '../../categories/api/categories-api'
import type { CategoryAttributeField } from '../../categories/types'
import type { PriceType, Service, ServiceStatus } from '../types'
import type { ServicePayload } from '../api/services-api'

export interface ServiceFormValues {
  category_id: number | ''
  title: string
  short_description: string
  description: string
  base_price: string
  price_type: PriceType
  duration_minutes: string
  attributes: Record<string, unknown>
  status: ServiceStatus
}

function toFormValues(service?: Service): ServiceFormValues {
  return {
    category_id: service?.category_id ?? '',
    title: service?.title ?? '',
    short_description: service?.short_description ?? '',
    description: service?.description ?? '',
    base_price: service ? String(service.base_price / 100) : '',
    price_type: service?.price_type ?? 'fixed',
    duration_minutes: service?.duration_minutes ? String(service.duration_minutes) : '',
    attributes: service?.attributes ?? {},
    status: service?.status ?? 'draft',
  }
}

interface ServiceFormProps {
  service?: Service
  showStatus?: boolean
  submitLabel: string
  onSubmit: (payload: ServicePayload) => Promise<void>
}

export function ServiceForm({ service, showStatus, submitLabel, onSubmit }: ServiceFormProps) {
  const { data: categories } = useCategories()
  const flatCategories = useMemo(() => flattenCategories(categories ?? []), [categories])

  const [values, setValues] = useState<ServiceFormValues>(() => toFormValues(service))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedCategory = flatCategories.find((c) => c.id === values.category_id)
  const attributeFields: CategoryAttributeField[] = selectedCategory?.attribute_schema ?? []

  const setField = <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const setAttribute = (key: string, value: unknown) =>
    setValues((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }))

  const handleSubmit = async () => {
    setError(null)

    if (!values.category_id) {
      setError('Choose a category.')
      return
    }
    if (!values.title.trim()) {
      setError('Title is required.')
      return
    }
    if (values.price_type !== 'quote' && !values.base_price) {
      setError('Enter a price, or switch to "Quote on request".')
      return
    }
    for (const field of attributeFields) {
      if (field.required && (values.attributes[field.key] === undefined || values.attributes[field.key] === '')) {
        setError(`"${field.label}" is required for this category.`)
        return
      }
    }

    const payload: ServicePayload = {
      category_id: values.category_id as number,
      title: values.title.trim(),
      short_description: values.short_description || undefined,
      description: values.description || undefined,
      price_type: values.price_type,
      base_price: values.price_type === 'quote' ? undefined : Math.round(Number(values.base_price) * 100),
      duration_minutes: values.duration_minutes ? Number(values.duration_minutes) : undefined,
      attributes: values.attributes,
      ...(showStatus ? { status: values.status as 'draft' | 'paused' } : {}),
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        select
        label="Category"
        value={values.category_id}
        onChange={(e) => setField('category_id', e.target.value === '' ? '' : Number(e.target.value))}
        fullWidth
      >
        {flatCategories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField label="Title" value={values.title} onChange={(e) => setField('title', e.target.value)} fullWidth />

      <TextField
        label="Short description"
        value={values.short_description}
        onChange={(e) => setField('short_description', e.target.value)}
        fullWidth
      />

      <TextField
        label="Description"
        value={values.description}
        onChange={(e) => setField('description', e.target.value)}
        multiline
        minRows={3}
        fullWidth
      />

      <TextField
        select
        label="Pricing type"
        value={values.price_type}
        onChange={(e) => setField('price_type', e.target.value as PriceType)}
        fullWidth
      >
        <MenuItem value="fixed">Fixed price</MenuItem>
        <MenuItem value="hourly">Hourly rate</MenuItem>
        <MenuItem value="quote">Quote on request</MenuItem>
      </TextField>

      {values.price_type !== 'quote' && (
        <TextField
          label={values.price_type === 'hourly' ? 'Rate per hour (USD)' : 'Price (USD)'}
          type="number"
          value={values.base_price}
          onChange={(e) => setField('base_price', e.target.value)}
          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          fullWidth
        />
      )}

      <TextField
        label="Typical duration (minutes, optional)"
        type="number"
        value={values.duration_minutes}
        onChange={(e) => setField('duration_minutes', e.target.value)}
        slotProps={{ htmlInput: { min: 1 } }}
        fullWidth
      />

      {!!attributeFields.length && (
        <>
          <Divider />
          <Typography variant="subtitle2">Category details</Typography>
          {attributeFields.map((field) => {
            const value = values.attributes[field.key]
            if (field.type === 'select') {
              return (
                <TextField
                  key={field.key}
                  select
                  label={field.label + (field.required ? ' *' : '')}
                  value={(value as string) ?? ''}
                  onChange={(e) => setAttribute(field.key, e.target.value)}
                  fullWidth
                >
                  {(field.options ?? []).map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              )
            }
            if (field.type === 'boolean') {
              return (
                <FormControlLabel
                  key={field.key}
                  control={
                    <Checkbox
                      checked={!!value}
                      onChange={(e) => setAttribute(field.key, e.target.checked)}
                    />
                  }
                  label={field.label + (field.required ? ' *' : '')}
                />
              )
            }
            return (
              <TextField
                key={field.key}
                label={field.label + (field.required ? ' *' : '')}
                type={field.type === 'number' ? 'number' : 'text'}
                value={(value as string) ?? ''}
                onChange={(e) =>
                  setAttribute(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)
                }
                fullWidth
              />
            )
          })}
        </>
      )}

      {showStatus && (
        <TextField
          select
          label="Status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as ServiceStatus)}
          fullWidth
          helperText="Only an admin can move a service to Active or Rejected."
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="paused">Paused</MenuItem>
          <MenuItem value="active" disabled={values.status !== 'active'}>
            Active
          </MenuItem>
          <MenuItem value="rejected" disabled={values.status !== 'rejected'}>
            Rejected
          </MenuItem>
        </TextField>
      )}

      <Button variant="contained" size="large" onClick={handleSubmit} disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
        {submitLabel}
      </Button>
    </Stack>
  )
}
