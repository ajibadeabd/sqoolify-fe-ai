import { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { paymentService } from '../../../../lib/api-services'

export default function PaymentCallbackPage() {
  const pageContext = usePageContext()
  const reference = (pageContext.urlParsed as any)?.search?.reference || ''

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      setError('No payment reference found')
      return
    }

    const verify = async () => {
      try {
        const res = await paymentService.verify(reference)
        if (res.data?.status === 'completed') {
          setStatus('success')
        } else {
          setStatus('failed')
          setError('Payment was not completed')
        }
      } catch (err: any) {
        setStatus('failed')
        setError(err.message || 'Failed to verify payment')
      }
    }

    verify()
  }, [reference])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your payment has been processed and your fee balance has been updated.
            </p>
            <button
              onClick={() => navigate('/my-fees')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Back to My Fees
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-2">
              {error || 'Something went wrong with your payment.'}
            </p>
            {reference && (
              <p className="text-xs text-gray-400 mb-6 font-mono">Ref: {reference}</p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/my-fees')}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Back to My Fees
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
