import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useCreatePlan, usePlanFeatures, useUpdatePlan } from '../hooks/usePlans'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { BillingCycle, SubscriptionPlan } from '../types'

interface PlanFormDialogProps {
  open: boolean
  plan: SubscriptionPlan | null
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

export function PlanFormDialog({ open, plan, onClose, onNotify }: PlanFormDialogProps) {
  const { data: features } = usePlanFeatures()
  const createMutation = useCreatePlan()
  const updateMutation = useUpdatePlan()
  const isEdit = plan !== null

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priceText, setPriceText] = useState('0')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [trialDays, setTrialDays] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState('0')
  const [limitValues, setLimitValues] = useState<Record<string, string>>({})
  const [boolValues, setBoolValues] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open) return
    setName(plan?.name ?? '')
    setDescription(plan?.description ?? '')
    setPriceText(plan ? (plan.price / 100).toString() : '0')
    setCurrencyCode(plan?.currency_code ?? 'USD')
    setBillingCycle(plan?.billing_cycle ?? 'monthly')
    setTrialDays(plan ? plan.trial_days.toString() : '0')
    setIsActive(plan?.is_active ?? true)
    setSortOrder(plan ? plan.sort_order.toString() : '0')

    const nextLimits: Record<string, string> = {}
    const nextBools: Record<string, boolean> = {}
    for (const f of features ?? []) {
      const current = plan?.features?.[f.key]
      if (f.type === 'limit') {
        nextLimits[f.key] = current === undefined ? '' : String(current)
      } else {
        nextBools[f.key] = Boolean(current)
      }
    }
    setLimitValues(nextLimits)
    setBoolValues(nextBools)
  }, [open, plan, features])

  const handleSave = async () => {
    if (!name.trim()) {
      onNotify('Name is required.', 'error')
      return
    }
    const price = Math.round(parseFloat(priceText || '0') * 100)
    if (Number.isNaN(price) || price < 0) {
      onNotify('Enter a valid non-negative price.', 'error')
      return
    }

    const values: Record<string, number | boolean> = {}
    for (const [key, text] of Object.entries(limitValues)) {
      if (text.trim() !== '') {
        values[key] = parseInt(text, 10) || 0
      }
    }
    for (const [key, value] of Object.entries(boolValues)) {
      values[key] = value
    }

    const payload = {
      name,
      description: description || null,
      price,
      currency_code: currencyCode,
      billing_cycle: billingCycle,
      trial_days: parseInt(trialDays, 10) || 0,
      is_active: isActive,
      sort_order: parseInt(sortOrder, 10) || 0,
      values,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: plan.id, payload })
        onNotify('Plan updated.', 'success')
      } else {
        await createMutation.mutateAsync(payload)
        onNotify('Plan created.', 'success')
      }
      onClose()
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? `Edit ${plan.name}` : 'New subscription plan'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="Description (optional)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Price"
              size="small"
              type="number"
              fullWidth
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
            />
            <TextField
              label="Currency"
              size="small"
              fullWidth
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
              slotProps={{ htmlInput: { maxLength: 3 } }}
            />
            <TextField
              select
              label="Billing cycle"
              size="small"
              fullWidth
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="lifetime">Lifetime</MenuItem>
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Trial days"
              size="small"
              type="number"
              fullWidth
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
            />
            <TextField
              label="Sort order"
              size="small"
              type="number"
              fullWidth
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <FormControlLabel
              sx={{ flexShrink: 0 }}
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
              label="Active"
            />
          </Stack>

          {!!features?.length && (
            <>
              <Divider />
              <Typography variant="subtitle2">Feature values</Typography>
              <Typography variant="caption" color="text.secondary">
                Limits: leave blank to disable that feature entirely, 0 for unlimited, or a specific number.
              </Typography>
              <Stack spacing={1.5}>
                {features.map((feature) =>
                  feature.type === 'limit' ? (
                    <TextField
                      key={feature.key}
                      label={feature.label}
                      size="small"
                      type="number"
                      value={limitValues[feature.key] ?? ''}
                      onChange={(e) => setLimitValues((prev) => ({ ...prev, [feature.key]: e.target.value }))}
                    />
                  ) : (
                    <FormControlLabel
                      key={feature.key}
                      control={
                        <Switch
                          checked={boolValues[feature.key] ?? false}
                          onChange={(e) => setBoolValues((prev) => ({ ...prev, [feature.key]: e.target.checked }))}
                        />
                      }
                      label={feature.label}
                    />
                  ),
                )}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={pending}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
