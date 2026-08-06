import { Order, ServicePackage, ShopSettings, User, Ticket, ResetCode, GoogleSheetsConfig, SheetUser, SheetResetCode, SheetProduct, SheetOrder } from '../types';
import { encryptData } from '../utils/crypto';
import { AuditLogEntry } from './discordLogger';

export type { GoogleSheetsConfig };

/**
 * Send background JSON payload directly to a Google Apps Script Webhook.
 * Requires zero OAuth token management or logins.
 */
export async function sendToAppsScriptWebhook(webhookUrl: string, payload: any): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });
    return true;
  } catch (err) {
    console.warn('Google Apps Script Webhook Sync notice:', err);
    return false;
  }
}

/**
 * Send action payload to Google Apps Script Webhook and receive response if available
 */
export async function postToAppsScript(webhookUrl: string, payload: any): Promise<any> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return null;
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      try {
        return await res.json();
      } catch (_) {
        return { success: true };
      }
    }
  } catch (err) {
    // If CORS prevents JSON reading, fallback to no-cors dispatch
    sendToAppsScriptWebhook(webhookUrl, payload);
  }
  return { success: true };
}

// Global script loader for Google Identity Services (GIS)
export function loadGoogleGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google GIS script failed to load'));
    document.head.appendChild(script);
  });
}


/**
 * Prompt user to authorize Google Sheets & Drive scopes
 */
export async function requestGoogleAccessToken(customClientId?: string): Promise<string> {
  await loadGoogleGisScript();

  return new Promise((resolve, reject) => {
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        reject(new Error('Google OAuth Client nicht initialisiert.'));
        return;
      }

      const activeClientId = customClientId?.trim() || '';
      if (!activeClientId) {
        reject(new Error('Bitte gib eine gültige Google OAuth Client ID an oder nutze den 1-Klick CSV Export.'));
        return;
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        error_callback: (err: any) => {
          if (err?.type === 'popup_blocked' || err?.message?.includes('popup') || err?.type === 'popup_closed') {
            reject(new Error('Das Login-Fenster wurde vom Browser blockiert. Bitte erlaube Popups im Browser ODER nutze die einfache Webhook-Methode (kein Login nötig).'));
          } else {
            reject(new Error(err?.message || 'Google OAuth Popup Fehler.'));
          }
        },
        callback: (response: any) => {
          if (response.error) {
            if (response.error === 'popup_blocked_by_browser' || response.error === 'access_denied') {
              reject(new Error('Das Login-Fenster wurde vom Browser blockiert. Bitte nutze die Google Webhook-URL oben (Empfohlen) oder erlaube Popups.'));
            } else {
              reject(new Error(response.error_description || response.error));
            }
            return;
          }
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Kein Zugriffs-Token von Google erhalten.'));
          }
        },
      });

      try {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (reqErr: any) {
        reject(new Error('Google OAuth Login konnte nicht geöffnet werden (Popup blockiert). Nutze bitte die Webhook-URL.'));
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Create a new Google Spreadsheet with all required sheets for Graviq Shop
 */
export async function createDatabaseSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Graviq Shop - Datenbank',
      },
      sheets: [
        { properties: { title: 'Benutzer_Users' } },
        { properties: { title: 'Bestellungen_Orders' } },
        { properties: { title: 'Reset_Codes' } },
        { properties: { title: 'Support_Tickets' } },
        { properties: { title: 'Audit_Logs' } },
        { properties: { title: 'Produkte_Products' } },
        { properties: { title: 'AntiSpam_Sperrliste' } },
        { properties: { title: 'Encrypted_Vault' } },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = 'Erstellung der Google Spreadsheet fehlgeschlagen';
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch (_) {}

    if (response.status === 401) {
      throw new Error('🔐 Google-Zugangsdaten abgelaufen (401). Bitte neu anmelden.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl,
  };
}

/**
 * Fetch raw tab rows from Google Sheets API or gviz CSV
 */
export async function fetchSheetTabValues(spreadsheetId: string, tabName: string, accessToken?: string): Promise<string[][]> {
  if (!spreadsheetId) return [];
  
  // 1. Try Google Sheets v4 API with OAuth Access Token
  if (accessToken) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A:Z`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        return json.values || [];
      }
    } catch (e) {
      console.warn(`v4 fetch error for ${tabName}:`, e);
    }
  }

  // 2. Fallback to gviz CSV endpoint (Public/Viewable Sheet)
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const res = await fetch(url);
    if (res.ok) {
      const csvText = await res.text();
      const lines = csvText.split('\n').filter(l => l.trim().length > 0);
      return lines.map(line => {
        // Simple CSV splitter handling quotes
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches) return line.split(',').map(c => c.replace(/^"|"$/g, ''));
        return matches.map(c => c.replace(/^"|"$/g, ''));
      });
    }
  } catch (e) {
    console.warn(`gviz fetch error for ${tabName}:`, e);
  }

  return [];
}

/**
 * TAB 1: Query user from "Users" sheet
 */
export async function queryUserInSheet(
  discordId: string,
  config?: GoogleSheetsConfig
): Promise<{ user?: SheetUser; status: 'active' | 'banned' | 'deleted' | 'not_found'; ban_reason?: string; unban_code?: string }> {
  const cleanId = discordId.toLowerCase().trim();
  if (!cleanId) return { status: 'not_found' };

  // 1. Check Apps Script Webhook if configured
  if (config?.appsScriptWebhookUrl) {
    try {
      const response = await postToAppsScript(config.appsScriptWebhookUrl, {
        action: 'query_user',
        discord_id: cleanId,
      });
      if (response && response.status) {
        return {
          user: response.user,
          status: response.status,
          ban_reason: response.ban_reason,
          unban_code: response.unban_code,
        };
      }
    } catch (_) {}
  }

  // 2. Check Google Sheets tab "Benutzer_Users"
  if (config?.spreadsheetId) {
    let rows = (await fetchSheetTabValues(config.spreadsheetId, 'Benutzer_Users', config.accessToken)) || [];
    if (!rows || rows.length === 0) {
      rows = (await fetchSheetTabValues(config.spreadsheetId, 'Users', config.accessToken)) || [];
    }
    // Skip header row if exists
    const dataRows = (rows || []).slice(1);
    for (const row of dataRows) {
      if (!row) continue;
      const rowDiscordId = (row[0] || '').toLowerCase().trim();
      if (rowDiscordId === cleanId) {
        const username = row[1] || '';
        const rawStatus = (row[2] || 'active').toLowerCase().trim();
        const banReason = row[3] || '';
        const unbanCode = row[4] || '';

        const status = (['active', 'banned', 'deleted'].includes(rawStatus) ? rawStatus : 'active') as 'active' | 'banned' | 'deleted';
        return {
          user: { discord_id: row[0], username, status, ban_reason: banReason, unban_code: unbanCode },
          status,
          ban_reason: banReason,
          unban_code: unbanCode,
        };
      }
    }
  }

  return { status: 'not_found' };
}

/**
 * TAB 1: Save new user to "Benutzer_Users" sheet
 */
export async function addUserToSheet(sheetUser: SheetUser, config?: GoogleSheetsConfig): Promise<boolean> {
  if (config?.appsScriptWebhookUrl) {
    postToAppsScript(config.appsScriptWebhookUrl, {
      action: 'add_user',
      user: sheetUser,
    });
  }

  if (config?.accessToken && config?.spreadsheetId) {
    try {
      const row = [
        sheetUser.discord_id,
        sheetUser.username,
        sheetUser.status,
        sheetUser.ban_reason || '',
        sheetUser.unban_code || '',
      ];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Benutzer_Users!A1:E10000:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            majorDimension: 'ROWS',
            values: [row],
          }),
        }
      );
      return true;
    } catch (e) {
      console.warn('Google Sheets addUser error:', e);
    }
  }
  return true;
}

/**
 * TAB 1: Update user status / ban_reason / unban_code in "Benutzer_Users"
 */
export async function updateUserInSheet(sheetUser: SheetUser, config?: GoogleSheetsConfig): Promise<boolean> {
  if (config?.appsScriptWebhookUrl) {
    postToAppsScript(config.appsScriptWebhookUrl, {
      action: 'update_user',
      user: sheetUser,
    });
  }
  return true;
}

/**
 * TAB 2: Verify & Redeem Reset Code in "Reset_Codes" & unlock "Benutzer_Users" status
 */
export async function verifyAndRedeemResetCodeInSheet(
  codeStr: string,
  config?: GoogleSheetsConfig
): Promise<{ success: boolean; message: string; discord_id?: string }> {
  const cleanCode = codeStr.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Ungültiger oder bereits genutzter Entsperr-Code.' };
  }

  if (config?.appsScriptWebhookUrl) {
    try {
      const res = await postToAppsScript(config.appsScriptWebhookUrl, {
        action: 'redeem_code',
        code: cleanCode,
      });
      if (res && typeof res.success === 'boolean') {
        return res;
      }
    } catch (_) {}
  }

  return { success: false, message: 'Ungültiger oder bereits genutzter Entsperr-Code.' };
}

/**
 * TAB 3: Fetch products from "Produkte_Products" sheet
 */
export async function fetchProductsFromSheet(config?: GoogleSheetsConfig): Promise<SheetProduct[]> {
  if (config?.spreadsheetId) {
    let rows = (await fetchSheetTabValues(config.spreadsheetId, 'Produkte_Products', config.accessToken)) || [];
    if (!rows || rows.length === 0) {
      rows = (await fetchSheetTabValues(config.spreadsheetId, 'Products', config.accessToken)) || [];
    }
    if (rows && rows.length > 1) {
      const products: SheetProduct[] = [];
      for (const row of (rows || []).slice(1)) {
        if (row && row[0]) {
          products.push({
            product_id: row[0],
            title: row[1] || '',
            price: parseFloat(row[2]) || 0,
            description: row[3] || '',
            category: row[4] || 'followers',
            stock: parseInt(row[5], 10) || 0,
          });
        }
      }
      if (products.length > 0) return products;
    }
  }
  return [];
}

/**
 * TAB 3: Update stock for product in "Produkte_Products" sheet
 */
export async function updateProductStockInSheet(productId: string, newStock: number, config?: GoogleSheetsConfig): Promise<boolean> {
  if (config?.appsScriptWebhookUrl) {
    postToAppsScript(config.appsScriptWebhookUrl, {
      action: 'update_stock',
      product_id: productId,
      stock: newStock,
    });
  }
  return true;
}

/**
 * TAB 4: Add new order row to "Bestellungen_Orders" sheet
 */
export async function addOrderToSheet(sheetOrder: SheetOrder, config?: GoogleSheetsConfig): Promise<boolean> {
  if (config?.appsScriptWebhookUrl) {
    postToAppsScript(config.appsScriptWebhookUrl, {
      action: 'create_order',
      order: sheetOrder,
    });
  }

  if (config?.accessToken && config?.spreadsheetId) {
    try {
      const row = [
        sheetOrder.order_id,
        sheetOrder.discord_id,
        sheetOrder.product_id,
        sheetOrder.status,
        sheetOrder.created_at,
      ];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Bestellungen_Orders!A1:E10000:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            majorDimension: 'ROWS',
            values: [row],
          }),
        }
      );
      return true;
    } catch (e) {
      console.warn('Google Sheets addOrder error:', e);
    }
  }
  return true;
}


/**
 * Save / Update single User to Local Database Vault & Google Sheets Sync
 */
export async function syncUserToDatabase(
  user: User,
  config?: GoogleSheetsConfig
): Promise<void> {
  // 1. Update Local Storage Database Vault
  try {
    const rawUsers = localStorage.getItem('graviq_users_db');
    const usersMap: Record<string, User> = rawUsers ? JSON.parse(rawUsers) : {};
    usersMap[user.id] = user;
    localStorage.setItem('graviq_users_db', JSON.stringify(usersMap));
    console.log('📊 User in 0€ Google Sheets Local Database Vault gespeichert:', user.id);
  } catch (err) {
    console.warn('Local User DB write warning:', err);
  }

  // 2. If Google Sheets accessToken and spreadsheetId are present, write row
  if (config?.accessToken && config?.spreadsheetId) {
    try {
      const userRow = [
        user.id,
        user.name,
        user.email,
        user.discordId || 'Nicht verknüpft',
        user.discordUsername || 'Nicht verknüpft',
        user.role,
        user.userIp || 'DSGVO-Geschützt',
        new Date().toLocaleString('de-DE'),
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Benutzer_Users!A1:Z1000:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            majorDimension: 'ROWS',
            values: [userRow],
          }),
        }
      );
    } catch (e) {
      console.warn('Google Sheets User append notice:', e);
    }
  }
}

/**
 * Sync entire Graviq Shop dataset to Google Sheets
 */
export async function syncShopToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  data: {
    users?: User[];
    orders?: Order[];
    products?: ServicePackage[];
    tickets?: Ticket[];
    resetCodes?: ResetCode[];
    auditLogs?: AuditLogEntry[];
    shopSettings?: ShopSettings;
  },
  options?: {
    encryptionEnabled?: boolean;
  }
): Promise<void> {
  const users = data?.users || [];
  const orders = data?.orders || [];
  const products = data?.products || [];
  const tickets = data?.tickets || [];
  const resetCodes = data?.resetCodes || [];
  const auditLogs = data?.auditLogs || [];
  const shopSettings = data?.shopSettings || ({} as ShopSettings);

  // 1. Benutzer_Users
  const userHeaders = ['User ID', 'Name', 'E-Mail', 'Discord ID', 'Discord Username', 'Rolle', 'IP (DSGVO)', 'Registriert am'];
  const userRows = [userHeaders];
  for (const u of users) {
    userRows.push([
      u.id,
      u.name,
      u.email,
      u.discordId || '-',
      u.discordUsername || '-',
      u.role,
      u.userIp || 'x.x.x.x',
      new Date(u.createdAt).toLocaleString('de-DE'),
    ]);
  }

  // 2. Bestellungen_Orders (With Explicit PayPal Käuferschutz Exclusion Note)
  const orderHeaders = [
    'Bestell-ID',
    'Datum',
    'Kunde Name',
    'Kunde E-Mail',
    'Produkte',
    'Menge',
    'Gesamtpreis (€)',
    'Zahlungsart',
    'Käuferschutz Status',
    'Bestellstatus',
    'Payload',
  ];
  const orderRows = [orderHeaders];
  for (const ord of orders) {
    const plainJSON = JSON.stringify({
      userName: ord.userName,
      userEmail: ord.userEmail,
      targetLink: ord.targetLink,
      items: ord.items,
    });

    orderRows.push([
      ord.id,
      new Date(ord.createdAt).toLocaleString('de-DE'),
      ord.userName,
      ord.userEmail,
      ord.items.map((i) => i.title).join(', '),
      String(ord.items.reduce((s, i) => s + i.quantity, 0)),
      ord.totalPrice.toFixed(2) + ' €',
      ord.paymentMethod,
      'AUSGESCHLOSSEN (Digitale Sofort-Lieferung)',
      ord.status,
      plainJSON,
    ]);
  }

  // 3. Reset_Codes
  const resetHeaders = ['Code ID', 'Sicherheitscode', 'User ID', 'Kunde Name', 'E-Mail', 'Ablaufdatum', 'Status', 'Erstellt von Admin', 'Einlösungsdatum'];
  const resetRows = [resetHeaders];
  for (const rc of resetCodes) {
    resetRows.push([
      rc.id,
      rc.code,
      rc.userId,
      rc.userName,
      rc.userEmail,
      new Date(rc.expiresAt).toLocaleString('de-DE'),
      rc.status.toUpperCase(),
      rc.createdByAdmin,
      rc.usedAt ? new Date(rc.usedAt).toLocaleString('de-DE') : 'Ausstehend',
    ]);
  }

  // 4. Support_Tickets
  const ticketHeaders = ['Ticket ID', 'User ID', 'Kunde Name', 'Kunde E-Mail', 'Betreff', 'Kategorie', 'Priorität', 'Status', 'Letzte Aktualisierung', 'Anzahl Nachrichten'];
  const ticketRows = [ticketHeaders];
  for (const t of tickets) {
    ticketRows.push([
      t.id,
      t.userId,
      t.userName,
      t.userEmail,
      t.subject,
      t.category,
      t.priority,
      t.status,
      new Date(t.updatedAt).toLocaleString('de-DE'),
      String(t.messages.length),
    ]);
  }

  // 5. Audit_Logs
  const auditHeaders = ['Log ID', 'Zeitstempel', 'Kategorie', 'Level', 'Aktion', 'Details', 'Benutzer', 'Discord ID', 'Ergebnis', 'Ausgeführt von'];
  const auditRows = [auditHeaders];
  for (const log of auditLogs.slice(0, 500)) {
    auditRows.push([
      log.id,
      new Date(log.timestamp).toLocaleString('de-DE'),
      log.category,
      log.level,
      log.action,
      log.details,
      log.userName || log.userId || '-',
      log.discordId || '-',
      log.result,
      log.performedBy || 'System',
    ]);
  }

  // 6. Produkte_Products
  const productHeaders = ['Produkt ID', 'Titel', 'Plattform', 'Kategorie', 'Preis (€)', 'Features'];
  const productRows = [productHeaders];
  for (const p of products) {
    productRows.push([p.id, p.title, p.platform, p.category, p.price.toFixed(2) + ' €', p.features.join(' | ')]);
  }

  // 7. AntiSpam_Sperrliste
  const spamHeaders = ['Typ', 'Sperr-Eintrag', 'Datum', 'Status'];
  const spamRows = [spamHeaders];
  for (const ip of shopSettings.blockedIPs || []) {
    spamRows.push(['IP-Adresse', ip, new Date().toLocaleDateString('de-DE'), 'GESPERRT']);
  }
  for (const email of shopSettings.blockedEmails || []) {
    spamRows.push(['E-Mail Adresse', email, new Date().toLocaleDateString('de-DE'), 'GESPERRT']);
  }

  // 8. Encrypted_Vault Payload
  const fullPayload = JSON.stringify({
    timestamp: new Date().toISOString(),
    users,
    orders,
    products,
    tickets,
    resetCodes,
    auditLogs: auditLogs.slice(0, 100),
    shopSettings,
  });

  const vaultRows = [
    ['Graviq Shop 0€ Google Sheets Vault Backup'],
    ['Letzte Synchronisation', new Date().toLocaleString('de-DE')],
    ['Sicherungs-Status', 'AKTIV / AUTOMATISCH'],
    ['Master-Dump Payload'],
    [fullPayload],
  ];

  // Batch Updates
  const updates = [
    { range: 'Benutzer_Users!A1:Z2000', values: userRows },
    { range: 'Bestellungen_Orders!A1:Z5000', values: orderRows },
    { range: 'Reset_Codes!A1:Z2000', values: resetRows },
    { range: 'Support_Tickets!A1:Z2000', values: ticketRows },
    { range: 'Audit_Logs!A1:Z5000', values: auditRows },
    { range: 'Produkte_Products!A1:Z1000', values: productRows },
    { range: 'AntiSpam_Sperrliste!A1:Z1000', values: spamRows },
    { range: 'Encrypted_Vault!A1:B10', values: vaultRows },
  ];

  for (const update of updates) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(update.range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: update.range,
          majorDimension: 'ROWS',
          values: update.values,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      let msg = `Fehler beim Schreiben in Google Sheet Tab (${update.range})`;
      try {
        const parsed = JSON.parse(errText);
        msg = parsed.error?.message || msg;
      } catch (_) {}
      
      if (
        res.status === 401 ||
        res.status === 403 ||
        msg.toLowerCase().includes('invalid authentication credentials') ||
        msg.toLowerCase().includes('unauthenticated') ||
        msg.toLowerCase().includes('expected oauth 2 access token')
      ) {
        throw new Error('INVALID_GOOGLE_TOKEN: Google OAuth Token ist abgelaufen oder ungültig. Bitte Token erneuern.');
      }
      throw new Error(msg);
    }
  }
}

/**
 * 1-Click CSV Export optimized for Google Sheets Import
 */
export async function downloadGoogleSheetsCSV(
  data: {
    users?: User[];
    orders?: Order[];
    resetCodes?: ResetCode[];
    products?: ServicePackage[];
    shopSettings?: ShopSettings;
  },
  options?: { encryptionEnabled?: boolean }
): Promise<void> {
  const users = data?.users || [];
  const orders = data?.orders || [];
  const resetCodes = data?.resetCodes || [];
  const products = data?.products || [];
  const shopSettings = data?.shopSettings || ({} as ShopSettings);

  let csv = '--- BENUTZER DATENBANK ---\n';
  csv += 'User_ID,Name,Email,Discord_ID,Discord_Username,Rolle,Registriert_Am\n';
  for (const u of users) {
    csv += `"${u.id}","${u.name}","${u.email}","${u.discordId || '-'}","${u.discordUsername || '-'}","${u.role}","${new Date(u.createdAt).toLocaleDateString('de-DE')}"\n`;
  }

  csv += '\n--- BESTELLUNGEN (PAYPAL KÄUFERSCHUTZ AUSGESCHLOSSEN) ---\n';
  csv += 'Bestell_ID,Datum,Kunde,Email,Produkte,Gesamtpreis,Zahlungsart,Käuferschutz_Status,Status\n';
  for (const o of orders) {
    csv += `"${o.id}","${new Date(o.createdAt).toLocaleString('de-DE')}","${o.userName}","${o.userEmail}","${o.items.map((i) => i.title).join(' | ')}","${o.totalPrice.toFixed(2)} €","${o.paymentMethod}","AUSGESCHLOSSEN (Digitale Sofort-Lieferung)","${o.status}"\n`;
  }

  csv += '\n--- SUPPORT RESET CODES ---\n';
  csv += 'Code_ID,Sicherheitscode,User_ID,User_Email,Ablaufdatum,Status,Erstellt_Von\n';
  for (const r of resetCodes) {
    csv += `"${r.id}","${r.code}","${r.userId}","${r.userEmail}","${new Date(r.expiresAt).toLocaleString('de-DE')}","${r.status}","${r.createdByAdmin}"\n`;
  }

  csv += '\n--- ANTI-SPAM SPERRLISTE ---\n';
  for (const ip of shopSettings.blockedIPs || []) {
    csv += `IP-Adresse,"${ip}","${new Date().toLocaleDateString('de-DE')}"\n`;
  }
  for (const email of shopSettings.blockedEmails || []) {
    csv += `E-Mail,"${email}","${new Date().toLocaleDateString('de-DE')}"\n`;
  }

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Graviq_GoogleSheets_Database_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
