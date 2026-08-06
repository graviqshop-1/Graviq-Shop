import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  generateTOTPSecret,
  verifyTOTPCode,
  TOTPSetupResult,
} from '../utils/totp';
import {
  requestGoogleAccessToken,
  createDatabaseSpreadsheet,
  syncShopToGoogleSheets,
  downloadGoogleSheetsCSV,
  sendToAppsScriptWebhook,
  GoogleSheetsConfig,
} from '../services/googleSheetsService';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  QrCode,
  ExternalLink,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Database,
  Download,
  Copy,
  Check,
  Info,
  Sliders,
  Send,
  Clock,
  UserCheck,
  Zap,
  Trash2,
  Filter,
  ListChecks,
  Layers,
} from 'lucide-react';

export const GoogleSheetsSecurityModule: React.FC = () => {
  const {
    users,
    orders,
    products,
    tickets,
    auditLogs,
    shopSettings,
    updateShopSettings,
    generateAccountResetCode,
    resetCodes,
    currentUser,
    pendingSyncEvents,
    approveSyncEvents,
    dismissSyncEvents,
    clearAllSyncEvents,
  } = useShop();

  // Load stored Google Sheets Config from Shop Settings or local state
  const sheetsConfig: GoogleSheetsConfig = shopSettings.googleSheetsConfig || {
    autoSyncEnabled: true,
    encryptionEnabled: true,
  };

  const [accessToken, setAccessToken] = useState<string>(sheetsConfig.accessToken || '');
  const [clientId, setClientId] = useState<string>(sheetsConfig.clientId || '');
  const [spreadsheetId, setSpreadsheetId] = useState<string>(sheetsConfig.spreadsheetId || '');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(sheetsConfig.spreadsheetUrl || '');
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(sheetsConfig.appsScriptWebhookUrl || '');
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [isAutoSync, setIsAutoSync] = useState<boolean>(sheetsConfig.autoSyncEnabled ?? true);
  const [isEncryptionOn, setIsEncryptionOn] = useState<boolean>(sheetsConfig.encryptionEnabled ?? true);
  const [lastSynced, setLastSynced] = useState<string>(sheetsConfig.lastSyncedAt || '');
  const [syncModeState, setSyncModeState] = useState<'instant' | 'staged'>(sheetsConfig.syncMode || 'staged');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  // 2FA Google Authenticator State
  const defaultAccountLabel = currentUser?.name
    ? `${currentUser.name} (${currentUser.email || currentUser.role || 'User'})`
    : 'Admin Staff';
  const [authAccountName, setAuthAccountName] = useState<string>(defaultAccountLabel);
  const [totpSetup, setTotpSetup] = useState<TOTPSetupResult | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');

  // Lock / Unlock State
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [showClientIdInput, setShowClientIdInput] = useState<boolean>(false);

  // Reset Code Generator State
  const [resetTargetEmail, setResetTargetEmail] = useState('');
  const [resetExpMinutes, setResetExpMinutes] = useState<number>(30);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string>('');
  const [copiedResetCode, setCopiedResetCode] = useState<boolean>(false);

  // Discord Webhook State
  const [webhookUrlInput, setWebhookUrlInput] = useState(shopSettings.discordWebhookUrl || '');
  const [webhookTestStatus, setWebhookTestStatus] = useState<string>('');

  const handleCreateResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetEmail.trim()) return;
    const codeObj = generateAccountResetCode(
      resetTargetEmail.trim(),
      resetExpMinutes,
      currentUser?.id || 'admin_staff'
    );
    setLastGeneratedCode(codeObj.code);
    setStatusMessage({
      type: 'success',
      text: `🔑 Sicherheitscode ${codeObj.code} generiert! Ablaufzeit: ${resetExpMinutes} Minuten.`,
    });
  };

  const handleSaveDiscordWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings({ discordWebhookUrl: webhookUrlInput.trim() });
    setWebhookTestStatus('✅ Discord Webhook URL gespeichert!');
    setTimeout(() => setWebhookTestStatus(''), 3000);
  };

  // Initialize or load TOTP setup if not created yet
  useEffect(() => {
    if (!sheetsConfig.totpSecret) {
      const activeLabel = authAccountName.trim() || defaultAccountLabel;
      generateTOTPSecret(activeLabel).then(setTotpSetup).catch(console.error);
    }
  }, [sheetsConfig.totpSecret]);

  const handleResetTOTP = async () => {
    try {
      const activeLabel = authAccountName.trim() || defaultAccountLabel;
      const newSetup = await generateTOTPSecret(activeLabel);
      setTotpSetup(newSetup);
      updateShopSettings({
        googleSheetsConfig: {
          ...sheetsConfig,
          totpSecret: undefined,
          isTwoFactorSetup: false,
        },
      });
      setStatusMessage({
        type: 'success',
        text: `🔄 Neuer 2FA QR-Code für "${activeLabel}" generiert! Du kannst diesen jetzt in deiner Google Authenticator App scannen.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Fehler beim Erstellen des neuen 2FA Schlüssel: ${err.message}`,
      });
    }
  };

  const saveConfig = (updated: Partial<GoogleSheetsConfig>) => {
    const newConfig: GoogleSheetsConfig = {
      ...sheetsConfig,
      ...updated,
      spreadsheetId: updated.spreadsheetId !== undefined ? updated.spreadsheetId : spreadsheetId,
      spreadsheetUrl: updated.spreadsheetUrl !== undefined ? updated.spreadsheetUrl : spreadsheetUrl,
      accessToken: updated.accessToken !== undefined ? updated.accessToken : accessToken,
      clientId: updated.clientId !== undefined ? updated.clientId : clientId,
      appsScriptWebhookUrl: updated.appsScriptWebhookUrl !== undefined ? updated.appsScriptWebhookUrl : appsScriptUrl,
      autoSyncEnabled: updated.autoSyncEnabled !== undefined ? updated.autoSyncEnabled : isAutoSync,
      encryptionEnabled: updated.encryptionEnabled !== undefined ? updated.encryptionEnabled : isEncryptionOn,
      lastSyncedAt: updated.lastSyncedAt !== undefined ? updated.lastSyncedAt : lastSynced,
    };
    updateShopSettings({ googleSheetsConfig: newConfig });
  };

  // Direct Google Sheets API Authorization Flow
  const handleConnectGoogle = async () => {
    if (!clientId.trim() && !accessToken.trim()) {
      setStatusMessage({
        type: 'error',
        text: '❌ Für direkte API-Kopplung benötigst du eine Google Client-ID (aus der Google Cloud Console) ODER nutze direkt unten den 1-Klick CSV-Export für Google Sheets!',
      });
      setShowClientIdInput(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      let activeToken = accessToken.trim();
      if (!activeToken) {
        activeToken = await requestGoogleAccessToken(clientId);
        setAccessToken(activeToken);
      }

      setStatusMessage({ type: 'success', text: '✅ Mit Google Konto verbunden! Erstelle jetzt die Tabellendatei.' });

      // Create spreadsheet if not exists
      if (!spreadsheetId) {
        const sheet = await createDatabaseSpreadsheet(activeToken);
        setSpreadsheetId(sheet.id);
        setSpreadsheetUrl(sheet.url);
        saveConfig({ accessToken: activeToken, clientId, spreadsheetId: sheet.id, spreadsheetUrl: sheet.url });
        setStatusMessage({ type: 'success', text: `✅ Google Sheet "${sheet.id.slice(0, 10)}..." erfolgreich in Google Drive erstellt!` });
      } else {
        saveConfig({ accessToken: activeToken, clientId });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Fehler beim Verbinden: ${err.message}. Tipp: Nutze alternativ den 1-Klick Datei-Export für Google Sheets!`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click CSV Export formatted for Google Sheets import
  const handleDownloadCSV = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: '⏳ Generiere verschlüsselte Google Sheets CSV-Datei...' });
    try {
      await downloadGoogleSheetsCSV(
        { users, orders, resetCodes, products, shopSettings },
        { encryptionEnabled: isEncryptionOn }
      );
      setStatusMessage({
        type: 'success',
        text: '🎉 Datei heruntergeladen! Öffne Google Sheets ➔ Datei ➔ Importieren ➔ Auswählen.',
      });
    } catch (err: any) {
      console.error('CSV export failed:', err);
      setStatusMessage({ type: 'error', text: `Export-Fehler: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Unlock Vault with Google Authenticator Code
  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const secretToVerify = sheetsConfig.totpSecret || totpSetup?.secret;
    if (!secretToVerify) {
      setStatusMessage({ type: 'error', text: 'Kein TOTP Secret vorhanden.' });
      return;
    }

    const isValid = verifyTOTPCode(secretToVerify, twoFactorCode);
    if (!isValid) {
      setStatusMessage({ type: 'error', text: '❌ Ungültiger Google Authenticator 6-Stelliger Code! Bitte überprüfe deine App.' });
      return;
    }

    // Save TOTP Secret to config if first time setup
    if (!sheetsConfig.totpSecret && totpSetup) {
      saveConfig({
        totpSecret: totpSetup.secret,
        isTwoFactorSetup: true,
      });
    }

    setIsVaultUnlocked(true);
    setStatusMessage({ type: 'success', text: '🔓 Tresor erfolgreich entsperrt! Du hast vollen Zugriff auf die Google Sheets Datenbank.' });
  };

  // 1-Click Sync Data to Google Sheets
  const handleManualSync = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: '⏳ Synchronisiere alle Shop-Daten mit deiner Google Sheets Tabelle...' });

    let webhookSuccess = false;
    const url = (appsScriptUrl || sheetsConfig.appsScriptWebhookUrl || '').trim();

    if (url) {
      try {
        webhookSuccess = await sendToAppsScriptWebhook(url, {
          timestamp: new Date().toLocaleString('de-DE'),
          spreadsheetId: spreadsheetId || '1ppYOLzz7bIA2-xCk8BFPT74dus-1mcAEqU0zVjkzjHI',
          orders,
          products,
          users,
          tickets,
          resetCodes,
          auditLogs,
          shopSettings,
        });
      } catch (e) {
        console.warn('Webhook sync error:', e);
      }
    }

    // Try OAuth sync if token or clientId is present
    let oauthSuccess = false;
    if (spreadsheetId) {
      try {
        let activeToken = accessToken;
        if (!activeToken && clientId.trim()) {
          try {
            activeToken = await requestGoogleAccessToken(clientId);
            setAccessToken(activeToken);
          } catch (_) {}
        }
        if (activeToken) {
          await syncShopToGoogleSheets(
            activeToken,
            spreadsheetId,
            { users, orders, products, tickets, resetCodes, auditLogs, shopSettings },
            { encryptionEnabled: isEncryptionOn }
          );
          oauthSuccess = true;
        }
      } catch (err: any) {
        console.warn('Direct OAuth sync notice:', err);
      }
    }

    const nowStr = new Date().toLocaleString('de-DE');
    setLastSynced(nowStr);
    saveConfig({ lastSyncedAt: nowStr });
    setIsLoading(false);

    if (webhookSuccess || oauthSuccess) {
      setStatusMessage({
        type: 'success',
        text: `🎉 Erschöpfend synchronisiert! ${orders.length} Bestellungen, ${products.length} Produkte, ${users.length} Kunden und ${tickets.length} Tickets wurden direkt in dein Google Sheet geschrieben!`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: '❌ Synchronisation fehlgeschlagen. Bitte prüfe deine Webhook-URL oder trage sie oben ein.',
      });
    }
  };

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Google Sheets Datenbank
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase">
                AES-256 + Google Authenticator
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchrosiere alle Graviq-Shop Daten in deine eigene Google Drive Tabelle – geschützt mit Passwort & 6-stelligem Security Key.
            </p>
          </div>
        </div>

        {/* Lock Status Pill */}
        <div className="flex items-center gap-2">
          {isVaultUnlocked ? (
            <div className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
              <Unlock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Tresor Entsperrt</span>
            </div>
          ) : (
            <div className="bg-red-950 text-red-300 border border-red-800 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-red-400" />
              <span>Tresor Sperre Aktiv</span>
            </div>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-red-950/80 border-red-800 text-red-200'
              : 'bg-cyan-950/80 border-cyan-800 text-cyan-200'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
          {statusMessage.type === 'info' && <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />}
          <div className="leading-relaxed">{statusMessage.text}</div>
        </div>
      )}

      {/* STEP 1: Google Authenticator 2FA & Password Setup / Unlock */}
      {!isVaultUnlocked ? (
        <div className="bg-slate-900/90 border border-indigo-900/40 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <span>Google Authenticator & Passwort Entsperrung</span>
          </div>

          {/* Show existing 2FA status or QR Code Setup */}
          {sheetsConfig.totpSecret && sheetsConfig.isTwoFactorSetup ? (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 2FA Schlüssel eingerichtet für: <strong className="text-white">{currentUser?.name || 'Admin'}</strong>
                </span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  Eigener Name in Google Authenticator: <span className="text-indigo-300 font-mono font-semibold">{authAccountName}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetTOTP}
                className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Neuen QR-Code generieren
              </button>
            </div>
          ) : totpSetup ? (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>Schritt 1: Google Authenticator App verbinden</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Konto-Name:</span>
                  <input
                    type="text"
                    value={authAccountName}
                    onChange={(e) => setAuthAccountName(e.target.value)}
                    placeholder="z.B. Nico (Admin)"
                    className="bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1 rounded-lg w-48 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleResetTOTP}
                    className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold flex items-center gap-1 underline transition-colors shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Aktualisieren
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Öffne deine <strong>Google Authenticator</strong> App auf deinem Smartphone, tippe auf das <strong>+ Symbol</strong> und scanne diesen persönlichen QR-Code (angezeigt als <strong className="text-indigo-300">Graviq Shop: {authAccountName}</strong>):
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0">
                  <img src={totpSetup.qrCodeUrl} alt="Google Authenticator QR Code" className="w-40 h-40 object-contain" />
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Geheimschlüssel (Manuelle Eingabe):</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-slate-900 text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-sm font-bold select-all">
                        {totpSetup.secret}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(totpSetup.secret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Schlüssel kopieren"
                      >
                        {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Account Name in App: <strong className="text-white">Strauss - Graviq DB</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Verification Form */}
          <form onSubmit={handleUnlockVault} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-300 font-bold mb-1 text-xs">6-Stelliger Code (Google Authenticator):</label>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="z.B. 489201"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-cyan-300 font-mono text-base font-bold tracking-widest text-center focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-indigo-900/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              <Unlock className="w-4 h-4" />
              <span>Mit Google Authenticator Code Entsperren</span>
            </button>
          </form>
        </div>
      ) : (
        /* STEP 2: Vault Unlocked - Google Sheets Sync & Control Center */
        <div className="space-y-6">
          {/* OPTION 1: Google Apps Script Webhook Permanent Live Sync Card */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-indigo-900/80 space-y-4 text-xs shadow-xl">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-white font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Google Apps Script Webhook (100% Automatischer Dauer-Live-Sync)</span>
              </span>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                KEIN TOKEN-ABLAUF ⚡
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Trägt jede neue Bestellung und jede Kundenaktion <strong>vollautomatisch in Echtzeit ohne OAuth-Login / Ablaufdatum</strong> in deine Google Tabelle ein!
            </p>

            <div className="space-y-2">
              <label className="block text-slate-300 font-bold text-[11px]">Deine Google Apps Script Webhook URL:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={appsScriptUrl}
                  onChange={(e) => {
                    setAppsScriptUrl(e.target.value);
                    saveConfig({ appsScriptWebhookUrl: e.target.value });
                  }}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    saveConfig({ appsScriptWebhookUrl: appsScriptUrl });
                    setStatusMessage({ type: 'success', text: '⚡ Webhook URL gespeichert! Graviq sendet jetzt alle Daten live in dein Google Sheet.' });
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/40"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>URL Speichern</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 text-xs mt-2"
              >
                <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>⚡ Alle Shop-Daten (Bestellungen, Produkte, Kunden, Tickets) JETZT in Google Sheet einspeichern</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAppsScriptGuide(!showAppsScriptGuide)}
              className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer pt-1 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{showAppsScriptGuide ? 'Anleitung für Google Apps Script ausblenden' : 'Anleitung: Wie richte ich das in 1 Minute in Google Sheets ein?'}</span>
            </button>

            {showAppsScriptGuide && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-slate-300 text-[11px]">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Öffne deine Google Tabelle (Google Sheets).</li>
                  <li>Klicke oben auf <strong>Erweiterungen ➔ Apps Script</strong>.</li>
                  <li>Ersetze den gesamten Code mit diesem optimierten Snippet (erstellt saubere Tabs für Bestellungen & Events):</li>
                </ol>

                <div className="relative bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-amber-200 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const snippet = `function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Keine Daten empfangen" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === "sync_all" || data.users || data.orders || data.products || data.resetCodes) {
      
      // 1. Nutzer Tabellenblatt
      if (data.users && Array.isArray(data.users)) {
        var sheetUsers = ss.getSheetByName("Nutzer") || ss.insertSheet("Nutzer");
        sheetUsers.clearContents();
        
        var userRows = [
          ["Discord ID", "Username", "Rolle", "Guthaben (EUR)", "Erstellt am", "Status", "Notizen"]
        ];
        
        data.users.forEach(function(u) {
          userRows.push([
            u.discordId || u.id || "-",
            u.username || u.name || "-",
            u.role || "user",
            u.balance !== undefined ? u.balance : 0,
            u.createdAt || "-",
            u.isBlocked ? "Gesperrt" : (u.status || "Aktiv"),
            u.notes || u.email || ""
          ]);
        });

        sheetUsers.getRange(1, 1, userRows.length, userRows[0].length).setValues(userRows);
        sheetUsers.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#1e1b4b").setFontColor("#c084fc");
      }

      // 2. Bestellungen Tabellenblatt
      if (data.orders && Array.isArray(data.orders)) {
        var sheetOrders = ss.getSheetByName("Bestellungen") || ss.insertSheet("Bestellungen");
        sheetOrders.clearContents();
        
        var orderRows = [
          ["Bestell ID", "Kunde", "Email", "Produkte", "Gesamtsumme (EUR)", "Status", "Datum"]
        ];
        
        data.orders.forEach(function(o) {
          var itemsStr = "";
          if (o.items && Array.isArray(o.items)) {
            itemsStr = o.items.map(function(i){ 
              return (i.quantity || 1) + "x " + (i.title || i.name || "Artikel"); 
            }).join("; ");
          } else if (typeof o.items === "string") {
            itemsStr = o.items;
          }

          orderRows.push([
            o.id || "-",
            o.customerName || o.userName || "-",
            o.customerEmail || o.userEmail || "-",
            itemsStr || "-",
            o.totalAmount !== undefined ? o.totalAmount : (o.totalPrice !== undefined ? o.totalPrice : 0),
            o.status || "ausstehend",
            o.createdAt || o.date || "-"
          ]);
        });

        sheetOrders.getRange(1, 1, orderRows.length, orderRows[0].length).setValues(orderRows);
        sheetOrders.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#0f172a").setFontColor("#34d399");
      }

      // 3. Produkte Tabellenblatt
      if (data.products && Array.isArray(data.products)) {
        var sheetProducts = ss.getSheetByName("Produkte") || ss.insertSheet("Produkte");
        sheetProducts.clearContents();
        
        var productRows = [
          ["Produkt ID", "Titel", "Kategorie", "Preis (EUR)", "Status"]
        ];
        
        data.products.forEach(function(p) {
          productRows.push([
            p.id || "-",
            p.title || p.name || "-",
            p.category || "-",
            p.price !== undefined ? p.price : 0,
            p.isPopular || p.popular ? "Beliebt" : "Normal"
          ]);
        });

        sheetProducts.getRange(1, 1, productRows.length, productRows[0].length).setValues(productRows);
        sheetProducts.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#064e3b").setFontColor("#6ee7b7");
      }

      // 4. ResetCodes Tabellenblatt
      if (data.resetCodes && Array.isArray(data.resetCodes)) {
        var sheetReset = ss.getSheetByName("ResetCodes") || ss.insertSheet("ResetCodes");
        sheetReset.clearContents();
        
        var resetRows = [
          ["Code", "Discord ID / User", "Erstellt am", "Ablaufdatum", "Einmalig", "Status"]
        ];
        
        data.resetCodes.forEach(function(r) {
          resetRows.push([
            r.code || "-",
            r.discordId || r.userId || r.userEmail || "-",
            r.createdAt || "-",
            r.expiresAt || "-",
            r.isOneTime !== undefined ? (r.isOneTime ? "JA" : "NEIN") : "JA",
            r.used || r.status === "used" || r.status === "Eingelöst" ? "Eingelöst" : "Aktiv"
          ]);
        });

        sheetReset.getRange(1, 1, resetRows.length, resetRows[0].length).setValues(resetRows);
        sheetReset.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#312e81").setFontColor("#a5b4fc");
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Daten erfolgreich synchronisiert" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Event verarbeitet" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
                      navigator.clipboard.writeText(snippet);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] px-2 py-1 rounded cursor-pointer flex items-center gap-1 z-10"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Kopiert!' : 'Code Kopieren'}</span>
                  </button>
                  <pre>{`function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    
    // Tab 1: Log Events
    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
      var eventSheet = ss.getSheetByName("Graviq Log Events") || ss.insertSheet("Graviq Log Events");
      if (eventSheet.getLastRow() === 0) {
        eventSheet.appendRow(["Zeitstempel", "Kategorie", "Aktion", "Beschreibung", "Benutzer / E-Mail"]);
        eventSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#38bdf8");
      }
      data.events.forEach(function(ev) {
        eventSheet.appendRow([
          ev.timestamp || new Date().toLocaleString("de-DE"),
          ev.category ? ev.category.toUpperCase() : "SYSTEM",
          ev.actionName || "Live Aktion",
          ev.description || "-",
          ev.userEmail || ev.payload?.email || "-"
        ]);
      });
    }

    // Tab 2: Single Live Event
    if (data.singleEvent) {
      var ev = data.singleEvent;
      var eventSheet = ss.getSheetByName("Graviq Log Events") || ss.insertSheet("Graviq Log Events");
      if (eventSheet.getLastRow() === 0) {
        eventSheet.appendRow(["Zeitstempel", "Kategorie", "Aktion", "Beschreibung", "Benutzer / E-Mail"]);
        eventSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#38bdf8");
      }
      eventSheet.appendRow([
        ev.timestamp || new Date().toLocaleString("de-DE"),
        ev.category ? ev.category.toUpperCase() : "SYSTEM",
        ev.actionName || "Live Aktion",
        ev.description || "-",
        ev.userEmail || ev.payload?.email || "-"
      ]);
    }

    // Tab 3: Bestellungen (Direkte Tabelle)
    if (data.orders && Array.isArray(data.orders)) {
      var orderSheet = ss.getSheetByName("Bestellungen") || ss.insertSheet("Bestellungen");
      orderSheet.clearContents();
      orderSheet.appendRow(["Bestell-ID", "Datum", "Kunde", "E-Mail", "Paket", "Betrag (€)", "Status"]);
      orderSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#0f172a").setFontColor("#34d399");
      data.orders.forEach(function(o) {
        orderSheet.appendRow([o.id, o.date, o.customerName, o.email, o.packageName, o.amount, o.status]);
      });
    }

    return ContentService.createTextOutput("SUCCESS");
  } catch(err) {
    return ContentService.createTextOutput("ERROR: " + err.toString());
  }
}`}</pre>
                </div>

                <ol start={4} className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Klicke oben rechts auf <strong>Bereitstellen ➔ Neue Bereitstellung</strong>.</li>
                  <li>Wähle Typ: <strong>Web-App</strong>. Ausführen als: <strong>Ich</strong>. Wer hat Zugriff: <strong>Jeder</strong>.</li>
                  <li>Klicke auf Bereitstellen, kopiere die <strong>Web-App-URL</strong> und füge sie oben ein!</li>
                </ol>
              </div>
            )}
          </div>

          {/* STAGING & EVENT REVIEW QUEUE CARD */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-400" />
                <span className="text-white font-bold text-sm">Aktions-Freigabe & Live-Queue (Staging Buffer)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = syncModeState === 'staged' ? 'instant' : 'staged';
                    setSyncModeState(nextMode);
                    saveConfig({ syncMode: nextMode });
                    setStatusMessage({
                      type: 'info',
                      text: nextMode === 'staged' 
                        ? '🛑 Manuelle Freigabe aktiv: Aktionen werden gesammelt und vor dem Eintragen im Sheet geprüft.'
                        : '⚡ Echtzeit-Direktsync aktiv: Jede Aktion wird sofort ins Sheet übertragen.',
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    syncModeState === 'staged'
                      ? 'bg-amber-950/80 border-amber-700 text-amber-200'
                      : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                  }`}
                >
                  {syncModeState === 'staged' ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Modus: {syncModeState === 'staged' ? '🛑 Manuelle Freigabe (Warteschlange)' : '⚡ Sofort-Sync'}</span>
                </button>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Verhindert unnötige oder kleine Zeilen im Google Sheet: Alle Shop-Aktionen landen hier in einer Auswahlliste. Du entscheidest per Klick, welche Einträge ins Google Sheet übertragen oder verworfen werden.
            </p>

            {/* Pending Events List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-300 font-bold text-xs pt-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Ausstehende Aktionen ({pendingSyncEvents.length})</span>
                </span>
                {pendingSyncEvents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearAllSyncEvents();
                        setStatusMessage({ type: 'info', text: '🗑️ Ausstehende Aktionen verworfen.' });
                      }}
                      className="text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Alle verwerfen</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsLoading(true);
                        const ok = await approveSyncEvents();
                        setIsLoading(false);
                        if (ok) {
                          setStatusMessage({ type: 'success', text: '✅ Alle Aktionen erfolgreich ins Google Sheet übertragen!' });
                        } else {
                          setStatusMessage({ type: 'error', text: 'Fehler beim Übertragen der Aktionen. Prüfe die Webhook URL.' });
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Alle Freigeben ({pendingSyncEvents.length})</span>
                    </button>
                  </div>
                )}
              </div>

              {pendingSyncEvents.length === 0 ? (
                <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                  ✨ Keine ausstehenden Aktionen in der Warteschlange. Dein Google Sheet ist auf dem neusten Stand!
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {pendingSyncEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            evt.category === 'order' 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : evt.category === 'user'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {evt.category}
                          </span>
                          <span className="text-white font-bold">{evt.actionName}</span>
                          <span className="text-slate-500 text-[10px]">{evt.timestamp}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{evt.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => dismissSyncEvents([evt.id])}
                          className="bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-900 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Verwerfen</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setIsLoading(true);
                            const ok = await approveSyncEvents([evt.id]);
                            setIsLoading(false);
                            if (ok) {
                              setStatusMessage({ type: 'success', text: `✅ "${evt.actionName}" ins Google Sheet übertragen!` });
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow"
                        >
                          <Send className="w-3 h-3" />
                          <span>Übertragen</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Explanation Box for Fehler 401 Invalid Client */}
          <div className="bg-amber-950/40 border border-amber-900/60 p-4 rounded-2xl text-xs space-y-2 text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Hinweis zu OAuth Token / API Limits:</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-200/90">
              Beim direkten Google OAuth Login läuft das Token nach 60 Minuten ab. Für <strong>100% dauerhaften Auto-Sync ohne erneute Logins</strong> empfehlen wir die <strong>Google Apps Script Webhook Methode</strong> oben!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google OAuth Connection Card */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-xs flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Google Drive Live-API Synchronisation
                </span>
                {spreadsheetId ? (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                    CONNECTED
                  </span>
                ) : (
                  <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    MANUELL / EXPORT
                  </span>
                )}
              </div>

              {/* Client ID Setup Optional Toggle */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowClientIdInput(!showClientIdInput)}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showClientIdInput ? 'Google Client ID ausblenden' : 'Eigene Google Client ID / Token eintragen'}</span>
                </button>

                {showClientIdInput && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <label className="block text-slate-300 font-bold text-[11px]">Google Cloud OAuth Client ID:</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => {
                        setClientId(e.target.value);
                        saveConfig({ clientId: e.target.value });
                      }}
                      placeholder="xyz.apps.googleusercontent.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                    />
                    <label className="block text-slate-300 font-bold text-[11px] pt-1">Oder Access Token / Bearer:</label>
                    <input
                      type="text"
                      value={accessToken}
                      onChange={(e) => {
                        setAccessToken(e.target.value);
                        saveConfig({ accessToken: e.target.value });
                      }}
                      placeholder="ya29.a0..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              {spreadsheetUrl ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Spreadsheet-ID:</span>
                    <code className="text-emerald-400 font-mono text-xs font-bold block truncate">{spreadsheetId}</code>
                  </div>
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-900/30 text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>In Google Sheets Öffnen</span>
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Mit Google Sheets API Verbinden</span>
                </button>
              )}
            </div>

            {/* 1-Click CSV Direct Export for Google Sheets */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <span className="text-white font-bold block flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-400" />
                1-Klick Datei-Export für Google Sheets
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Exportiere alle Bestellungen, Produkte und Anti-Spam Sperrlisten als verschlüsselte <strong>.CSV Datei</strong>. Du kannst diese Datei in Google Sheets über <em>Datei ➔ Importieren</em> mit 1 Klick öffnen.
              </p>

              <button
                type="button"
                onClick={handleDownloadCSV}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-900/30 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Google Sheets CSV Export Herunterladen 📥</span>
              </button>
            </div>
          </div>

          {/* Encryption & Auto-Sync Settings */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <span className="text-white font-bold block flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Sicherheits- & Verschlüsselungseinstellungen
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white font-bold block">AES-256 Payload Verschlüsselung</span>
                  <span className="text-slate-400 text-[11px]">Kundendaten als Ciphertext speichern</span>
                </div>
                <input
                  type="checkbox"
                  checked={isEncryptionOn}
                  onChange={(e) => {
                    setIsEncryptionOn(e.target.checked);
                    saveConfig({ encryptionEnabled: e.target.checked });
                  }}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white font-bold block flex items-center gap-1.5">
                    <span>⚡ Live Auto-Sync</span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded font-mono">OPTIONAL</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">Automatische Übertragung bei jeder Aktion (Optional - frei abwählbar)</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAutoSync}
                  onChange={(e) => {
                    setIsAutoSync(e.target.checked);
                    saveConfig({ autoSyncEnabled: e.target.checked });
                  }}
                  className="w-4 h-4 accent-purple-400 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Support Account Reset Code Generator Panel */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-indigo-900/60 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Support Account Reset Code Generator
              </span>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                SUPPORT TOOL
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Erstelle einen zeitlich begrenzten 8-stelligen Einmal-Sicherheitscode für Kunden, die ihren Discord-Zugang verloren haben.
            </p>

            <form onSubmit={handleCreateResetCode} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Kunden E-Mail / Discord ID:</label>
                <input
                  type="text"
                  value={resetTargetEmail}
                  onChange={(e) => setResetTargetEmail(e.target.value)}
                  placeholder="kunde@graviq.shop"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Gültigkeit (Minuten):</label>
                <select
                  value={resetExpMinutes}
                  onChange={(e) => setResetExpMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs"
                >
                  <option value={15}>15 Minuten</option>
                  <option value={30}>30 Minuten</option>
                  <option value={60}>1 Stunde</option>
                  <option value={1440}>24 Stunden</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2 rounded-xl transition-colors cursor-pointer text-xs"
                >
                  Code Generieren 🔑
                </button>
              </div>
            </form>

            {lastGeneratedCode && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-900/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Generierter Sicherheitscode:</span>
                  <code className="text-cyan-300 font-mono text-lg font-black tracking-widest">{lastGeneratedCode}</code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lastGeneratedCode);
                    setCopiedResetCode(true);
                    setTimeout(() => setCopiedResetCode(false), 2000);
                  }}
                  className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedResetCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedResetCode ? 'Kopiert!' : 'Code Kopieren'}</span>
                </button>
              </div>
            )}

            {/* Active Reset Codes Table */}
            {resetCodes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[11px] font-bold block">Aktive & Vergangene Codes ({resetCodes.length}):</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {resetCodes.map((rc) => {
                    const isExpired = new Date(rc.expiresAt).getTime() < Date.now();
                    return (
                      <div key={rc.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-cyan-300 font-bold">{rc.code}</code>
                          <span className="text-slate-400 truncate max-w-[150px]">{rc.targetUserEmail}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          rc.status === 'used'
                            ? 'bg-slate-900 text-slate-500'
                            : isExpired
                            ? 'bg-rose-950 text-rose-400 border border-rose-900'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                        }`}>
                          {rc.status === 'used' ? 'Eingelöst' : isExpired ? 'Abgelaufen' : 'Aktiv'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Discord Logging Webhook Setup */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <span className="text-white font-bold block flex items-center gap-2">
              <Send className="w-4 h-4 text-[#5865F2]" />
              Discord Webhook Audit Logging Channel
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Alle Registrierungen, Logins, Käufe, Account-Resets und Support-Aktionen werden automatisch per Discord Webhook live an deinen Discord Server gesendet.
            </p>

            <form onSubmit={handleSaveDiscordWebhook} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Discord Channel Webhook URL:</label>
                <input
                  type="text"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/123.../xyz..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              {webhookTestStatus && (
                <div className="text-emerald-400 font-bold text-xs">{webhookTestStatus}</div>
              )}

              <button
                type="submit"
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs"
              >
                Discord Webhook Speichern 🚀
              </button>
            </form>
          </div>

          {/* Execution Bar */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs">
              <span className="text-slate-400 block">Letzte Synchronisation / Export:</span>
              <span className="text-cyan-300 font-mono font-bold">{lastSynced || 'Noch nie synchronisiert'}</span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 text-white font-extrabold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-900/30 text-xs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>API Live Sync Ausführen</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVaultUnlocked(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
                title="Tresor Sperren"
              >
                <Lock className="w-4 h-4 text-red-400" />
                <span>Tresor Sperren</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
