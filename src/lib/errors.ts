export function friendlyError(error: unknown): string {
  const value = error as { code?: string; message?: string } | null;
  if (value?.code === 'PGRST205' || value?.code === '42P01' || value?.code === 'PGRST202') return 'The community database is still being set up. Please try again later.';
  if (value?.code === '42501') return 'This action is not available for your account or this story.';
  if (value?.code === '23505') return 'This was already saved. Refresh to see the latest version.';
  if (value?.code === 'otp_expired') return 'That code is invalid or expired. Request a new code and try again.';
  if (value?.code === 'over_email_send_rate_limit' || value?.code === 'over_request_rate_limit') return 'Please wait a minute before requesting another code.';
  if (value?.code === 'email_address_not_authorized') return 'Email delivery is still being configured. Please try the demo for now.';
  return 'Could not complete the request. Check your connection and try again.';
}
