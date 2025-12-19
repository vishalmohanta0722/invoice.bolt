import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { getCompany } from './lib/auth';
import App from './App';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { CompanySetup } from './pages/CompanySetup';

type AuthPage = 'sign-in' | 'sign-up' | 'company-setup' | 'app';

export function AppWrapper() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<AuthPage>('sign-in');
  const [userCompany, setUserCompany] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(session);

          if (session?.user) {
            const { data: company } = await getCompany(session.user.id);
            if (isMounted) {
              setUserCompany(company);
              setCurrentPage(company ? 'app' : 'company-setup');
            }
          } else {
            if (isMounted) {
              setCurrentPage('sign-in');
            }
          }
          if (isMounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setCurrentPage('sign-in');
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setSession(session);

        (async () => {
          try {
            if (session?.user) {
              const { data: company } = await getCompany(session.user.id);
              if (isMounted) {
                setUserCompany(company);
                setCurrentPage(company ? 'app' : 'company-setup');
              }
            } else {
              if (isMounted) {
                setCurrentPage('sign-in');
              }
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            if (isMounted) {
              setCurrentPage('sign-in');
            }
          }
        })();
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-gray-600 border-t-white rounded-full"></div>
          </div>
          <p className="text-white mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'sign-in') {
    return (
      <SignIn
        onSignInSuccess={() => setCurrentPage('app')}
        onNavigateToSignUp={() => setCurrentPage('sign-up')}
      />
    );
  }

  if (currentPage === 'sign-up') {
    return (
      <SignUp
        onSignUpSuccess={() => setCurrentPage('company-setup')}
        onNavigateToSignIn={() => setCurrentPage('sign-in')}
      />
    );
  }

  if (currentPage === 'company-setup' && session?.user) {
    return (
      <CompanySetup
        userId={session.user.id}
        onSetupComplete={() => setCurrentPage('app')}
      />
    );
  }

  return <App userCompany={userCompany} />;
}
