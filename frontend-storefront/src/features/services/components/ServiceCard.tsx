import { Link as RouterLink } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Rating from '@mui/material/Rating'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import type { Service } from '../types'

function money(amount: number, currency: string, priceType: string) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
  return priceType === 'quote' ? 'Quote on request' : formatted
}

export function ServiceCard({ service }: { service: Service }) {
  const image = service.media[0]?.url

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={RouterLink}
        to={`/services/${service.id}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {image ? (
          <CardMedia component="img" image={image} alt={service.title} sx={{ height: 160, objectFit: 'cover' }} />
        ) : (
          <Stack sx={{ height: 160, bgcolor: 'action.hover', alignItems: 'center', justifyContent: 'center' }}>
            <StorefrontOutlinedIcon sx={{ fontSize: 40, opacity: 0.4 }} />
          </Stack>
        )}
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          {service.category && (
            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
              {service.category.name}
            </Typography>
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.25 }}>
            {service.title}
          </Typography>
          {service.vendor && (
            <Typography variant="body2" color="text.secondary">
              {service.vendor.business_name}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
            <Rating value={service.avg_rating} readOnly size="small" precision={0.5} />
            <Typography variant="caption" color="text.secondary">
              ({service.review_count})
            </Typography>
          </Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
            {money(service.base_price, service.currency_code, service.price_type)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
