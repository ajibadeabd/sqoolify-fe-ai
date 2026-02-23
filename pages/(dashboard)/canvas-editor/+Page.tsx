import { useEffect } from 'react';
import { navigate } from 'vike/client/router';
import { useAuth } from '../../../lib/auth-context';
import { sitePageService } from '../../../lib/api-services';

export default function CanvasEditorIndexPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.school) { navigate('/site-builder'); return; }
    sitePageService.getAll()
      .then(res => {
        const home = res.data.find(p => p.isHomePage);
        if (home) {
          navigate(`/canvas-editor/${home._id}`);
        } else {
          navigate('/site-builder');
        }
      })
      .catch(() => navigate('/site-builder'));
  }, [user?.school]);

  return (
    <div className="fixed inset-0 bg-white z-999 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400">Loading Canvas Editor...</p>
      </div>
    </div>
  );
}
