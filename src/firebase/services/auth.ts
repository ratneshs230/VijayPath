import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config';

// Store confirmation result for OTP verification
let confirmationResult: ConfirmationResult | null = null;

// Initialize reCAPTCHA verifier
export const initRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
};

// Send OTP to phone number
export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<boolean> => {
  try {
    // Format phone number for India (add +91 if not present)
    const formattedNumber = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+91${phoneNumber.replace(/\D/g, '')}`;

    confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier);
    return true;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
};

// Verify OTP
export const verifyOTP = async (otp: string): Promise<User> => {
  if (!confirmationResult) {
    throw new Error('Please request OTP first');
  }

  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error(error.message || 'Invalid OTP');
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
    confirmationResult = null;
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Subscribe to auth state changes
export const subscribeToAuthState = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};
