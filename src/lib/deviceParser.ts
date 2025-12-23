/**
 * Device and Browser Parser Utilities
 * Parse user-agent strings to extract device and browser information
 */

/**
 * Parse device type from user-agent string
 * @param userAgent - User-agent string from request headers
 * @returns Device type: 'mobile', 'tablet', or 'desktop'
 */
export function parseDeviceType(userAgent: string | null): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  // Check for mobile devices
  if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini/i.test(ua)) {
    return 'mobile';
  }

  // Check for tablets
  if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * Parse browser name from user-agent string
 * @param userAgent - User-agent string from request headers
 * @returns Browser name (Chrome, Firefox, Safari, Edge, etc.)
 */
export function parseBrowser(userAgent: string | null): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  // Check in order of specificity
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('opera/') || ua.includes('opr/')) return 'Opera';
  if (ua.includes('msie') || ua.includes('trident/')) return 'IE';

  return 'other';
}

/**
 * Parse OS from user-agent string
 * @param userAgent - User-agent string from request headers
 * @returns Operating system (Windows, macOS, Linux, iOS, Android, etc.)
 */
export function parseOS(userAgent: string | null): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os x')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('android')) return 'Android';

  return 'other';
}
