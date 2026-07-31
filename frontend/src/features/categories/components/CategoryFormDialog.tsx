import { useEffect } from 'react'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import type { Category, CategoryFormValues } from '../types'

const attributeSchema = z.object({
  key: z
    .string()
    .min(1, 'Required')
    .regex(/^[a-z0-9_]+$/, 'lowercase letters, numbers, underscores only'),
  label: z.string().min(1, 'Required'),
  type: z.enum(['text', 'number', 'select', 'boolean', 'date']),
  required: z.boolean(),
  optionsText: z.string().optional(),
})

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  parent_id: z.number().nullable(),
  description: z.string().optional(),
  booking_mode_allowed: z.array(z.enum(['slot', 'request'])).min(1, 'Pick at least one booking mode'),
  is_active: z.boolean(),
  attributes: z.array(attributeSchema),
})

type FormShape = z.infer<typeof formSchema>

interface CategoryFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: CategoryFormValues) => void
  isSubmitting: boolean
  category: Category | null
  parentOptions: Category[]
}

function toFormDefaults(category: Category | null): FormShape {
  if (!category) {
    return {
      name: '',
      parent_id: null,
      description: '',
      booking_mode_allowed: ['slot'],
      is_active: true,
      attributes: [],
    }
  }

  return {
    name: category.name,
    parent_id: category.parent_id,
    description: category.description ?? '',
    booking_mode_allowed: category.booking_mode_allowed.length ? category.booking_mode_allowed : ['slot'],
    is_active: category.is_active,
    attributes: (category.attribute_schema ?? []).map((attr) => ({
      key: attr.key,
      label: attr.label,
      type: attr.type,
      required: attr.required,
      optionsText: (attr.options ?? []).join(', '),
    })),
  }
}

export function CategoryFormDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  category,
  parentOptions,
}: CategoryFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormShape>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormDefaults(category),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' })
  const bookingModes = watch('booking_mode_allowed')

  useEffect(() => {
    if (open) reset(toFormDefaults(category))
  }, [open, category, reset])

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      parent_id: values.parent_id,
      description: values.description ?? '',
      booking_mode_allowed: values.booking_mode_allowed,
      is_active: values.is_active,
      attribute_schema: values.attributes.map((attr) => ({
        key: attr.key,
        label: attr.label,
        type: attr.type,
        required: attr.required,
        options:
          attr.type === 'select'
            ? (attr.optionsText ?? '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
      })),
    })
  })

  const toggleBookingMode = (mode: 'slot' | 'request', checked: boolean, onChange: (v: string[]) => void) => {
    const next = checked ? [...bookingModes, mode] : bookingModes.filter((m) => m !== mode)
    onChange(next)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            fullWidth
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />

          <Controller
            control={control}
            name="parent_id"
            render={({ field }) => (
              <TextField
                select
                label="Parent category"
                fullWidth
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
              >
                <MenuItem value="">None (top-level)</MenuItem>
                {parentOptions
                  .filter((p) => p.id !== category?.id)
                  .map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            {...register('description')}
          />

          <Stack>
            <Typography variant="subtitle2" gutterBottom>
              Booking modes allowed
            </Typography>
            <Controller
              control={control}
              name="booking_mode_allowed"
              render={({ field }) => (
                <Stack direction="row">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value.includes('slot')}
                        onChange={(e) => toggleBookingMode('slot', e.target.checked, field.onChange)}
                      />
                    }
                    label="Fixed time slots"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value.includes('request')}
                        onChange={(e) => toggleBookingMode('request', e.target.checked, field.onChange)}
                      />
                    }
                    label="Request a quote"
                  />
                </Stack>
              )}
            />
            {errors.booking_mode_allowed && (
              <Typography variant="caption" color="error">
                {errors.booking_mode_allowed.message}
              </Typography>
            )}
          </Stack>

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Active (visible to customers)"
              />
            )}
          />

          <Divider />

          <Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Custom fields for this category</Typography>
              <Button
                size="small"
                startIcon={<AddOutlinedIcon />}
                onClick={() =>
                  append({ key: '', label: '', type: 'text', required: false, optionsText: '' })
                }
              >
                Add field
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              These become the extra fields vendors fill in when creating a service in this category —
              this is what lets the same platform serve any kind of business.
            </Typography>

            {fields.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No custom fields yet.
              </Typography>
            )}

            <Stack spacing={2}>
              {fields.map((field, index) => {
                const type = watch(`attributes.${index}.type`)
                return (
                  <Stack
                    key={field.id}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'flex-start', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          label="Key"
                          size="small"
                          fullWidth
                          placeholder="property_type"
                          error={!!errors.attributes?.[index]?.key}
                          {...register(`attributes.${index}.key`)}
                        />
                        <TextField
                          label="Label"
                          size="small"
                          fullWidth
                          placeholder="Property Type"
                          error={!!errors.attributes?.[index]?.label}
                          {...register(`attributes.${index}.label`)}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Controller
                          control={control}
                          name={`attributes.${index}.type`}
                          render={({ field: typeField }) => (
                            <TextField select label="Type" size="small" sx={{ minWidth: 140 }} {...typeField}>
                              <MenuItem value="text">Text</MenuItem>
                              <MenuItem value="number">Number</MenuItem>
                              <MenuItem value="select">Select</MenuItem>
                              <MenuItem value="boolean">Yes/No</MenuItem>
                              <MenuItem value="date">Date</MenuItem>
                            </TextField>
                          )}
                        />
                        {type === 'select' && (
                          <TextField
                            label="Options (comma-separated)"
                            size="small"
                            fullWidth
                            placeholder="Apartment, House, Office"
                            {...register(`attributes.${index}.optionsText`)}
                          />
                        )}
                        <Controller
                          control={control}
                          name={`attributes.${index}.required`}
                          render={({ field: reqField }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={reqField.value}
                                  onChange={(e) => reqField.onChange(e.target.checked)}
                                />
                              }
                              label="Required"
                              sx={{ whiteSpace: 'nowrap' }}
                            />
                          )}
                        />
                      </Stack>
                    </Stack>
                    <IconButton size="small" onClick={() => remove(index)} sx={{ mt: 0.5 }}>
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )
              })}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={isSubmitting}>
          {category ? 'Save changes' : 'Create category'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
