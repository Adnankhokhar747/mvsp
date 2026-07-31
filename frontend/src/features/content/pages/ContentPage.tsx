import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import {
  useCmsPages,
  useDeleteCmsPage,
  useDeleteNotificationTemplate,
  useLegalDocuments,
  useNotificationTemplates,
  usePublishLegalDocument,
  useUpdateCmsPage,
  useUpdateNotificationTemplate,
} from '../hooks/useContent'
import { CmsPageFormDialog } from '../components/CmsPageFormDialog'
import { LegalDocumentFormDialog } from '../components/LegalDocumentFormDialog'
import { NotificationTemplateFormDialog } from '../components/NotificationTemplateFormDialog'
import { extractErrorMessage } from '../../../shared/lib/api-client'
import { EmptyState } from '../../../shared/components/EmptyState'
import type { CmsPage, NotificationTemplate } from '../types'

export function ContentPage() {
  const [tab, setTab] = useState(0)
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)
  const notify = (message: string, severity: 'success' | 'error') => setToast({ message, severity })

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" fontWeight={700}>
          Content
        </Typography>
        <Typography color="text.secondary">Manage CMS pages, legal documents, and notification templates.</Typography>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label="Pages" />
          <Tab label="Legal Documents" />
          <Tab label="Notification Templates" />
        </Tabs>

        <Stack sx={{ p: 3 }}>
          {tab === 0 && <PagesPanel notify={notify} />}
          {tab === 1 && <LegalPanel notify={notify} />}
          {tab === 2 && <TemplatesPanel notify={notify} />}
        </Stack>
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

function PagesPanel({ notify }: { notify: (m: string, s: 'success' | 'error') => void }) {
  const { data: pages, isLoading } = useCmsPages()
  const updateMutation = useUpdateCmsPage()
  const deleteMutation = useDeleteCmsPage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CmsPage | null>(null)

  const handleTogglePublished = async (page: CmsPage) => {
    try {
      await updateMutation.mutateAsync({ id: page.id, payload: { is_published: !page.is_published } })
      notify(`${page.title} ${!page.is_published ? 'published' : 'unpublished'}.`, 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  const handleDelete = async (page: CmsPage) => {
    try {
      await deleteMutation.mutateAsync(page.id)
      notify('Page deleted.', 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          New page
        </Button>
      </Stack>

      {!isLoading && pages?.length === 0 ? (
        <EmptyState title="No pages yet" description="Create your first CMS page." />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Page</TableCell>
                <TableCell>Locale</TableCell>
                <TableCell>Published</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages?.map((page) => (
                <TableRow key={page.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{page.title}</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      /{page.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{page.locale}</TableCell>
                  <TableCell>
                    <Switch checked={page.is_published} onChange={() => handleTogglePublished(page)} disabled={updateMutation.isPending} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditing(page)
                        setDialogOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(page)} disabled={deleteMutation.isPending}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CmsPageFormDialog open={dialogOpen} page={editing} onClose={() => setDialogOpen(false)} onNotify={notify} />
    </Stack>
  )
}

function LegalPanel({ notify }: { notify: (m: string, s: 'success' | 'error') => void }) {
  const { data: documents, isLoading } = useLegalDocuments()
  const publishMutation = usePublishLegalDocument()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handlePublish = async (id: number) => {
    try {
      await publishMutation.mutateAsync(id)
      notify('Version published.', 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" startIcon={<AddOutlinedIcon />} onClick={() => setDialogOpen(true)}>
          New version
        </Button>
      </Stack>

      {!isLoading && documents?.length === 0 ? (
        <EmptyState title="No legal documents yet" description="Create your first version." />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents?.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Typography fontFamily="monospace">{doc.type}</Typography>
                  </TableCell>
                  <TableCell>{doc.version}</TableCell>
                  <TableCell>
                    {doc.published_at ? (
                      <Chip size="small" label="Published" color="success" variant="outlined" />
                    ) : (
                      <Chip size="small" label="Draft" color="warning" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    {!doc.published_at && (
                      <Button size="small" onClick={() => handlePublish(doc.id)} disabled={publishMutation.isPending}>
                        Publish
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <LegalDocumentFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onNotify={notify} />
    </Stack>
  )
}

function TemplatesPanel({ notify }: { notify: (m: string, s: 'success' | 'error') => void }) {
  const { data: templates, isLoading } = useNotificationTemplates()
  const updateMutation = useUpdateNotificationTemplate()
  const deleteMutation = useDeleteNotificationTemplate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NotificationTemplate | null>(null)

  const handleToggleActive = async (template: NotificationTemplate) => {
    try {
      await updateMutation.mutateAsync({ id: template.id, payload: { is_active: !template.is_active } })
      notify(`${template.key} ${!template.is_active ? 'activated' : 'deactivated'}.`, 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  const handleDelete = async (template: NotificationTemplate) => {
    try {
      await deleteMutation.mutateAsync(template.id)
      notify('Template deleted.', 'success')
    } catch (error) {
      notify(extractErrorMessage(error), 'error')
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          New template
        </Button>
      </Stack>

      {!isLoading && templates?.length === 0 ? (
        <EmptyState title="No templates yet" description="Create your first notification template." />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Channel</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates?.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Typography fontFamily="monospace">{template.key}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.locale}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{template.channel}</TableCell>
                  <TableCell>{template.subject ?? '—'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={template.is_active}
                      onChange={() => handleToggleActive(template)}
                      disabled={updateMutation.isPending}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditing(template)
                        setDialogOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(template)} disabled={deleteMutation.isPending}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <NotificationTemplateFormDialog
        open={dialogOpen}
        template={editing}
        onClose={() => setDialogOpen(false)}
        onNotify={notify}
      />
    </Stack>
  )
}
