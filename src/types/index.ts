export type UserRole = 'kunde' | 'support' | 'team_graviq' | 'admin';

export type PlatformId = 'twitch' | 'tiktok' | 'youtube' | 'instagram';

export type ServiceCategory = 'followers' | 'live' | 'likes' | 'views' | 'chatbots';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  discordId?: string;
  discordUsername?: string;
  isVerified?: boolean;
  userIp?: string;
}

export interface DeletedUserMeta {
  id: string;
  name: string;
  email: string;
  discordId?: string;
  deletedAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface PartnerApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  channelName: string;
  platform: string;
  followerCount: string;
  socialLink: string;
  message: string;
  status: 'neu' | 'in_prüfung' | 'angenommen' | 'abgelehnt';
  createdAt: string;
  checklist?: ChecklistItem[];
  isArchived?: boolean;
}

export interface ServicePackage {
  id: string;
  platform: PlatformId;
  category: ServiceCategory;
  title: string;
  amount: number;
  unit: string; // e.g., 'Follower', 'Zuschauer', 'Likes', 'Views'
  price: number;
  originalPrice?: number;
  deliverySpeed: string; // e.g. 'Instant', '5-15 Min', 'Express'
  isPopular?: boolean;
  isBestValue?: boolean;
  features: string[];
  isActive?: boolean;
}

export interface LiveSliderConfig {
  platform: PlatformId;
  minViewers: number;
  maxViewers: number;
  step: number;
  basePricePer10: number; // e.g. 20€ per 10 viewers for 1hr
  durationMultipliers: Record<string, number>; // e.g. '30min': 0.7, '1h': 1.0, '3h': 2.4, '24h': 12.0
}

export interface CartItem {
  id: string;
  packageId?: string;
  title: string;
  platform: PlatformId;
  category: ServiceCategory;
  quantity: number;
  amount: number;
  unit: string;
  price: number;
  targetLink: string; // e.g. Twitch Channel Name or Video URL
  duration?: string;
  withChatBots?: boolean;
}

export type OrderStatus = 'neu' | 'in_bearbeitung' | 'geliefert' | 'storniert';

export interface Order {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  totalPrice: number;
  discountApplied?: number;
  couponCode?: string;
  paymentMethod: 'paypal_sandbox' | 'paypal_live' | 'creditcard' | 'sofort';
  paypalTransactionId?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  targetLink: string;
  checklist?: ChecklistItem[];
  isArchived?: boolean;
}

export type TicketPriority = 'niedrig' | 'mittel' | 'hoch' | 'dringend';
export type TicketStatus = 'offen' | 'in_bearbeitung' | 'geschlossen';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: 'bestellung' | 'zahlung' | 'technisch' | 'sonstiges';
  orderId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  checklist?: ChecklistItem[];
  isArchived?: boolean;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
  maxUses?: number;
  usedCount: number;
  description: string;
}

export type SeasonTheme = 'default' | 'sommer' | 'winter' | 'halloween';

export interface PendingSyncEvent {
  id: string;
  timestamp: string;
  category: 'order' | 'user' | 'ticket' | 'system';
  actionName: string;
  description: string;
  userEmail?: string;
  payload?: any;
}

export interface GoogleSheetsConfig {
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  accessToken?: string;
  clientId?: string;
  appsScriptWebhookUrl?: string;
  lastSyncedAt?: string;
  autoSyncEnabled?: boolean;
  syncMode?: 'instant' | 'staged';
  syncCategories?: {
    orders?: boolean;
    users?: boolean;
    tickets?: boolean;
    auditLogs?: boolean;
  };
  encryptionEnabled?: boolean;
  totpSecret?: string;
  isTwoFactorSetup?: boolean;
}

export interface ShopSettings {
  shopEmail: string;
  paypalMode: 'sandbox' | 'live';
  paypalClientId: string;
  paypalSecret: string;
  discordClientId: string;
  discordClientSecret: string;
  discordWebhookUrl?: string;
  activeSeason: SeasonTheme;
  seasonDiscountPercent?: number;
  autoSeasonEffects: boolean;
  announcementText?: string;
  isMaintenanceMode?: boolean;
  maintenanceMessage?: string;
  blockedIPs?: string[];
  blockedEmails?: string[];
  googleSheetsConfig?: GoogleSheetsConfig;
}

export interface ResetCode {
  id: string;
  code: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  status: 'active' | 'used' | 'expired';
  createdByAdmin: string;
  customValidityMinutes: number;
}

export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: 'order_confirmation' | 'ticket_update' | 'welcome' | 'admin_alert';
  timestamp: string;
}

// Strictly required Google Sheets Tab Schema Types
export interface SheetUser {
  discord_id: string;
  username: string;
  status: 'active' | 'banned' | 'deleted';
  ban_reason?: string;
  unban_code?: string;
}

export interface SheetResetCode {
  code: string;
  is_used: boolean;
  created_at: string;
}

export interface SheetProduct {
  product_id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  stock: number;
}

export interface SheetOrder {
  order_id: string;
  discord_id: string;
  product_id: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}
