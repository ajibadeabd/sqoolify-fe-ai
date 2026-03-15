import type { Editor } from 'grapesjs'
import { getStoredToken } from '../../lib/auth-context'

export function configureAssetManager(editor: Editor) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

  editor.on('asset:upload:start', () => {
    console.log('Asset upload started')
  })

  editor.on('asset:upload:end', () => {
    console.log('Asset upload ended')
  })

  editor.on('asset:upload:error', (err: any) => {
    console.log('Asset upload error:', err)
  })

  // Override the default upload handler
  const am = editor.AssetManager
  const originalUpload = am.config.uploadFile as any

  am.config.uploadFile = async (e: any) => {
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const token = getStoredToken()
        const res = await fetch(`${apiUrl}/storage/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const json = await res.json()
        const url = json.data?.url || json.url

        if (url) {
          editor.AssetManager.add({ src: url, type: 'image' })
          // If we're in image selection context, set the src
          const selected = editor.getSelected()
          if (selected && selected.is('image')) {
            selected.addAttributes({ src: url })
          }
        }
      } catch (err) {
        console.log('Failed to upload asset:', err)
      }
    }
  }
}
