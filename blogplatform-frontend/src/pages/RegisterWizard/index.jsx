import { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import StepEmail from './StepEmail';
import StepCode from './StepCode';
import StepProfile from './StepProfile';
import { RegisterWizardProvider, useRegisterWizard } from './RegisterWizardContext';

function RegisterWizardShell() {
  const location = useLocation();
  const { temporaryKey, isVerified } = useRegisterWizard();

  const stepSlug = (() => {
    if (location.pathname.includes('/register/profile')) return 'profile';
    if (location.pathname.includes('/register/code')) return 'code';
    return 'email';
  })();

  const steps = [
    { id: 'email', title: 'Email', description: 'Код и пароль' },
    { id: 'code', title: 'Код', description: 'Подтверждение', disabled: !temporaryKey },
    { id: 'profile', title: 'Профиль', description: 'Данные аккаунта', disabled: !isVerified },
  ];

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-base-200 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Регистрация</h1>
              <p className="text-base-content/70">Три простых шага: email → код → профиль</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-2 rounded-lg border ${
                    stepSlug === step.id ? 'border-primary bg-primary/10' : 'border-base-300'
                  } ${step.disabled ? 'opacity-60' : ''}`}
                >
                  <div className="text-sm font-semibold flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    {step.title}
                  </div>
                  <div className="text-xs text-base-content/60">{step.description}</div>
                </div>
              ))}
            </div>
          </div>

          <Suspense fallback={<WizardSkeleton />}>
            <Routes>
              <Route index element={<StepEmail />} />
              <Route
                path="code"
                element={
                  <StepGuard>
                    <StepCode />
                  </StepGuard>
                }
              />
              <Route
                path="profile"
                element={
                  <StepGuard requireVerification>
                    <StepProfile />
                  </StepGuard>
                }
              />
              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </motion.div>
  );
}

function StepGuard({ children, requireVerification = false }) {
  const { temporaryKey, isVerified } = useRegisterWizard();

  if (!temporaryKey) return <Navigate to="/register" replace />;
  if (requireVerification && !isVerified) return <Navigate to="/register/code" replace />;
  return children;
}

function WizardSkeleton() {
  return (
    <div className="min-h-[200px] grid place-items-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
}

export default function RegisterWizard() {
  return (
    <RegisterWizardProvider>
      <RegisterWizardShell />
    </RegisterWizardProvider>
  );
}
