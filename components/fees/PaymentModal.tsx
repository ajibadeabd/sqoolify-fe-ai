import Badge from '../ui/Badge'

interface PaymentModalProps {
  studentFee: any
  paying: boolean
  payingTerm?: number | null
  error: string
  onPayTerm?: (term: number) => void
  onPayAll?: () => void
  onPay?: () => void
  onClose: () => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

const formatDate = (date: string | Date | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
}

function getTermPaid(studentFee: any, termNumber: number): number {
  return (studentFee.payments || [])
    .filter((p: any) => p.term === termNumber)
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
}

export default function PaymentModal({ studentFee, paying, payingTerm = null, error, onPayTerm, onPayAll, onPay, onClose }: PaymentModalProps) {
  const fee = studentFee.fee
  const terms = fee?.terms || []
  const feeTotal = terms.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
  const unpaidTerms = terms.filter((t: any) => {
    const paid = getTermPaid(studentFee, t.term)
    return paid < t.amount
  })
  const isPayingAll = paying && payingTerm === null
  const className = fee?.class?.name
    ? `${fee.class.name}${fee.class.section ? ` - ${fee.class.section}` : ''}`
    : null
  const sessionName = fee?.session?.name || null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Payment Summary</h3>
            <p className="text-blue-100 text-sm">
              {[className, sessionName].filter(Boolean).join(' / ') || 'School Fee'}
            </p>
          </div>
          <Badge variant={statusVariant[studentFee.status] || 'default'}>
            {studentFee.status}
          </Badge>
        </div>

        <div className="p-6">
          {/* Student info */}
          {studentFee.student?.user && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student</p>
              <p className="text-sm font-medium text-gray-800">
                {studentFee.student.user.firstName} {studentFee.student.user.lastName}
              </p>
            </div>
          )}

          {/* Per-term breakdown with individual pay buttons */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pay Per Term</p>
            <div className="space-y-3">
              {terms.map((term: any) => {
                const termPaid = getTermPaid(studentFee, term.term)
                const termBalance = Math.max(term.amount - termPaid, 0)
                const isPaid = termBalance <= 0
                const isPayingThis = paying && payingTerm === term.term

                return (
                  <div key={term.term} className={`rounded-lg border p-4 ${isPaid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">Term {term.term}</span>
                        {term.dueDate && (
                          <span className="text-xs text-gray-400 ml-2">Due: {formatDate(term.dueDate)}</span>
                        )}
                      </div>
                      {isPaid ? (
                        <Badge variant="success">Paid</Badge>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(term.amount)}</span>
                      )}
                    </div>

                    {term.breakdowns && term.breakdowns.length > 0 && (
                      <div className="border-t border-gray-200 pt-2 mb-2 space-y-1">
                        {term.breakdowns.map((item: any, bIdx: number) => (
                          <div key={bIdx} className="flex justify-between text-xs text-gray-600">
                            <span>{item.item}</span>
                            <span>{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isPaid && (
                      <button
                        onClick={() => onPayTerm ? onPayTerm(term.term) : onPay?.()}
                        disabled={paying}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                      >
                        {isPayingThis ? 'Processing...' : `Pay Term ${term.term} — ${formatCurrency(termBalance)}`}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Overall summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Fee</span>
              <span className="font-medium text-gray-800">{formatCurrency(feeTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-medium text-green-600">{formatCurrency(studentFee.amountPaid)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-semibold text-gray-700">Total Balance</span>
              <span className="font-bold text-lg text-blue-600">{formatCurrency(studentFee.balance)}</span>
            </div>
          </div>

          {/* Pay All button — only show when more than 1 unpaid term */}
          {unpaidTerms.length > 1 && (
            <button
              onClick={onPayAll || onPay}
              disabled={paying}
              className="w-full mt-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50"
            >
              {isPayingAll ? 'Processing...' : `Pay All Remaining — ${formatCurrency(studentFee.balance)}`}
            </button>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-5">
            <button
              onClick={onClose}
              disabled={paying}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
