import { promises as dns } from 'dns';

interface DomainVerification {
  verified: boolean;
  walletAddress?: string;
}

export async function verifyDomainOwnership(
  domain: string,
): Promise<DomainVerification> {
  try {
    const records = await dns.resolveTxt(`_unbrowse.${domain}`);
    for (const record of records) {
      const txt = record.join('');
      const match = txt.match(/wallet=([1-9A-HJ-NP-Za-km-z]{32,44})/);
      if (match) {
        return { verified: true, walletAddress: match[1] };
      }
    }
    return { verified: false };
  } catch {
    return { verified: false };
  }
}
