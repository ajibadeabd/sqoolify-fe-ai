import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { interSchoolService } from '../../../lib/api-services';
import {
  School, SchoolConnection, InterSchoolExam, InterSchoolMessage,
  CreateInterExamData, CreateMessageData, InterSchoolExamType,
} from '../../../lib/types';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import SearchBar from '../../../components/ui/SearchBar';
import EmptyState from '../../../components/ui/EmptyState';
import Breadcrumbs from '../../../components/layout/Breadcrumbs';
import { usePermission } from '../../../lib/use-permission';
import { useSchool } from '../../../lib/school-context';

type Tab = 'discover' | 'connections' | 'requests' | 'exams' | 'messages';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'discover', label: 'Discover Schools', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { key: 'connections', label: 'Connections', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { key: 'requests', label: 'Requests', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { key: 'exams', label: 'Inter-School Exams', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'messages', label: 'Messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

const examTypeLabels: Record<InterSchoolExamType, string> = {
  common_entrance: 'Common Entrance',
  inter_school_competition: 'Competition',
  mock_waec: 'Mock WAEC',
  mock_jamb: 'Mock JAMB',
  custom: 'Custom',
};

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  accepted: 'success',
  pending: 'warning',
  rejected: 'danger',
  draft: 'default',
  pending_approval: 'warning',
  approved: 'info',
  live: 'success',
  completed: 'default',
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getSchoolName = (school: School | string) =>
  typeof school === 'object' ? school.name : school;

const getSchoolDetails = (school: School | string) => {
  if (typeof school !== 'object') return { name: school as string };
  return {
    name: school.name,
    logo: school.schoolSetup?.logo,
    shortName: school.schoolSetup?.schoolShortName,
    motto: school.schoolSetup?.schoolMotto,
    type: school.schoolInformation?.schoolType,
    email: school.schoolSetup?.schoolEmailAddress || school.schoolInformation?.email,
    phone: school.schoolSetup?.schoolPhoneNumber || school.schoolInformation?.phone,
    address: school.schoolSetup?.schoolAddress || school.schoolInformation?.address?.schoolAddress,
    state: school.schoolInformation?.address?.state,
    description: school.schoolInformation?.description,
  };
};

function SchoolAvatar({ school, size = 'md' }: { school: School | string; size?: 'sm' | 'md' | 'lg' }) {
  const details = getSchoolDetails(school);
  const sizeClass = size === 'sm' ? 'w-10 h-10 text-sm' : size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-base';

  if (details.logo) {
    return <img src={details.logo} alt={details.name} className={`${sizeClass} rounded-xl object-cover`} />;
  }

  const initials = details.shortName || details.name?.slice(0, 2).toUpperCase() || '??';
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const colorIdx = details.name ? details.name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`${sizeClass} ${colors[colorIdx]} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}>
      {initials.slice(0, 2)}
    </div>
  );
}

function SchoolCardInfo({ school, compact }: { school: School | string; compact?: boolean }) {
  const d = getSchoolDetails(school);
  return (
    <div className="flex items-start gap-3">
      <SchoolAvatar school={school} size={compact ? 'sm' : 'md'} />
      <div className="min-w-0 flex-1">
        <h3 className={`font-semibold text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>{d.name}</h3>
        {d.type && !compact && (
          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1">{d.type}</span>
        )}
        {d.address && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            <span className="truncate">{d.address}{d.state ? `, ${d.state}` : ''}</span>
          </p>
        )}
        {d.email && !compact && (
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            <span className="truncate">{d.email}</span>
          </p>
        )}
        {d.motto && !compact && (
          <p className="text-xs text-gray-400 italic mt-1 truncate">&ldquo;{d.motto}&rdquo;</p>
        )}
      </div>
    </div>
  );
}

export default function InterSchoolPage() {
  const { can } = usePermission();
  const [activeTab, setActiveTab] = useState<Tab>('discover');

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Inter-School Network' }]} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inter-School Network</h1>
        <p className="text-sm text-gray-500 mt-1">Connect with other schools, share exams and information</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'discover' && <DiscoverTab />}
      {activeTab === 'connections' && <ConnectionsTab />}
      {activeTab === 'requests' && <RequestsTab />}
      {activeTab === 'exams' && <ExamsTab />}
      {activeTab === 'messages' && <MessagesTab />}
    </div>
  );
}

// ============ DISCOVER TAB ============
function DiscoverTab() {
  const { can } = usePermission();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await interSchoolService.discoverSchools({ search: search || undefined });
      setSchools(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleConnect = async (schoolId: string) => {
    setSendingTo(schoolId);
    try {
      await interSchoolService.sendRequest(schoolId);
      toast.success('Connection request sent');
      fetchSchools();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div>
      <div className="mb-5 max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search schools by name..." />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading schools...</div>
      ) : schools.length === 0 ? (
        <EmptyState title="No schools found" description="No other schools available to connect with right now." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => {
            const d = getSchoolDetails(school);
            return (
              <Card key={school._id} className="p-5 hover:shadow-md transition-shadow">
                <SchoolCardInfo school={school} />
                {d.description && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{d.description}</p>
                )}
                {can('write_inter_school') && (
                  <Button
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => handleConnect(school._id)}
                    loading={sendingTo === school._id}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    Connect
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ CONNECTIONS TAB ============
function ConnectionsTab() {
  const { can } = usePermission();
  const { school: currentSchool } = useSchool();
  const [connections, setConnections] = useState<SchoolConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await interSchoolService.getConnections();
      setConnections(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect from this school?')) return;
    try {
      await interSchoolService.disconnect(id);
      toast.success('Disconnected');
      fetchConnections();
    } catch (err: any) {
      toast.error(err.message || 'Failed to disconnect');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading connections...</div>;
  if (connections.length === 0) return <EmptyState title="No connections" description="You haven't connected with any schools yet. Discover schools to get started." />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {connections.map((conn) => {
        const requesterId = typeof conn.requester === 'object' ? conn.requester._id : conn.requester;
        const otherSchool = requesterId === currentSchool?._id ? conn.receiver : conn.requester;
        return (
          <Card key={conn._id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <SchoolCardInfo school={otherSchool} />
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[conn.status] || 'default'}>{conn.status}</Badge>
                <span className="text-xs text-gray-400">Since {formatDate(conn.updatedAt)}</span>
              </div>
            </div>
            {can('delete_inter_school') && (
              <Button size="sm" variant="outline" className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDisconnect(conn._id)}>
                Disconnect
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ============ REQUESTS TAB ============
function RequestsTab() {
  const { school: currentSchool } = useSchool();
  const [requests, setRequests] = useState<SchoolConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await interSchoolService.getRequests();
      setRequests(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      await interSchoolService.acceptRequest(id);
      toast.success('Request accepted');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await interSchoolService.rejectRequest(id);
      toast.success('Request rejected');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading requests...</div>;
  if (requests.length === 0) return <EmptyState title="No pending requests" description="You don't have any connection requests right now." />;

  const mySchoolId = currentSchool?._id;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {requests.map((req) => {
        const requesterId = typeof req.requester === 'object' ? req.requester._id : req.requester;
        const iSentThis = requesterId === mySchoolId;
        const otherSchool = iSentThis ? req.receiver : req.requester;
        const d = getSchoolDetails(otherSchool);

        return (
          <Card key={req._id} className={`p-5 hover:shadow-md transition-shadow border-l-4 ${iSentThis ? 'border-l-blue-400' : 'border-l-amber-400'}`}>
            <div className="flex items-center justify-between mb-2">
              <Badge variant={iSentThis ? 'info' : 'warning'} size="sm">
                {iSentThis ? 'Sent' : 'Received'}
              </Badge>
              <Badge variant="warning" size="sm">{req.status || 'pending'}</Badge>
            </div>
            <SchoolCardInfo school={otherSchool} />
            {d.description && (
              <p className="text-sm text-gray-500 mt-3 line-clamp-2">{d.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {iSentThis ? 'Sent' : 'Received'} {formatDate(req.createdAt)}
            </div>
            {!iSentThis && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button size="sm" className="flex-1" onClick={() => handleAccept(req._id)} loading={processingId === req._id}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(req._id)} loading={processingId === req._id}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Reject
                </Button>
              </div>
            )}
            {iSentThis && (
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <span className="text-sm text-gray-400">Awaiting response...</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ============ EXAMS TAB ============
function ExamsTab() {
  const { can } = usePermission();
  const [exams, setExams] = useState<InterSchoolExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [connections, setConnections] = useState<SchoolConnection[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await interSchoolService.getExams();
      setExams(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleApprove = async (examId: string) => {
    setApprovingId(examId);
    try {
      await interSchoolService.approveExam(examId);
      toast.success('Exam approved');
      fetchExams();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve exam');
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenCreate = async () => {
    try {
      const res = await interSchoolService.getConnections();
      setConnections(res.data || []);
      setShowCreateModal(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load connections');
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {can('manage_inter_school_exams') && (
          <Button onClick={handleOpenCreate}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Create Exam
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading exams...</div>
      ) : exams.length === 0 ? (
        <EmptyState title="No inter-school exams" description="Create an exam to collaborate with connected schools." />
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam._id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-lg">{exam.name}</h3>
                    <Badge variant={statusVariant[exam.status] || 'default'}>{exam.status.replace('_', ' ')}</Badge>
                    <Badge variant="info">{examTypeLabels[exam.type] || exam.type}</Badge>
                  </div>
                  {exam.description && <p className="text-sm text-gray-500 mt-1">{exam.description}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {exam.duration && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {exam.duration} mins
                      </span>
                    )}
                    {exam.maxScore && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                        Max: {exam.maxScore}
                      </span>
                    )}
                    {exam.startTime && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        {formatDate(exam.startTime)}
                      </span>
                    )}
                  </div>
                </div>
                {exam.status === 'pending_approval' && can('manage_inter_school_exams') && (
                  <Button size="sm" onClick={() => handleApprove(exam._id)} loading={approvingId === exam._id}>
                    Approve
                  </Button>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Participating Schools</p>
                <div className="flex flex-wrap gap-2">
                  {exam.schools.map((ps, i) => (
                    <div key={i} className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                      <SchoolAvatar school={ps.school} size="sm" />
                      <span className="text-sm text-gray-700">{getSchoolName(ps.school)}</span>
                      {ps.approved ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ) : (
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateExamModal
          connections={connections}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchExams(); }}
        />
      )}
    </div>
  );
}

function CreateExamModal({ connections, onClose, onCreated }: { connections: SchoolConnection[]; onClose: () => void; onCreated: () => void }) {
  const { school: currentSchool } = useSchool();
  const [form, setForm] = useState<CreateInterExamData>({
    name: '',
    type: 'custom',
    schoolIds: [],
  });
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSchool = (id: string) => {
    setForm((prev) => ({
      ...prev,
      schoolIds: prev.schoolIds.includes(id)
        ? prev.schoolIds.filter((s) => s !== id)
        : [...prev.schoolIds, id],
    }));
  };

  const connectedSchools = connections
    .filter((c) => c.status === 'accepted')
    .map((c) => {
      const requesterId = typeof c.requester === 'object' ? c.requester._id : c.requester;
      return requesterId === currentSchool?._id
        ? (typeof c.receiver === 'object' ? c.receiver : null)
        : (typeof c.requester === 'object' ? c.requester : null);
    })
    .filter(Boolean) as School[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Exam name is required'); return; }
    if (form.schoolIds.length === 0) { toast.error('Select at least one school'); return; }
    setSaving(true);
    try {
      await interSchoolService.createExam(form);
      toast.success('Exam created');
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create exam');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Create Inter-School Exam" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Inter-School Math Competition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => update('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Optional description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(examTypeLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
            <input
              type="number"
              value={form.maxScore || ''}
              onChange={(e) => update('maxScore', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
            <input
              type="number"
              value={form.duration || ''}
              onChange={(e) => update('duration', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Participating Schools</label>
          {connectedSchools.length === 0 ? (
            <p className="text-sm text-gray-500">No connected schools. Connect with schools first.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {connectedSchools.map((school) => (
                <label key={school._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.schoolIds.includes(school._id)}
                    onChange={() => toggleSchool(school._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <SchoolAvatar school={school} size="sm" />
                  <span className="text-sm text-gray-700">{school.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Create Exam</Button>
        </div>
      </form>
    </Modal>
  );
}

// ============ MESSAGES TAB ============
function MessagesTab() {
  const { can } = usePermission();
  const [messages, setMessages] = useState<InterSchoolMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [connections, setConnections] = useState<SchoolConnection[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InterSchoolMessage | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await interSchoolService.getMessages();
      setMessages(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleOpenCompose = async () => {
    try {
      const res = await interSchoolService.getConnections();
      setConnections(res.data || []);
      setShowComposeModal(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load connections');
    }
  };

  const handleViewMessage = async (msg: InterSchoolMessage) => {
    setSelectedMessage(msg);
    if (!msg.readAt) {
      try {
        await interSchoolService.getMessageById(msg._id);
      } catch {}
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {can('write_inter_school') && (
          <Button onClick={handleOpenCompose}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            Compose
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading messages...</div>
      ) : messages.length === 0 ? (
        <EmptyState title="No messages" description="Send a message to a connected school to get started." />
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => handleViewMessage(msg)}
              className={`p-4 border rounded-xl cursor-pointer hover:shadow-sm transition group ${
                !msg.readAt ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <SchoolAvatar school={msg.fromSchool} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{getSchoolName(msg.fromSchool)}</span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    <span className="text-sm text-gray-500">{getSchoolName(msg.toSchool)}</span>
                    {!msg.readAt && <Badge variant="info" size="sm">New</Badge>}
                  </div>
                  <p className="font-medium text-gray-900 mt-0.5">{msg.subject}</p>
                  <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{msg.content}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap self-start">{formatDate(msg.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMessage && (
        <Modal open onClose={() => setSelectedMessage(null)} title={selectedMessage.subject}>
          <div className="p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
              <SchoolAvatar school={selectedMessage.fromSchool} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{getSchoolName(selectedMessage.fromSchool)}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  <span className="text-gray-600">{getSchoolName(selectedMessage.toSchool)}</span>
                </div>
                <span className="text-sm text-gray-400">{formatDate(selectedMessage.createdAt)}</span>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {selectedMessage.content}
            </div>
          </div>
        </Modal>
      )}

      {showComposeModal && (
        <ComposeModal
          connections={connections}
          onClose={() => setShowComposeModal(false)}
          onSent={() => { setShowComposeModal(false); fetchMessages(); }}
        />
      )}
    </div>
  );
}

function ComposeModal({ connections, onClose, onSent }: { connections: SchoolConnection[]; onClose: () => void; onSent: () => void }) {
  const { school: currentSchool } = useSchool();
  const [form, setForm] = useState<CreateMessageData>({ toSchoolId: '', subject: '', content: '' });
  const [saving, setSaving] = useState(false);

  const connectedSchools = connections
    .filter((c) => c.status === 'accepted')
    .map((c) => {
      const requesterId = typeof c.requester === 'object' ? c.requester._id : c.requester;
      return requesterId === currentSchool?._id
        ? (typeof c.receiver === 'object' ? c.receiver : null)
        : (typeof c.requester === 'object' ? c.requester : null);
    })
    .filter(Boolean) as School[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toSchoolId) { toast.error('Select a school'); return; }
    if (!form.subject.trim()) { toast.error('Subject is required'); return; }
    if (!form.content.trim()) { toast.error('Message content is required'); return; }
    setSaving(true);
    try {
      await interSchoolService.sendMessage(form);
      toast.success('Message sent');
      onSent();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Compose Message" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To School</label>
          <select
            value={form.toSchoolId}
            onChange={(e) => setForm({ ...form, toSchoolId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a school...</option>
            {connectedSchools.map((school) => (
              <option key={school._id} value={school._id}>{school.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Message subject..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            placeholder="Write your message..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Send Message</Button>
        </div>
      </form>
    </Modal>
  );
}
