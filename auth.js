export const isAdmin = (req) => !!process.env.ADMIN_KEY && req.headers.get('x-admin-key') === process.env.ADMIN_KEY;
export const isCron = (req) => !!process.env.CRON_SECRET && req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
