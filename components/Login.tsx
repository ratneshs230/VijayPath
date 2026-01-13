import React, { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { initRecaptcha, sendOTP, verifyOTP } from '../src/firebase/services/auth';
import { useLanguage, LanguageSwitch } from '../src/i18n';

const Login: React.FC = () => {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize reCAPTCHA on mount
    try {
      recaptchaRef.current = initRecaptcha('recaptcha-container');
    } catch (err) {
      console.error('Error initializing reCAPTCHA:', err);
    }

    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
      }
    };
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t.auth.invalidPhone);
      setIsLoading(false);
      return;
    }

    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = initRecaptcha('recaptcha-container');
      }
      await sendOTP(cleanPhone, recaptchaRef.current);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = initRecaptcha('recaptcha-container');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (otp.length !== 6) {
      setError(t.auth.invalidOtp);
      setIsLoading(false);
      return;
    }

    try {
      await verifyOTP(otp);
      // Auth state change will be handled by the context
    } catch (err: any) {
      setError(err.message || t.auth.invalidOtp);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Switch - top right */}
        <div className="flex justify-end mb-4">
          <LanguageSwitch />
        </div>

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <span className="text-4xl">🗳️</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t.auth.title}</h1>
          <p className="text-gray-500 mt-2">{t.auth.subtitle}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {step === 'phone' ? t.auth.login : t.auth.verifyOtp}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {step === 'phone'
                ? t.auth.enterMobile
                : `${t.auth.otpSentTo} +91 ${phoneNumber}`}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOTP}>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    {t.auth.mobileNumber}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder={t.auth.enterMobile}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-orange-500 outline-none text-lg font-medium"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phoneNumber.length !== 10}
                  className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.auth.sendingOtp}
                    </span>
                  ) : (
                    t.auth.sendOtp
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    {t.auth.enterOtp}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-2xl font-bold text-center tracking-[0.5em]"
                    disabled={isLoading}
                    autoFocus
                    maxLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.auth.verifying}
                    </span>
                  ) : (
                    t.auth.verifyAndLogin
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full mt-3 py-2 text-gray-500 font-medium hover:text-gray-700 transition"
                >
                  ← {t.auth.changeNumber}
                </button>
              </form>
            )}
          </div>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              {t.auth.privacyTerms}
            </p>
          </div>
        </div>

        {/* reCAPTCHA container (invisible) */}
        <div id="recaptcha-container"></div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-8">
          VijayPath 2026 • {t.auth.poweredBy}
        </p>
      </div>
    </div>
  );
};

export default Login;
