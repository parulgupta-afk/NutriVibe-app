import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders Google's own "Sign in with Google" button using Google
 * Identity Services. On success, sends the resulting ID token to our
 * backend for verification via AuthContext's googleLogin, then routes
 * new accounts to onboarding and returning accounts to the dashboard.
 */
const GoogleSignInButton = () => {
  const buttonRef = useRef(null);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google sign-in button will not render.');
      return;
    }

    const handleCredentialResponse = async (response) => {
      const result = await googleLogin(response.credential);
      if (result.success) {
        navigate(result.isNewUser ? '/onboarding' : '/dashboard');
      }
    };

    // Google's script loads async, so wait for it to actually be ready
    const initGoogle = () => {
      if (!window.google?.accounts?.id) {
        setTimeout(initGoogle, 100);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
      }
    };

    initGoogle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-xs text-gray-400 text-center">
        Google sign-in isn't configured yet.
      </p>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;