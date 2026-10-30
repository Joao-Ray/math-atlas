import type { ExpoConfig } from 'expo/config';
import application from './app.json';

// Hosting uses a client-routed export; local/native development retains API routes.
export default (): ExpoConfig => {
  const base = application.expo as ExpoConfig;
  return { ...base, name: 'Lemivanta', web: { ...base.web, output: process.env.LEMIVANTA_WEB_EXPORT === '1' ? 'single' : 'server' } };
};
