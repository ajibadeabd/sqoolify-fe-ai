import { useState, useEffect, useCallback } from 'react';
import { configService, schoolService } from '../../../lib/api-services';
import { AppConfig, School } from '../../../lib/types';
import { useAuth } from '../../../lib/auth-context';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function SettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    academicYearStart: 'September',
    gradeSystem: 'WAEC',
    attendanceRequired: true,
    feesEnabled: true,
    notificationsEnabled: true,
    termsPerSession: 3,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configRes, schoolRes] = await Promise.all([
        configService.get().catch(() => ({ data: null })),
        user?.currentSchool ? schoolService.getById(user.currentSchool).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);
      if (configRes.data) {
        setConfig(configRes.data);
        if (configRes.data.settings) {
          setSettings({
            currency: configRes.data.settings.currency || 'NGN',
            timezone: configRes.data.settings.timezone || 'Africa/Lagos',
            academicYearStart: configRes.data.settings.academicYearStart || 'September',
            gradeSystem: configRes.data.settings.gradeSystem || 'WAEC',
            attendanceRequired: configRes.data.settings.attendanceRequired ?? true,
            feesEnabled: configRes.data.settings.feesEnabled ?? true,
            notificationsEnabled: configRes.data.settings.notificationsEnabled ?? true,
            termsPerSession: configRes.data.settings.termsPerSession || 3,
          });
        }
      }
      setSchool(schoolRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user?.currentSchool]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await configService.update(settings);
      setSuccess('Settings saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
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
      <Breadcrumbs items={[{ label: 'Settings' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your school's preferences</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* School Info */}
      {school && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">School Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">School Name</p>
              <p className="font-medium">{school.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">School Code</p>
              <p className="font-medium">{school.schoolCode || '-'}</p>
            </div>
            {school.schoolInformation?.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{school.schoolInformation.email}</p>
              </div>
            )}
            {school.schoolInformation?.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{school.schoolInformation.phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">General Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="NGN">Nigerian Naira (NGN)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GHS">Ghanaian Cedi (GHS)</option>
              <option value="KES">Kenyan Shilling (KES)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="Africa/Accra">Africa/Accra (GMT)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Academic Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Academic Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year Starts</label>
            <select
              value={settings.academicYearStart}
              onChange={(e) => setSettings({ ...settings, academicYearStart: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grading System</label>
            <select
              value={settings.gradeSystem}
              onChange={(e) => setSettings({ ...settings, gradeSystem: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="WAEC">WAEC (A1-F9)</option>
              <option value="AMERICAN">American (A-F)</option>
              <option value="BRITISH">British (A*-G)</option>
              <option value="PERCENTAGE">Percentage Based</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms Per Session</label>
            <select
              value={settings.termsPerSession}
              onChange={(e) => setSettings({ ...settings, termsPerSession: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2">2 Terms</option>
              <option value="3">3 Terms</option>
              <option value="4">4 Terms (Quarters)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Feature Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Attendance Tracking</p>
              <p className="text-sm text-gray-500">Enable daily attendance management</p>
            </div>
            <input
              type="checkbox"
              checked={settings.attendanceRequired}
              onChange={(e) => setSettings({ ...settings, attendanceRequired: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Fee Management</p>
              <p className="text-sm text-gray-500">Enable fee and payment tracking</p>
            </div>
            <input
              type="checkbox"
              checked={settings.feesEnabled}
              onChange={(e) => setSettings({ ...settings, feesEnabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Notifications</p>
              <p className="text-sm text-gray-500">Enable email and push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
