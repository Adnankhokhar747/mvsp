import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { useAdminCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../hooks/useCategories'
import { CategoryFormDialog } from '../components/CategoryFormDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import type { Category, CategoryFormValues } from '../types'

function flatten(categories: Category[], depth = 0): Array<{ category: Category; depth: number }> {
  return categories.flatMap((category) => [
    { category, depth },
    ...flatten(category.children ?? [], depth + 1),
  ])
}

export function CategoriesListPage() {
  const { data: categories, isLoading, isError, refetch } = useAdminCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const rows = useMemo(() => flatten(categories ?? []), [categories])
  const flatForParentSelect = rows.map((r) => r.category)

  const openCreate = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, payload: values })
        setToast({ message: 'Category updated.', severity: 'success' })
      } else {
        await createMutation.mutateAsync(values)
        setToast({ message: 'Category created.', severity: 'success' })
      }
      setDialogOpen(false)
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setToast({ message: `${deleteTarget.name} deleted.`, severity: 'success' })
    } catch (error) {
      setToast({ message: extractErrorMessage(error), severity: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Stack>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Categories
          </Typography>
          <Typography color="text.secondary">
            Define the service verticals on the platform and the custom fields each one collects.
          </Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
          New category
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {isError ? (
          <ErrorState message="Couldn't load categories." onRetry={() => refetch()} />
        ) : !isLoading && rows.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create your first category to start onboarding vendors."
            action={
              <Button variant="contained" onClick={openCreate}>
                New category
              </Button>
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Custom fields</TableCell>
                  <TableCell>Booking modes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rows.map(({ category, depth }) => (
                      <TableRow key={category.id} hover>
                        <TableCell>
                          <Typography sx={{ pl: depth * 3, fontWeight: depth === 0 ? 600 : 400 }}>
                            {depth > 0 && '— '}
                            {category.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {category.attribute_schema?.length
                              ? `${category.attribute_schema.length} field${category.attribute_schema.length === 1 ? '' : 's'}`
                              : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {category.booking_mode_allowed.map((mode) => (
                              <Chip key={mode} size="small" label={mode === 'slot' ? 'Time slots' : 'Quote'} variant="outlined" />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={category.is_active ? 'Active' : 'Inactive'}
                            color={category.is_active ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(category)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteTarget(category)}>
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CategoryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        category={editingCategory}
        parentOptions={flatForParentSelect}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete <strong>{deleteTarget?.name}</strong>. Categories with existing
            subcategories or services can't be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Stack>
  )
}
