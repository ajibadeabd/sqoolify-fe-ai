import { useState, useEffect } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { navigate } from 'vike/client/router';
import { useAuth } from '../../../../lib/auth-context';
import { schoolService, sitePageService } from '../../../../lib/api-services';
import type { School, SitePage } from '../../../../lib/types';
import CanvasEditor from '../../../../components/public-site/templates/canvas/CanvasEditor';

export default function CanvasEditorPage() {
  const pageContext = usePageContext();
  const id = (pageContext.routeParams as any)?.id;
  const { user } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.school || !id) { navigate('/site-builder'); return; }
    Promise.all([
      schoolService.getById(user.school),
      sitePageService.getById(id),
    ])
      .then(([schoolRes, pageRes]) => {
        setSchool(schoolRes.data);
        setPage(pageRes.data);
      })
      .catch(() => navigate('/site-builder'))
      .finally(() => setLoading(false));
  }, [user?.school, id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[999] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400">Loading Canvas Editor...</p>
        </div>
      </div>
    );
  }

  if (!school || !page) return null;

  return (
    <CanvasEditor
      school={school}
      page={page}
      onClose={() => navigate('/site-builder')}
      onSave={() => navigate('/site-builder')}
    />
  );
}
