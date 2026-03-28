import xss from 'xss';

/** Strip HTML for stored text fields (reduces stored XSS). */
export function sanitizePlainText(input: string | undefined | null): string {
  if (input == null) {
    return '';
  }
  return xss(String(input), {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  }).trim();
}
