import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import Skeleton from '@mui/material/Skeleton'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import { useCategories } from '../hooks/useCategories'
import { useServices } from '../../services/hooks/useServices'
import { ServiceCard } from '../../services/components/ServiceCard'
import { useMe } from '../../auth/hooks/useAuth'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'

const VALUE_PROPS = [
  {
    icon: <VerifiedUserOutlinedIcon />,
    title: 'Vetted vendors',
    description: 'Every business submits verification documents before going live.',
  },
  {
    icon: <ReviewsOutlinedIcon />,
    title: 'Verified reviews',
    description: 'Ratings only come from customers who actually completed a booking.',
  },
  {
    icon: <LockOutlinedIcon />,
    title: 'Secure by design',
    description: 'Your account and booking details are protected end to end.',
  },
  {
    icon: <BoltOutlinedIcon />,
    title: 'Fast booking',
    description: 'Pick an open slot and confirm in minutes — no back-and-forth calls.',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { data: categories, isLoading, isError, refetch } = useCategories()
  const { data: topRated, isLoading: topRatedLoading } = useServices({ sort: '-rating', page: 1 })

  const [query, setQuery] = useState('')

  const handleSearch = () => {
    navigate(query.trim() ? `/services?search=${encodeURIComponent(query.trim())}` : '/services')
  }

  const featuredServices = (topRated?.data ?? []).filter((s) => s.review_count > 0).slice(0, 4)

  return (
    <Stack spacing={8} sx={{ pb: 6 }}>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 9 },
          textAlign: 'center',
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'radial-gradient(120% 140% at 50% 0%, #E0F2FE 0%, #F8FAFC 60%)'
              : 'radial-gradient(120% 140% at 50% 0%, #0C2A3D 0%, #0B1120 60%)',
        }}
      >
        <Stack spacing={2.5} sx={{ alignItems: 'center', maxWidth: 720, mx: 'auto' }}>
          <Chip
            label="Trusted by local service businesses"
            size="small"
            sx={{ bgcolor: 'background.paper', fontWeight: 600 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Find a service you can trust
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
            Browse categories from vetted local vendors, or search for exactly what you need.
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 0.75,
              mt: 1,
              width: '100%',
              maxWidth: 560,
              display: 'flex',
              gap: 1,
              borderRadius: 2.5,
              bgcolor: 'background.paper',
            }}
          >
            <TextField
              placeholder="Try “home cleaning” or “electrician”…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" color="disabled" />
                    </InputAdornment>
                  ),
                },
              }}
              variant="standard"
              sx={{ px: 1, '& .MuiInput-root:before, & .MuiInput-root:after': { display: 'none' } }}
            />
            <Button variant="contained" onClick={handleSearch} sx={{ flexShrink: 0, px: 3 }}>
              Search
            </Button>
          </Paper>

          {!!categories?.length && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center', rowGap: 1 }}>
              {categories.slice(0, 5).map((category) => (
                <Chip
                  key={category.id}
                  component={RouterLink}
                  to={`/services?category=${category.slug}`}
                  label={category.name}
                  clickable
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Value props / trust */}
      <Grid container spacing={2.5}>
        {VALUE_PROPS.map((prop) => (
          <Grid key={prop.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1.25}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {prop.icon}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {prop.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {prop.description}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>

      {/* Categories */}
      <Stack spacing={3}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Browse by category
          </Typography>
          <Typography color="text.secondary">Jump straight to the kind of help you need.</Typography>
        </Stack>

        {isError ? (
          <ErrorState message="Couldn't load categories." onRetry={() => refetch()} />
        ) : !isLoading && categories?.length === 0 ? (
          <EmptyState title="No categories yet" description="Check back soon." />
        ) : (
          <Grid container spacing={2}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Skeleton variant="rounded" height={148} />
                  </Grid>
                ))
              : categories?.map((category) => (
                  <Grid key={category.id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        transition: 'transform 150ms ease, box-shadow 150ms ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                      }}
                    >
                      <CardActionArea
                        component={RouterLink}
                        to={`/services?category=${category.slug}`}
                        sx={{ height: '100%', p: 1.5 }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 1 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: 'action.hover',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 1.25,
                            }}
                          >
                            <CategoryOutlinedIcon sx={{ fontSize: 26 }} />
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {category.name}
                          </Typography>
                          {category.description && (
                            <Typography variant="caption" color="text.secondary">
                              {category.description}
                            </Typography>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
          </Grid>
        )}
      </Stack>

      {/* Top-rated services */}
      {(topRatedLoading || featuredServices.length > 0) && (
        <Stack spacing={3}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Top-rated services
              </Typography>
              <Typography color="text.secondary">Highly rated by customers who've booked before.</Typography>
            </Stack>
            <Button component={RouterLink} to="/services" variant="outlined">
              View all
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {topRatedLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="rounded" height={280} />
                  </Grid>
                ))
              : featuredServices.map((service) => (
                  <Grid key={service.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <ServiceCard service={service} />
                  </Grid>
                ))}
          </Grid>
        </Stack>
      )}

      {/* Closing CTA */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          border: 'none',
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 480, mx: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Ready to get started?
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>
            Browse hundreds of services from vetted local vendors, or create an account to book in minutes.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
            <Button
              component={RouterLink}
              to="/services"
              variant="contained"
              size="large"
              sx={{ bgcolor: 'background.paper', color: 'primary.main', '&:hover': { bgcolor: 'background.paper' } }}
            >
              Browse services
            </Button>
            {!me && (
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                size="large"
                sx={{ borderColor: 'primary.contrastText', color: 'primary.contrastText' }}
              >
                Sign up free
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}
