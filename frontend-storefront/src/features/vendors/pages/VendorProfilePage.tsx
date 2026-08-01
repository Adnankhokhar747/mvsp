import { Link as RouterLink, useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Rating from '@mui/material/Rating'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import { useVendor, useVendorReviews } from '../hooks/useVendors'
import { useServices } from '../../services/hooks/useServices'
import { ServiceCard } from '../../services/components/ServiceCard'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'

export function VendorProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: vendor, isLoading, isError, refetch } = useVendor(slug)
  const { data: services, isLoading: servicesLoading } = useServices({ vendorId: vendor?.id })
  const { data: reviews } = useVendorReviews(vendor?.id)

  if (isError) {
    return <ErrorState message="Couldn't load this vendor." onRetry={() => refetch()} />
  }

  if (isLoading || !vendor) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={160} />
        <Skeleton width="40%" height={40} />
      </Stack>
    )
  }

  const avgRating = reviews?.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <Stack spacing={4}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar src={vendor.logo_path ?? undefined} sx={{ width: 72, height: 72 }}>
            <StorefrontOutlinedIcon />
          </Avatar>
          <Stack>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {vendor.business_name}
            </Typography>
            {!!reviews?.length && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Rating value={avgRating} readOnly precision={0.5} size="small" />
                <Typography variant="caption" color="text.secondary">
                  ({reviews.length} review{reviews.length === 1 ? '' : 's'})
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
        <Button
          component={RouterLink}
          to={`/vendors/${vendor.slug}/message`}
          variant="outlined"
          startIcon={<ChatBubbleOutlineOutlinedIcon />}
        >
          Message
        </Button>
      </Stack>

      {vendor.description && <Typography variant="body1">{vendor.description}</Typography>}

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Services
        </Typography>
        {!servicesLoading && services?.data.length === 0 ? (
          <EmptyState title="No services listed yet" />
        ) : (
          <Grid container spacing={2}>
            {servicesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="rounded" height={280} />
                  </Grid>
                ))
              : services?.data.map((service) => (
                  <Grid key={service.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <ServiceCard service={service} />
                  </Grid>
                ))}
          </Grid>
        )}
      </Stack>

      {!!reviews?.length && (
        <>
          <Divider />
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Reviews
            </Typography>
            <Stack spacing={2}>
              {reviews.map((review) => (
                <Paper key={review.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {review.customer?.name ?? 'Anonymous'}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Stack>
                    {review.service && (
                      <Typography variant="caption" color="text.secondary">
                        {review.service.title}
                      </Typography>
                    )}
                    {review.title && (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {review.title}
                      </Typography>
                    )}
                    {review.comment && <Typography variant="body2">{review.comment}</Typography>}
                    {review.vendor_reply && (
                      <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'action.hover' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Response from {vendor.business_name}
                        </Typography>
                        <Typography variant="body2">{review.vendor_reply}</Typography>
                      </Paper>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </>
      )}
    </Stack>
  )
}
