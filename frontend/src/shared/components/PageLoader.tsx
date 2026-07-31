import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
      }}
    >
      <CircularProgress />
    </Box>
  )
}
