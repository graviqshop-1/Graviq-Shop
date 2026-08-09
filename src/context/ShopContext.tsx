import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  ServicePackage,
  CartItem,
  Order,
  Ticket,
  Coupon,
  ShopSettings,
  SentEmailLog,
  PlatformId,
  OrderStatus,
  PartnerApplication,
  ResetCode,
  PendingSyncEvent,
  DeletedUserMeta,
  ProductReview,
  SupporterShift,
  InAppNotification,
  QuickMacro,
} from '../types';
import {
  INITIAL_ADMIN_USER,
  INITIAL_SUPPORT_USERS,
  INITIAL_SHOP_SETTINGS,
  INITIAL_COUPONS,
  INITIAL_PACKAGES,
  INITIAL_ORDERS,
  INITIAL_TICKETS,
  INITIAL_PARTNER_APPLICATIONS,
  INITIAL_IN_APP_NOTIFICATIONS,
  INITIAL_PRODUCT_REVIEWS,
  INITIAL_SUPPORTER_SHIFTS,
  INITIAL_QUICK_MACROS,
} from '../data/initialData';
import {
  syncUserToDatabase,
  syncShopToGoogleSheets,
  sendToAppsScriptWebhook,
  queryUserInSheet,
  addUserToSheet,
  updateUserInSheet,
  verifyAndRedeemResetCodeInSheet,
  fetchProductsFromSheet,
  updateProductStockInSheet,
  addOrderToSheet,
  loadGoogleGisScript,
} from '../services/googleSheetsService';
import { sendDiscordLog, AuditLogEntry } from '../services/discordLogger';

interface ShopContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, pass: string) => boolean;
  loginWithDiscord: (overrideClientId?: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, pass: string) => boolean;
  resetPassword: (email: string) => boolean;
  
  // Products & Slider
  products: ServicePackage[];
  setProducts: React.Dispatch<React.SetStateAction<ServicePackage[]>>;
  addProduct: (product: ServicePackage) => void;
  updateProduct: (productId: string, updated: Partial<ServicePackage>) => void;
  deleteProduct: (productId: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  
  // Orders
  orders: Order[];
  placeOrder: (
    paymentMethod: 'paypal_sandbox' | 'paypal_live' | 'creditcard' | 'sofort',
    targetLink: string,
    paypalTxId?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleOrderCheckitem: (orderId: string, itemId: string) => void;
  archiveOrder: (orderId: string, isArchived: boolean) => void;
  deleteOrder: (orderId: string) => void;
  
  // Tickets
  tickets: Ticket[];
  createTicket: (
    subject: string,
    category: Ticket['category'],
    message: string,
    orderId?: string,
    priority?: Ticket['priority']
  ) => Ticket;
  replyTicket: (ticketId: string, message: string) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  toggleTicketCheckitem: (ticketId: string, itemId: string) => void;
  archiveTicket: (ticketId: string, isArchived: boolean) => void;
  deleteTicket: (ticketId: string) => void;

  // Partner Applications
  partnerApplications: PartnerApplication[];
  submitPartnerApplication: (data: Omit<PartnerApplication, 'id' | 'status' | 'createdAt'>) => PartnerApplication;
  updatePartnerApplicationStatus: (id: string, status: PartnerApplication['status']) => void;
  togglePartnerCheckitem: (appId: string, itemId: string) => void;
  archivePartnerApplication: (appId: string, isArchived: boolean) => void;
  deletePartnerApplication: (appId: string) => void;

  // Support Account Reset System
  resetCodes: ResetCode[];
  generateResetCode: (userId: string, customValidityMinutes?: number) => ResetCode;
  generateAccountResetCode: (emailOrId: string, customValidityMinutes?: number, createdBy?: string) => ResetCode;
  redeemResetCode: (codeStr: string) => { success: boolean; message: string; user?: User };
  deleteResetCode: (codeId: string) => void;
  deleteUserAccount: (userId: string) => void;

  // Audit Trail & Logs
  auditLogs: AuditLogEntry[];
  logAuditEvent: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => Promise<AuditLogEntry>;

  // Global Purge/Cleanup
  deleteArchivedItems: () => void;
  
  // Admin & Settings
  coupons: Coupon[];
  createCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;
  
  supportAccounts: User[];
  allUsers: User[];
  createSupportAccount: (name: string, email: string, role?: 'support' | 'team_graviq') => User;
  deleteSupportAccount: (userId: string) => void;
  unblockUserAccount: (identifier: string) => void;
  unbanAllUsers: () => void;
  deletedUserIds: string[];
  deletedUsersMeta: DeletedUserMeta[];

  authError: string | null;
  setAuthError: (err: string | null) => void;
  
  shopSettings: ShopSettings;
  updateShopSettings: (settings: Partial<ShopSettings>) => void;
  blockIP: (ip: string) => void;
  unblockIP: (ip: string) => void;
  blockEmail: (email: string) => void;
  unblockEmail: (email: string) => void;
  
  notifications: SentEmailLog[];
  clearNotifications: () => void;
  
  activePlatform: PlatformId;
  setActivePlatform: (p: PlatformId) => void;

  // Active modal triggers
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalView: 'login' | 'register' | 'forgot' | 'discord';
  setAuthModalView: (view: 'login' | 'register' | 'forgot' | 'discord') => void;
  resetModalOpen: boolean;
  setResetModalOpen: (open: boolean) => void;
  
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  partnerModalOpen: boolean;
  setPartnerModalOpen: (open: boolean) => void;

  // In-App Notifications & Bells
  inAppNotifications: InAppNotification[];
  addInAppNotification: (notif: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearInAppNotifications: () => void;

  // Product Reviews & Ratings
  productReviews: ProductReview[];
  addProductReview: (productId: string, rating: number, comment: string) => void;

  // Supporter Shifts & Quick Macros
  supporterShifts: SupporterShift[];
  updateSupporterStatus: (status: SupporterShift['status']) => void;
  quickMacros: QuickMacro[];

  // Loyalty & Gamification (Daily Reward, Coins Conversion, Ticket Ratings)
  claimDailyReward: () => { success: boolean; message: string; rewardCoins?: number; rewardBalance?: number };
  convertCoinsToBalance: (coinsToConvert: number) => { success: boolean; message: string };
  rateTicket: (ticketId: string, rating: number, comment?: string) => void;

  // Update Announcement Modal
  updateModalOpen: boolean;
  setUpdateModalOpen: (open: boolean) => void;

  // Auto Google Sheets Live Trigger & Event Staging
  triggerGoogleSheetsFullSync: () => Promise<void>;
  pendingSyncEvents: PendingSyncEvent[];
  addSyncEvent: (event: Omit<PendingSyncEvent, 'id' | 'timestamp'>) => void;
  approveSyncEvents: (ids?: string[]) => Promise<boolean>;
  dismissSyncEvents: (ids: string[]) => void;
  clearAllSyncEvents: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('graviq_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<ServicePackage[]>(() => {
    const saved = localStorage.getItem('graviq_products');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('graviq_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('graviq_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('graviq_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('graviq_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);
  const [deletedUsersMeta, setDeletedUsersMeta] = useState<DeletedUserMeta[]>([]);

  const [authError, setAuthError] = useState<string | null>(null);

  const [supportAccounts, setSupportAccounts] = useState<User[]>(() => {
    const saved = localStorage.getItem('graviq_support_accs');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_USERS;
  });

  const [resetCodes, setResetCodes] = useState<ResetCode[]>(() => {
    const saved = localStorage.getItem('graviq_reset_codes');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('graviq_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [partnerApplications, setPartnerApplications] = useState<PartnerApplication[]>(() => {
    const saved = localStorage.getItem('graviq_partner_apps');
    return saved ? JSON.parse(saved) : INITIAL_PARTNER_APPLICATIONS;
  });

  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('graviq_shop_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    const mergedConfig = {
      ...INITIAL_SHOP_SETTINGS.googleSheetsConfig,
      ...(parsed.googleSheetsConfig || {}),
    };
    if (!mergedConfig.appsScriptWebhookUrl || mergedConfig.appsScriptWebhookUrl.includes('AKfycbwfEf8RA990KRe51NbbSI-L1hMu6038IJJf3dCb4fGbZlJt3NLIciCpezfBLs_MyssJ')) {
      mergedConfig.appsScriptWebhookUrl = 'https://script.google.com/macros/s/AKfycbxXRFTKQQrml4VuGAVpBnxluZJhIP1wdM8272JEttROEJjA4yg2nGluLoLGIgKBhEEfdQ/exec';
    }
    return {
      ...INITIAL_SHOP_SETTINGS,
      ...parsed,
      googleSheetsConfig: mergedConfig,
    };
  });

  const [notifications, setNotifications] = useState<SentEmailLog[]>([]);

  const [activePlatform, setActivePlatform] = useState<PlatformId>('twitch');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot' | 'discord'>('login');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // In-App Notifications State
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('graviq_in_app_notifications');
      return saved ? JSON.parse(saved) : INITIAL_IN_APP_NOTIFICATIONS;
    } catch {
      return INITIAL_IN_APP_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('graviq_in_app_notifications', JSON.stringify(inAppNotifications));
    } catch (_) {}
  }, [inAppNotifications]);

  // Product Reviews State
  const [productReviews, setProductReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem('graviq_product_reviews');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCT_REVIEWS;
    } catch {
      return INITIAL_PRODUCT_REVIEWS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('graviq_product_reviews', JSON.stringify(productReviews));
    } catch (_) {}
  }, [productReviews]);

  // Supporter Shifts State
  const [supporterShifts, setSupporterShifts] = useState<SupporterShift[]>(() => {
    try {
      const saved = localStorage.getItem('graviq_supporter_shifts');
      return saved ? JSON.parse(saved) : INITIAL_SUPPORTER_SHIFTS;
    } catch {
      return INITIAL_SUPPORTER_SHIFTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('graviq_supporter_shifts', JSON.stringify(supporterShifts));
    } catch (_) {}
  }, [supporterShifts]);

  // Quick Macros (Canned Replies)
  const [quickMacros] = useState<QuickMacro[]>(INITIAL_QUICK_MACROS);

  const [pendingSyncEvents, setPendingSyncEvents] = useState<PendingSyncEvent[]>(() => {
    try {
      const saved = localStorage.getItem('graviq_pending_sync_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('graviq_pending_sync_events', JSON.stringify(pendingSyncEvents));
  }, [pendingSyncEvents]);

  const addSyncEvent = (evt: Omit<PendingSyncEvent, 'id' | 'timestamp'>) => {
    const config = shopSettings.googleSheetsConfig;
    const catAllowed = config?.syncCategories?.[evt.category === 'system' ? 'auditLogs' : evt.category + 's' as keyof typeof config.syncCategories] ?? true;
    if (!catAllowed) return; // Exclude disabled categories

    const newEvt: PendingSyncEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString('de-DE'),
      ...evt,
    };
    setPendingSyncEvents((prev) => [newEvt, ...prev]);

    // If instant mode is active, send event immediately to webhook
    if (config?.appsScriptWebhookUrl && (config.syncMode || 'instant') === 'instant') {
      sendToAppsScriptWebhook(config.appsScriptWebhookUrl.trim(), {
        timestamp: newEvt.timestamp,
        singleEvent: newEvt,
      });
    }
  };

  const dismissSyncEvents = (ids: string[]) => {
    setPendingSyncEvents((prev) => prev.filter((e) => !ids.includes(e.id)));
  };

  const clearAllSyncEvents = () => {
    setPendingSyncEvents([]);
  };

  const approveSyncEvents = async (ids?: string[]) => {
    const config = shopSettings.googleSheetsConfig;
    const url = config?.appsScriptWebhookUrl?.trim();
    if (!url) return false;

    const eventsToSync = ids ? pendingSyncEvents.filter((e) => ids.includes(e.id)) : pendingSyncEvents;
    if (eventsToSync.length === 0) return false;

    const success = await sendToAppsScriptWebhook(url, {
      timestamp: new Date().toLocaleString('de-DE'),
      events: eventsToSync,
      orders,
      users: allUsers,
    });

    if (success) {
      const syncedIds = eventsToSync.map((e) => e.id);
      setPendingSyncEvents((prev) => prev.filter((e) => !syncedIds.includes(e.id)));
    }
    return success;
  };

  // In-App Notification Methods
  const addInAppNotification = (notif: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setInAppNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setInAppNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setInAppNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearInAppNotifications = () => {
    setInAppNotifications([]);
  };

  // Product Review Methods
  const addProductReview = (productId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const newReview: ProductReview = {
      id: `rev_${Date.now()}`,
      productId,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verifiedBuyer: orders.some((o) => o.userId === currentUser.id || o.userEmail === currentUser.email),
    };
    setProductReviews((prev) => [newReview, ...prev]);

    // Reward user with 15 Graviq Coins
    const currentCoins = currentUser.coins || 0;
    const updatedCoins = currentCoins + 15;
    const updatedUser = { ...currentUser, coins: updatedCoins };
    setCurrentUser(updatedUser);
    syncUserToDatabase(updatedUser);

    addInAppNotification({
      userId: currentUser.id,
      title: '⭐ Bewertung Veröffentlicht!',
      message: 'Vielen Dank für deine Produkt-Bewertung! Du hast +15 Graviq Coins geschenkt bekommen.',
      type: 'coins',
    });
  };

  // Supporter Shift Status Update
  const updateSupporterStatus = (status: SupporterShift['status']) => {
    if (!currentUser) return;
    setSupporterShifts((prev) => {
      const existing = prev.find((s) => s.userId === currentUser.id || s.userEmail === currentUser.email);
      if (existing) {
        return prev.map((s) =>
          s.userId === currentUser.id || s.userEmail === currentUser.email
            ? { ...s, status, shiftStartedAt: status === 'in_schicht' ? new Date().toISOString() : s.shiftStartedAt }
            : s
        );
      } else {
        return [
          ...prev,
          {
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            role: currentUser.role,
            status,
            shiftStartedAt: status === 'in_schicht' ? new Date().toISOString() : undefined,
            ticketsResolvedToday: 0,
          },
        ];
      }
    });
  };

  // Calculate VIP Rank based on Graviq Coins
  const calculateVipRank = (coins: number) => {
    if (coins >= 2500) return 'VIP' as const;
    if (coins >= 1000) return 'Platin' as const;
    if (coins >= 500) return 'Gold' as const;
    if (coins >= 250) return 'Silber' as const;
    return 'Bronze' as const;
  };

  // Claim Daily Login Bonus
  const claimDailyReward = (): { success: boolean; message: string; rewardCoins?: number; rewardBalance?: number } => {
    if (!currentUser) {
      return { success: false, message: '❌ Bitte melde dich an, um deinen Belohnungs-Bonus abzuholen.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (currentUser.lastDailyRewardClaimed === todayStr) {
      return { success: false, message: '⏳ Du hast deinen täglichen Bonus heute bereits abgeholt! Komm morgen wieder.' };
    }

    const rewardCoins = 25;
    const rewardBalance = 0.50;

    const newCoins = (currentUser.coins || 0) + rewardCoins;
    const newBalance = Number(((currentUser.balance || 0) + rewardBalance).toFixed(2));
    const newRank = calculateVipRank(newCoins);

    const updatedUser: User = {
      ...currentUser,
      coins: newCoins,
      balance: newBalance,
      vipRank: newRank,
      lastDailyRewardClaimed: todayStr,
    };

    setCurrentUser(updatedUser);
    syncUserToDatabase(updatedUser);

    addInAppNotification({
      userId: currentUser.id,
      title: '🎁 Daily Login Bonus Abgeholt!',
      message: `Du hast +25 Graviq Coins & 0,50 € Guthaben erhalten! Aktueller VIP-Rang: ${newRank}`,
      type: 'reward',
    });

    return {
      success: true,
      message: `🎉 Daily Bonus erhalten! +25 Graviq Coins & +0,50 € Guthaben gutgeschrieben. (Dein Rang: ${newRank})`,
      rewardCoins,
      rewardBalance,
    };
  };

  // Convert Graviq Coins into Balance (100 Coins = 1,00 €)
  const convertCoinsToBalance = (coinsToConvert: number): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: '❌ Bitte zuerst einloggen.' };
    }
    const currentCoins = currentUser.coins || 0;
    if (coinsToConvert < 100) {
      return { success: false, message: '❌ Es müssen mindestens 100 Graviq Coins eingelöst werden (100 Coins = 1,00 €).' };
    }
    if (currentCoins < coinsToConvert) {
      return { success: false, message: `❌ Nicht genügend Coins. Du besitzt aktuell ${currentCoins} Graviq Coins.` };
    }

    const eurosToAdd = coinsToConvert / 100;
    const newCoins = currentCoins - coinsToConvert;
    const newBalance = Number(((currentUser.balance || 0) + eurosToAdd).toFixed(2));

    const updatedUser: User = {
      ...currentUser,
      coins: newCoins,
      balance: newBalance,
    };

    setCurrentUser(updatedUser);
    syncUserToDatabase(updatedUser);

    addInAppNotification({
      userId: currentUser.id,
      title: '🪙 Coins in Guthaben umgewandelt!',
      message: `${coinsToConvert} Graviq Coins wurden erfolgreich in ${eurosToAdd.toFixed(2)} € Guthaben umgewandelt!`,
      type: 'coins',
    });

    return {
      success: true,
      message: `🎉 Erfolg! ${coinsToConvert} Graviq Coins wurden in ${eurosToAdd.toFixed(2)} € Shop-Guthaben gewandelt.`,
    };
  };

  // Ticket Rating System
  const rateTicket = (ticketId: string, rating: number, comment?: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, rating, ratingComment: comment } : t))
    );

    if (currentUser) {
      const updatedCoins = (currentUser.coins || 0) + 20;
      const updatedUser = { ...currentUser, coins: updatedCoins };
      setCurrentUser(updatedUser);
      syncUserToDatabase(updatedUser);

      addInAppNotification({
        userId: currentUser.id,
        title: '⭐ Support-Bewertung Gespeichert!',
        message: 'Danke für dein Feedback zu unserem Kundenservice! Du hast +20 Graviq Coins als Dankeschön erhalten.',
        type: 'ticket',
      });
    }

    triggerGoogleSheetsFullSync();
  };

  // Sync state to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('graviq_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('graviq_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('graviq_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('graviq_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('graviq_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('graviq_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('graviq_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('graviq_support_accs', JSON.stringify(supportAccounts));
  }, [supportAccounts]);

  useEffect(() => {
    localStorage.setItem('graviq_reset_codes', JSON.stringify(resetCodes));
  }, [resetCodes]);

  useEffect(() => {
    localStorage.setItem('graviq_partner_apps', JSON.stringify(partnerApplications));
  }, [partnerApplications]);

  useEffect(() => {
    localStorage.setItem('graviq_shop_settings', JSON.stringify(shopSettings));
  }, [shopSettings]);

  useEffect(() => {
    localStorage.setItem('graviq_deleted_user_ids', JSON.stringify(deletedUserIds));
  }, [deletedUserIds]);

  useEffect(() => {
    localStorage.setItem('graviq_deleted_users_meta', JSON.stringify(deletedUsersMeta));
  }, [deletedUsersMeta]);

  // Preload Google Identity Services (GIS) script
  useEffect(() => {
    loadGoogleGisScript().catch(() => {});
  }, []);

  // Logout if current user is in deletedUserIds
  useEffect(() => {
    if (currentUser) {
      const email = currentUser.email?.toLowerCase().trim();
      const discordId = currentUser.discordId?.toLowerCase().trim();
      const isDeleted = deletedUserIds.some((id) => {
        const clean = id.toLowerCase().trim();
        return (
          clean === currentUser.id.toLowerCase() ||
          (email && clean === email) ||
          (discordId && clean === discordId)
        );
      });
      if (isDeleted) {
        setCurrentUser(null);
        localStorage.removeItem('graviq_current_user');
      }
    }
  }, [currentUser, deletedUserIds]);

  // Keep currentUser role synced with supportAccounts & Admin status
  useEffect(() => {
    if (!currentUser) return;

    const cEmail = currentUser.email?.toLowerCase().trim();
    const cDiscordId = currentUser.discordId?.toLowerCase().trim();
    const cDiscordUser = currentUser.discordUsername?.toLowerCase().trim();
    const cName = currentUser.name?.toLowerCase().trim();

    // Admin check
    if (
      (cEmail && cEmail.includes('strauss')) ||
      (cDiscordUser && cDiscordUser.includes('strauss')) ||
      (cName && cName.includes('strauss')) ||
      currentUser.id === INITIAL_ADMIN_USER.id
    ) {
      if (currentUser.role !== 'admin') {
        setCurrentUser((prev) => (prev ? { ...prev, role: 'admin' } : null));
      }
      return;
    }

    // Check supportAccounts
    const match = supportAccounts.find((s) => {
      const sEmail = s.email?.toLowerCase().trim();
      const sDiscordId = s.discordId?.toLowerCase().trim();
      const sDiscordUser = s.discordUsername?.toLowerCase().trim();
      const sName = s.name?.toLowerCase().trim();

      return (
        (cEmail && sEmail && cEmail === sEmail) ||
        (cDiscordId && sDiscordId && cDiscordId === sDiscordId) ||
        (cDiscordUser && sDiscordUser && cDiscordUser === sDiscordUser) ||
        (cName && sName && cName === sName)
      );
    });

    if (match && currentUser.role !== match.role) {
      setCurrentUser((prev) => (prev ? { ...prev, role: match.role } : null));
    }
  }, [supportAccounts, currentUser?.id, currentUser?.email, currentUser?.discordId, currentUser?.discordUsername, currentUser?.name, currentUser?.role]);

  // Helper to check if a user is deleted
  const isUserDeleted = (u: User) => {
    const uId = u.id?.toLowerCase().trim();
    const uEmail = u.email?.toLowerCase().trim();
    const uDiscord = u.discordId?.toLowerCase().trim();
    return deletedUserIds.some((id) => {
      const clean = id.toLowerCase().trim();
      return (
        (uId && clean === uId) ||
        (uEmail && clean === uEmail) ||
        (uDiscord && clean === uDiscord) ||
        (uDiscord && clean === `usr_discord_${uDiscord}`)
      );
    });
  };

  // Combined User list for Admin User Management
  const allUsers: User[] = React.useMemo(() => {
    const usersMap = new Map<string, User>();
    if (!isUserDeleted(INITIAL_ADMIN_USER)) {
      usersMap.set(INITIAL_ADMIN_USER.id, INITIAL_ADMIN_USER);
    }
    supportAccounts.forEach((u) => {
      if (!isUserDeleted(u)) {
        usersMap.set(u.id, u);
      }
    });
    if (currentUser && !isUserDeleted(currentUser)) {
      usersMap.set(currentUser.id, currentUser);
    }

    // load from local storage user db vault
    try {
      const raw = localStorage.getItem('graviq_users_db');
      if (raw) {
        const parsed: Record<string, User> = JSON.parse(raw);
        Object.values(parsed).forEach((u) => {
          if (u && u.id && !isUserDeleted(u)) {
            usersMap.set(u.id, u);
          }
        });
      }
    } catch (_) {}

    return Array.from(usersMap.values());
  }, [currentUser, supportAccounts, deletedUserIds]);

  // Audit Logger Wrapper
  const logAuditEvent = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> => {
    const newLog = await sendDiscordLog(shopSettings.discordWebhookUrl, entry);
    setAuditLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  // Full Google Sheets Live Sync Trigger (Optional - executes if autoSyncEnabled or webhook is set)
  const triggerGoogleSheetsFullSync = async () => {
    // 1. Permanent Apps Script Webhook Sync (Zero OAuth Token expiry)
    const appsScriptUrl = shopSettings.googleSheetsConfig?.appsScriptWebhookUrl;
    if (appsScriptUrl && appsScriptUrl.trim()) {
      const formattedUsers = allUsers.map((u) => {
        const isBlocked = deletedUserIds.includes(u.id) || (u as any).isBlocked || false;
        return {
          id: u.id,
          discordId: u.discordId || u.id,
          username: u.discordUsername || u.name,
          name: u.name,
          email: u.email,
          role: u.role,
          balance: (u as any).balance || 0,
          createdAt: u.createdAt ? new Date(u.createdAt).toLocaleString('de-DE') : new Date().toLocaleString('de-DE'),
          isBlocked: isBlocked,
          status: isBlocked ? 'Gesperrt' : 'Aktiv',
          notes: u.email ? `E-Mail: ${u.email}` : '',
        };
      });

      const formattedOrders = orders.map((o) => ({
        id: o.id,
        customerName: o.userName,
        userName: o.userName,
        customerEmail: o.userEmail,
        userEmail: o.userEmail,
        items: o.items ? o.items.map((i) => ({ quantity: i.quantity, title: i.title })) : [],
        totalAmount: o.totalPrice,
        totalPrice: o.totalPrice,
        status: o.status,
        createdAt: new Date(o.createdAt).toLocaleString('de-DE'),
        date: new Date(o.createdAt).toLocaleString('de-DE'),
      }));

      const formattedProducts = products.map((p) => ({
        id: p.id,
        title: p.title,
        name: p.title,
        category: p.category,
        price: p.price,
        isPopular: p.popular || false,
        popular: p.popular || false,
      }));

      const formattedResetCodes = resetCodes.map((r) => ({
        code: r.code,
        discordId: r.userId || r.userEmail || '-',
        userId: r.userId,
        userEmail: r.userEmail,
        createdAt: new Date(r.createdAt).toLocaleString('de-DE'),
        expiresAt: new Date(r.expiresAt).toLocaleString('de-DE'),
        isOneTime: true,
        used: r.status === 'used',
        status: r.status === 'used' ? 'Eingelöst' : 'Aktiv',
      }));

      sendToAppsScriptWebhook(appsScriptUrl.trim(), {
        action: 'sync_all',
        timestamp: new Date().toISOString(),
        users: formattedUsers,
        orders: formattedOrders,
        products: formattedProducts,
        resetCodes: formattedResetCodes,
        tickets,
        auditLogs,
        shopSettings,
      });
      console.log('⚡ Background Google Apps Script Webhook Sync executed!');
    }

    const isAutoSyncActive = shopSettings.googleSheetsConfig?.autoSyncEnabled ?? false;
    if (!isAutoSyncActive) {
      console.log('ℹ️ Google Sheets Live Auto-Sync via Direct OAuth API ist deaktiviert.');
      return;
    }

    const sheetsAccessToken = localStorage.getItem('graviq_gsheets_token') || shopSettings.googleSheetsConfig?.accessToken;
    const spreadsheetId = localStorage.getItem('graviq_gsheets_id') || shopSettings.googleSheetsConfig?.spreadsheetId;
    if (sheetsAccessToken && spreadsheetId) {
      try {
        await syncShopToGoogleSheets(
          sheetsAccessToken,
          spreadsheetId,
          {
            users: allUsers,
            orders,
            products,
            tickets,
            resetCodes,
            auditLogs,
            shopSettings,
          },
          {
            encryptionEnabled: shopSettings.googleSheetsConfig?.encryptionEnabled ?? false,
          }
        );
        console.log('✅ Live Background Google Sheets Sync completed!');
      } catch (err: any) {
        if (
          err.message?.includes('INVALID_GOOGLE_TOKEN') ||
          err.message?.includes('invalid authentication credentials') ||
          err.message?.includes('OAuth 2') ||
          err.message?.includes('Unauthenticated')
        ) {
          console.warn('⚠️ Google Sheets Token abgelaufen. Auto-Sync pausiert.');
          localStorage.removeItem('graviq_gsheets_token');
          setShopSettings((prev) => ({
            ...prev,
            googleSheetsConfig: {
              ...prev.googleSheetsConfig,
              accessToken: undefined,
              autoSyncEnabled: false,
            },
          }));
        } else {
          console.warn('Google Sheets Live Sync Notice:', err);
        }
      }
    }
  };

  // Automatic background debounced sync to Google Sheets Webhook on data changes
  useEffect(() => {
    const appsScriptUrl = shopSettings.googleSheetsConfig?.appsScriptWebhookUrl;
    if (!appsScriptUrl || !appsScriptUrl.trim()) return;

    const timer = setTimeout(() => {
      triggerGoogleSheetsFullSync();
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    orders,
    allUsers,
    products,
    tickets,
    resetCodes,
    shopSettings.googleSheetsConfig?.appsScriptWebhookUrl,
  ]);

  // Periodic 30-second background auto-sync to Google Sheets (Webhook or OAuth)
  useEffect(() => {
    const appsScriptUrl = shopSettings.googleSheetsConfig?.appsScriptWebhookUrl;
    const sheetsAccessToken = localStorage.getItem('graviq_gsheets_token') || shopSettings.googleSheetsConfig?.accessToken;
    const spreadsheetId = localStorage.getItem('graviq_gsheets_id') || shopSettings.googleSheetsConfig?.spreadsheetId;

    const hasWebhook = Boolean(appsScriptUrl && appsScriptUrl.trim());
    const hasOAuth = Boolean(sheetsAccessToken && spreadsheetId);

    if (!hasWebhook && !hasOAuth) return;

    const interval = setInterval(() => {
      console.log('🔄 30s Periodic Live Google Sheets Auto-Sync executed');
      triggerGoogleSheetsFullSync();
    }, 30000);

    return () => clearInterval(interval);
  }, [
    orders,
    allUsers,
    products,
    tickets,
    resetCodes,
    shopSettings.googleSheetsConfig?.appsScriptWebhookUrl,
    shopSettings.googleSheetsConfig?.accessToken,
    shopSettings.googleSheetsConfig?.spreadsheetId,
  ]);

  // Listen for Discord OAuth Callback postMessage from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DISCORD_OAUTH_SUCCESS' && event.data?.payload) {
        const payload = event.data.payload;
        const userId = `usr_discord_${payload.id}`;
        const userEmail = payload.email?.toLowerCase().trim();
        const discordId = payload.id?.toLowerCase().trim();

        const isDeleted = deletedUserIds.some((id) => {
          const clean = id.toLowerCase().trim();
          return (
            clean === userId.toLowerCase() ||
            (userEmail && clean === userEmail) ||
            (discordId && clean === discordId)
          );
        });

        if (isDeleted) {
          setAuthError(
            '⚠️ DEIN KONTO WURDE GESPERRT ODER GELÖSCHT!\n\nDein Discord-Account bzw. dein Konto wurde vom Support/Admin dauerhaft gesperrt oder gelöscht. Eine Anmeldung ist nicht mehr möglich.\n\nFalls du der Meinung bist, dass es sich um einen Fehler handelt, wende dich bitte per E-Mail an: kontakt@graviq-shop.de'
          );
          setAuthModalOpen(true);
          return;
        }

        setAuthError(null);

        const isStraussAdmin =
          payload.username?.toLowerCase().includes('strauss') ||
          payload.discordTag?.toLowerCase().includes('strauss') ||
          payload.email?.toLowerCase().includes('strauss');

        // Check if user exists in supportAccounts
        const pEmail = payload.email?.toLowerCase().trim();
        const pDiscordId = payload.id?.toLowerCase().trim();
        const pDiscordTag = payload.discordTag?.toLowerCase().trim();
        const pUsername = payload.username?.toLowerCase().trim();

        const foundSupport = supportAccounts.find((s) => {
          const sEmail = s.email?.toLowerCase().trim();
          const sDiscordId = s.discordId?.toLowerCase().trim();
          const sDiscordUser = s.discordUsername?.toLowerCase().trim();
          const sName = s.name?.toLowerCase().trim();

          return (
            (pEmail && sEmail && pEmail === sEmail) ||
            (pDiscordId && sDiscordId && pDiscordId === sDiscordId) ||
            (pDiscordTag && sDiscordUser && pDiscordTag === sDiscordUser) ||
            (pUsername && sName && pUsername === sName)
          );
        });

        const assignedRole: UserRole = isStraussAdmin
          ? 'admin'
          : foundSupport
          ? foundSupport.role
          : 'kunde';

        const loggedInUser: User = {
          id: userId,
          email: payload.email,
          name: payload.username,
          role: assignedRole,
          discordId: payload.id,
          discordUsername: payload.discordTag,
          avatarUrl: payload.avatarUrl,
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(loggedInUser);
        syncUserToDatabase(loggedInUser);

        logAuditEvent({
          category: 'user',
          level: 'success',
          action: 'Anmeldung über Discord OAuth',
          details: `Benutzer ${loggedInUser.name} (${loggedInUser.email}) hat sich über Discord angemeldet.`,
          userId: loggedInUser.id,
          userName: loggedInUser.name,
          discordId: loggedInUser.discordId,
          result: 'Erfolgreich',
        });

        triggerGoogleSheetsFullSync();
        setAuthModalOpen(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [shopSettings, deletedUserIds]);

  // Auth Methods
  const login = (email: string, pass: string): boolean => {
    const cleanEmail = email.toLowerCase().trim();
    
    if (deletedUserIds.some((id) => id.toLowerCase().trim() === cleanEmail)) {
      alert('⚠️ Dieses Konto wurde dauerhaft gelöscht.');
      return false;
    }
    
    // Admin login for Strauss
    if (cleanEmail === 'strauss@graviq.shop' || cleanEmail === 'straussiimausii' || cleanEmail === 'admin@graviq.shop') {
      setCurrentUser(INITIAL_ADMIN_USER);
      logAuditEvent({
        category: 'user',
        level: 'success',
        action: 'Admin Login (Strauss)',
        details: 'Admin-Zugang für Strauss erfolgreich autorisiert.',
        userId: INITIAL_ADMIN_USER.id,
        userName: INITIAL_ADMIN_USER.name,
        result: 'Erfolgreich',
      });
      return true;
    }

    // Check support users
    const foundSupport = supportAccounts.find((s) => {
      const sEmail = s.email?.toLowerCase().trim();
      const sDiscordUser = s.discordUsername?.toLowerCase().trim();
      const sName = s.name?.toLowerCase().trim();
      return (
        (sEmail && sEmail === cleanEmail) ||
        (sDiscordUser && sDiscordUser === cleanEmail) ||
        (sName && sName === cleanEmail)
      );
    });
    if (foundSupport) {
      setCurrentUser(foundSupport);
      logAuditEvent({
        category: 'user',
        level: 'success',
        action: 'Support Login',
        details: `Support-Mitarbeiter ${foundSupport.name} (${foundSupport.role}) angemeldet.`,
        userId: foundSupport.id,
        userName: foundSupport.name,
        result: 'Erfolgreich',
      });
      return true;
    }

    // Customer login
    const customerUser: User = {
      id: `usr_k_${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      role: 'kunde',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(customerUser);

    logAuditEvent({
      category: 'user',
      level: 'info',
      action: 'Kunden Login',
      details: `Kunde ${customerUser.name} (${customerUser.email}) angemeldet.`,
      userId: customerUser.id,
      userName: customerUser.name,
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
    return true;
  };

  const loginWithDiscord = (overrideClientId?: string): boolean => {
    const activeClientId = overrideClientId?.trim() || shopSettings.discordClientId?.trim();
    if (!activeClientId) {
      return false;
    }

    const redirectUri = `${window.location.origin}/discord-callback.html`;
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
      activeClientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify%20email`;

    window.open(discordAuthUrl, 'discord_oauth', 'width=600,height=750');
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent({
        category: 'user',
        level: 'info',
        action: 'Abmeldung / Logout',
        details: `Benutzer ${currentUser.name} hat sich abgemeldet.`,
        userId: currentUser.id,
        userName: currentUser.name,
        discordId: currentUser.discordId,
        result: 'Erfolgreich',
      });
    }
    setCurrentUser(null);
  };

  const register = (name: string, email: string, pass: string): boolean => {
    const newUser: User = {
      id: `usr_k_${Date.now()}`,
      email: email.toLowerCase().trim(),
      name,
      role: 'kunde',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);

    logAuditEvent({
      category: 'user',
      level: 'success',
      action: 'Konto Registrierung',
      details: `Neues Konto erstellt für ${name} (${email}).`,
      userId: newUser.id,
      userName: newUser.name,
      result: 'Erfolgreich',
    });

    logAuditEvent({
      category: 'user',
      level: 'info',
      action: 'Willkommens-Benachrichtigung',
      details: `Willkommens-Info für ${name} (${email}) registriert.`,
      userId: newUser.id,
      userName: newUser.name,
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
    return true;
  };

  const resetPassword = (email: string): boolean => {
    logAuditEvent({
      category: 'user',
      level: 'info',
      action: 'Passwort Zurücksetzen Info',
      details: `Passwort-Zurücksetzen Anfrage für ${email}`,
      result: 'Erfolgreich',
    });
    return true;
  };

  // Support Account Reset Code System Operations
  const generateResetCode = (userId: string, customValidityMinutes = 60): ResetCode => {
    const targetUser = allUsers.find((u) => u.id === userId) || {
      id: userId,
      name: 'Unbekannter Nutzer',
      email: 'user@graviq.shop',
    };

    // Generate random 9-digit code formatted as XXX-XXX-XXX (e.g. 489-291-039)
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    const p3 = Math.floor(100 + Math.random() * 900);
    const codeString = `${p1}-${p2}-${p3}`;
    const expiresAt = new Date(Date.now() + customValidityMinutes * 60 * 1000).toISOString();

    const newCode: ResetCode = {
      id: `rc_${Date.now()}`,
      code: codeString,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      createdAt: new Date().toISOString(),
      expiresAt,
      status: 'active',
      createdByAdmin: currentUser?.name || 'Admin / Support',
      customValidityMinutes,
    };

    setResetCodes((prev) => [newCode, ...prev]);

    logAuditEvent({
      category: 'support',
      level: 'warning',
      action: 'Support Reset-Code Erstellt',
      details: `9-stelliger Support-Code ${codeString} erstellt für ${targetUser.name} (${targetUser.email}). Gültig für ${customValidityMinutes} Minuten.`,
      userId: targetUser.id,
      userName: targetUser.name,
      performedBy: currentUser?.name || 'Admin',
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
    return newCode;
  };

  const generateAccountResetCode = (
    emailOrId: string,
    customValidityMinutes = 30,
    createdBy?: string
  ): ResetCode => {
    const cleanSearch = emailOrId.toLowerCase().trim();
    const targetUser = allUsers.find(
      (u) =>
        u.id.toLowerCase() === cleanSearch ||
        u.email?.toLowerCase().trim() === cleanSearch ||
        u.name?.toLowerCase().trim() === cleanSearch
    ) || {
      id: `usr_${Date.now()}`,
      name: emailOrId,
      email: emailOrId.includes('@') ? emailOrId : `${emailOrId}@graviq-shop.de`,
    };

    return generateResetCode(targetUser.id, customValidityMinutes);
  };

  const redeemResetCode = (codeStr: string): { success: boolean; message: string; user?: User } => {
    const cleanInput = codeStr.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (!cleanInput) {
      return { success: false, message: '❌ Bitte gib den 9-stelligen Support-Code ein.' };
    }

    const found = resetCodes.find((rc) => {
      const cleanDbCode = rc.code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      return cleanDbCode === cleanInput;
    });

    if (!found) {
      logAuditEvent({
        category: 'support',
        level: 'error',
        action: 'Reset-Code Einlösung Fehlgeschlagen',
        details: `Versuchte Einlösung eines ungültigen Sicherheitscodes: ${codeStr}`,
        result: 'Fehlgeschlagen',
      });
      return { success: false, message: '❌ Ungültiger Support-Code. Bitte überprüfe den 9-stelligen Code.' };
    }

    if (found.status !== 'active') {
      return { success: false, message: '❌ Dieser Support-Code wurde bereits eingelöst oder deaktiviert.' };
    }

    if (new Date() > new Date(found.expiresAt)) {
      setResetCodes((prev) =>
        prev.map((rc) => (rc.id === found.id ? { ...rc, status: 'expired' } : rc))
      );
      return { success: false, message: '❌ Dieser Support-Code ist abgelaufen (Zeitlimit überschritten).' };
    }

    // Update code status to 'used'
    setResetCodes((prev) =>
      prev.map((rc) => (rc.id === found.id ? { ...rc, status: 'used', usedAt: new Date().toISOString() } : rc))
    );

    // Find and unlock/re-link user
    const targetUser = allUsers.find((u) => u.id === found.userId) || {
      id: found.userId,
      name: found.userName,
      email: found.userEmail,
      role: 'kunde' as const,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(targetUser);
    syncUserToDatabase(targetUser);

    logAuditEvent({
      category: 'support',
      level: 'success',
      action: 'Account Wiederhergestellt mit Reset-Code',
      details: `9-stelliger Support-Code ${found.code} erfolgreich eingelöst. Account von ${found.userName} freigeschaltet.`,
      userId: targetUser.id,
      userName: targetUser.name,
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
    return { success: true, message: '✅ Support-Code erfolgreich verifiziert! Dein Konto wurde freigeschaltet.', user: targetUser };
  };

  const deleteResetCode = (codeId: string) => {
    setResetCodes((prev) => prev.filter((rc) => rc.id !== codeId));
  };

  const deleteUserAccount = (userId: string) => {
    // Find target user details first
    const targetUser = allUsers.find((u) => u.id === userId);
    const targetEmail = targetUser?.email?.toLowerCase().trim();
    const targetDiscordId = targetUser?.discordId?.toLowerCase().trim();

    const newMeta: DeletedUserMeta = {
      id: userId,
      name: targetUser?.name || 'Unbekannter Nutzer',
      email: targetUser?.email || userId,
      discordId: targetUser?.discordId,
      deletedAt: new Date().toLocaleString('de-DE'),
    };

    setDeletedUsersMeta((prev) => [
      newMeta,
      ...prev.filter(
        (m) =>
          m.id.toLowerCase().trim() !== userId.toLowerCase().trim() &&
          (targetEmail ? m.email.toLowerCase().trim() !== targetEmail : true)
      ),
    ]);

    setDeletedUserIds((prev) => {
      const updatedSet = new Set(prev.map((i) => i.toLowerCase().trim()));
      updatedSet.add(userId.toLowerCase().trim());
      if (targetEmail) updatedSet.add(targetEmail);
      if (targetDiscordId) updatedSet.add(targetDiscordId);
      if (targetDiscordId) updatedSet.add(`usr_discord_${targetDiscordId}`);
      return Array.from(updatedSet);
    });

    setSupportAccounts((prev) =>
      prev.filter(
        (u) =>
          u.id !== userId &&
          (targetEmail ? u.email?.toLowerCase().trim() !== targetEmail : true)
      )
    );

    if (
      currentUser &&
      (currentUser.id === userId ||
        (targetEmail && currentUser.email?.toLowerCase().trim() === targetEmail) ||
        (targetDiscordId && currentUser.discordId?.toLowerCase().trim() === targetDiscordId))
    ) {
      setCurrentUser(null);
      localStorage.removeItem('graviq_current_user');
    }

    try {
      const raw = localStorage.getItem('graviq_users_db');
      if (raw) {
        const parsed: Record<string, User> = JSON.parse(raw);
        delete parsed[userId];
        if (targetEmail) {
          Object.keys(parsed).forEach((k) => {
            if (parsed[k]?.email?.toLowerCase().trim() === targetEmail) {
              delete parsed[k];
            }
          });
        }
        localStorage.setItem('graviq_users_db', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error(e);
    }

    setResetCodes((prev) =>
      prev.filter(
        (rc) =>
          rc.userId !== userId &&
          (targetEmail ? rc.userEmail?.toLowerCase().trim() !== targetEmail : true)
      )
    );

    logAuditEvent({
      category: 'support',
      level: 'warning',
      action: 'Konto Gelöscht',
      details: `Nutzer-Konto "${targetUser?.name || userId}" (${targetUser?.email || userId}) wurde vom Support/Admin dauerhaft gelöscht und gesperrt.`,
      performedBy: currentUser?.name || 'Support',
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
  };

  const unblockUserAccount = (identifier: string) => {
    const cleanId = identifier.toLowerCase().trim();

    // Find metadata for this user
    const meta = deletedUsersMeta.find(
      (m) =>
        m.id.toLowerCase().trim() === cleanId ||
        m.email.toLowerCase().trim() === cleanId ||
        (m.discordId && m.discordId.toLowerCase().trim() === cleanId)
    );

    const idsToRemove = new Set<string>();
    idsToRemove.add(cleanId);
    if (meta?.id) idsToRemove.add(meta.id.toLowerCase().trim());
    if (meta?.email) idsToRemove.add(meta.email.toLowerCase().trim());
    if (meta?.discordId) {
      idsToRemove.add(meta.discordId.toLowerCase().trim());
      idsToRemove.add(`usr_discord_${meta.discordId.toLowerCase().trim()}`);
    }

    setDeletedUserIds((prev) =>
      prev.filter((id) => !idsToRemove.has(id.toLowerCase().trim()))
    );

    setDeletedUsersMeta((prev) =>
      prev.filter((m) => !idsToRemove.has(m.id.toLowerCase().trim()) && (!m.email || !idsToRemove.has(m.email.toLowerCase().trim())))
    );

    logAuditEvent({
      category: 'support',
      level: 'success',
      action: 'Konto Entsperrt / Wiederhergestellt',
      details: `Konto "${meta?.name || identifier}" (${meta?.email || identifier}) wurde vom Admin entsperrt.`,
      performedBy: currentUser?.name || 'Admin',
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
  };

  const unbanAllUsers = () => {
    setDeletedUserIds([]);
    setDeletedUsersMeta([]);
    try {
      localStorage.removeItem('graviq_deleted_user_ids');
      localStorage.removeItem('graviq_deleted_users_meta');
    } catch (_) {}
    logAuditEvent({
      category: 'support',
      level: 'success',
      action: 'Alle Konten Entsperrt',
      details: 'Sämtliche Benutzersperren & Deaktivierungen wurden aufgehoben (alle Nutzer sind wieder aktiv).',
      performedBy: currentUser?.name || 'Admin',
      result: 'Erfolgreich',
    });
    triggerGoogleSheetsFullSync();
  };

  // Product Management Operations
  const addProduct = (product: ServicePackage) => {
    setProducts((prev) => [product, ...prev]);
    logAuditEvent({
      category: 'admin',
      level: 'info',
      action: 'Produkt Erstellt',
      details: `Neues Paket '${product.title}' (€${product.price}) hinzugefügt.`,
      result: 'Erfolgreich',
    });
    triggerGoogleSheetsFullSync();
  };

  const updateProduct = (productId: string, updated: Partial<ServicePackage>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updated } : p))
    );
    triggerGoogleSheetsFullSync();
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    triggerGoogleSheetsFullSync();
  };

  // Cart Operations
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.title === item.title && i.duration === item.duration && i.targetLink === item.targetLink
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
    if (!found) {
      return { success: false, message: 'Gutscheincode ungültig oder abgelaufen.' };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Gutscheincode '${found.code}' aktiviert! (-${found.discountPercent}%)` };
  };

  // Order Operations
  const placeOrder = (
    paymentMethod: 'paypal_sandbox' | 'paypal_live' | 'creditcard' | 'sofort',
    targetLink: string,
    paypalTxId?: string
  ): Order => {
    const rawTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const couponDisc = appliedCoupon ? (rawTotal * appliedCoupon.discountPercent) / 100 : 0;
    const seasonDiscPercent = shopSettings.seasonDiscountPercent || 0;
    const seasonDisc = (rawTotal * seasonDiscPercent) / 100;
    const discount = couponDisc + seasonDisc;
    const finalTotal = Math.max(0, rawTotal - discount);

    const newOrder: Order = {
      id: `GRVQ-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email || 'gast@graviq.shop',
      userName: currentUser?.name || 'Gast Kunde',
      items: [...cart],
      totalPrice: Number(finalTotal.toFixed(2)),
      discountApplied: Number(discount.toFixed(2)),
      couponCode: appliedCoupon?.code,
      paymentMethod,
      paypalTransactionId: paypalTxId || `PAYPAL-TX-${Date.now()}`,
      status: 'neu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetLink: targetLink || cart[0]?.targetLink || 'https://twitch.tv/',
      checklist: [
        { id: 'chk_1', label: '💳 PayPal / Zahlungs-Eingang verifiziert (Käuferschutz Ausgeschlossen)', completed: true },
        { id: 'chk_2', label: '🔗 Ziel-Link / Stream Kanal verifiziert', completed: false },
        { id: 'chk_3', label: '⚡ Bot-Server & Live Delivery gestartet', completed: false },
        { id: 'chk_4', label: '✅ Qualitätssicherung & Fertigstellung', completed: false },
      ],
      isArchived: false,
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (appliedCoupon) {
      setCoupons((prev) =>
        prev.map((c) => (c.code === appliedCoupon.code ? { ...c, usedCount: c.usedCount + 1 } : c))
      );
    }

    // Award Graviq Coins (10 Coins per 1€ spent)
    if (currentUser) {
      const earnedCoins = Math.max(10, Math.floor(finalTotal * 10));
      const newCoins = (currentUser.coins || 0) + earnedCoins;
      const newRank = calculateVipRank(newCoins);

      const updatedUser: User = {
        ...currentUser,
        coins: newCoins,
        vipRank: newRank,
      };

      setCurrentUser(updatedUser);
      syncUserToDatabase(updatedUser);

      addInAppNotification({
        userId: currentUser.id,
        title: `📦 Bestellung ${newOrder.id} Erfolgreich!`,
        message: `Vielen Dank für deinen Einkauf! Du hast +${earnedCoins} Graviq Coins erhalten. (VIP-Rang: ${newRank})`,
        type: 'order',
      });
    }

    logAuditEvent({
      category: 'shop',
      level: 'success',
      action: 'Neue Bestellung Erstellt',
      details: `Bestellung ${newOrder.id} (€${newOrder.totalPrice.toFixed(2)}) via ${paymentMethod}. [Hinweis: PayPal Käuferschutz gemäß AGB für Digitale Güter ausgeschlossen]. Ziel: ${newOrder.targetLink}`,
      userId: newOrder.userId,
      userName: newOrder.userName,
      result: 'Erfolgreich',
    });

    clearCart();
    triggerGoogleSheetsFullSync();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status, updatedAt: new Date().toISOString() };
          logAuditEvent({
            category: 'shop',
            level: 'info',
            action: 'Bestellstatus Aktualisiert',
            details: `Bestellung ${o.id} geändert auf: ${status.toUpperCase()}`,
            userId: o.userId,
            userName: o.userName,
            result: 'Erfolgreich',
          });
          return updated;
        }
        return o;
      })
    );
    triggerGoogleSheetsFullSync();
  };

  const toggleOrderCheckitem = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentChecklist = o.checklist || [
            { id: 'chk_1', label: '💳 PayPal / Zahlungs-Eingang verifiziert', completed: true },
            { id: 'chk_2', label: '🔗 Ziel-Link / Stream Kanal verifiziert', completed: false },
            { id: 'chk_3', label: '⚡ Bot-Server & Live Delivery gestartet', completed: false },
            { id: 'chk_4', label: '✅ Qualitätssicherung & Fertigstellung', completed: false },
          ];
          const updatedList = currentChecklist.map((ch) =>
            ch.id === itemId ? { ...ch, completed: !ch.completed } : ch
          );
          const allCompleted = updatedList.every((ch) => ch.completed);
          return {
            ...o,
            checklist: updatedList,
            status: allCompleted ? 'geliefert' : o.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
  };

  const archiveOrder = (orderId: string, isArchived: boolean) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, isArchived, updatedAt: new Date().toISOString() } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Ticket Operations
  const createTicket = (
    subject: string,
    category: Ticket['category'],
    message: string,
    orderId?: string,
    priority: Ticket['priority'] = 'mittel'
  ): Ticket => {
    const newTicket: Ticket = {
      id: `TCK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser?.id || `usr_k_${Date.now()}`,
      userEmail: currentUser?.email || 'kunden.support@graviq.shop',
      userName: currentUser?.name || 'Kunde',
      subject,
      category,
      orderId,
      priority,
      status: 'offen',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: currentUser?.id || 'usr_k_guest',
          senderName: currentUser?.name || 'Kunde',
          senderRole: currentUser?.role || 'kunde',
          message,
          createdAt: new Date().toISOString(),
        },
      ],
      checklist: [
        { id: 'tchk_1', label: '🔍 Kundenanliegen & Bestellung analysiert', completed: true },
        { id: 'tchk_2', label: '💬 Support-Antwort an den Kunden übermittelt', completed: false },
        { id: 'tchk_3', label: '🎯 Problem gelöst & Bestätigung erhalten', completed: false },
        { id: 'tchk_4', label: '🔒 Support-Ticket beendet & ins Archiv verlegt', completed: false },
      ],
      isArchived: false,
    };

    setTickets((prev) => [newTicket, ...prev]);

    logAuditEvent({
      category: 'support',
      level: 'info',
      action: 'Neues Support-Ticket Erstellt',
      details: `Ticket ${newTicket.id} [${category.toUpperCase()}]: ${subject}`,
      userId: newTicket.userId,
      userName: newTicket.userName,
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
    return newTicket;
  };

  const replyTicket = (ticketId: string, message: string) => {
    if (!currentUser) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newMsg = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            message,
            createdAt: new Date().toISOString(),
          };
          const updatedStatus = currentUser.role === 'kunde' ? 'offen' : 'in_bearbeitung';
          const updated = {
            ...t,
            status: updatedStatus as Ticket['status'],
            updatedAt: new Date().toISOString(),
            messages: [...t.messages, newMsg],
          };

          logAuditEvent({
            category: 'support',
            level: 'info',
            action: 'Support-Ticket Antwort',
            details: `Antwort auf Ticket ${t.id} von ${currentUser.name} (${currentUser.role}): "${message.slice(0, 50)}..."`,
            userId: currentUser.id,
            userName: currentUser.name,
            result: 'Erfolgreich',
          });

          return updated;
        }
        return t;
      })
    );
    triggerGoogleSheetsFullSync();
  };

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              isArchived: status === 'geschlossen' ? true : t.isArchived,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    triggerGoogleSheetsFullSync();
  };

  const toggleTicketCheckitem = (ticketId: string, itemId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const currentList = t.checklist || [
            { id: 'tchk_1', label: '🔍 Kundenanliegen & Bestellung analysiert', completed: true },
            { id: 'tchk_2', label: '💬 Support-Antwort an den Kunden übermittelt', completed: false },
            { id: 'tchk_3', label: '🎯 Problem gelöst & Bestätigung erhalten', completed: false },
            { id: 'tchk_4', label: '🔒 Support-Ticket beendet & ins Archiv verlegt', completed: false },
          ];
          const updatedList = currentList.map((ch) =>
            ch.id === itemId ? { ...ch, completed: !ch.completed } : ch
          );
          const allCompleted = updatedList.every((ch) => ch.completed);
          return {
            ...t,
            checklist: updatedList,
            status: allCompleted ? 'geschlossen' : t.status,
            isArchived: allCompleted ? true : t.isArchived,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const archiveTicket = (ticketId: string, isArchived: boolean) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, isArchived, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  // Partner Applications
  const submitPartnerApplication = (
    data: Omit<PartnerApplication, 'id' | 'status' | 'createdAt'>
  ): PartnerApplication => {
    const newApp: PartnerApplication = {
      ...data,
      id: `PARTNER-${Math.floor(100 + Math.random() * 900)}`,
      status: 'neu',
      createdAt: new Date().toISOString(),
      checklist: [
        { id: 'pchk_1', label: '📺 Kanal-Link & Creator Profile prüfen', completed: false },
        { id: 'pchk_2', label: '👥 Reichweite & Aktivität verifizieren', completed: false },
        { id: 'pchk_3', label: '🏆 S3 eSport Freigabe & Teamabstellung', completed: false },
        { id: 'pchk_4', label: '🤝 Partner-Vertrag & Gutschein übergeben', completed: false },
      ],
      isArchived: false,
    };
    setPartnerApplications((prev) => [newApp, ...prev]);

    logAuditEvent({
      category: 'shop',
      level: 'info',
      action: 'Partnerschafts-Bewerbung Eingereicht',
      details: `Kanal ${newApp.channelName} (${newApp.platform}) - ${newApp.applicantName}`,
      result: 'Erfolgreich',
    });

    return newApp;
  };

  const updatePartnerApplicationStatus = (id: string, status: PartnerApplication['status']) => {
    setPartnerApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
  };

  const togglePartnerCheckitem = (appId: string, itemId: string) => {
    setPartnerApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const currentList = app.checklist || [];
          const updatedList = currentList.map((ch) =>
            ch.id === itemId ? { ...ch, completed: !ch.completed } : ch
          );
          return { ...app, checklist: updatedList };
        }
        return app;
      })
    );
  };

  const archivePartnerApplication = (appId: string, isArchived: boolean) => {
    setPartnerApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, isArchived } : app))
    );
  };

  const deletePartnerApplication = (appId: string) => {
    setPartnerApplications((prev) => prev.filter((app) => app.id !== appId));
  };

  const deleteArchivedItems = () => {
    setOrders((prev) => {
      const filtered = prev.filter((o) => !o.isArchived);
      try { localStorage.setItem('graviq_orders', JSON.stringify(filtered)); } catch (_) {}
      return filtered;
    });
    setTickets((prev) => {
      const filtered = prev.filter((t) => !t.isArchived);
      try { localStorage.setItem('graviq_tickets', JSON.stringify(filtered)); } catch (_) {}
      return filtered;
    });
    setPartnerApplications((prev) => {
      const filtered = prev.filter((app) => !app.isArchived);
      try { localStorage.setItem('graviq_partner_apps', JSON.stringify(filtered)); } catch (_) {}
      return filtered;
    });
    logAuditEvent({
      category: 'admin',
      level: 'warning',
      action: 'Archiv Geleert',
      details: 'Sämtliche archivierten Einträge (Bestellungen, Tickets & Partner-Bewerbungen) wurden endgültig gelöscht.',
      performedBy: currentUser?.name || 'Admin',
      result: 'Erfolgreich',
    });
    triggerGoogleSheetsFullSync();
  };

  // Coupons
  const createCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
  };

  const toggleCoupon = (code: string) => {
    setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c)));
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  };

  // Support Accounts
  const createSupportAccount = (name: string, email: string, role: 'support' | 'team_graviq' = 'support'): User => {
    // Check if user exists in allUsers or local database vault
    const cleanSearch = (email || name).toLowerCase().trim();
    const existingUser = allUsers.find(
      (u) =>
        u.id.toLowerCase().trim() === cleanSearch ||
        (u.email && u.email.toLowerCase().trim() === cleanSearch) ||
        (u.discordId && u.discordId.toLowerCase().trim() === cleanSearch) ||
        u.name.toLowerCase().trim() === name.toLowerCase().trim() ||
        (u.discordUsername && u.discordUsername.toLowerCase().trim() === name.toLowerCase().trim())
    );

    const targetEmail = existingUser?.email || (email && email.includes('@') ? email : `${(email || name).toLowerCase().replace(/[^a-z0-9]/g, '')}@graviq-shop.de`);

    const newSupportUser: User = {
      id: existingUser?.id || `usr_${role === 'team_graviq' ? 'team' : 'supp'}_${Date.now()}`,
      name: existingUser?.name || name,
      email: targetEmail.toLowerCase().trim(),
      discordId: existingUser?.discordId,
      discordUsername: existingUser?.discordUsername,
      avatarUrl: existingUser?.avatarUrl,
      role,
      createdAt: existingUser?.createdAt || new Date().toISOString(),
    };

    if (existingUser) {
      existingUser.role = role;
      syncUserToDatabase(existingUser);
    } else {
      syncUserToDatabase(newSupportUser);
    }

    setSupportAccounts((prev) => {
      const filtered = prev.filter((acc) => acc.id !== newSupportUser.id && acc.email.toLowerCase() !== newSupportUser.email.toLowerCase());
      return [...filtered, newSupportUser];
    });

    logAuditEvent({
      category: 'admin',
      level: 'info',
      action: 'Team-Mitglied Hinzugefügt/Aktualisiert',
      details: `${newSupportUser.name} (${newSupportUser.email}) wurde die Rolle "${role}" zugewiesen.`,
      performedBy: currentUser?.name || 'Admin',
      result: 'Erfolgreich',
    });

    triggerGoogleSheetsFullSync();
    return newSupportUser;
  };

  const deleteSupportAccount = (userId: string) => {
    setSupportAccounts((prev) => prev.filter((u) => u.id !== userId));
  };

  // Settings
  const updateShopSettings = (settings: Partial<ShopSettings>) => {
    setShopSettings((prev) => ({ ...prev, ...settings }));
    logAuditEvent({
      category: 'admin',
      level: 'warning',
      action: 'Shop Einstellungen Geändert',
      details: `Einstellungen aktualisiert von Admin ${currentUser?.name || 'System'}.`,
      result: 'Erfolgreich',
    });
    triggerGoogleSheetsFullSync();
  };

  const blockIP = (ip: string) => {
    const cleanIP = ip.trim();
    if (!cleanIP) return;
    setShopSettings((prev) => ({
      ...prev,
      blockedIPs: Array.from(new Set([...(prev.blockedIPs || []), cleanIP])),
    }));
  };

  const unblockIP = (ip: string) => {
    setShopSettings((prev) => ({
      ...prev,
      blockedIPs: (prev.blockedIPs || []).filter((i) => i !== ip),
    }));
  };

  const blockEmail = (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return;
    setShopSettings((prev) => ({
      ...prev,
      blockedEmails: Array.from(new Set([...(prev.blockedEmails || []), cleanEmail])),
    }));
  };

  const unblockEmail = (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    setShopSettings((prev) => ({
      ...prev,
      blockedEmails: (prev.blockedEmails || []).filter((e) => e.toLowerCase() !== cleanEmail),
    }));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <ShopContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        loginWithDiscord,
        logout,
        register,
        resetPassword,
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        orders,
        placeOrder,
        updateOrderStatus,
        toggleOrderCheckitem,
        archiveOrder,
        deleteOrder,
        tickets,
        createTicket,
        replyTicket,
        updateTicketStatus,
        toggleTicketCheckitem,
        archiveTicket,
        deleteTicket,
        partnerApplications,
        submitPartnerApplication,
        updatePartnerApplicationStatus,
        togglePartnerCheckitem,
        archivePartnerApplication,
        deletePartnerApplication,
        resetCodes,
        generateResetCode,
        generateAccountResetCode,
        redeemResetCode,
        deleteResetCode,
        deleteUserAccount,
        unblockUserAccount,
        unbanAllUsers,
        deletedUserIds,
        deletedUsersMeta,
        authError,
        setAuthError,
        auditLogs,
        logAuditEvent,
        deleteArchivedItems,
        coupons,
        createCoupon,
        toggleCoupon,
        deleteCoupon,
        supportAccounts,
        allUsers,
        createSupportAccount,
        deleteSupportAccount,
        shopSettings,
        updateShopSettings,
        blockIP,
        unblockIP,
        blockEmail,
        unblockEmail,
        notifications,
        clearNotifications,
        activePlatform,
        setActivePlatform,
        authModalOpen,
        setAuthModalOpen,
        authModalView,
        setAuthModalView,
        resetModalOpen,
        setResetModalOpen,
        cartOpen,
        setCartOpen,
        partnerModalOpen,
        setPartnerModalOpen,
        updateModalOpen,
        setUpdateModalOpen,
        inAppNotifications,
        addInAppNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearInAppNotifications,
        productReviews,
        addProductReview,
        supporterShifts,
        updateSupporterStatus,
        quickMacros,
        claimDailyReward,
        convertCoinsToBalance,
        rateTicket,
        triggerGoogleSheetsFullSync,
        pendingSyncEvents,
        addSyncEvent,
        approveSyncEvents,
        dismissSyncEvents,
        clearAllSyncEvents,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return ctx;
};
