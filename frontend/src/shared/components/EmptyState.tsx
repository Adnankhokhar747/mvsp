import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{ py: 8, textAlign: 'center', color: 'text.secondary', alignItems: 'center' }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.5 }} />
      <Typography variant="h6" color="text.primary">
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  )
}
