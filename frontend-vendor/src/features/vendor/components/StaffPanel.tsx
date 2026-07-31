import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { useInviteStaff, useRemoveStaff, useStaff } from '../hooks/useVendor'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { VendorRole } from '../types'

interface StaffPanelProps {
  vendorId: number
  canManage: boolean
  currentUserId: number
}

export function StaffPanel({ vendorId, canManage, currentUserId }: StaffPanelProps) {
  const { data: staff, isLoading } = useStaff(vendorId)
  const inviteMutation = useInviteStaff()
  const removeMutation = useRemoveStaff()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Exclude<VendorRole, 'owner'>>('staff')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInvite = async () => {
    setError(null)
    setSuccess(null)
    if (!email.trim()) {
      setError('Enter an email address.')
      return
    }
    try {
      await inviteMutation.mutateAsync({ vendorId, email: email.trim(), role })
      setSuccess(`${email} added as ${role}.`)
      setEmail('')
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleRemove = async (userId: number) => {
    setError(null)
    try {
      await removeMutation.mutateAsync({ vendorId, userId })
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <List disablePadding>
        {!isLoading &&
          staff?.map((member) => (
            <ListItem
              key={member.id}
              divider
              secondaryAction={
                canManage && member.role !== 'owner' && member.user_id !== currentUserId ? (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemove(member.user_id)}
                    disabled={removeMutation.isPending}
                  >
                    Remove
                  </Button>
                ) : undefined
              }
            >
              <ListItemText
                slotProps={{ secondary: { component: 'div' } }}
                primary={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600 }}>{member.name}</Typography>
                    <Chip size="small" label={member.role} variant="outlined" />
                  </Stack>
                }
                secondary={member.email}
              />
            </ListItem>
          ))}
      </List>

      {canManage && (
        <>
          <Divider />
          <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
            <Typography variant="subtitle2">Add a team member</Typography>
            <Typography variant="caption" color="text.secondary">
              The person must already have a ServiceHub account.
            </Typography>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as Exclude<VendorRole, 'owner'>)}
              fullWidth
            >
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </TextField>
            <Button
              variant="contained"
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add to team
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  )
}
