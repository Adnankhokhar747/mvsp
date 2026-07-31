import { useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import type { ServiceMedia } from '../types'

interface MediaGalleryProps {
  media: ServiceMedia[]
  onUpload: (file: File) => Promise<void>
}

export function MediaGallery({ media, onUpload }: MediaGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Stack spacing={1.5}>
      {error && <Alert severity="error">{error}</Alert>}
      {!!media.length && (
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          {media.map((item) => (
            <Box
              key={item.id}
              component="img"
              src={item.url}
              alt=""
              sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1.5 }}
            />
          ))}
        </Stack>
      )}
      {!media.length && (
        <Typography variant="body2" color="text.secondary">
          No photos yet.
        </Typography>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" hidden onChange={handleFileChange} />
      <Button
        variant="outlined"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        sx={{ alignSelf: 'flex-start' }}
      >
        {uploading ? 'Uploading…' : 'Upload photo'}
      </Button>
    </Stack>
  )
}
