import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { usePlanFeatures, usePlans, useUpdatePlan, useDeletePlan } from '../hooks/usePlans'
import { FeatureFormDialog } from '../components/FeatureFormDialog'
import { PlanFormDialog } from '../components/PlanFormDialog'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { PlanFeature, SubscriptionPlan } from '../types'

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export function PlansPage() {
  const { data: features, isLoading: featuresLoading } = usePlanFeatures()
  const { data: plans, isLoading: plansLoading } = usePlans()
  const updatePlanMutation = useUpdatePlan()
  const deletePlanMutation = useDeletePlan()

  const [featureDialogOpen, setFeatureDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<PlanFeature | null>(null)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const notify = (message: string, severity: 'success' | 'error') => setToast({ message, severity })

  const openNewFeature = () => {
    setEditingFeature(null)
    setFeatureDialogOpen(true)
  }
  const openEditFeature = (feature: PlanFeature) => {
    setEditingFeature(feature)
    setFeatureDialogOpen(true)
  }
  const openNewPlan = () => {
    setEditingPlan(null)
    setPlanDialogOpen(true)
  }
  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setPlanDialogOpen(true)
  }

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      await updatePlanMutation.mutateAsync({ id: plan.id, payload: { is_active: !plan.is_active } })
      notify(`${plan.name} ${!plan.is_active ? 'activated' : 'deactivated'}.`, 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  const handleSetDefault = async (plan: SubscriptionPlan) => {
    try {
      await updatePlanMutation.mutateAsync({ id: plan.id, payload: { is_default: true } })
      notify(`${plan.name} is now the default plan.`, 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  const handleDelete = async (plan: SubscriptionPlan) => {
    try {
      await deletePlanMutation.mutateAsync(plan.id)
      notify('Plan deleted.', 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Subscription Plans
        </Typography>
        <Typography color="text.secondary">
          Define the feature limits vendors get on each plan, and manage pricing and availability.
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Plans</Typography>
          <Button size="small" startIcon={<AddOutlinedIcon />} onClick={openNewPlan}>
            New plan
          </Button>
        </Stack>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Trial</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plansLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : plans?.map((plan) => (
                      <TableRow key={plan.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>{plan.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {plan.billing_cycle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{money(plan.price, plan.currency_code)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{plan.trial_days ? `${plan.trial_days} days` : '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={plan.is_active}
                            onChange={() => handleToggleActive(plan)}
                            disabled={updatePlanMutation.isPending}
                          />
                        </TableCell>
                        <TableCell>
                          {plan.is_default ? (
                            <Chip size="small" label="Default" color="primary" variant="outlined" />
                          ) : (
                            <Button
                              size="small"
                              disabled={!plan.is_active || updatePlanMutation.isPending}
                              onClick={() => handleSetDefault(plan)}
                            >
                              Set as default
                            </Button>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => openEditPlan(plan)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            disabled={deletePlanMutation.isPending}
                            onClick={() => handleDelete(plan)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Plan features</Typography>
          <Button size="small" startIcon={<AddOutlinedIcon />} onClick={openNewFeature}>
            New feature
          </Button>
        </Stack>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {featuresLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : features?.map((feature) => (
                      <TableRow key={feature.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {feature.key}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{feature.label}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={feature.type} variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => openEditFeature(feature)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <FeatureFormDialog
        open={featureDialogOpen}
        feature={editingFeature}
        onClose={() => setFeatureDialogOpen(false)}
        onNotify={notify}
      />
      <PlanFormDialog open={planDialogOpen} plan={editingPlan} onClose={() => setPlanDialogOpen(false)} onNotify={notify} />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Stack>
  )
}
