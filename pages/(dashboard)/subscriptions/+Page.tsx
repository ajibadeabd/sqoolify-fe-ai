import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { subscriptionService, planService } from '../../../lib/api-services';
import { Subscription, SubscriptionHistory, Plan } from '../../../lib/types';
import { useAppConfig } from '../../../lib/use-app-config';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function SubscriptionsPage() {
  const { formatCurrency } = useAppConfig();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, historyRes] = await Promise.all([
        subscriptionService.getCurrent().catch(() => ({ data: null })),
        planService.getAll({ limit: 10 }),
        subscriptionService.getHistory().catch(() => ({ data: [] })),
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data || []);
      setHistory(historyRes.data || []);

      // Check for payment verification on redirect
      const params = new URLSearchParams(window.location.search);
      const reference = params.get('reference') || params.get('trxref');
      if (reference && params.get('verify')) {
        try {
          await subscriptionService.verifyPayment(reference);
          toast.success('Payment verified! Your plan is now active.');
          window.history.replaceState({}, '', '/subscriptions');
          // Re-fetch to show updated subscription
          const freshSub = await subscriptionService.getCurrent().catch(() => ({ data: null }));
          setSubscription(freshSub.data);
        } catch {
          toast.error('Payment verification failed. Please contact support.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getPrice = (plan: Plan) => {
    if (billingCycle === 'yearly') {
      const discount = (plan.yearlyDiscountPercent || 0) / 100;
      return Math.round(plan.amount * 12 * (1 - discount));
    }
    return plan.amount;
  };

  // Get max discount across all plans for the toggle badge
  const maxDiscount = Math.max(...plans.map(p => p.yearlyDiscountPercent || 0));

  const handleSelectPlan = async (plan: Plan) => {
    const currentPlanId = (subscription?.plan as any)?._id;
    if (currentPlanId === plan._id) return;

    // Free plan — just switch directly
    if (plan.amount === 0) {
      setActionLoading(plan._id);
      try {
        await subscriptionService.subscribe(plan._id);
        toast.success(`Switched to ${plan.name} plan`);
        fetchData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to switch plan');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    // Paid plan — go through Paystack
    setActionLoading(plan._id);
    try {
      const res = await subscriptionService.initializePayment(plan._id, billingCycle);
      window.location.href = res.data.authorization_url;
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment');
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll be downgraded to the Starter plan.')) return;
    setActionLoading('cancel');
    try {
      await subscriptionService.cancel();
      toast.success('Subscription cancelled');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: any; label: string }> = {
      active: { variant: 'success', label: 'Active' },
      trial: { variant: 'info', label: 'Free Trial' },
      grace_period: { variant: 'warning', label: 'Grace Period' },
      expired: { variant: 'error', label: 'Expired' },
      cancelled: { variant: 'warning', label: 'Cancelled' },
    };
    const s = map[status] || { variant: 'default', label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getButtonLabel = (plan: Plan) => {
    const currentPlanId = (subscription?.plan as any)?._id;
    if (currentPlanId === plan._id) return 'Current Plan';
    if (plan.amount === 0) return 'Downgrade';
    const currentAmount = (subscription?.plan as any)?.amount || 0;
    return plan.amount > currentAmount ? 'Upgrade' : 'Switch Plan';
  };

  const daysLeft = subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Sort plans: Starter, Standard, Premium
  const sortedPlans = [...plans].sort((a, b) => a.amount - b.amount);
  const currentPlanId = (subscription?.plan as any)?._id;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Subscriptions' }]} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your school's subscription plan</p>
      </div>

      {/* Current Plan Banner */}
      {subscription && (
        <div className={`rounded-2xl p-6 mb-8 border ${
          subscription.status === 'trial' ? 'bg-blue-50 border-blue-200' :
          subscription.status === 'grace_period' ? 'bg-amber-50 border-amber-200' :
          subscription.status === 'active' ? 'bg-green-50 border-green-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {(subscription.plan as any)?.name || 'Unknown'} Plan
                </h2>
                {getStatusBadge(subscription.status)}
              </div>
              <p className="text-sm text-gray-600">
                {subscription.status === 'trial' && `Free trial ends ${formatDate(subscription.endDate)} (${daysLeft} days left)`}
                {subscription.status === 'grace_period' && `Grace period ends ${formatDate(subscription.endDate)} — subscribe now to keep your features`}
                {subscription.status === 'active' && `Renews ${formatDate(subscription.endDate)}`}
                {subscription.status === 'expired' && `Expired on ${formatDate(subscription.endDate)}`}
                {subscription.status === 'cancelled' && `Cancelled — active until ${formatDate(subscription.endDate)}`}
              </p>
            </div>
            <div className="flex gap-2">
              {(subscription.status === 'active' && (subscription.plan as any)?.name !== 'Starter') && (
                <Button variant="outline" size="sm" onClick={handleCancel} loading={actionLoading === 'cancel'}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {subscription.status === 'trial' && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.max(0, 100 - (daysLeft / 30) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-blue-700">{daysLeft} days left</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
            {maxDiscount > 0 && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save {maxDiscount}%</span>}
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {sortedPlans.map((plan) => {
          const isCurrent = currentPlanId === plan._id;
          const isPopular = plan.name === 'Standard';
          const price = getPrice(plan);
          const f = plan.features || {} as any;

          const featureList = [
            { label: `${f.maxStudents || '∞'} students`, on: true },
            { label: `${f.maxTeachers || '∞'} teachers`, on: true },
            { label: `${f.maxClasses || '∞'} classes`, on: true },
            { label: 'Attendance', on: f.hasAttendance },
            { label: 'Exams & CBT', on: f.hasExams },
            { label: 'Report Cards', on: f.hasReportCards },
            { label: 'Notice Board', on: f.hasNoticeBoard },
            { label: 'Timetable', on: f.hasTimetable },
            { label: 'Fees & Payments', on: f.hasPayments || f.hasFees },
            { label: 'Bank Accounts', on: f.hasBanks },
            { label: 'Chat', on: f.hasChat },
            { label: 'Audit Logs', on: f.hasAuditLogs },
            { label: 'Inter-School', on: f.hasInterSchool },
            { label: 'Site Builder', on: f.hasSiteBuilder },
            { label: 'AI Features', on: f.hasAI },
            { label: f.maxStorageMB >= 1000 ? `${f.maxStorageMB / 1000}GB Storage` : `${f.maxStorageMB || 0}MB Storage`, on: f.hasFileStorage },
            { label: `${f.maxSchools || 1} School${(f.maxSchools || 1) > 1 ? 's' : ''}`, on: true },
          ];

          return (
            <div
              key={plan._id}
              className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
                isCurrent ? 'border-blue-500 shadow-lg shadow-blue-500/10' :
                isPopular ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full">Current Plan</span>
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4">
                  {price === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">{formatCurrency(price)}</span>
                      <span className="text-gray-500 text-sm">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.amount > 0 && (
                  <p className="text-xs text-gray-400 mt-1 line-through">{formatCurrency(plan.amount * 12)}/year</p>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {featureList.map((item) => (
                  <li key={item.label} className={`flex items-center gap-2.5 text-sm ${item.on ? 'text-gray-700' : 'text-gray-300'}`}>
                    {item.on ? (
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={!item.on ? 'line-through' : ''}>{item.label}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? 'outline' : isPopular ? 'primary' : 'secondary'}
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrent || actionLoading !== null}
                loading={actionLoading === plan._id}
              >
                {getButtonLabel(plan)}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Subscription History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Subscription History</h2>
          <div className="divide-y divide-gray-100">
            {history.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    item.action === 'created' ? 'bg-green-100 text-green-700' :
                    item.action === 'renewed' ? 'bg-blue-100 text-blue-700' :
                    item.action === 'upgraded' ? 'bg-purple-100 text-purple-700' :
                    item.action === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.action === 'created' ? '+' : item.action === 'renewed' ? '↻' : item.action === 'upgraded' ? '↑' : item.action === 'cancelled' ? '×' : '•'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize text-sm">{item.action}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                  </div>
                </div>
                {item.amount ? (
                  <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
