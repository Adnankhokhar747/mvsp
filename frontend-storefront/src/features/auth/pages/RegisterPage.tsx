import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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
import Link from '@mui/material/Link'
import { useRegister } from '../hooks/useAuth'
import { extractErrorMessage } from '../../../shared/lib/api-client'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(150),
    email: z.string().email('Enter a valid email'),
    phone: z.string().optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-zA-Z]/, 'Must include a letter')
      .regex(/[0-9]/, 'Must include a number'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: 'customer',
      })
      navigate('/verify-email', { state: { email: values.email } })
    } catch (error) {
      setServerError(extractErrorMessage(error))
    }
  })

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <Paper variant="outlined" sx={{ p: 5, width: 420 }}>
        <Stack spacing={0.5} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Book trusted services in minutes.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2.5}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
              label="Full name"
              autoFocus
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...registerField('name')}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              {...registerField('email')}
            />
            <TextField
              label="Phone (optional)"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              {...registerField('phone')}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              {...registerField('password')}
            />
            <TextField
              label="Confirm password"
              type="password"
              fullWidth
              error={!!errors.password_confirmation}
              helperText={errors.password_confirmation?.message}
              {...registerField('password_confirmation')}
            />

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting || registerMutation.isPending}>
              {isSubmitting || registerMutation.isPending ? 'Creating account…' : 'Create account'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
