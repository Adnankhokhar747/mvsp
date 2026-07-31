import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { useCreateStaff, usePlatformRoles } from '../hooks/useStaff'
import { extractErrorMessage } from '../../../shared/lib/api-client'

interface StaffFormDialogProps {
  open: boolean
  onClose: () => void
  onNotify: (message: string, severity: 'success' | 'error') => void
}

export function StaffFormDialog({ open, onClose, onNotify }: StaffFormDialogProps) {
  const { data: roles } = usePlatformRoles()
  const createMutation = useCreateStaff()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')

  const reset = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !role) {
      onNotify('Name, email, and role are required.', 'error')
      return
    }
    if (password.length < 8) {
      onNotify('Password must be at least 8 characters.', 'error')
      return
    }

    try {
      await createMutation.mutateAsync({ name, email, password, role })
      onNotify('Staff member created.', 'success')
      handleClose()
    } catch (error) {
      onNotify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>New staff member</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="Email"
            size="small"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Initial password"
            size="small"
            fullWidth
            type="password"
            helperText="At least 8 characters. Share this with the staff member securely."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField select label="Role" size="small" fullWidth value={role} onChange={(e) => setRole(e.target.value)}>
            {roles?.map((r) => (
              <MenuItem key={r.name} value={r.name}>
                {r.name} ({r.permissions_count} permissions)
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={createMutation.isPending}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
