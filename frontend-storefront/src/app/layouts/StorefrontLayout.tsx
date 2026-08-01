import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import { useColorMode } from '../providers/ColorModeProvider'
import { useMe } from '../../features/auth/hooks/useAuth'

export function StorefrontLayout({ children }: { children: ReactNode }) {
  const { mode, toggle } = useColorMode()
  const { data: user } = useMe()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/" underline="none" color="inherit">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ServiceHub
              </Typography>
            </Link>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Link component={RouterLink} to="/services" underline="none" color="inherit">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Browse services
                </Typography>
              </Link>
              <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton onClick={toggle}>
                  {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
              {user ? (
                <>
                  <Link component={RouterLink} to="/bookings" underline="none" color="inherit">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      My bookings
                    </Typography>
                  </Link>
                  <Link component={RouterLink} to="/messages" underline="none" color="inherit">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Messages
                    </Typography>
                  </Link>
                  <Tooltip title="My account">
                    <IconButton component={RouterLink} to="/account">
                      <PersonOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Link component={RouterLink} to="/login" underline="none" color="inherit">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Sign in
                    </Typography>
                  </Link>
                  <Button component={RouterLink} to="/register" variant="contained" size="small">
                    Sign up
                  </Button>
                </>
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

      <Divider />
      <Box component="footer" sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} ServiceHub. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
