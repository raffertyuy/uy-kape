import type { ReactNode } from 'react';
import { useEffect } from 'react';
import PasswordProtection from '@/components/PasswordProtection';
import { trackCoffeeEvent } from '@/utils/analytics';

interface ConditionalPasswordProtectionProps {
  children: ReactNode;
  requiredPassword: string;
  title: string;
  description: string;
  role: 'guest' | 'admin';
  bypassPassword?: boolean;
}

/**
 * ConditionalPasswordProtection component
 * 
 * Conditionally renders password protection based on the bypassPassword prop.
 * When bypassPassword is true, children are rendered directly without authentication.
 * When bypassPassword is false or undefined, full password protection is applied.
 * 
 * @param children - Content to protect/render
 * @param bypassPassword - Whether to bypass password protection
 * @param ...passwordProtectionProps - All other props passed to PasswordProtection
 */
function ConditionalPasswordProtection({
  children,
  bypassPassword = false,
  role,
  ...passwordProtectionProps
}: ConditionalPasswordProtectionProps) {
  // Track bypass access for analytics
  useEffect(() => {
    if (bypassPassword && role === 'guest') {
      trackCoffeeEvent.guestAccess()
    }
  }, [bypassPassword, role])

  // If bypass is enabled, render children directly without password protection
  if (bypassPassword) {
    return <>{children}</>;
  }

  // Otherwise, apply full password protection
  return (
    <PasswordProtection {...passwordProtectionProps} role={role}>
      {children}
    </PasswordProtection>
  );
}

export default ConditionalPasswordProtection;