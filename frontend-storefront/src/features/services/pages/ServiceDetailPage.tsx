import { Link as RouterLink, useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { useService } from '../hooks/useServices'
import { ErrorState } from '../../../shared/components/ErrorState'

function money(amount: number, currency: string, priceType: string) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
  return priceType === 'quote' ? 'Quote on request' : formatted
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: service, isLoading, isError, refetch } = useService(id ? Number(id) : undefined)

  if (isError) {
    return <ErrorState message="Couldn't load this service." onRetry={() => refetch()} />
  }

  if (isLoading || !service) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={320} />
        <Skeleton width="60%" height={40} />
        <Skeleton width="40%" />
      </Stack>
    )
  }

  const image = service.media[0]?.url
  const attributeEntries = Object.entries(service.attributes ?? {})

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 7 }}>
        {image ? (
          <Box
            component="img"
            src={image}
            alt={service.title}
            sx={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 2 }}
          />
        ) : (
          <Stack sx={{ height: 360, bgcolor: 'action.hover', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
            <StorefrontOutlinedIcon sx={{ fontSize: 64, opacity: 0.4 }} />
          </Stack>
        )}

        <Stack spacing={2} sx={{ mt: 3 }}>
          {service.category && (
            <Chip
              size="small"
              label={service.category.name}
              color="primary"
              variant="outlined"
              component={RouterLink}
              to={`/services?category=${service.category.slug}`}
              clickable
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {service.title}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Rating value={service.avg_rating} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              {service.avg_rating.toFixed(1)} ({service.review_count} review{service.review_count === 1 ? '' : 's'})
            </Typography>
          </Stack>

          {service.description && <Typography variant="body1">{service.description}</Typography>}

          {!!attributeEntries.length && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Details</Typography>
              <Grid container spacing={1}>
                {attributeEntries.map(([key, value]) => (
                  <Grid key={key} size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="body2">{String(value)}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {money(service.base_price, service.currency_code, service.price_type)}
            </Typography>
            {service.duration_minutes && (
              <Typography variant="body2" color="text.secondary">
                Approx. {service.duration_minutes} minutes
              </Typography>
            )}

            <Button
              component={RouterLink}
              to={`/services/${service.id}/book`}
              variant="contained"
              size="large"
              fullWidth
            >
              {service.price_type === 'quote' ? 'Request a quote' : 'Book now'}
            </Button>

            {!!service.packages.length && (
              <>
                <Divider />
                <Typography variant="subtitle2">Packages</Typography>
                <Stack spacing={1.5}>
                  {service.packages.map((pkg) => (
                    <Stack key={pkg.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {pkg.name}
                        </Typography>
                        {pkg.description && (
                          <Typography variant="caption" color="text.secondary">
                            {pkg.description}
                          </Typography>
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {money(pkg.price, service.currency_code, 'fixed')}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}

            <Divider />

            {service.vendor && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Provided by</Typography>
                <Link component={RouterLink} to={`/vendors/${service.vendor.slug}`} underline="hover">
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {service.vendor.business_name}
                  </Typography>
                </Link>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}
