import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { configService, schoolService } from '../../../lib/api-services';
import { School, ClassLevel } from '../../../lib/types';
import { useAuth } from '../../../lib/auth-context';
import Button from '../../../components/ui/Button';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';

export default function SettingsPage() {
  const { user } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    academicYearStart: 'September',
    gradeSystem: 'WAEC',
    attendanceRequired: true,
    feesEnabled: true,
    notificationsEnabled: true,
    termsPerSession: 3,
    classLevels: [] as ClassLevel[],
    sectionPresets: [] as string[],
    examTypes: [] as string[],
    paymentCategories: [] as string[],
    paymentTypes: [] as string[],
    paymentMethods: [] as string[],
    studentStatuses: [] as string[],
    noticeVisibility: [] as string[],
    noticeTypes: [] as string[],
  });

  const [customDomains, setCustomDomains] = useState<{ domain: string; verified: boolean }[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [savingDomains, setSavingDomains] = useState(false);

  // Temp state for adding new items
  const [newLevel, setNewLevel] = useState({ name: '', shortCode: '' });
  const [newPreset, setNewPreset] = useState('');
  const [newItems, setNewItems] = useState({
    examTypes: '',
    paymentCategories: '',
    paymentTypes: '',
    paymentMethods: '',
    studentStatuses: '',
    noticeVisibility: '',
    noticeTypes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, schoolRes] = await Promise.all([
        configService.get().catch(() => ({ data: null })),
        (user?.currentSchool || user?.school)
          ? schoolService.getById((user.currentSchool || user.school)!).catch(() => ({ data: null }))
          : Promise.resolve({ data: null }),
      ]);
      if (configRes.data) {
        if (configRes.data.settings) {
          const s = configRes.data.settings;
          setSettings({
            currency: s.currency ,
            timezone: s.timezone  ,
            academicYearStart: s.academicYearStart,
            gradeSystem: s.gradeSystem,
            attendanceRequired: s.attendanceRequired ?? true,
            feesEnabled: s.feesEnabled ?? true,
            notificationsEnabled: s.notificationsEnabled ?? true,
            termsPerSession: s.termsPerSession,
            classLevels: s.classLevels || [],
            sectionPresets: s.sectionPresets || [],
            examTypes: s.examTypes || [],
            paymentCategories: s.paymentCategories || [],
            paymentTypes: s.paymentTypes || [],
            paymentMethods: s.paymentMethods || [],
            studentStatuses: s.studentStatuses || [],
            noticeVisibility: s.noticeVisibility || [],
            noticeTypes: s.noticeTypes || [],
          });
        }
      }
      console.log('[settings] schoolRes:', schoolRes);
      console.log('[settings] school data:', schoolRes.data);
      console.log('[settings] currentSchool:', user?.currentSchool);
      setSchool(schoolRes.data);
      if (schoolRes.data?.customDomains) {
        setCustomDomains(schoolRes.data.customDomains);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user?.currentSchool, user?.school]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { paymentMethods, ...saveable } = settings;
      await configService.update({
        ...saveable,
        classLevels: settings.classLevels.map(({ name, shortCode }) => ({ name, shortCode })),
      });
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Class Levels helpers
  const addLevel = () => {
    if (!newLevel.name.trim() || !newLevel.shortCode.trim()) {
      toast.error('Both name and short code are required');
      return;
    }
    if (settings.classLevels.some((l) => l.shortCode === newLevel.shortCode.toUpperCase())) {
      toast.error('A level with this short code already exists');
      return;
    }
    setSettings({
      ...settings,
      classLevels: [...settings.classLevels, { name: newLevel.name.trim(), shortCode: newLevel.shortCode.trim().toUpperCase() }],
    });
    setNewLevel({ name: '', shortCode: '' });
  };

  const removeLevel = (index: number) => {
    setSettings({
      ...settings,
      classLevels: settings.classLevels.filter((_, i) => i !== index),
    });
  };

  const updateLevel = (index: number, field: 'name' | 'shortCode', value: string) => {
    const updated = [...settings.classLevels];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, classLevels: updated });
  };

  // Section Presets helpers
  const addPreset = () => {
    const val = newPreset.trim().toUpperCase();
    if (!val) return;
    if (settings.sectionPresets.includes(val)) {
      toast.error('This section preset already exists');
      return;
    }
    setSettings({
      ...settings,
      sectionPresets: [...settings.sectionPresets, val],
    });
    setNewPreset('');
  };

  const removePreset = (index: number) => {
    setSettings({
      ...settings,
      sectionPresets: settings.sectionPresets.filter((_, i) => i !== index),
    });
  };

  // Generic string array helpers
  const addItem = (field: keyof typeof newItems) => {
    const val = newItems[field].trim();
    if (!val) return;
    const arr = settings[field] as string[];
    if (arr.includes(val)) {
      toast.error('This item already exists');
      return;
    }
    setSettings({ ...settings, [field]: [...arr, val] });
    setNewItems({ ...newItems, [field]: '' });
  };

  const removeItem = (field: keyof typeof newItems, index: number) => {
    setSettings({
      ...settings,
      [field]: (settings[field] as string[]).filter((_, i) => i !== index),
    });
  };

  const addDomain = async () => {
    const domain = newDomain.trim().toLowerCase();
    if (!domain) return;
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
      toast.error('Enter a valid domain (e.g. myschool.com)');
      return;
    }
    if (customDomains.some((d) => d.domain === domain)) {
      toast.error('This domain is already added');
      return;
    }
    const updated = [...customDomains, { domain, verified: false }];
    setSavingDomains(true);
    try {
      await schoolService.update(school!._id, { customDomains: updated } as any);
      setCustomDomains(updated);
      setNewDomain('');
      toast.success('Domain added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add domain');
    } finally {
      setSavingDomains(false);
    }
  };

  const removeDomain = async (index: number) => {
    const updated = customDomains.filter((_, i) => i !== index);
    setSavingDomains(true);
    try {
      await schoolService.update(school!._id, { customDomains: updated } as any);
      setCustomDomains(updated);
      toast.success('Domain removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove domain');
    } finally {
      setSavingDomains(false);
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

      {/* Custom Domains */}
      {school && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Custom Domains</h2>
            <p className="text-sm text-gray-500">
              Connect your own domain to your school's public site. Point your domain's CNAME record to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">cname.sqoolify.com</code>
            </p>
          </div>

          {customDomains.length > 0 ? (
            <div className="space-y-3 mb-4">
              {customDomains.map((d, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{d.domain}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      d.verified
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {d.verified ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Verified
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
                          Pending DNS
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDomain(index)}
                    disabled={savingDomains}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove domain"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mb-4">
              <p className="text-sm text-gray-500">No custom domains configured</p>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. myschool.com"
              className="flex-1 max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
            />
            <button
              type="button"
              onClick={addDomain}
              disabled={savingDomains}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingDomains ? 'Adding...' : 'Add Domain'}
            </button>
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

      {/* Class Levels */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Class Levels</h2>
            <p className="text-sm text-gray-500">Define the education levels your school offers</p>
          </div>
        </div>

        {settings.classLevels.length > 0 ? (
          <div className="space-y-3 mb-4">
            {settings.classLevels.map((level, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={level.name}
                    onChange={(e) => updateLevel(index, 'name', e.target.value)}
                    placeholder="Level name"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    value={level.shortCode}
                    onChange={(e) => updateLevel(index, 'shortCode', e.target.value.toUpperCase())}
                    placeholder="Short code"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLevel(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove level"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mb-4">
            <p className="text-sm text-gray-500">No class levels configured</p>
          </div>
        )}

        <div className="flex items-end gap-3 p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Level Name</label>
            <input
              type="text"
              value={newLevel.name}
              onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
              placeholder="e.g. Junior Secondary"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLevel())}
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-500 mb-1">Short Code</label>
            <input
              type="text"
              value={newLevel.shortCode}
              onChange={(e) => setNewLevel({ ...newLevel, shortCode: e.target.value.toUpperCase() })}
              placeholder="e.g. JSS"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLevel())}
            />
          </div>
          <button
            type="button"
            onClick={addLevel}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      {/* Section Presets */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Section Presets</h2>
          <p className="text-sm text-gray-500">Quick-select options shown when creating or editing a class</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {settings.sectionPresets.length > 0 ? (
            settings.sectionPresets.map((preset, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {preset}
                <button
                  type="button"
                  onClick={() => removePreset(index)}
                  className="text-blue-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No section presets configured</p>
          )}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={newPreset}
            onChange={(e) => setNewPreset(e.target.value)}
            placeholder="e.g. A, Science, Gold"
            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreset())}
          />
          <button
            type="button"
            onClick={addPreset}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Exam Types */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Exam Types</h2>
          <p className="text-sm text-gray-500">Assessment types available when creating exams (e.g. CA1, CA2, Exam)</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.examTypes.length > 0 ? (
            settings.examTypes.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                {item}
                <button type="button" onClick={() => removeItem('examTypes', index)} className="text-purple-400 hover:text-red-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No exam types configured</p>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" value={newItems.examTypes} onChange={(e) => setNewItems({ ...newItems, examTypes: e.target.value })} placeholder="e.g. CA3, Midterm, Final" className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('examTypes'))} />
          <button type="button" onClick={() => addItem('examTypes')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
        </div>
      </div>

      {/* Payment Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Categories</h2>
          <p className="text-sm text-gray-500">Fee categories for recording payments</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.paymentCategories.length > 0 ? (
            settings.paymentCategories.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium capitalize">
                {item}
                <button type="button" onClick={() => removeItem('paymentCategories', index)} className="text-green-400 hover:text-red-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No payment categories configured</p>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" value={newItems.paymentCategories} onChange={(e) => setNewItems({ ...newItems, paymentCategories: e.target.value })} placeholder="e.g. tuition, books, lab fee" className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('paymentCategories'))} />
          <button type="button" onClick={() => addItem('paymentCategories')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
        </div>
      </div>

      {/* Payment Types */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Types</h2>
          <p className="text-sm text-gray-500">How a student pays (e.g. full, partial, installment)</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.paymentTypes.length > 0 ? (
            settings.paymentTypes.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium capitalize">
                {item}
                <button type="button" onClick={() => removeItem('paymentTypes', index)} className="text-yellow-400 hover:text-red-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No payment types configured</p>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" value={newItems.paymentTypes} onChange={(e) => setNewItems({ ...newItems, paymentTypes: e.target.value })} placeholder="e.g. full, partial, scholarship" className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('paymentTypes'))} />
          <button type="button" onClick={() => addItem('paymentTypes')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <p className="text-sm text-gray-500">System-managed payment channels used in the payment form</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.paymentMethods.length > 0 ? (
            settings.paymentMethods.map((item, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize">
                {item.replace('_', ' ')}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No payment methods configured</p>
          )}
        </div>
      </div>

      {/* Student Statuses */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Student Statuses</h2>
          <p className="text-sm text-gray-500">Available statuses for student records</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.studentStatuses.length > 0 ? (
            settings.studentStatuses.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium capitalize">
                {item}
                <button type="button" onClick={() => removeItem('studentStatuses', index)} className="text-orange-400 hover:text-red-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No student statuses configured</p>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" value={newItems.studentStatuses} onChange={(e) => setNewItems({ ...newItems, studentStatuses: e.target.value })} placeholder="e.g. active, expelled, deferred" className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('studentStatuses'))} />
          <button type="button" onClick={() => addItem('studentStatuses')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
        </div>
      </div>

      {/* Notice Visibility */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Notice Visibility Options</h2>
          <p className="text-sm text-gray-500">Audience groups for notice targeting</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.noticeVisibility.length > 0 ? (
            settings.noticeVisibility.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium capitalize">
                {item}
                <button type="button" onClick={() => removeItem('noticeVisibility', index)} className="text-indigo-400 hover:text-red-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No visibility options configured</p>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" value={newItems.noticeVisibility} onChange={(e) => setNewItems({ ...newItems, noticeVisibility: e.target.value })} placeholder="e.g. everyone, staff, alumni" className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('noticeVisibility'))} />
          <button type="button" onClick={() => addItem('noticeVisibility')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
        </div>
      </div>

      {/* Notice Types */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Notice Types</h2>
          <p className="text-sm text-gray-500">Categories for notices and announcements</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {settings.noticeTypes.length > 0 ? (
            settings.noticeTypes.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium capitalize">
                {item}
                <button type="button" onClick={() => removeItem('noticeTypes', index)} className="text-red-400 hover:text-red-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400">No notice types configured</p>
          )}
        </div>
        <div className="flex gap-3">
          <input type="text" value={newItems.noticeTypes} onChange={(e) => setNewItems({ ...newItems, noticeTypes: e.target.value })} placeholder="e.g. general, urgent, meeting" className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('noticeTypes'))} />
          <button type="button" onClick={() => addItem('noticeTypes')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
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