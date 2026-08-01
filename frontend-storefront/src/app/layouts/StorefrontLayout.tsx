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
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { useColorMode } from '../providers/ColorModeProvider'
import { useMe } from '../../features/auth/hooks/useAuth'

function LogoMark() {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '8px',
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <CheckRoundedIcon sx={{ color: 'primary.contrastText', fontSize: 18 }} />
    </Box>
  )
}

function NavLinkText({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      color="inherit"
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    </Link>
  )
}

export function StorefrontLayout({ children }: { children: ReactNode }) {
  const { mode, toggle } = useColorMode()
  const { data: user } = useMe()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/" underline="none" color="inherit">
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <LogoMark />
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                  ServiceHub
                </Typography>
              </Stack>
            </Link>

            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <NavLinkText to="/services">Browse services</NavLinkText>
              <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton onClick={toggle}>
                  {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
              {user ? (
                <>
                  <NavLinkText to="/bookings">My bookings</NavLinkText>
                  <NavLinkText to="/messages">Messages</NavLinkText>
                  <Tooltip title="My account">
                    <IconButton component={RouterLink} to="/account">
                      <PersonOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <NavLinkText to="/login">Sign in</NavLinkText>
                  <Button component={RouterLink} to="/register" variant="contained" size="small" sx={{ ml: 0.5 }}>
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
