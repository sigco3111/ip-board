/**
 * Converts a country code (e.g., 'US') to its localized full name (e.g., '미국').
 * @param code The two-letter country code.
 * @returns The localized country name, or the original code if conversion fails.
 */
export const getCountryNameByCode = (code?: string): string | undefined => {
  if (!code) {
    return undefined;
  }
  try {
    // 'ko' for Korean.
    const regionNames = new Intl.DisplayNames(['ko'], { type: 'region' });
    return regionNames.of(code);
  } catch (error) {
    console.error(`Could not find country name for code: ${code}`, error);
    // Fallback to the code itself if the name can't be found
    return code;
  }
};