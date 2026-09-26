export const ADMIN_EMAIL = 'hinata4020196@gmail.com';

export function isAdminEmail(value = '') {
  return (value || '').trim().toLowerCase() === ADMIN_EMAIL;
}

export const ADMIN_ONLY_SIGN_IN =
  'This is an admin account. Admins can only sign in from the admin page.';

export function signupErrorMessage(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('signups not allowed')) {
    return 'New accounts are temporarily unavailable. Please contact support for help.';
  }
  if (msg.includes('error sending confirmation') || msg.includes('email not authorized')) {
    return 'We could not send the confirmation email. Please try again or contact support.';
  }
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists';
  }
  if (msg.includes('database error')) {
    return 'We could not create your account right now. Please try again later.';
  }
  return 'We could not create your account. Please try again.';
}

export function loginErrorMessage(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('user not found')) {
    return 'Invalid email or password';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email before signing in';
  }
  if (msg.includes('too many') || msg.includes('rate limit')) {
    return 'Too many sign-in attempts. Please try again shortly';
  }
  return 'We could not sign you in. Please try again';
}

export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const PASSWORD_RULES = [
  { test: (p) => (p || '').length >= 8, label: '8 or more characters' },
  { test: (p) => /[A-Z]/.test(p || ''), label: 'one uppercase letter' },
  { test: (p) => /[a-z]/.test(p || ''), label: 'one lowercase letter' },
  { test: (p) => /\d/.test(p || ''), label: 'one number' },
];

export function passwordIssues(password = '') {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label);
}

export function validatePassword(password = '') {
  const issues = passwordIssues(password);
  if (issues.length === 0) return null;
  return `Password must include ${issues.join(', ')}.`;
}