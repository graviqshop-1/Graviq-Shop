import { User, ServicePackage, Coupon, ShopSettings, Order, Ticket, PartnerApplication, LiveSliderConfig } from '../types';

export const INITIAL_ADMIN_USER: User = {
  id: 'usr_admin_strauss',
  email: 'strauss@graviq.shop',
  name: 'Strauss (straussiimausii)',
  role: 'admin',
  discordUsername: 'straussiimausii',
  avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-01-01T00:00:00Z',
};

export const INITIAL_SUPPORT_USERS: User[] = [];

export const INITIAL_PARTNER_APPLICATIONS: PartnerApplication[] = [];

export const INITIAL_SHOP_SETTINGS: ShopSettings = {
  shopEmail: 'graviq.shop@gmail.com',
  paypalMode: 'live',
  paypalClientId: 'AbNWNkKrVV4CsrdD9Ozl8nddWpK68587P7zA-Zr6T56mbRpQntwnEqk0t-tekyB65oEjmFO82G3VOd14',
  paypalSecret: 'EISwLVmirghVpBqbw5EKmKz3B4pCQ4mIDrCnTXcwd_W6T0jUG6eJmoRo38DfaqGGrQl996XgO5jPa7Vp',
  discordClientId: '1533231933281144962',
  discordClientSecret: 'e06a5f13c28c4e065e208acd57508f52eb8baac8e1b95c6bc4bad03cad5fcc5b',
  activeSeason: 'sommer',
  seasonDiscountPercent: 15,
  autoSeasonEffects: true,
  announcementText: '🔥 SOMMER-EVENT ACTIVE: Nutze 15% Event-Rabatt auf alle Live-Zuschauer!',
  isMaintenanceMode: false,
  maintenanceMessage: 'Der Graviq Shop befindet sich derzeit im Wartungsmodus. Wir führen System-Upgrades & Server-Optimierungen durch. Unser Discord Support ist weiterhin erreichbar!',
  blockedIPs: ['185.220.101.5', '194.26.29.110'],
  blockedEmails: ['spammer@tempmail.org', 'bot@badactor.net'],
  googleSheetsConfig: {
    spreadsheetId: '1ppYOLzz7bIA2-xCk8BFPT74dus-1mcAEqU0zVjkzjHI',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1ppYOLzz7bIA2-xCk8BFPT74dus-1mcAEqU0zVjkzjHI/edit',
    appsScriptWebhookUrl: 'https://script.google.com/macros/s/AKfycbxXRFTKQQrml4VuGAVpBnxluZJhIP1wdM8272JEttROEJjA4yg2nGluLoLGIgKBhEEfdQ/exec',
    autoSyncEnabled: true,
    encryptionEnabled: false,
  },
};

export const INITIAL_COUPONS: Coupon[] = [];

export const INITIAL_SLIDER_CONFIGS: Record<string, LiveSliderConfig> = {
  twitch: {
    platform: 'twitch',
    minViewers: 10,
    maxViewers: 1000,
    step: 10,
    basePricePer10: 20, // 10 Zuschauern = 20€
    durationMultipliers: {
      '30m': 0.65,
      '1h': 1.0,
      '3h': 2.3,
      '6h': 4.2,
      '12h': 7.5,
      '24h': 13.0,
    },
  },
  tiktok: {
    platform: 'tiktok',
    minViewers: 50,
    maxViewers: 5000,
    step: 50,
    basePricePer10: 15,
    durationMultipliers: {
      '30m': 0.6,
      '1h': 1.0,
      '3h': 2.2,
      '6h': 4.0,
    },
  },
  youtube: {
    platform: 'youtube',
    minViewers: 20,
    maxViewers: 2000,
    step: 20,
    basePricePer10: 18,
    durationMultipliers: {
      '30m': 0.7,
      '1h': 1.0,
      '3h': 2.4,
      '6h': 4.5,
    },
  },
  instagram: {
    platform: 'instagram',
    minViewers: 25,
    maxViewers: 2500,
    step: 25,
    basePricePer10: 16,
    durationMultipliers: {
      '30m': 0.65,
      '1h': 1.0,
      '3h': 2.3,
    },
  },
};

export const INITIAL_PACKAGES: ServicePackage[] = [
  // Twitch
  {
    id: 'tw_fol_1',
    platform: 'twitch',
    category: 'followers',
    title: 'Twitch Follower Basic',
    amount: 100,
    unit: 'Follower',
    price: 4.99,
    originalPrice: 7.99,
    deliverySpeed: '5-15 Min.',
    isPopular: false,
    features: ['Echte Profile', '100% Sicher', 'Soft Drop-Protection', '24/7 Support'],
  },
  {
    id: 'tw_fol_2',
    platform: 'twitch',
    category: 'followers',
    title: 'Twitch Follower Streamer Pack',
    amount: 500,
    unit: 'Follower',
    price: 14.99,
    originalPrice: 22.99,
    deliverySpeed: 'Express (Instand)',
    isPopular: true,
    features: ['Echte & Aktive Profile', 'Affiliate Ready Boost', 'Garantiert ohne Ban-Risiko', '24/7 VIP Support'],
  },
  {
    id: 'tw_fol_3',
    platform: 'twitch',
    category: 'followers',
    title: 'Twitch Follower Pro Beast',
    amount: 2500,
    unit: 'Follower',
    price: 49.99,
    originalPrice: 79.99,
    deliverySpeed: 'Organisch (1-3 Std)',
    isBestValue: true,
    features: ['Pro Streamer Standard', 'Inkl. Auto-Refill 60 Tage', 'High Retention Accounts', 'Persönlicher Discord Manager'],
  },
  {
    id: 'tw_views_1',
    platform: 'twitch',
    category: 'views',
    title: 'Kanal Video Aufrufe',
    amount: 5000,
    unit: 'Kanal-Views',
    price: 9.99,
    originalPrice: 14.99,
    deliverySpeed: 'Sofort',
    features: ['High Speed Delivery', 'Verteilt auf Wunsch-VODs', 'Global Traffic'],
  },

  // TikTok
  {
    id: 'tt_fol_1',
    platform: 'tiktok',
    category: 'followers',
    title: 'TikTok Follower Starter',
    amount: 500,
    unit: 'Follower',
    price: 7.99,
    originalPrice: 11.99,
    deliverySpeed: '10 Min.',
    features: ['Für LIVE-Freischaltung ab 1k', 'Organisches Aussehen', 'Kein Passwort nötig'],
  },
  {
    id: 'tt_fol_2',
    platform: 'tiktok',
    category: 'followers',
    title: 'TikTok Follower Viral Boost',
    amount: 1000,
    unit: 'Follower',
    price: 12.99,
    originalPrice: 19.99,
    deliverySpeed: 'Sofort',
    isPopular: true,
    features: ['Inkl. Live-Streaming-Freischaltung', 'Super Schneller Start', '100% Diskret & Anonym'],
  },
  {
    id: 'tt_likes_1',
    platform: 'tiktok',
    category: 'likes',
    title: 'TikTok Video Likes Pack',
    amount: 2000,
    unit: 'Likes',
    price: 8.99,
    originalPrice: 14.99,
    deliverySpeed: 'Instand',
    isBestValue: true,
    features: ['Erhöht FYP Algorithmus Rank', 'HQ Profile', 'Sofortige Ausführung'],
  },
  {
    id: 'tt_views_1',
    platform: 'tiktok',
    category: 'views',
    title: 'TikTok Video Views Ultra',
    amount: 10000,
    unit: 'Views',
    price: 3.99,
    originalPrice: 7.99,
    deliverySpeed: 'Instand',
    features: ['Perfekt für FyP Boost', 'Verteilbar auf 5 Videos', 'Schnellste Lieferzeit'],
  },

  // YouTube
  {
    id: 'yt_sub_1',
    platform: 'youtube',
    category: 'followers',
    title: 'YouTube Abonnenten Starter',
    amount: 250,
    unit: 'Abonnenten',
    price: 18.99,
    originalPrice: 28.99,
    deliverySpeed: 'Drip-Feed 24 Std',
    isPopular: true,
    features: ['Echte Youtube Konten', 'Monetarisierungs-Safe', 'Non-Drop Garantie'],
  },
  {
    id: 'yt_views_1',
    platform: 'youtube',
    category: 'views',
    title: 'YouTube High Retention Views',
    amount: 2500,
    unit: 'Views',
    price: 14.99,
    originalPrice: 21.99,
    deliverySpeed: '2-4 Std',
    features: ['Lange Wiedergabezeit', 'Algorithmus freundlich', 'SEO-Rank Upgrade'],
  },

  // Instagram
  {
    id: 'ig_fol_1',
    platform: 'instagram',
    category: 'followers',
    title: 'Instagram HQ Follower',
    amount: 1000,
    unit: 'Follower',
    price: 9.99,
    originalPrice: 16.99,
    deliverySpeed: 'Instand',
    isPopular: true,
    features: ['Mit Story & Profilbild', '30 Tage Auto Refill', 'Absolut Sicher'],
  },
  {
    id: 'ig_likes_1',
    platform: 'instagram',
    category: 'likes',
    title: 'Instagram Post Likes',
    amount: 1000,
    unit: 'Likes',
    price: 4.99,
    originalPrice: 8.99,
    deliverySpeed: 'Sofort',
    features: ['Verteilbar auf multiple Posts', 'High Speed Delivery', 'HQ Accounts'],
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_TICKETS: Ticket[] = [];

export const INITIAL_IN_APP_NOTIFICATIONS = [
  {
    id: 'notif_welcome_v3',
    title: '🚀 v3.2.0 Update Live!',
    message: 'Neu: Graviq Coins Treuepunkte, Daily Login Bonus, VIP-Ränge & Support-Schicht-System sind jetzt aktiv!',
    type: 'update' as const,
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif_coins_info',
    title: '🪙 100 Graviq Coins geschenkt!',
    message: 'Hole dir jetzt deinen täglichen Daily Login Bonus ab & löse Coins gegen echtes Guthaben ein.',
    type: 'coins' as const,
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_PRODUCT_REVIEWS = [
  {
    id: 'rev_1',
    productId: 'tw_fol_1',
    userId: 'usr_sample_1',
    userName: 'GamerPro_DE',
    rating: 5,
    comment: 'Mega schnelle Lieferung! Innerhalb von 3 Minuten waren alle Twitch Follower da. Absolut empfehlenswert ⭐⭐⭐⭐⭐',
    createdAt: '2026-08-08T14:30:00Z',
    verifiedBuyer: true,
  },
  {
    id: 'rev_2',
    productId: 'tt_fol_1',
    userId: 'usr_sample_2',
    userName: 'TikTok_Kreativ',
    rating: 5,
    comment: 'Top Qualität! Hat mir direkt geholfen den Live-Stream Button freizuschalten. Danke an das Graviq Support Team ❤️',
    createdAt: '2026-08-07T11:15:00Z',
    verifiedBuyer: true,
  },
];

export const INITIAL_SUPPORTER_SHIFTS = [
  {
    userId: 'usr_admin_strauss',
    userName: 'Strauss (straussiimausii)',
    userEmail: 'strauss@graviq.shop',
    role: 'admin' as const,
    status: 'online' as const,
    shiftStartedAt: new Date().toISOString(),
    ticketsResolvedToday: 12,
  },
];

export const INITIAL_QUICK_MACROS = [
  {
    id: 'macro_1',
    title: '👋 Freundliche Begrüßung',
    shortcut: '!hello',
    content: 'Hallo! Schön dass du dich beim Graviq Support meldest. Ich schaue mir dein Anliegen sofort an! 😊',
    category: 'Begrüßung',
  },
  {
    id: 'macro_2',
    title: '📦 Lieferzeit Status',
    shortcut: '!delivery',
    content: 'Deine Bestellung wird bereits über unsere High-Speed Server verarbeitet. Die Auslieferung erfolgt in der Regel innerhalb von 5-15 Minuten! 🚀',
    category: 'Bestellung',
  },
  {
    id: 'macro_3',
    title: '🔑 Account-Reset Info',
    shortcut: '!reset',
    content: 'Ein Admin oder Supporter hat deinen Reset-Code generiert. Bitte erstelle dein neues Passwort direkt über den zugesandten Link. 🔒',
    category: 'Sicherheit',
  },
  {
    id: 'macro_4',
    title: '✅ Ticket Schließung & Danke',
    shortcut: '!close',
    content: 'Freut mich dass ich dir helfen konnte! Ich schließe dieses Ticket nun. Bitte hinterlasse uns kurz eine Sterne-Bewertung. Viel Erfolg weiterhin! ⭐',
    category: 'Abschluss',
  },
];

