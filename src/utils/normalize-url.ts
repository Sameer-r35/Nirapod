export function normalizeFacebookUrl(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^(www\.|m\.)?facebook\.com\//, '')
    .replace(/^fb\.com\//, '')
    .replace(/\/$/, '')
    .split('?')[0]
    .replace(/\s+/g, '')        // strip all spaces
    .replace(/-/g, '')          // strip hyphens
    .replace(/\./g, '')         // strip dots
}

/**
 * Checks if a string is a valid Bangladeshi bKash/Nagad mobile number.
 * Accepts formats like '+8801XXXXXXXXX', '01XXXXXXXXX', or '1XXXXXXXXX'.
 */
export function isBkashNumber(input: string): boolean {
  const cleaned = input.replace(/\s+/g, '').replace(/-/g, '')
  const regex = /^(?:\+880|0)?1[3-9]\d{8}$/
  return regex.test(cleaned)
}