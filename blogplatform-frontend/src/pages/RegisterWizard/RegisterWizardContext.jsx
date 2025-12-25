import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const RegisterWizardContext = createContext(null);

const initialProfile = {
  username: '',
  fullName: '',
  birthDate: '',
  bio: '',
  profilePictureUrl: '',
};

export function RegisterWizardProvider({ children }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [temporaryKey, setTemporaryKey] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [lastSentAt, setLastSentAt] = useState(null);

  const setEmail = useCallback((email) => {
    setCredentials((prev) => ({ ...prev, email }));
  }, []);

  const setPassword = useCallback((password) => {
    setCredentials((prev) => ({ ...prev, password }));
  }, []);

  const updateProfile = useCallback((data) => {
    setProfile((prev) => ({ ...prev, ...data }));
  }, []);

  const markSentNow = useCallback(() => setLastSentAt(Date.now()), []);

  const resetWizard = useCallback(() => {
    setCredentials({ email: '', password: '' });
    setTemporaryKey(null);
    setIsVerified(false);
    setProfile(initialProfile);
    setLastSentAt(null);
  }, []);

  const value = useMemo(
    () => ({
      email: credentials.email,
      password: credentials.password,
      temporaryKey,
      isVerified,
      profile,
      lastSentAt,
      setEmail,
      setPassword,
      setTemporaryKey,
      setIsVerified,
      updateProfile,
      markSentNow,
      resetWizard,
    }),
    [
      credentials.email,
      credentials.password,
      temporaryKey,
      isVerified,
      profile,
      lastSentAt,
      setEmail,
      setPassword,
      updateProfile,
      markSentNow,
      resetWizard,
    ]
  );

  return <RegisterWizardContext.Provider value={value}>{children}</RegisterWizardContext.Provider>;
}

export function useRegisterWizard() {
  const context = useContext(RegisterWizardContext);
  if (!context) {
    throw new Error('useRegisterWizard must be used within RegisterWizardProvider');
  }
  return context;
}
