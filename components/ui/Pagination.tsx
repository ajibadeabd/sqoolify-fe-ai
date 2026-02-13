interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  pageSize?: number
  onPageChange: (page: number) => void
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis')
  }

  pages.push(total)

  return pages
}

export default function Pagination({ page, totalPages, total, pageSize = 10, onPageChange }: PaginationProps) {
  if (totalPages <= 1 && total == null) return null

  const pages = getPageNumbers(page, totalPages)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total ?? page * pageSize)

  const btnBase = 'inline-flex items-center justify-center h-9 min-w-[36px] px-2 text-sm rounded-lg border transition-colors'
  const btnDefault = `${btnBase} border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed`
  const btnActive = `${btnBase} bg-blue-600 text-white border-blue-600`

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
      {total != null && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{from}</span>–<span className="font-medium text-gray-700">{to}</span> of{' '}
          <span className="font-medium text-gray-700">{total}</span>
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className={btnDefault}
            title="First page"
          >
            «
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={btnDefault}
            title="Previous page"
          >
            ‹
          </button>

          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400 select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={p === page ? btnActive : btnDefault}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={btnDefault}
            title="Next page"
          >
            ›
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className={btnDefault}
            title="Last page"
          >
            »
          </button>
        </div>
      )}
    </div>
  )
}
