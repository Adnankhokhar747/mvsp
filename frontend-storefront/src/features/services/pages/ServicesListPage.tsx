import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Pagination from '@mui/material/Pagination'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { useServices } from '../hooks/useServices'
import { ServiceCard } from '../components/ServiceCard'
import { ErrorState } from '../../../shared/components/ErrorState'
import { EmptyState } from '../../../shared/components/EmptyState'
import type { ServiceListParams } from '../api/services-api'

const SORT_OPTIONS: Array<{ label: string; value: NonNullable<ServiceListParams['sort']> }> = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low to high', value: 'price' },
  { label: 'Price: high to low', value: '-price' },
  { label: 'Top rated', value: '-rating' },
]

export function ServicesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? undefined
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [sort, setSort] = useState<NonNullable<ServiceListParams['sort']>>('newest')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useServices({ page, category, search, sort })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    const next = new URLSearchParams(searchParams)
    if (value) next.set('search', value)
    else next.delete('search')
    setSearchParams(next, { replace: true })
  }

  const clearCategory = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('category')
    setSearchParams(next, { replace: true })
    setPage(1)
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Browse services
        </Typography>
        {category && (
          <Typography color="text.secondary">
            Filtered by category{' '}
            <Typography
              component="span"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 600 }}
              onClick={clearCategory}
            >
              (clear)
            </Typography>
          </Typography>
        )}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search services…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as NonNullable<ServiceListParams['sort']>)
            setPage(1)
          }}
          sx={{ minWidth: 200 }}
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isError ? (
        <ErrorState message="Couldn't load services." onRetry={() => refetch()} />
      ) : !isLoading && data?.data.length === 0 ? (
        <EmptyState title="No services found" description="Try a different search or filter." />
      ) : (
        <>
          <Grid container spacing={2}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="rounded" height={280} />
                  </Grid>
                ))
              : data?.data.map((service) => (
                  <Grid key={service.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <ServiceCard service={service} />
                  </Grid>
                ))}
          </Grid>

          {data && data.meta.last_page > 1 && (
            <Stack sx={{ alignItems: 'center', pt: 2 }}>
              <Pagination
                count={data.meta.last_page}
                page={data.meta.current_page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
