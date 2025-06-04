
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRouteProtection = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (loading) return;

    const isAuthPage = location.pathname === '/auth';
    const isAuthenticated = !!user;

    // If user is not authenticated and not on auth page, redirect to auth
    if (!isAuthenticated && !isAuthPage) {
      navigate('/auth', { replace: true });
      return;
    }

    // If user is authenticated and on auth page, redirect to dashboard
    if (isAuthenticated && isAuthPage) {
      navigate('/', { replace: true });
      return;
    }
  }, [user, loading, location.pathname, navigate]);

  return { user, loading, isAuthenticated: !!user };
};
