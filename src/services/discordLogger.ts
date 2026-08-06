import { ShopSettings } from '../types';

export type LogCategory = 'user' | 'shop' | 'support' | 'admin';
export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  level: LogLevel;
  action: string;
  details: string;
  userId?: string;
  userName?: string;
  discordId?: string;
  ipAddress?: string;
  performedBy?: string;
  result: 'Erfolgreich' | 'Fehlgeschlagen';
}

// DSGVO-compliant IP anonymizer
export function anonymizeIp(ip?: string): string {
  if (!ip) return 'x.x.x.x (Anonymisiert)';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  return 'x.x.x.x (Anonymisiert)';
}

export async function sendDiscordLog(
  webhookUrl: string | undefined,
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
  };

  // Save to local Audit Log Vault
  try {
    const existingRaw = localStorage.getItem('graviq_audit_logs');
    const logs: AuditLogEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
    logs.unshift(fullEntry);
    // Keep last 500 logs locally
    if (logs.length > 500) logs.pop();
    localStorage.setItem('graviq_audit_logs', JSON.stringify(logs));
  } catch (err) {
    console.warn('Local audit log write warning:', err);
  }

  // Determine Embed Color
  let color = 0x3b82f6; // Blue default
  if (entry.level === 'success') color = 0x10b981; // Green
  if (entry.level === 'warning') color = 0xf59e0b; // Yellow
  if (entry.level === 'error') color = 0xef4444; // Red

  // Category Emoji Prefix
  const categoryEmojis: Record<LogCategory, string> = {
    user: '👤 [BENUTZER]',
    shop: '🛒 [SHOP & PAYPAL]',
    support: '🎟️ [SUPPORT & RESET]',
    admin: '⚙️ [ADMINISTRATION]',
  };

  const embed = {
    title: `${categoryEmojis[entry.category]} ${entry.action}`,
    description: entry.details,
    color,
    fields: [
      {
        name: '👤 Benutzer / Kunde',
        value: entry.userName ? `${entry.userName} (${entry.userId || 'Keine ID'})` : 'Anonym / System',
        inline: true,
      },
      {
        name: '👾 Discord ID',
        value: entry.discordId || 'Nicht verknüpft',
        inline: true,
      },
      {
        name: '🛡️ Ergebnis',
        value: entry.result === 'Erfolgreich' ? '✅ Erfolgreich' : '❌ Fehlgeschlagen',
        inline: true,
      },
      {
        name: '🛠️ Ausgeführt von',
        value: entry.performedBy || entry.userName || 'System Auto-Task',
        inline: true,
      },
      {
        name: '🌐 IP-Adresse (DSGVO)',
        value: anonymizeIp(entry.ipAddress),
        inline: true,
      },
      {
        name: '📅 Zeitstempel',
        value: new Date(fullEntry.timestamp).toLocaleString('de-DE'),
        inline: true,
      },
    ],
    footer: {
      text: 'Graviq Shop Security Audit',
    },
    timestamp: fullEntry.timestamp,
  };

  // Dispatch Webhook if URL is configured
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Graviq Shop Security Logger',
          avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
          embeds: [embed],
        }),
      });
      console.log('📢 Discord Log Webhook sent successfully:', entry.action);
    } catch (webhookErr) {
      console.warn('Discord Webhook Send Notice:', webhookErr);
    }
  }

  return fullEntry;
}
