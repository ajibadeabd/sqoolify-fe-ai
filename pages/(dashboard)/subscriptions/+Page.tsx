import { useState, useEffect, useCallback } from 'react';
import { subscriptionService, planService } from '../../../lib/api-services';
import { Subscription, SubscriptionHistory, Plan } from '../../../lib/types';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, plansRes, historyRes] = await Promise.all([
        subscriptionService.getCurrent().catch(() => ({ data: null })),
        planService.getAll({ limit: 10 }),
        subscriptionService.getHistory().catch(() => ({ data: [] })),
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = async (planId: string) => {
    setActionLoading(true);
    try {
      await subscriptionService.subscribe(planId, true);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to subscribe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    setActionLoading(true);
    try {
      await subscriptionService.cancel();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    setActionLoading(true);
    try {
      await subscriptionService.renew();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to renew subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'expired':
        return <Badge variant="error">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="warning">Cancelled</Badge>;
      case 'trial':
        return <Badge variant="info">Trial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Subscriptions' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your school's subscription plan</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
          <button onClick={fetchData} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Subscription</h2>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-xl font-bold text-gray-900">
                  {(subscription.plan as any)?.name || 'Unknown Plan'}
                </p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{formatDate(subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">{formatDate(subscription.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Auto Renew</p>
                <p className="font-medium">{subscription.autoRenew ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">{formatCurrency((subscription.plan as any)?.amount || 0)}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              {subscription.status === 'active' && (
                <Button variant="secondary" onClick={handleCancel} loading={actionLoading}>
                  Cancel Subscription
                </Button>
              )}
              {(subscription.status === 'expired' || subscription.status === 'cancelled') && (
                <Button onClick={handleRenew} loading={actionLoading}>
                  Renew Subscription
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No active subscription. Choose a plan below to get started.</p>
        )}
      </div>

      {/* Available Plans */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-xl border p-6 ${
                (subscription?.plan as any)?._id === plan._id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200'
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {formatCurrency(plan.amount)}
                <span className="text-sm font-normal text-gray-500">/{plan.billingCycle}</span>
              </p>
              {plan.features && (
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Up to {plan.features.maxStudents || 'unlimited'} students
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Up to {plan.features.maxTeachers || 'unlimited'} teachers
                  </li>
                  {plan.features.hasAttendance && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Attendance Tracking
                    </li>
                  )}
                  {plan.features.hasExams && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Exam Management
                    </li>
                  )}
                  {plan.features.hasReportCards && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Report Cards
                    </li>
                  )}
                  {plan.features.hasPayments && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Payment Processing
                    </li>
                  )}
                </ul>
              )}
              <Button
                className="w-full mt-4"
                onClick={() => handleSubscribe(plan._id)}
                disabled={(subscription?.plan as any)?._id === plan._id || actionLoading}
              >
                {(subscription?.plan as any)?._id === plan._id ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Subscription History</h2>
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium capitalize">{item.action}</p>
                  <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                </div>
                {item.amount && (
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
