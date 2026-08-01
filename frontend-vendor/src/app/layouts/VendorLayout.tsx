import { useState } from 'react'
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
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { useColorMode } from '../providers/ColorModeProvider'
import { useLogout, useMe } from '../../features/auth/hooks/useAuth'

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

export function VendorLayout({ children }: { children: ReactNode }) {
  const { mode, toggle } = useColorMode()
  const { data: user } = useMe()
  const logoutMutation = useLogout()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = async () => {
    setAnchorEl(null)
    await logoutMutation.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/bookings" underline="none" color="inherit">
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <LogoMark />
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                  ServiceHub Vendor
                </Typography>
              </Stack>
            </Link>

            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              {user && (
                <>
                  <NavLinkText to="/bookings">Bookings</NavLinkText>
                  <NavLinkText to="/services">Services</NavLinkText>
                  <NavLinkText to="/profile">Profile</NavLinkText>
                  <NavLinkText to="/wallet">Wallet</NavLinkText>
                  <NavLinkText to="/messages">Messages</NavLinkText>
                </>
              )}
              <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <IconButton onClick={toggle}>
                  {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
              {user && (
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 600 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <MenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                      <ListItemIcon>
                        <LogoutOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      Log out
                    </MenuItem>
                  </Menu>
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
    </Box>
  )
}
