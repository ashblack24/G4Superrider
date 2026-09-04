// Vercel Serverless Function: /api/lta
// Proxies Land Transport Authority (LTA) DataMall requests with CORS bypass and API key injection.

export default async function handler(req: any, res: any) {
  // CORS Headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, AccountKey, accountkey, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Allowed LTA DataMall Services
  // e.g. CarParkAvailabilityv2, TrafficIncidents, ERPRates, TrafficSpeedBandsv2, BusArrivalv2
  const service = (req.query?.service as string) || 'CarParkAvailabilityv2';

  // Read LTA API Key from:
  // 1. Vercel Environment Variables (LTA_API_KEY, LTA_ACCOUNT_KEY, VITE_LTA_API_KEY)
  // 2. Client-passed header 'AccountKey' or 'x-api-key'
  const apiKey =
    (process.env.LTA_API_KEY as string) ||
    (process.env.LTA_ACCOUNT_KEY as string) ||
    (process.env.VITE_LTA_API_KEY as string) ||
    (req.headers?.['accountkey'] as string) ||
    (req.headers?.['AccountKey'] as string) ||
    (req.headers?.['x-api-key'] as string) ||
    '';

  if (!apiKey) {
    return res.status(200).json({
      status: 'warning',
      message: 'No LTA API Key detected in Vercel environment variables (LTA_API_KEY) or request headers.',
      value: [],
      source: 'fallback_needed',
    });
  }

  try {
    const ltaEndpoint = `https://datamall2.mytransport.sg/ltaodataservice/${service}`;
    const response = await fetch(ltaEndpoint, {
      method: 'GET',
      headers: {
        AccountKey: apiKey,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `LTA DataMall responded with ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error proxying LTA DataMall in Vercel serverless function:', error);
    return res.status(500).json({
      error: 'Failed to contact LTA DataMall API',
      message: error?.message || 'Network error',
    });
  }
}
