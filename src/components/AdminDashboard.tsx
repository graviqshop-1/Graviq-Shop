import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShieldAlert,
  BarChart3,
  PackageCheck,
  LifeBuoy,
  Users,
  Tag,
  Settings,
  TrendingUp,
  Send,
  PlusCircle,
  Trash2,
  Sun,
  Snowflake,
  Sparkles,
  Zap,
  Headphones,
  Crown,
  CheckCircle2,
  Percent,
  Search,
  ExternalLink,
  MessageSquare,
  Handshake,
  UserCheck,
  UserX,
  Briefcase,
  Check,
  Clock,
  Filter,
  CheckSquare,
  Square,
  Archive,
  FileText,
  Printer,
  Download,
  RotateCcw,
  FileCheck,
  Wrench,
  Package,
  Edit3,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Copy,
  CopyCheck,
  Unlock,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { OrderStatus, Ticket, SeasonTheme, PartnerApplication, UserRole, Order, ServicePackage, PlatformId } from '../types';
import { InvoiceModal } from './InvoiceModal';
import { ProductEditModal } from './ProductEditModal';
import { GoogleSheetsSecurityModule } from './GoogleSheetsSecurityModule';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    currentUser,
    orders,
    updateOrderStatus,
    toggleOrderCheckitem,
    archiveOrder,
    deleteOrder,
    tickets,
    replyTicket,
    updateTicketStatus,
    toggleTicketCheckitem,
    archiveTicket,
    deleteTicket,
    partnerApplications,
    updatePartnerApplicationStatus,
    togglePartnerCheckitem,
    archivePartnerApplication,
    deletePartnerApplication,
    deleteArchivedItems,
    coupons,
    createCoupon,
    toggleCoupon,
    deleteCoupon,
    supportAccounts,
    allUsers,
    createSupportAccount,
    deleteSupportAccount,
    deleteUserAccount,
    unblockUserAccount,
    unbanAllUsers,
    resetCodes,
    generateResetCode,
    deleteResetCode,
    shopSettings,
    updateShopSettings,
    blockIP,
    unblockIP,
    blockEmail,
    unblockEmail,
    products,
    updateProduct,
    deleteProduct,
    quickMacros,
    supporterShifts,
    updateSupporterStatus,
  } = useShop();

  const isAdmin = currentUser?.role === 'admin';
  const isSupport = currentUser?.role === 'support';
  const isTeamGraviq = currentUser?.role === 'team_graviq';

  // Role View Mode for Admins to switch or activate all role views with 1 click
  const [adminRoleViewMode, setAdminRoleViewMode] = useState<'admin_full' | 'supporter_view' | 'team_view'>('admin_full');

  // Effective role context considering Admin 1-click mode switch
  const effectiveRole = isAdmin 
    ? (adminRoleViewMode === 'supporter_view' ? 'support' : adminRoleViewMode === 'team_view' ? 'team_graviq' : 'admin')
    : currentUser?.role;

  // Default active tab based on role
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'orders' | 'tickets' | 'events' | 'partners' | 'archive' | 'support_team' | 'coupons' | 'settings' | 'order_lookup' | 'security' | 'user_management' | 'google_sheets'
  >(
    isAdmin ? 'analytics' : isTeamGraviq ? 'orders' : 'tickets'
  );

  // User Management & Support Code Generator States
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [generatedCodeModal, setGeneratedCodeModal] = useState<{
    code: string;
    userName: string;
    userEmail: string;
    expiresAt: string;
  } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; email: string } | null>(null);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState(false);

  // IP / Anti-Spam Blocker Form States
  const [newIpInput, setNewIpInput] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');

  // Collapsible Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Product Editor Modal State (null = create, ServicePackage = edit, undefined = closed)
  const [editingProductModal, setEditingProductModal] = useState<ServicePackage | null | undefined>(undefined);
  const [productSearch, setProductSearch] = useState('');
  const [productPlatformFilter, setProductPlatformFilter] = useState<PlatformId | 'all'>('all');

  // Supporter Ticket Filters & Quick Replies
  const [ticketFilter, setTicketFilter] = useState<'all' | 'offen' | 'in_bearbeitung' | 'geschlossen'>('all');
  const [ticketSearch, setTicketSearch] = useState('');

  // Supporter Order Lookup State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Selected Order for Invoice Popup
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Event & Wartungsmodus Form State (Admin)
  const [isMaintenanceModeSetting, setIsMaintenanceModeSetting] = useState<boolean>(shopSettings.isMaintenanceMode || false);
  const [maintenanceMessageSetting, setMaintenanceMessageSetting] = useState<string>(
    shopSettings.maintenanceMessage || 'Der Graviq Shop befindet sich derzeit im Wartungsmodus. Wir führen System-Upgrades & Server-Optimierungen durch.'
  );
  const [eventSeason, setEventSeason] = useState<SeasonTheme>(shopSettings.activeSeason || 'sommer');
  const [eventDiscount, setEventDiscount] = useState<number>(shopSettings.seasonDiscountPercent || 15);
  const [eventBannerText, setEventBannerText] = useState<string>(
    shopSettings.announcementText || '🔥 SOMMER-EVENT ACTIVE: Nutze 15% Event-Rabatt auf alle Produkte!'
  );
  const [eventParticles, setEventParticles] = useState<boolean>(shopSettings.autoSeasonEffects ?? true);

  // Support / Team Account Form State
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppEmail, setNewSuppEmail] = useState('');
  const [newSuppRole, setNewSuppRole] = useState<'support' | 'team_graviq'>('support');
  const [teamUserSearchQuery, setTeamUserSearchQuery] = useState('');
  const [confirmDeleteArchive, setConfirmDeleteArchive] = useState(false);

  // Ticket Reply State
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<Ticket | null>(null);
  const [adminReplyMsg, setAdminReplyMsg] = useState('');

  // Coupon Creation Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState<number>(15);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Settings State
  const [emailSetting, setEmailSetting] = useState(shopSettings.shopEmail);
  const [paypalModeSetting, setPaypalModeSetting] = useState<'sandbox' | 'live'>(shopSettings.paypalMode);
  const [paypalClientIdSetting, setPaypalClientIdSetting] = useState(shopSettings.paypalClientId);
  const [paypalSecretSetting, setPaypalSecretSetting] = useState(shopSettings.paypalSecret);

  if (!currentUser || (!isAdmin && !isSupport && !isTeamGraviq)) {
    return null;
  }

  // Active (non-archived) vs Archived items - sorted newest & priority first
  const activeOrders = orders
    .filter((o) => !o.isArchived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const archivedOrders = orders
    .filter((o) => o.isArchived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeTickets = tickets
    .filter((t) => !t.isArchived)
    .sort((a, b) => {
      const prio: Record<string, number> = { offen: 0, in_bearbeitung: 1, geschlossen: 2 };
      const pA = prio[a.status] ?? 1;
      const pB = prio[b.status] ?? 1;
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const archivedTickets = tickets
    .filter((t) => t.isArchived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activePartnerApps = partnerApplications
    .filter((p) => !p.isArchived)
    .sort((a, b) => {
      const prio: Record<string, number> = { neu: 0, in_prüfung: 1, akzeptiert: 2, abgelehnt: 3 };
      const pA = prio[a.status] ?? 2;
      const pB = prio[b.status] ?? 2;
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const archivedPartnerApps = partnerApplications
    .filter((p) => p.isArchived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Analytics Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalOrdersCount = orders.length;
  const openTicketsCount = activeTickets.filter((t) => t.status !== 'geschlossen').length;
  const openPartnerAppsCount = activePartnerApps.filter((p) => p.status === 'neu' || p.status === 'in_prüfung').length;

  const handleAdminReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminTicket || !adminReplyMsg.trim()) return;

    replyTicket(selectedAdminTicket.id, adminReplyMsg);
    setAdminReplyMsg('');
    const updated = tickets.find((t) => t.id === selectedAdminTicket.id);
    if (updated) setSelectedAdminTicket(updated);
  };

  const applyQuickReplyMacro = (text: string) => {
    setAdminReplyMsg(text);
  };

  const handleCreateSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName.trim()) return;
    const created = createSupportAccount(newSuppName.trim(), newSuppEmail.trim(), newSuppRole);
    setNewSuppName('');
    setNewSuppEmail('');
    alert(`✅ ${created.name} wurde als "${created.role === 'team_graviq' ? 'Team Graviq' : 'Supporter'}" hinzugefügt!`);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    createCoupon({
      code: newCouponCode.toUpperCase().trim(),
      discountPercent: Number(newCouponPercent),
      active: true,
      usedCount: 0,
      description: newCouponDesc || `${newCouponPercent}% Rabatt`,
    });
    setNewCouponCode('');
    setNewCouponDesc('');
  };

  const handleSaveMaintenanceAndEventSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings({
      isMaintenanceMode: isMaintenanceModeSetting,
      maintenanceMessage: maintenanceMessageSetting,
      activeSeason: eventSeason,
      seasonDiscountPercent: Number(eventDiscount),
      announcementText: eventBannerText,
      autoSeasonEffects: eventParticles,
    });
    alert('Wartungsmodus & Event-Einstellungen wurden gespeichert!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings({
      shopEmail: emailSetting,
      paypalMode: paypalModeSetting,
      paypalClientId: paypalClientIdSetting,
      paypalSecret: paypalSecretSetting,
    });
    alert('Shop-Einstellungen erfolgreich gespeichert!');
  };

  // Download Ticket PDF / Text
  const handleDownloadTicketPDF = (tck: Ticket) => {
    const text = `
============================================================
GRAVIQ SHOP & S3 ESPORT SUPPORT TICKET REPORT
Ticket-ID: ${tck.id}
Kategorie: ${tck.category.toUpperCase()} | Priorität: ${tck.priority.toUpperCase()}
Datum: ${new Date(tck.createdAt).toLocaleString('de-DE')}
============================================================
KUNDE: ${tck.userName} (${tck.userEmail})
ORDER-ID: ${tck.orderId || 'Keine'}
STATUS: ${tck.status.toUpperCase()}

CHECKLISTE FORTSCHRITT:
------------------------------------------------------------
${(tck.checklist || [])
  .map((c) => `[${c.completed ? 'X' : ' '}] ${c.label}`)
  .join('\n')}

NACHRICHTENVERLAUF:
------------------------------------------------------------
${tck.messages
  .map(
    (m) =>
      `[${new Date(m.createdAt).toLocaleString('de-DE')}] ${m.senderName} (${m.senderRole}):\n${m.message}\n`
  )
  .join('\n------------------------------------------------------------\n')}

============================================================
Exportiert von Graviq Console am ${new Date().toLocaleString('de-DE')}
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Support_Ticket_${tck.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Partner Application Export PDF / Text
  const handleDownloadPartnerPDF = (app: PartnerApplication) => {
    const text = `
============================================================
GRAVIQ x S3 ESPORT PARTNERSCHAFTS-BEWERBUNG
Bewerbungs-ID: ${app.id}
Datum: ${new Date(app.createdAt).toLocaleString('de-DE')}
============================================================
BEWERBER: ${app.applicantName} (${app.applicantEmail})
KANAL: ${app.channelName} (${app.platform})
REICHWEITE: ${app.followerCount}
SOCIAL LINK: ${app.socialLink}
STATUS: ${app.status.toUpperCase()}

BEWERBUNGS-NACHRICHT:
------------------------------------------------------------
"${app.message}"

PRÜFUNGS-CHECKLISTE:
------------------------------------------------------------
${(app.checklist || [])
  .map((c) => `[${c.completed ? 'X' : ' '}] ${c.label}`)
  .join('\n')}

============================================================
Exportiert von Graviq Console am ${new Date().toLocaleString('de-DE')}
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Partner_Bewerbung_${app.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Active Tickets for Support Desk
  const filteredTickets = activeTickets.filter((t) => {
    if (ticketFilter !== 'all' && t.status !== ticketFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Products for Product Editor Tab
  const filteredProductsList = products.filter((p) => {
    if (productPlatformFilter !== 'all' && p.platform !== productPlatformFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[90vh] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row my-auto">
        
        {/* LEFT VERTICAL NAVIGATION SIDEBAR */}
        <aside
          className={`bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 shrink-0 ${
            isSidebarCollapsed ? 'hidden sm:flex sm:w-20' : 'w-full sm:w-64'
          }`}
        >
          {/* Sidebar Header & Toggle */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div
                className={`p-2.5 rounded-2xl border shrink-0 ${
                  isAdmin
                    ? 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                    : isTeamGraviq
                    ? 'bg-amber-600/20 text-amber-400 border-amber-500/30'
                    : 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30'
                }`}
              >
                {isAdmin ? <Crown className="w-5 h-5" /> : isTeamGraviq ? <Briefcase className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <h2 className="text-sm font-black text-white truncate">
                    {isAdmin ? 'Admin Console' : isTeamGraviq ? 'Team Console' : 'Support Desk'}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border inline-block ${
                      isAdmin
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : isTeamGraviq
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    }`}
                  >
                    {isAdmin ? '👑 Admin' : isTeamGraviq ? '⚡ Team' : '🟢 Support'}
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Expand / Collapse Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden sm:flex text-slate-400 hover:text-white bg-slate-900 p-2 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors"
              title={isSidebarCollapsed ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen (Karte vergrößern)'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-purple-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* 1-CLICK ADMIN PRESET CONTROL (ADMIN ONLY) */}
          {isAdmin && !isSidebarCollapsed && (
            <div className="p-3 bg-purple-950/40 border-b border-purple-800/40 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Admin 1-Klick Presets
                </span>
                <span className="text-[9px] bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded font-mono font-bold border border-purple-700">
                  {adminRoleViewMode === 'admin_full' ? 'Alles Aktiv' : adminRoleViewMode === 'supporter_view' ? 'Supporter' : 'Team Graviq'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                Mit 1 Klick Ansichten & Funktionen von Supportern oder Team Graviq schalten:
              </p>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => {
                    setAdminRoleViewMode('admin_full');
                    setActiveTab('analytics');
                  }}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold text-center transition-all cursor-pointer border ${
                    adminRoleViewMode === 'admin_full'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                  title="1-Klick: Alles aktivieren (Vollzugriff auf alle Admin & Team Funktionen)"
                >
                  👑 Alles
                </button>
                <button
                  onClick={() => {
                    setAdminRoleViewMode('supporter_view');
                    setActiveTab('tickets');
                  }}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold text-center transition-all cursor-pointer border ${
                    adminRoleViewMode === 'supporter_view'
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                  title="1-Klick: Supporter-Ansicht aktivieren (Tickets & Bestellungen)"
                >
                  🎧 Support
                </button>
                <button
                  onClick={() => {
                    setAdminRoleViewMode('team_view');
                    setActiveTab('orders');
                  }}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold text-center transition-all cursor-pointer border ${
                    adminRoleViewMode === 'team_view'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                  title="1-Klick: Team Graviq Ansicht aktivieren (Bestellverwaltung & Partner)"
                >
                  ⚡ Team
                </button>
              </div>
            </div>
          )}

          {/* Navigation Items grouped by Category */}
          <nav className="p-2 sm:p-3 space-y-4 overflow-y-auto flex-1">
            
            {/* CATEGORY 1: SHOP & VERKÄUFE */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Shop & Verkäufe</span>
                </div>
              )}

              {effectiveRole === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'analytics'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Umsatz-Dashboard"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">Umsatz-Dashboard</span>}
                  </button>

                  <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'products'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Produkte Bearbeiten"
                  >
                    <Package className="w-4 h-4 text-amber-400 shrink-0" />
                    {!isSidebarCollapsed && (
                      <div className="flex justify-between items-center w-full truncate">
                        <span className="truncate">Produkte Bearbeiten</span>
                        <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded border border-amber-800 font-bold">Admin</span>
                      </div>
                    )}
                  </button>
                </>
              )}

              {(effectiveRole === 'admin' || effectiveRole === 'team_graviq' || effectiveRole === 'support') && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                  } ${
                    activeTab === 'orders'
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                  title="Bestellungs-Management"
                >
                  <PackageCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex justify-between items-center w-full truncate">
                      <span className="truncate">
                        {effectiveRole === 'support' ? 'Bestellungen (Einblick)' : 'Bestellverwaltung'}
                      </span>
                      <span className="bg-slate-900 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                        {activeOrders.length}
                      </span>
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* CATEGORY 2: SUPPORT & KUNDEN */}
            {(effectiveRole === 'admin' || effectiveRole === 'support' || effectiveRole === 'team_graviq') && (
              <div className="space-y-1 pt-2 border-t border-slate-900">
                {!isSidebarCollapsed && (
                  <div className="px-3 pb-1 text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Support & Kunden</span>
                  </div>
                )}

                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                  } ${
                    activeTab === 'tickets'
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                  title="Support Desk"
                >
                  <LifeBuoy className="w-4 h-4 text-cyan-400 shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex justify-between items-center w-full truncate">
                      <span className="truncate">Support Desk</span>
                      {openTicketsCount > 0 && (
                        <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                          {openTicketsCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('user_management')}
                  className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                  } ${
                    activeTab === 'user_management'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                  title="Nutzer & Account Reset"
                >
                  <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex justify-between items-center w-full truncate">
                      <span className="truncate">Nutzer & Code Reset</span>
                      {resetCodes.filter((rc) => rc.status === 'active').length > 0 && (
                        <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                          {resetCodes.filter((rc) => rc.status === 'active').length}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {(effectiveRole === 'admin' || effectiveRole === 'team_graviq') && (
                  <button
                    onClick={() => setActiveTab('partners')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'partners'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Partner-Bewerbungen"
                  >
                    <Handshake className="w-4 h-4 text-purple-400 shrink-0" />
                    {!isSidebarCollapsed && (
                      <div className="flex justify-between items-center w-full truncate">
                        <span className="truncate">Partner-Bewerbungen</span>
                        {openPartnerAppsCount > 0 && (
                          <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                            {openPartnerAppsCount}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* CATEGORY 3: SYSTEM & SICHERHEIT */}
            <div className="space-y-1 pt-2 border-t border-slate-900">
              {!isSidebarCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>System & Sicherheit</span>
                </div>
              )}

              {effectiveRole === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'events'
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Wartung & Events"
                  >
                    <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                    {!isSidebarCollapsed && (
                      <div className="flex justify-between items-center w-full truncate">
                        <span className="truncate">Wartung & Events</span>
                        {shopSettings.isMaintenanceMode && (
                          <span className="bg-red-950 text-red-400 text-[9px] px-1.5 py-0.5 rounded border border-red-800 font-bold">Wartung</span>
                        )}
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('coupons')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'coupons'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Gutscheine & Rabatte"
                  >
                    <Tag className="w-4 h-4 text-purple-400 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">Gutscheine & Rabatte</span>}
                  </button>

                  <button
                    onClick={() => setActiveTab('support_team')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'support_team'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Team & Supporter"
                  >
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">Team & Supporter</span>}
                  </button>

                  <button
                    onClick={() => setActiveTab('google_sheets')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'google_sheets'
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Google Sheets & Live DB Sync"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    {!isSidebarCollapsed && (
                      <div className="flex justify-between items-center w-full truncate">
                        <span className="truncate">Google Sheets DB</span>
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                          Echtzeit ⚡
                        </span>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'security'
                        ? 'bg-red-600/20 text-red-300 border border-red-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="IP Blocker & Anti-Spam Schutz"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    {!isSidebarCollapsed && (
                      <div className="flex justify-between items-center w-full truncate">
                        <span className="truncate">IP Blocker & Anti-Spam</span>
                        {((shopSettings.blockedIPs?.length || 0) + (shopSettings.blockedEmails?.length || 0)) > 0 && (
                          <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                            {(shopSettings.blockedIPs?.length || 0) + (shopSettings.blockedEmails?.length || 0)}
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                    } ${
                      activeTab === 'settings'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                    title="Shop-Einstellungen"
                  >
                    <Settings className="w-4 h-4 text-purple-400 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">Shop-Einstellungen</span>}
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('archive')}
                className={`w-full p-2.5 rounded-2xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'
                } ${
                  activeTab === 'archive'
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
                title="Archiv & Export"
              >
                <Archive className="w-4 h-4 text-emerald-400 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Archiv & Export</span>}
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold truncate">{currentUser.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">🟢 Active</span>
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN CONTENT PANEL ("Die Karte") */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          
          {/* Top Panel Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-slate-400 hover:text-white bg-slate-900 p-2 rounded-xl border border-slate-800 cursor-pointer sm:hidden"
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5 text-purple-400" /> : <PanelLeftClose className="w-5 h-5 text-slate-400" />}
              </button>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-white capitalize">
                  {activeTab === 'analytics' && '📊 Umsatz- & Performance Dashboard'}
                  {activeTab === 'products' && '📦 Produkte & Angebote Bearbeiten (Admin)'}
                  {activeTab === 'orders' && '🚚 Bestellungs-Management & Fulfillment'}
                  {activeTab === 'tickets' && '🎧 Supporter Desk & Kundentickets'}
                  {activeTab === 'user_management' && '🔑 Nutzer-Verwaltung & Support Account Code Reset'}
                  {activeTab === 'partners' && '🤝 Partner-Bewerbungen (S3 eSport & Creator)'}
                  {activeTab === 'archive' && '📦 Archiv & PDF Dokumenten Export'}
                  {activeTab === 'events' && '🛠️ Wartungsmodus & Event-Rabatte'}
                  {activeTab === 'coupons' && '🏷️ Gutscheine & Rabattcodes'}
                  {activeTab === 'support_team' && '👥 Team & Supporter Verwaltung'}
                  {activeTab === 'security' && '🛡️ IP Blocker & Anti-Spam Security Center'}
                  {activeTab === 'google_sheets' && '📊 Google Sheets Datenbank & Webhook Sync'}
                  {activeTab === 'settings' && '⚙️ System- & Shop-Einstellungen'}
                </h2>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Eingeloggt als: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-2xl cursor-pointer hover:bg-slate-700 transition-colors"
              title="Fenster Schließen"
            >
              ✕
            </button>
          </div>

          {/* Mobile Horizontal Quick Tab Selector */}
          <div className="flex sm:hidden overflow-x-auto border-b border-slate-800 bg-slate-950 p-2 gap-1.5 shrink-0 scrollbar-none">
            {effectiveRole === 'admin' && (
              <button
                onClick={() => { setActiveTab('analytics'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                📊 Umsatz
              </button>
            )}
            {effectiveRole === 'admin' && (
              <button
                onClick={() => { setActiveTab('products'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                📦 Produkte
              </button>
            )}
            {(effectiveRole === 'admin' || effectiveRole === 'team_graviq' || effectiveRole === 'support') && (
              <button
                onClick={() => { setActiveTab('orders'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🚚 Bestellungen ({activeOrders.length})
              </button>
            )}
            {(effectiveRole === 'admin' || effectiveRole === 'support' || effectiveRole === 'team_graviq') && (
              <button
                onClick={() => { setActiveTab('tickets'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'tickets'
                    ? 'bg-cyan-600 text-white border-cyan-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🎧 Tickets ({activeTickets.length})
              </button>
            )}
            {(effectiveRole === 'admin' || effectiveRole === 'support') && (
              <button
                onClick={() => { setActiveTab('user_management'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'user_management'
                    ? 'bg-cyan-600 text-white border-cyan-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🔑 Nutzer
              </button>
            )}
            {(effectiveRole === 'admin' || effectiveRole === 'team_graviq') && (
              <button
                onClick={() => { setActiveTab('partners'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'partners'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🤝 Partner ({openPartnerAppsCount})
              </button>
            )}
            {effectiveRole === 'admin' && (
              <button
                onClick={() => { setActiveTab('security'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-red-600 text-white border-red-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🛡️ Security
              </button>
            )}
            {effectiveRole === 'admin' && (
              <button
                onClick={() => { setActiveTab('settings'); setIsSidebarCollapsed(true); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                ⚙️ Einstellungen
              </button>
            )}
            <button
              onClick={() => { setActiveTab('archive'); setIsSidebarCollapsed(true); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border cursor-pointer ${
                activeTab === 'archive'
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              📦 Archiv
            </button>
          </div>

          {/* Main Scrollable Tab Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

            {/* ANALYTICS TAB (Admin Only) */}
            {isAdmin && activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Gesamtumsatz</span>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      €{totalRevenue.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-bold">
                      <TrendingUp className="w-3.5 h-3.5" /> +24% gegenüber Vormonat
                    </span>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Absolvierte Bestellungen</span>
                    <div className="text-3xl font-black text-cyan-400 font-mono">
                      {totalOrdersCount}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">PayPal Live & Sandbox Aufträge</span>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Offene Support-Tickets</span>
                    <div className="text-3xl font-black text-amber-400 font-mono">
                      {openTicketsCount}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Durchschnittliche Antwortzeit: ~2 Min.</span>
                  </div>
                </div>

                {/* Quick Status Bar */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <span>PayPal Status:</span>
                    <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                      shopSettings.paypalMode === 'live' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {shopSettings.paypalMode === 'live' ? '🟢 LIVE (Echte Zahlungen)' : '🟡 SANDBOX'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <span>Wartungsmodus:</span>
                    <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                      shopSettings.isMaintenanceMode ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {shopSettings.isMaintenanceMode ? '🔴 AKTIV' : '🟢 INAKTIV (Shop Online)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT EDITOR TAB (Admin Only) */}
            {isAdmin && activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-400" />
                      Produkte & Pakete Verwalten ({filteredProductsList.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hier kannst du als Admin Preise, Titel, Mengen, Badges und Sichtbarkeit einzelner Produkte anpassen.
                    </p>
                  </div>

                  <button
                    onClick={() => setEditingProductModal(null)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Neues Paket Erstellen</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Paket-Titel oder Einheit suchen..."
                      className="bg-transparent text-white w-full focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setProductPlatformFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        productPlatformFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      onClick={() => setProductPlatformFilter('twitch')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        productPlatformFilter === 'twitch' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Twitch 🟣
                    </button>
                    <button
                      onClick={() => setProductPlatformFilter('tiktok')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        productPlatformFilter === 'tiktok' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      TikTok 🎵
                    </button>
                    <button
                      onClick={() => setProductPlatformFilter('youtube')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        productPlatformFilter === 'youtube' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      YouTube 🔴
                    </button>
                    <button
                      onClick={() => setProductPlatformFilter('instagram')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        productPlatformFilter === 'instagram' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Instagram 📸
                    </button>
                  </div>
                </div>

                {/* Product List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProductsList.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        pkg.isActive !== false
                          ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-slate-900 text-slate-300 uppercase text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                              {pkg.platform}
                            </span>
                            <span className="text-slate-400 text-[10px] font-semibold capitalize">
                              {pkg.category}
                            </span>
                            {pkg.isPopular && (
                              <span className="bg-amber-950 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-800">
                                🔥 Bestseller
                              </span>
                            )}
                            {pkg.isBestValue && (
                              <span className="bg-purple-950 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-800">
                                👑 Best Value
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white">{pkg.title}</h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {pkg.amount} {pkg.unit} • {pkg.deliverySpeed}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-emerald-400 font-mono">
                            €{pkg.price.toFixed(2)}
                          </div>
                          {pkg.originalPrice && (
                            <div className="text-xs text-slate-500 line-through font-mono">
                              €{pkg.originalPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                        <button
                          onClick={() => updateProduct(pkg.id, { isActive: pkg.isActive === false })}
                          className={`flex items-center gap-1.5 font-bold cursor-pointer ${
                            pkg.isActive !== false ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {pkg.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{pkg.isActive !== false ? 'Im Shop Aktiv' : 'Ausgeblendet'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingProductModal(pkg)}
                            className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Bearbeiten</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Paket "${pkg.title}" löschen?`)) deleteProduct(pkg.id);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-red-400 border border-slate-800 p-1.5 rounded-xl cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS MANAGEMENT TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <PackageCheck className="w-5 h-5 text-amber-400" />
                      Bestellungs-Management & Fulfillment Checklist
                    </h3>
                    <p className="text-xs text-slate-400">
                      Hake die einzelnen Arbeitsschritte ab. Ist die Liste vollständig, kann die Bestellung abgeschlossen und archiviert werden.
                    </p>
                  </div>
                </div>

                {activeOrders.length === 0 ? (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
                    <PackageCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-semibold">Keine aktiven Bestellungen vorhanden.</p>
                  </div>
                ) : (
                  activeOrders.map((ord) => {
                    const checklist = ord.checklist || [
                      { id: 'chk_1', label: '💳 PayPal / Zahlungs-Eingang verifiziert', completed: true },
                      { id: 'chk_2', label: '🔗 Ziel-Link / Stream Kanal verifiziert', completed: false },
                      { id: 'chk_3', label: '⚡ Bot-Server & Live Delivery gestartet', completed: false },
                      { id: 'chk_4', label: '✅ Qualitätssicherung & Fertigstellung', completed: false },
                    ];
                    const completedCount = checklist.filter((c) => c.completed).length;
                    const progressPct = Math.round((completedCount / checklist.length) * 100);

                    return (
                      <div key={ord.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-cyan-400 font-extrabold text-sm">{ord.id}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  ord.status === 'geliefert'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : ord.status === 'in_bearbeitung'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-slate-200 text-xs font-bold">
                                Kunde: <strong className="text-white">{ord.userName}</strong> ({ord.userEmail})
                              </span>

                              {/* Customer Total Orders Stats Badge */}
                              <span className="bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1" title="Gesamtzahl aller vergangenen Bestellungen dieses Kunden">
                                🛒 {orders.filter(o => o.userEmail.toLowerCase() === ord.userEmail.toLowerCase()).length}x Bestellungen
                              </span>

                              {/* Customer Verification & Role Badge */}
                              {partnerApplications.some(p => p.applicantEmail.toLowerCase() === ord.userEmail.toLowerCase()) ? (
                                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  ⭐ Partner-Kunde
                                </span>
                              ) : ord.userEmail.includes('discord') || ord.userName.includes('#') ? (
                                <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  🟢 Verifiziert (Discord OAuth)
                                </span>
                              ) : orders.filter(o => o.userEmail.toLowerCase() === ord.userEmail.toLowerCase()).length >= 3 ? (
                                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  🛡️ VIP Stammkunde
                                </span>
                              ) : (
                                <span className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                  👤 Verifizierter Kunde
                                </span>
                              )}

                              {/* Quick Anti-Spam Block Toggle */}
                              {(shopSettings.blockedEmails || []).map(e => e.toLowerCase()).includes(ord.userEmail.toLowerCase()) ? (
                                <button
                                  type="button"
                                  onClick={() => unblockEmail(ord.userEmail)}
                                  className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer"
                                  title="E-Mail entsperren"
                                >
                                  ⛔ Gesperrt (Entsperren)
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`E-Mail "${ord.userEmail}" sperren / auf Anti-Spam Blacklist setzen?`)) {
                                      blockEmail(ord.userEmail);
                                    }
                                  }}
                                  className="bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer transition-colors"
                                  title="E-Mail auf Anti-Spam Sperrliste setzen"
                                >
                                  🛡️ Sperren (Anti-Spam)
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className="bg-slate-900 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl font-bold focus:outline-none cursor-pointer"
                            >
                              <option value="neu">Neu 🟡</option>
                              <option value="in_bearbeitung">In Bearbeitung 🔵</option>
                              <option value="geliefert">Geliefert 🟢</option>
                              <option value="storniert">Storniert 🔴</option>
                            </select>

                            <button
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Rechnung</span>
                            </button>
                          </div>
                        </div>

                        {/* Items & Target Link */}
                        <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between font-medium">
                              <span>
                                {it.title} ({it.amount} {it.unit})
                              </span>
                              <span className="font-mono text-white font-bold">€{(it.price * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">
                              Ziel:{' '}
                              <a href={ord.targetLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-mono">
                                {ord.targetLink}
                              </a>
                            </span>
                            <span className="font-mono text-emerald-400 font-bold">
                              Gesamt: €{ord.totalPrice.toFixed(2)} ({ord.paymentMethod})
                            </span>
                          </div>
                        </div>

                        {/* Interactive Step Checklist */}
                        <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-300 uppercase text-[10px] tracking-wider flex items-center gap-1">
                              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                              Fulfillment-Schritte ({completedCount}/{checklist.length}):
                            </span>
                            <span className="font-mono text-amber-400 font-bold text-[11px]">{progressPct}%</span>
                          </div>

                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {checklist.map((chk) => (
                              <button
                                key={chk.id}
                                type="button"
                                onClick={() => toggleOrderCheckitem(ord.id, chk.id)}
                                className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${
                                  chk.completed
                                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {chk.completed ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                )}
                                <span className={chk.completed ? 'line-through text-slate-400' : 'font-medium'}>
                                  {chk.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              updateOrderStatus(ord.id, 'geliefert');
                              archiveOrder(ord.id, true);
                            }}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Archive className="w-4 h-4" />
                            <span>Auftrag Beenden & ins Archiv verlegen</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* USER MANAGEMENT & CODE RESET TAB */}
            {activeTab === 'user_management' && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-indigo-400" />
                        Nutzer-Verwaltung & Support Account Code Reset
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Wähle einen Nutzer für "Konto freischalten" (generiert 9-stelligen Code) oder "Konto löschen" (entfernt Zugang & Daten).
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          unbanAllUsers();
                          alert('✅ Alle Kontensperren & Löschungen wurden aufgehoben! Alle Nutzer (inkl. beautifulqueen) sind wieder voll aktiv.');
                        }}
                        className="bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                        title="Entbannt alle bisher gesperrten oder gelöschten Accounts"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Alle Nutzer Entbannen</span>
                      </button>

                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          placeholder="Name, E-Mail oder Discord ID..."
                          className="bg-transparent text-white focus:outline-none w-full placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Accounts List */}
                <div className="space-y-3">
                  {allUsers.length === 0 ? (
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                      Keine Registrierten Nutzer in der Datenbank gefunden.
                    </div>
                  ) : (
                    allUsers
                      .filter((u) => {
                        if (!userSearchTerm.trim()) return true;
                        const q = userSearchTerm.toLowerCase();
                        return (
                          u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          (u.discordId && u.discordId.toLowerCase().includes(q)) ||
                          (u.discordUsername && u.discordUsername.toLowerCase().includes(q))
                        );
                      })
                      .map((user) => {
                        const activeCode = resetCodes.find((rc) => rc.userId === user.id && rc.status === 'active');

                        return (
                          <div
                            key={user.id}
                            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center justify-center font-black text-sm shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-sm">{user.name}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-900 text-purple-300 border border-slate-800">
                                    {user.role}
                                  </span>
                                </div>
                                <div className="text-slate-400 text-xs flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                                  <span>✉️ {user.email}</span>
                                  {user.discordUsername && <span>👾 Discord: {user.discordUsername}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Active Code Indicator if exists */}
                            {activeCode && (
                              <div className="bg-cyan-950/60 border border-cyan-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2 shrink-0">
                                <KeyRound className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span className="text-cyan-300 font-mono font-extrabold text-xs">{activeCode.code}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(activeCode.code);
                                    alert(`Code ${activeCode.code} in Zwischenablage kopiert!`);
                                  }}
                                  className="text-cyan-400 hover:text-white p-1 cursor-pointer"
                                  title="Code Kopieren"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Two Clear Options: Konto Freischalten vs Konto Löschen */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const newRc = generateResetCode(user.id);
                                  setGeneratedCodeModal({
                                    code: newRc.code,
                                    userName: user.name,
                                    userEmail: user.email,
                                    expiresAt: newRc.expiresAt,
                                  });
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/20 transition-colors"
                              >
                                <Unlock className="w-4 h-4 text-cyan-300" />
                                <span>Konto freischalten</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setUserToDelete({ id: user.id, name: user.name, email: user.email })}
                                className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <UserX className="w-4 h-4 text-rose-400" />
                                <span>Konto löschen</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Reset Codes Log Table */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    Generierte Support-Codes Übersicht ({resetCodes.length})
                  </h4>

                  {resetCodes.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Noch keine Support-Codes generiert.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {resetCodes.map((rc) => (
                        <div key={rc.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-cyan-300 font-black text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-cyan-900/50">
                              {rc.code}
                            </span>
                            <div>
                              <span className="text-white font-bold block">{rc.userName} ({rc.userEmail})</span>
                              <span className="text-slate-400 text-[10px]">
                                Gültig bis: {new Date(rc.expiresAt).toLocaleString('de-DE')} • Erstellt von: {rc.createdByAdmin}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              rc.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              rc.status === 'used' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {rc.status === 'active' ? 'AKTIV' : rc.status === 'used' ? 'EINGELÖST' : 'ABGELAUFEN'}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(rc.code);
                                alert(`Code ${rc.code} in Zwischenablage kopiert!`);
                              }}
                              className="text-slate-400 hover:text-white p-1 cursor-pointer"
                              title="Kopieren"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteResetCode(rc.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TICKETS DESK TAB */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                {/* Supporter Shift & Presence Control Bar */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-sm shrink-0">
                        💼
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-2">
                          Supporter Live-Schicht & Präsenz-Status
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Aktualisiere deinen Arbeitsstatus für das Team & Kunden.
                        </p>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => updateSupporterStatus('online')}
                        className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        🟢 Online
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSupporterStatus('in_schicht')}
                        className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        💼 In Schicht
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSupporterStatus('pause')}
                        className="bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        ☕ Pause
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSupporterStatus('offline')}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        🔴 Offline
                      </button>
                    </div>
                  </div>

                  {/* Active Supporters Overview Pills */}
                  {supporterShifts.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 flex items-center gap-2 overflow-x-auto text-[11px]">
                      <span className="text-slate-500 font-bold shrink-0">Team Präsenz:</span>
                      {supporterShifts.map((s, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-xl border font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                            s.status === 'in_schicht'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : s.status === 'online'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : s.status === 'pause'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current" />
                          <span>{s.userName}</span>
                          <span className="text-[9px] uppercase font-mono opacity-80">({s.status})</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!selectedAdminTicket ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-2 flex-1">
                        <Search className="w-4 h-4 text-slate-400 ml-2" />
                        <input
                          type="text"
                          value={ticketSearch}
                          onChange={(e) => setTicketSearch(e.target.value)}
                          placeholder="Ticket-ID, Name oder E-Mail suchen..."
                          className="bg-transparent text-xs text-white focus:outline-none w-full placeholder-slate-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <button
                          onClick={() => setTicketFilter('all')}
                          className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                            ticketFilter === 'all' ? 'bg-cyan-600 text-slate-950' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          Alle ({activeTickets.length})
                        </button>
                        <button
                          onClick={() => setTicketFilter('offen')}
                          className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                            ticketFilter === 'offen' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          Offen ({activeTickets.filter((t) => t.status === 'offen').length})
                        </button>
                      </div>
                    </div>

                    {filteredTickets.length === 0 ? (
                      <p className="text-slate-500 text-xs py-8 text-center">Keine aktiven Support-Tickets gefunden.</p>
                    ) : (
                      filteredTickets.map((tck) => (
                        <div key={tck.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                          <div onClick={() => setSelectedAdminTicket(tck)} className="flex items-center justify-between cursor-pointer group">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-cyan-400">{tck.id}</span>
                                <span className="text-white text-sm font-bold group-hover:text-cyan-300 transition-colors">{tck.subject}</span>
                                {tck.orderId && (
                                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                                    Order: {tck.orderId}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">
                                Kunde: <strong className="text-slate-200">{tck.userName}</strong> ({tck.userEmail}) • Priorität:{' '}
                                <strong className="text-amber-400 uppercase text-[10px]">{tck.priority}</strong>
                              </p>
                              {tck.rating && (
                                <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                                  <span>⭐ Kundenbewertung: {tck.rating}/5.0</span>
                                  {tck.ratingComment && <span className="text-slate-400 italic">("{tck.ratingComment}")</span>}
                                </p>
                              )}
                            </div>

                            <div className="text-right flex items-center gap-3">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase block ${
                                  tck.status === 'offen'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : tck.status === 'in_bearbeitung'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {tck.status}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadTicketPDF(tck);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded-xl border border-slate-800 cursor-pointer"
                                title="Ticket als Text/PDF exportieren"
                              >
                                <Download className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                updateTicketStatus(tck.id, 'geschlossen');
                                archiveTicket(tck.id, true);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Ticket Beenden & Archivieren</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setSelectedAdminTicket(null)} className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1 cursor-pointer">
                      ← Zurück zur Ticketliste
                    </button>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-black text-cyan-400">{selectedAdminTicket.id}</span>
                          {selectedAdminTicket.orderId && (
                            <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono px-2 py-0.5 rounded">
                              Order #{selectedAdminTicket.orderId}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white">{selectedAdminTicket.subject}</h3>
                        <p className="text-xs text-slate-400">
                          Kunde: {selectedAdminTicket.userName} ({selectedAdminTicket.userEmail})
                        </p>
                        {selectedAdminTicket.rating && (
                          <div className="mt-1 text-xs text-amber-400 font-bold">
                            ⭐ Kundenbewertung: {selectedAdminTicket.rating} / 5 Sterne {selectedAdminTicket.ratingComment ? `("${selectedAdminTicket.ratingComment}")` : ''}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadTicketPDF(selectedAdminTicket)}
                          className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF / Text Export</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
                      {selectedAdminTicket.messages.map((m) => {
                        const isStaff = m.senderRole !== 'kunde';
                        return (
                          <div key={m.id} className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isStaff ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                              }`}
                            >
                              <div className="text-[10px] font-bold opacity-80 mb-1">{m.senderName}</div>
                              <p className="whitespace-pre-wrap">{m.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Macro Schnellantworten */}
                    <div className="mb-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        ⚡ Quick-Macro Schnellantworten (1-Klick):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {quickMacros.map((macro) => (
                          <button
                            key={macro.id}
                            type="button"
                            onClick={() => setAdminReplyMsg(macro.content)}
                            className="bg-slate-900 hover:bg-indigo-950 text-indigo-300 hover:text-white border border-indigo-900/60 hover:border-indigo-500 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                            title={macro.content}
                          >
                            <span>{macro.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleAdminReplySubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={adminReplyMsg}
                        onChange={(e) => setAdminReplyMsg(e.target.value)}
                        placeholder="Direkte Antwort an den Kunden verfassen..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                        <Send className="w-4 h-4" />
                        <span>Senden</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* PARTNER APPLICATIONS TAB */}
            {activeTab === 'partners' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-purple-400" />
                    Partnerschafts-Bewerbungen (S3 eSport & Creator)
                  </h3>
                  <p className="text-xs text-slate-400">Prüfe eingegangene Bewerbungen von Streamern & E-Sport Teams.</p>
                </div>

                {activePartnerApps.length === 0 ? (
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
                    <Handshake className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-semibold">Keine neuen Bewerbungen vorhanden.</p>
                  </div>
                ) : (
                  activePartnerApps.map((app) => (
                    <div key={app.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-400">{app.id}</span>
                            <h4 className="text-white font-bold text-sm">
                              {app.channelName} ({app.platform})
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Bewerber: <strong className="text-slate-200">{app.applicantName}</strong> ({app.applicantEmail}) • Reichweite:{' '}
                            <strong className="text-amber-400">{app.followerCount}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadPartnerPDF(app)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded-xl border border-slate-800 cursor-pointer"
                            title="Bewerbung als Text exportieren"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-400" />
                          </button>

                          <select
                            value={app.status}
                            onChange={(e) => updatePartnerApplicationStatus(app.id, e.target.value as PartnerApplication['status'])}
                            className="bg-slate-900 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                          >
                            <option value="neu">Neu 🟡</option>
                            <option value="in_prüfung">In Prüfung 🔵</option>
                            <option value="angenommen">Angenommen 🟢</option>
                            <option value="abgelehnt">Abgelehnt 🔴</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                        <span className="font-bold text-slate-400 block mb-1">Bewerbungstext:</span>
                        <p className="italic">"{app.message}"</p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => archivePartnerApplication(app.id, true)}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer border border-slate-800"
                        >
                          <Archive className="w-3.5 h-3.5 text-purple-400" />
                          <span>Ins Archiv verschieben</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ARCHIVE TAB */}
            {activeTab === 'archive' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Archive className="w-5 h-5 text-emerald-400" />
                      Archivierte Vorgänge & Protokolle
                    </h3>
                    <p className="text-xs text-slate-400">
                      Abgeschlossene Bestellungen, geschlossene Support-Tickets & geparkte Bewerbungen.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {confirmDeleteArchive ? (
                      <div className="flex items-center gap-2 bg-red-950 p-1.5 rounded-xl border border-red-800">
                        <span className="text-[11px] font-bold text-red-200 px-2">Archiv wirklich leeren?</span>
                        <button
                          onClick={() => {
                            deleteArchivedItems();
                            setConfirmDeleteArchive(false);
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer shadow-md"
                        >
                          Ja, Endgültig Löschen
                        </button>
                        <button
                          onClick={() => setConfirmDeleteArchive(false)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteArchive(true)}
                        className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Archiv Leeren</span>
                      </button>
                    )}
                  </div>
                </div>

                {archivedOrders.length === 0 && archivedTickets.length === 0 && archivedPartnerApps.length === 0 ? (
                  <p className="text-slate-500 text-xs py-8 text-center">Das Archiv ist aktuell leer.</p>
                ) : (
                  <div className="space-y-3">
                    {archivedOrders.map((ord) => (
                      <div key={ord.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono text-cyan-400 font-bold mr-2">{ord.id}</span>
                          <span className="text-white font-medium">Auftrag für {ord.userName} ({ord.userEmail})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold">€{ord.totalPrice.toFixed(2)}</span>
                          <button
                            onClick={() => archiveOrder(ord.id, false)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-bold cursor-pointer"
                          >
                            Wiederherstellen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WARTUNGSMODUS & EVENTS TAB (Admin Only) */}
            {isAdmin && activeTab === 'events' && (
              <form onSubmit={handleSaveMaintenanceAndEventSettings} className="space-y-6">
                
                {/* Maintenance Mode Toggle Card */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${isMaintenanceModeSetting ? 'bg-red-950 text-red-400 border-red-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'}`}>
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          Wartungsmodus (Maintenance Mode)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Sperrt den Shop für reguläre Besucher und zeigt eine Wartungsseite. Admins & Supporters behalten Zugriff!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMaintenanceModeSetting(!isMaintenanceModeSetting)}
                      className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                        isMaintenanceModeSetting
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                    >
                      {isMaintenanceModeSetting ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      <span>{isMaintenanceModeSetting ? 'Wartungsmodus AKTIV 🔴' : 'Wartungsmodus INAKTIV 🟢'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold text-xs mb-1.5">Ankündigungs-Text auf der Wartungsseite:</label>
                    <textarea
                      rows={3}
                      value={maintenanceMessageSetting}
                      onChange={(e) => setMaintenanceMessageSetting(e.target.value)}
                      placeholder="Geben Sie Ihren Kunden den Grund der Wartungsarbeiten an..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Seasonal Events & Discounts */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Saisonale Events & Extra-Rabatte
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Aktives Saison-Theme</label>
                      <select
                        value={eventSeason}
                        onChange={(e) => setEventSeason(e.target.value as SeasonTheme)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold"
                      >
                        <option value="sommer">☀️ Sommer Event</option>
                        <option value="winter">❄️ Winter Event</option>
                        <option value="halloween">🎃 Halloween Event</option>
                        <option value="default">⚡ Cyber Neon Default</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Extra Event-Rabatt (%)</label>
                      <input
                        type="number"
                        value={eventDiscount}
                        onChange={(e) => setEventDiscount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold text-xs mb-1">Banner Ankündigungs-Text:</label>
                    <input
                      type="text"
                      value={eventBannerText}
                      onChange={(e) => setEventBannerText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-bold">
                    <input
                      type="checkbox"
                      checked={eventParticles}
                      onChange={(e) => setEventParticles(e.target.checked)}
                      className="rounded border-slate-800 text-purple-600 focus:ring-0"
                    />
                    <span>Partikel-Effekte & Schnee/Sonne im Hintergrund aktivieren</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    Einstellungen Speichern
                  </button>
                </div>
              </form>
            )}

            {/* COUPONS TAB (Admin Only) */}
            {isAdmin && activeTab === 'coupons' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateCouponSubmit} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-400" />
                    Neuen Gutscheincode Erstellen
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Rabatt-Code *</label>
                      <input
                        type="text"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        placeholder="z.B. GRAVIQ20"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Rabatt (%) *</label>
                      <input
                        type="number"
                        value={newCouponPercent}
                        onChange={(e) => setNewCouponPercent(Number(e.target.value))}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Beschreibung</label>
                      <input
                        type="text"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        placeholder="z.B. Sommer-Special 20%"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Gutschein Anlegen
                  </button>
                </form>

                {/* Coupon List */}
                <div className="space-y-2">
                  {coupons.map((c) => (
                    <div key={c.code} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono text-purple-400 font-black text-sm mr-2">{c.code}</span>
                        <span className="text-emerald-400 font-bold mr-2">-{c.discountPercent}%</span>
                        <span className="text-slate-400">({c.description})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCoupon(c.code)}
                          className={`px-3 py-1 rounded-lg font-bold ${
                            c.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {c.active ? 'Aktiv 🟢' : 'Deaktiviert 🔴'}
                        </button>

                        <button onClick={() => deleteCoupon(c.code)} className="text-slate-500 hover:text-red-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEAM & SUPPORTER TAB (Admin Only) */}
            {isAdmin && activeTab === 'support_team' && (
              <div className="space-y-6">
                <form onSubmit={handleCreateSupportSubmit} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Neuen Supporter / Team Account Anlegen
                  </h3>

                  {/* Quick Search User Picker from DB */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-purple-900/40 space-y-2">
                    <label className="block text-purple-300 font-bold text-xs flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-purple-400" />
                      Nutzer aus Datenbank suchen (Name, Discord Username oder E-Mail)
                    </label>
                    <input
                      type="text"
                      value={teamUserSearchQuery}
                      onChange={(e) => setTeamUserSearchQuery(e.target.value)}
                      placeholder="Tippe hier z.B. beautifulqueen oder Marvin..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-purple-500"
                    />

                    {/* Live Matching User Suggestions */}
                    {teamUserSearchQuery.trim() && (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1">
                        {allUsers
                          .filter((u) => {
                            const q = teamUserSearchQuery.toLowerCase().trim();
                            return (
                              u.name.toLowerCase().includes(q) ||
                              (u.email && u.email.toLowerCase().includes(q)) ||
                              (u.discordUsername && u.discordUsername.toLowerCase().includes(q)) ||
                              (u.discordId && u.discordId.toLowerCase().includes(q))
                            );
                          })
                          .slice(0, 8)
                          .map((u) => {
                            const userEmail = u.email && u.email.includes('@') ? u.email : `${(u.discordUsername || u.name).toLowerCase().replace(/\s+/g, '')}@graviq.shop`;
                            return (
                              <div
                                key={u.id}
                                className="p-2.5 bg-slate-950 hover:bg-purple-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  {u.avatarUrl ? (
                                    <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover" />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-purple-900/90 text-purple-200 border border-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-white font-bold block">
                                      {u.name} {u.discordUsername ? `(@${u.discordUsername})` : ''}
                                    </span>
                                    <span className="text-slate-400 text-[11px]">{userEmail}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewSuppName(u.discordUsername || u.name);
                                      setNewSuppEmail(userEmail);
                                      setTeamUserSearchQuery('');
                                    }}
                                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 cursor-pointer"
                                  >
                                    Übernehmen
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const created = createSupportAccount(u.name, userEmail, newSuppRole);
                                      setTeamUserSearchQuery('');
                                      alert(`✅ ${created.name} wurde direkt als "${created.role === 'team_graviq' ? 'Team Graviq' : 'Supporter'}" ins Team aufgenommen!`);
                                    }}
                                    className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-lg font-black cursor-pointer shadow-md"
                                  >
                                    Direkt Ins Team ➔
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Name *</label>
                      <input
                        type="text"
                        value={newSuppName}
                        onChange={(e) => setNewSuppName(e.target.value)}
                        placeholder="z.B. Alex (Support)"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-bold">E-Mail Adresse</label>
                        <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                          Auto-Erstellung: Bald Verfügbar
                        </span>
                      </div>
                      <input
                        type="text"
                        value={newSuppEmail}
                        onChange={(e) => setNewSuppEmail(e.target.value)}
                        placeholder="z.B. name@graviq-shop.de"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Rolle</label>
                      <select
                        value={newSuppRole}
                        onChange={(e) => setNewSuppRole(e.target.value as 'support' | 'team_graviq')}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                      >
                        <option value="support">🟢 Supporter (Ticket desk)</option>
                        <option value="team_graviq">⚡ Team Graviq (Fulfillment & Delivery)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Dem Team Hinzufügen / Account Erstellen
                  </button>
                </form>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Aktuelle Team-Mitglieder & Supporter ({supportAccounts.length})
                  </h4>
                  {supportAccounts.map((acc) => (
                    <div key={acc.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        {acc.avatarUrl ? (
                          <img src={acc.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-900/90 text-purple-200 border border-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {acc.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-white font-bold block">{acc.name}</span>
                          <span className="text-slate-400 text-[11px]">{acc.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">
                          {acc.role === 'team_graviq' ? '⚡ Team Graviq' : '🟢 Supporter'}
                        </span>
                        <button
                          onClick={() => deleteSupportAccount(acc.id)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Aus Team entfernen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GOOGLE SHEETS LIVE DB TAB (Admin & Team Graviq) */}
            {(isAdmin || effectiveRole === 'admin' || effectiveRole === 'team_graviq') && activeTab === 'google_sheets' && (
              <div className="space-y-6">
                <GoogleSheetsSecurityModule />
              </div>
            )}

            {/* SECURITY & IP BLOCKER TAB (Admin & Team Graviq) */}
            {(isAdmin || effectiveRole === 'admin' || effectiveRole === 'team_graviq') && activeTab === 'security' && (
              <div className="space-y-6">
                {/* Encrypted Google Sheets Database Vault Module */}
                <GoogleSheetsSecurityModule />

                {/* Security Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-red-900/50 bg-red-950/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-950 text-red-400 rounded-xl border border-red-800 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-white font-black text-sm block">IP Blocker Status</span>
                      <span className="text-emerald-400 text-xs font-bold font-mono">🟢 AKTIV (Anti-Spam Shield)</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-900/50 bg-indigo-950/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-white font-black text-sm block">Kunden Verifizierung</span>
                      <span className="text-indigo-400 text-xs font-bold">Discord OAuth & Order Badging</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-900/50 bg-amber-950/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-950 text-amber-400 rounded-xl border border-amber-800 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-white font-black text-sm block">DevTools / Inspect Schutz</span>
                      <span className="text-amber-300 text-xs font-bold">Gesperrt (F12 / Rightclick)</span>
                    </div>
                  </div>
                </div>

                {/* IP Address Blacklist Manager */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                      IP Blocker Management (IPv4 / IPv6)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Füge IP-Adressen hinzu, die vom Zugriff, Bestellungen und Support-Tickets ausgeschlossen werden sollen.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newIpInput.trim()) {
                        blockIP(newIpInput.trim());
                        setNewIpInput('');
                      }
                    }}
                    className="flex gap-2 text-xs"
                  >
                    <input
                      type="text"
                      value={newIpInput}
                      onChange={(e) => setNewIpInput(e.target.value)}
                      placeholder="z.B. 185.220.101.5"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-2.5 rounded-xl cursor-pointer shrink-0"
                    >
                      IP Sperren ⛔
                    </button>
                  </form>

                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="text-slate-400 text-xs font-bold block">
                      Gesperrte IP-Adressen ({shopSettings.blockedIPs?.length || 0}):
                    </span>

                    {(shopSettings.blockedIPs?.length || 0) === 0 ? (
                      <p className="text-slate-500 text-xs italic">Keine IPs gesperrt.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {shopSettings.blockedIPs?.map((ip) => (
                          <div
                            key={ip}
                            className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono"
                          >
                            <span className="text-red-300 font-bold">{ip}</span>
                            <button
                              onClick={() => unblockIP(ip)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold cursor-pointer"
                            >
                              Entsperren
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Blacklist Manager */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <UserX className="w-5 h-5 text-red-400" />
                      Anti-Spam E-Mail Blacklist
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sperre verdächtige E-Mail-Adressen oder Wegwerf-Mails.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newEmailInput.trim()) {
                        blockEmail(newEmailInput.trim());
                        setNewEmailInput('');
                      }
                    }}
                    className="flex gap-2 text-xs"
                  >
                    <input
                      type="email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="spammer@tempmail.org"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-2.5 rounded-xl cursor-pointer shrink-0"
                    >
                      E-Mail Sperren ⛔
                    </button>
                  </form>

                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="text-slate-400 text-xs font-bold block">
                      Gesperrte E-Mails ({shopSettings.blockedEmails?.length || 0}):
                    </span>

                    {(shopSettings.blockedEmails?.length || 0) === 0 ? (
                      <p className="text-slate-500 text-xs italic">Keine E-Mails gesperrt.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {shopSettings.blockedEmails?.map((em) => (
                          <div
                            key={em}
                            className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono"
                          >
                            <span className="text-red-300 font-bold truncate">{em}</span>
                            <button
                              onClick={() => unblockEmail(em)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold cursor-pointer shrink-0"
                            >
                              Entsperren
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SHOP SETTINGS TAB (Admin Only) */}
            {isAdmin && activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  PayPal & Support Einstellungen
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Shop Offizielle E-Mail</label>
                    <input
                      type="email"
                      value={emailSetting}
                      onChange={(e) => setEmailSetting(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">PayPal Live / Sandbox Modus</label>
                    <select
                      value={paypalModeSetting}
                      onChange={(e) => setPaypalModeSetting(e.target.value as 'sandbox' | 'live')}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold"
                    >
                      <option value="live">🟢 Live Modus (Echte PayPal Zahlungen)</option>
                      <option value="sandbox">🟡 Sandbox Modus (Testumgebung)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">PayPal Client ID</label>
                    <input
                      type="text"
                      value={paypalClientIdSetting}
                      onChange={(e) => setPaypalClientIdSetting(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">PayPal Client Secret</label>
                    <input
                      type="password"
                      value={paypalSecretSetting}
                      onChange={(e) => setPaypalSecretSetting(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            )}

          </div>
        </main>
      </div>

      {/* Invoice Modal Popup if selected */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

      {/* Product Editing Modal Popup */}
      {editingProductModal !== undefined && (
        <ProductEditModal
          product={editingProductModal}
          onClose={() => setEditingProductModal(undefined)}
        />
      )}

      {/* 9-Digit Support Code Popup Overlay */}
      {generatedCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-cyan-950 text-cyan-400 rounded-2xl border border-cyan-800 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-900/30">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">
                Support-Code Generiert!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Konto freigeschaltet für <strong className="text-white">{generatedCodeModal.userName}</strong> ({generatedCodeModal.userEmail})
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-900/60 text-center space-y-2">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Dein 9-Stelliger Freischalt-Code:</span>
              <div className="text-3xl font-black font-mono text-cyan-300 tracking-widest py-1 select-all">
                {generatedCodeModal.code}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Gültig für 60 Minuten (bis {new Date(generatedCodeModal.expiresAt).toLocaleTimeString('de-DE')} Uhr)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedCodeModal.code);
                setCopiedCodeSuccess(true);
                setTimeout(() => setCopiedCodeSuccess(false), 2500);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer transition-all"
            >
              {copiedCodeSuccess ? <CopyCheck className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCodeSuccess ? '✅ Code in Zwischenablage Kopiert!' : '📋 Code Kopieren (an Nutzer senden)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setGeneratedCodeModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Konto Löschen Confirmation Modal Overlay */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-rose-950 text-rose-400 rounded-2xl border border-rose-800 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-900/30">
                <UserX className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">
                Konto wirklich löschen?
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Möchtest du das Nutzerkonto von <strong className="text-white">{userToDelete.name}</strong> ({userToDelete.email}) wirklich dauerhaft löschen?
              </p>
              <p className="text-[11px] text-rose-400 font-bold mt-2 bg-rose-950/60 p-2.5 rounded-xl border border-rose-900/50">
                ⚠️ Der Nutzer wird sofort abgemeldet, der Account dauerhaft gesperrt und alle aktiven Support-Codes entfernt!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUserAccount(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-900/30 transition-colors"
              >
                Dauerhaft Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
