import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import { useSendOtp, useVerifyOtp } from '../hooks/useAuth'
import { extractErrorMessage } from '../../../shared/lib/api-client'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = (location.state as { email?: string } | null)?.email ?? ''

  const [email, setEmail] = useState(emailFromState)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const verifyMutation = useVerifyOtp()
  const resendMutation = useSendOtp()

  const handleVerify = async () => {
    setError(null)
    setResendMessage(null)
    if (!email.trim()) {
      setError('Enter the email you registered with.')
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.')
      return
    }
    try {
      await verifyMutation.mutateAsync({ email, purpose: 'email_verification', code })
      navigate('/login', { state: { verified: true } })
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleResend = async () => {
    setError(null)
    setResendMessage(null)
    if (!email.trim()) {
      setError('Enter the email you registered with.')
      return
    }
    try {
      await resendMutation.mutateAsync({ email, purpose: 'email_verification' })
      setResendMessage('A new code has been sent.')
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <Paper variant="outlined" sx={{ p: 5, width: 420 }}>
        <Stack spacing={0.5} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Verify your email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter the 6-digit code we sent to your email address.
          </Typography>
        </Stack>

        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}
          {resendMessage && <Alert severity="success">{resendMessage}</Alert>}

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Verification code"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            slotProps={{ htmlInput: { maxLength: 6, inputMode: 'numeric' } }}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleVerify}
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? 'Verifying…' : 'Verify email'}
          </Button>

          <Button variant="text" onClick={handleResend} disabled={resendMutation.isPending}>
            Resend code
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login">
              Back to sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
