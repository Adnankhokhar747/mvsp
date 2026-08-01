import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import MiscellaneousServicesOutlinedIcon from '@mui/icons-material/MiscellaneousServicesOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { useColorMode } from '../providers/ColorModeProvider'
import { useMe, useLogout } from '../../features/auth/hooks/useAuth'

const DRAWER_WIDTH = 236

const NAV_SECTIONS = [
  {
    label: null,
    items: [{ label: 'Overview', to: '/', icon: <DashboardOutlinedIcon fontSize="small" /> }],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Vendors', to: '/vendors', icon: <StorefrontOutlinedIcon fontSize="small" /> },
      { label: 'Services', to: '/services', icon: <MiscellaneousServicesOutlinedIcon fontSize="small" /> },
      { label: 'Categories', to: '/categories', icon: <CategoryOutlinedIcon fontSize="small" /> },
      { label: 'Bookings', to: '/bookings', icon: <EventNoteOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payments', to: '/payments', icon: <PaymentsOutlinedIcon fontSize="small" /> },
      { label: 'Payouts', to: '/payouts', icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
      { label: 'Plans', to: '/plans', icon: <CardMembershipOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Reviews', to: '/reviews', icon: <ReviewsOutlinedIcon fontSize="small" /> },
      { label: 'Activity Log', to: '/activity-logs', icon: <HistoryOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Staff & Roles', to: '/staff', icon: <BadgeOutlinedIcon fontSize="small" /> },
      { label: 'Content', to: '/content', icon: <ArticleOutlinedIcon fontSize="small" /> },
      { label: 'Settings', to: '/settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
    ],
  },
]

function LogoMark() {
  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '8px',
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <CheckRoundedIcon sx={{ color: 'primary.contrastText', fontSize: 16 }} />
    </Box>
  )
}

export function AdminLayout({ children }: { children: ReactNode }) {
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar sx={{ px: 2.25 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LogoMark />
            <Typography sx={{ fontWeight: 700, letterSpacing: '-0.01em', fontSize: '1.0625rem' }}>
              ServiceHub
            </Typography>
          </Stack>
        </Toolbar>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            px: 1.5,
            pb: 2,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'divider', borderRadius: 3 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          }}
        >
          {NAV_SECTIONS.map((section, i) => (
            <Box key={section.label ?? i} sx={{ mb: 1 }}>
              {section.label && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    px: 1.25,
                    pt: 1.5,
                    pb: 0.5,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    fontSize: '0.6875rem',
                  }}
                >
                  {section.label}
                </Typography>
              )}
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {section.items.map((item) => (
                  <ListItemButton
                    key={item.label}
                    component={NavLink}
                    to={item.to}
                    end={item.to === '/'}
                    sx={{
                      borderRadius: 1.5,
                      py: 0.625,
                      pl: 1.25,
                      minHeight: 32,
                      borderLeft: '3px solid transparent',
                      color: 'text.secondary',
                      '& .MuiListItemIcon-root': { color: 'text.secondary' },
                      '&.active': {
                        bgcolor: 'action.selected',
                        borderLeftColor: 'primary.main',
                        color: 'primary.main',
                        fontWeight: 600,
                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                      },
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, '& svg': { fontSize: 18 } }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 'inherit' } } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          ))}
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton onClick={toggle}>
                {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </Tooltip>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 600 }}>
                {user?.name.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
