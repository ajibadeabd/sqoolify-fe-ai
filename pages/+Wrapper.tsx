import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useData } from 'vike-react/useData';
import { SchoolProvider } from '../lib/school-context';
import { useAuthStore } from '../lib/stores/auth-store';
import type { Data } from './+data';

export default function Wrapper({ children }: { children: ReactNode }) {
  const { school, slug } = useData<Data>() || {};

  useEffect(() => {
    useAuthStore.getState()._hydrate()
  }, [])

  if (slug && !school) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4">
          <a href="https://sqoolify.com" className="text-xl font-bold text-blue-600">
            Sqoolify
          </a>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            {/* Illustration */}
            <div className="relative mx-auto mb-8 w-48 h-48">
              <div className="absolute inset-0 bg-blue-100 rounded-full opacity-50" />
              <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-20 h-20 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">School Not Found</h1>
            <p className="text-gray-500 text-lg mb-2">
              We couldn't find a school registered at
            </p>
            <p className="inline-block bg-gray-100 text-gray-700 font-mono text-sm px-4 py-2 rounded-lg mb-8">
              {slug}.sqoolify.com
            </p>

            <div className="space-y-3">
              <a
                href="https://sqoolify.com"
                className="block w-full max-w-xs mx-auto bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
              >
                Go to Sqoolify
              </a>
              <a
                href="https://sqoolify.com/register"
                className="block w-full max-w-xs mx-auto bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition text-sm"
              >
                Register Your School
              </a>
            </div>

            <p className="text-gray-400 text-sm mt-8">
              Think this is a mistake? Double-check the URL or contact your school administrator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} Sqoolify. All rights reserved.</p>
        </div>
      </div>
    );
  }

  return (
    <SchoolProvider school={school ?? null} slug={slug ?? null}>
      {children}
    </SchoolProvider>
  )
}
