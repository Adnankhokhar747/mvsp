import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
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
import { useColorMode } from '../providers/ColorModeProvider'
import { useMe, useLogout } from '../../features/auth/hooks/useAuth'

const DRAWER_WIDTH = 260

const NAV_ITEMS = [
  { label: 'Overview', to: '/', icon: <DashboardOutlinedIcon />, enabled: true },
  { label: 'Vendors', to: '/vendors', icon: <StorefrontOutlinedIcon />, enabled: true },
  { label: 'Services', to: '/services', icon: <MiscellaneousServicesOutlinedIcon />, enabled: true },
  { label: 'Categories', to: '/categories', icon: <CategoryOutlinedIcon />, enabled: true },
  { label: 'Bookings', to: '/bookings', icon: <EventNoteOutlinedIcon />, enabled: true },
  { label: 'Payments', to: '/payments', icon: <PaymentsOutlinedIcon />, enabled: true },
  { label: 'Payouts', to: '/payouts', icon: <AccountBalanceWalletOutlinedIcon />, enabled: true },
  { label: 'Plans', to: '/plans', icon: <CardMembershipOutlinedIcon />, enabled: true },
  { label: 'Reviews', to: '/reviews', icon: <ReviewsOutlinedIcon />, enabled: true },
  { label: 'Activity Log', to: '/activity-logs', icon: <HistoryOutlinedIcon />, enabled: true },
  { label: 'Staff & Roles', to: '/staff', icon: <BadgeOutlinedIcon />, enabled: true },
  { label: 'Content', to: '/content', icon: <ArticleOutlinedIcon />, enabled: true },
  { label: 'Settings', to: '/settings', icon: <SettingsOutlinedIcon />, enabled: true },
]

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
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ServiceHub
          </Typography>
        </Toolbar>
        <List sx={{ px: 1.5 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.label}
              component={item.enabled ? NavLink : 'div'}
              to={item.enabled ? item.to : undefined}
              disabled={!item.enabled}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.active': {
                  bgcolor: 'action.selected',
                  fontWeight: 600,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} secondary={item.enabled ? undefined : 'Coming soon'} />
            </ListItemButton>
          ))}
        </List>
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
              <Avatar sx={{ width: 32, height: 32 }}>{user?.name.charAt(0)}</Avatar>
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
