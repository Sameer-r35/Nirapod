export function normalizeFacebookUrl(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^(www\.|m\.)?facebook\.com\//, '')
    .replace(/^fb\.com\//, '')
    .replace(/\/$/, '')
    .split('?')[0]
}

export function isBkashNumber(input: string): boolean {
  return /^01[3-9]\d{8}$/.test(input.trim())
}