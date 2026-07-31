import type { ReactNode } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { useColorMode } from '../providers/ColorModeProvider'
import { useLogout, useMe } from '../../features/auth/hooks/useAuth'

export function VendorLayout({ children }: { children: ReactNode }) {
  const { mode, toggle } = useColorMode()
  const { data: user } = useMe()
  const logoutMutation = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/bookings" underline="none" color="inherit">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ServiceHub Vendor
              </Typography>
            </Link>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {user && (
                <Link component={RouterLink} to="/bookings" underline="none" color="inherit">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Bookings
                  </Typography>
                </Link>
              )}
              {user && (
                <Link component={RouterLink} to="/services" underline="none" color="inherit">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Services
                  </Typography>
                </Link>
              )}
              {user && (
                <Link component={RouterLink} to="/profile" underline="none" color="inherit">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Profile
                  </Typography>
                </Link>
              )}
              {user && (
                <Link component={RouterLink} to="/wallet" underline="none" color="inherit">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Wallet
                  </Typography>
                </Link>
              )}
              {user && (
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  {user.name}
                </Typography>
              )}
              <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton onClick={toggle}>
                  {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
              {user && (
                <Tooltip title="Sign out">
                  <IconButton onClick={handleLogout} disabled={logoutMutation.isPending}>
                    <LogoutOutlinedIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
