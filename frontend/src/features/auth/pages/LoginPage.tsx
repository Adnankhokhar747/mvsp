import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { motion } from 'framer-motion'
import { useLogin } from '../hooks/useAuth'
import { extractErrorMessage } from '../../../shared/lib/api-client'

const schema = z.object({
  login: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await loginMutation.mutateAsync({ ...values, device_name: 'admin-web' })
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setServerError(extractErrorMessage(error))
    }
  })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper elevation={0} sx={{ p: 5, width: 400, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={0.5} sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={700}>
              ServiceHub Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage the platform
            </Typography>
          </Stack>

          <Box component="form" onSubmit={onSubmit} noValidate>
            <Stack spacing={2.5}>
              {serverError && <Alert severity="error">{serverError}</Alert>}

              <TextField
                label="Email or phone"
                autoFocus
                fullWidth
                error={!!errors.login}
                helperText={errors.login?.message}
                {...register('login')}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || loginMutation.isPending}
              >
                {isSubmitting || loginMutation.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  )
}
