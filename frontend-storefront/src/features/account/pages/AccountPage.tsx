import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { useLogout, useMe, useUpdateProfile } from '../../auth/hooks/useAuth'
import { extractErrorMessage } from '../../../shared/lib/api-client'

export function AccountPage() {
  const navigate = useNavigate()
  const { data: user } = useMe()
  const updateMutation = useUpdateProfile()
  const logoutMutation = useLogout()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPhone(user.phone ?? '')
    }
  }, [user])

  if (!user) return null

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ name, phone: phone || null })
      setToast({ message: 'Profile updated.', severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate('/', { replace: true })
  }

  return (
    <Stack spacing={4} sx={{ maxWidth: 560 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar src={user.avatar_path ?? undefined} sx={{ width: 64, height: 64 }}>
          <PersonOutlinedIcon />
        </Avatar>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My account
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
            <Chip
              size="small"
              label={user.email_verified_at ? 'Email verified' : 'Email not verified'}
              color={user.email_verified_at ? 'success' : 'warning'}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField label="Email" value={user.email} disabled fullWidth />
          <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
              Save changes
            </Button>
            <Button variant="outlined" color="error" onClick={handleLogout} disabled={logoutMutation.isPending}>
              Log out
            </Button>
          </Stack>
        </Stack>
      </Paper>

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
