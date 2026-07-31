import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <Stack spacing={1.5} sx={{ py: 8, textAlign: 'center', alignItems: 'center' }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Stack>
  )
}
