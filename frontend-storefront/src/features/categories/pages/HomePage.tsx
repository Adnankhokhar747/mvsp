import { Link as RouterLink } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import { useCategories } from '../hooks/useCategories'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'

export function HomePage() {
  const { data: categories, isLoading, isError, refetch } = useCategories()

  return (
    <Stack spacing={4}>
      <Stack spacing={1} sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h3">Find a service you can trust</Typography>
        <Typography variant="body1" color="text.secondary">
          Browse categories from vetted local vendors, or search for exactly what you need.
        </Typography>
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
                  <Skeleton variant="rounded" height={140} />
                </Grid>
              ))
            : categories?.map((category) => (
                <Grid key={category.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardActionArea
                      component={RouterLink}
                      to={`/services?category=${category.slug}`}
                      sx={{ height: '100%', p: 1 }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                          <CategoryOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
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
  )
}
