import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useModerateReview, useReviews } from '../hooks/useReviews'
import { ReviewStatusChip } from '../components/ReviewStatusChip'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { Review, ReviewStatus } from '../types'

const STATUS_OPTIONS: Array<{ label: string; value: ReviewStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'Flagged', value: 'flagged' },
]

export function ReviewsListPage() {
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const { data, isLoading, isError, refetch } = useReviews({ page, status })
  const moderateMutation = useModerateReview()

  const handleModerate = async (review: Review, next: ReviewStatus) => {
    try {
      await moderateMutation.mutateAsync({ id: review.id, status: next })
      setToast({ message: `Review marked as ${next}.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
          Reviews
        </Typography>
        <Typography color="text.secondary">Moderate customer reviews left on vendor services.</Typography>
      </Stack>

      <TextField
        select
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as ReviewStatus | 'all')
          setPage(1)
        }}
        sx={{ minWidth: 180 }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load reviews." onRetry={() => refetch()} />
        ) : !isLoading && data?.data.length === 0 ? (
          <EmptyState title="No reviews found" description="Try a different filter." />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service / Vendor</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data?.data.map((review) => (
                      <TableRow key={review.id} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{review.service?.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.vendor?.business_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{review.customer?.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Rating value={review.rating} readOnly size="small" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 320 }}>
                          {review.title && (
                            <Typography variant="body2" fontWeight={600}>
                              {review.title}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {review.comment}
                          </Typography>
                          {review.vendor_reply && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Vendor reply: {review.vendor_reply}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <ReviewStatusChip status={review.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            {review.status !== 'published' && (
                              <Button size="small" onClick={() => handleModerate(review, 'published')} disabled={moderateMutation.isPending}>
                                Publish
                              </Button>
                            )}
                            {review.status !== 'hidden' && (
                              <Button size="small" onClick={() => handleModerate(review, 'hidden')} disabled={moderateMutation.isPending}>
                                Hide
                              </Button>
                            )}
                            {review.status !== 'flagged' && (
                              <Button size="small" color="warning" onClick={() => handleModerate(review, 'flagged')} disabled={moderateMutation.isPending}>
                                Flag
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data && (
          <TablePagination
            component="div"
            count={data.meta.total}
            page={data.meta.current_page - 1}
            rowsPerPage={data.meta.per_page}
            rowsPerPageOptions={[data.meta.per_page]}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
          />
        )}
      </Paper>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Stack>
  )
}
