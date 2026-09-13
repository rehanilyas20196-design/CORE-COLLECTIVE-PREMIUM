export function signupErrorMessage(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('signups not allowed')) {
    return 'Signups are disabled in Supabase. Turn on "Allow new users to sign up" under Authentication → Sign In / Providers → Email.';
  }
  if (msg.includes('error sending confirmation')) {
    return 'The confirmation email could not be sent. Configure Custom SMTP in Supabase (Authentication → SMTP Settings, e.g. Resend) — or add this email to your Supabase organisation team to use the built-in sender.';
  }
  if (msg.includes('email not authorized')) {
    return 'This email address is not authorised by the built-in Supabase email sender. Add it to your organisation team, or configure Custom SMTP in Supabase.';
  }
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists';
  }
  if (msg.includes('database error')) {
    return 'Signup failed due to a database configuration issue. Please run the trigger fix SQL in your Supabase dashboard (see fix_trigger.sql file).';
  }
  return msg || 'Something went wrong. Please try again.';
}

const PASSWORD_RULES = [
  { test: (p) => (p || '').length >= 8, label: 'at least 8 characters' },
  { test: (p) => /[A-Z]/.test(p || ''), label: 'at least one UPPERCASE letter (A\u2013Z)' },
  { test: (p) => /[a-z]/.test(p || ''), label: 'at least one lowercase letter (a\u2013z)' },
  { test: (p) => /\d/.test(p || ''), label: 'at least one number (0\u20139)' },
];

export function passwordIssues(password = '') {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label);
}

export function validatePassword(password = '') {
  const issues = passwordIssues(password);
  if (issues.length === 0) return null;
  return `Password must include ${issues.join(', ')}.`;
}