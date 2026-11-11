/** Date helpers. Data is UTC; everything is shown in Copenhagen time, 24h clock. */
const TZ = 'Europe/Copenhagen';

const monthFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, month: 'short' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });

/** "Nov" */
export const formatMonth = (iso: string) => monthFmt.format(new Date(iso));
/** "4" */
export const formatDay = (iso: string) => dayFmt.format(new Date(iso));
/** "13:00" */
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

const longDateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: 'long', year: 'numeric' });
/** "23 September 2026, 23:59" */
export const formatLongDateTime = (iso: string) => `${longDateFmt.format(new Date(iso))}, ${formatTime(iso)}`;
