import { useState, useRef } from 'react'
import Papa from 'papaparse'
import Modal from './Modal'
import Button from './Button'

interface CsvColumn {
  key: string
  label: string
  required?: boolean
}

interface CsvImportModalProps {
  open: boolean
  onClose: () => void
  title: string
  columns: CsvColumn[]
  templateRows: Record<string, string>[]
  templateFilename: string
  onImport: (data: Record<string, string>[]) => Promise<{ successCount: number; failureCount: number; errors?: string[] }>
}

export default function CsvImportModal({
  open,
  onClose,
  title,
  columns,
  templateRows,
  templateFilename,
  onImport,
}: CsvImportModalProps) {
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredColumns = columns.filter(c => c.required).map(c => c.key)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setParsedData([])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          const headers = results.meta.fields || []

          // Validate required columns
          for (const req of requiredColumns) {
            if (!headers.includes(req)) {
              throw new Error(`Missing required column: "${req}"`)
            }
          }

          const rows = results.data as Record<string, string>[]

          // Validate required fields per row
          for (let i = 0; i < rows.length; i++) {
            for (const req of requiredColumns) {
              if (!rows[i][req]?.trim()) {
                throw new Error(`Row ${i + 2}: "${req}" is required`)
              }
            }
          }

          if (rows.length === 0) {
            throw new Error('No data rows found in CSV')
          }

          setParsedData(rows)
        } catch (err: any) {
          setError(err.message)
        }
      },
      error(err) {
        setError(`CSV parse error: ${err.message}`)
      },
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return
    setImporting(true)
    try {
      const result = await onImport(parsedData)
      if (result.failureCount > 0) {
        setError(
          `${result.successCount} imported, ${result.failureCount} failed.\n${(result.errors || []).join('\n')}`
        )
        // Keep modal open so user can see errors
        setParsedData([])
      } else {
        handleClose()
      }
    } catch (err: any) {
      setError(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setParsedData([])
    setError('')
    onClose()
  }

  const downloadTemplate = () => {
    const header = columns.map(c => c.key).join(',')
    const rows = templateRows.map(row =>
      columns.map(c => {
        const val = row[c.key] || ''
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
      }).join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = templateFilename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Show up to 5 columns in preview
  const previewColumns = columns.slice(0, 5)

  return (
    <Modal open={open} onClose={handleClose} title={title} size="lg">
      {/* Template download */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700 mb-2">
          Download the CSV template to see the expected format. Fill it in and upload below.
        </p>
        <button
          onClick={downloadTemplate}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
        >
          Download CSV Template
        </button>
      </div>

      {/* Column info */}
      <div className="mb-4 text-xs text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Required columns:</p>
        <p>{requiredColumns.map(c => <code key={c} className="bg-gray-100 px-1 rounded mr-1">{c}</code>)}</p>
        {columns.filter(c => !c.required).length > 0 && (
          <p className="mt-1">
            <span className="font-medium text-gray-700">Optional: </span>
            {columns.filter(c => !c.required).map(c => c.key).join(', ')}
          </p>
        )}
      </div>

      {/* File upload */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Preview */}
      {parsedData.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Preview ({parsedData.length} rows)
          </p>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500">#</th>
                  {previewColumns.map(c => (
                    <th key={c.key} className="px-3 py-2 text-left text-gray-500">{c.label}</th>
                  ))}
                  {columns.length > 5 && (
                    <th className="px-3 py-2 text-left text-gray-400">+{columns.length - 5} more</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    {previewColumns.map(c => (
                      <td key={c.key} className="px-3 py-2 max-w-[150px] truncate">{row[c.key] || '-'}</td>
                    ))}
                    {columns.length > 5 && <td className="px-3 py-2 text-gray-400">...</td>}
                  </tr>
                ))}
                {parsedData.length > 10 && (
                  <tr>
                    <td colSpan={previewColumns.length + 2} className="px-3 py-2 text-center text-gray-400 text-xs">
                      ...and {parsedData.length - 10} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          loading={importing}
          disabled={parsedData.length === 0}
        >
          Import {parsedData.length > 0 ? `${parsedData.length} Records` : ''}
        </Button>
      </div>
    </Modal>
  )
}
