/** The database stores money as integer minor units (paise); the UI works in whole currency units. */
export const toMinor = (amount: number): number => Math.round(amount * 100);
export const fromMinor = (minor: number | bigint): number => Number(minor) / 100;
