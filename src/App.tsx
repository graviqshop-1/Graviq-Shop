import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { SeasonalParticles } from './components/SeasonalParticles';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LiveViewerSlider } from './components/LiveViewerSlider';
import { ProductGrid } from './components/ProductGrid';
import { PartnerSection } from './components/PartnerSection';
import { PartnerModal } from './components/PartnerModal';
import { CartDrawer } from './components/CartDrawer';
import { PayPalModal } from './components/PayPalModal';
import { AuthModal } from './components/AuthModal';
import { AccountResetModal } from './components/AccountResetModal';
import { FaqModal } from './components/FaqModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { MaintenanceOverlay } from './components/MaintenanceOverlay';
import { BlockedOverlay } from './components/BlockedOverlay';
import { Footer } from './components/Footer';
import { Order } from './types';
import { Wrench, ShieldAlert, Lock } from 'lucide-react';

function MainShopView() {
  const { shopSettings, setAuthModalOpen, setAuthModalView, currentUser, resetModalOpen, setResetModalOpen } = useShop();

  // Modals state
  const [liveSliderModalOpen, setLiveSliderModalOpen] = useState(false);
  const [payPalModalOpen, setPayPalModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);

  const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'support' || currentUser.role === 'team_graviq');

  // Anti-Inspect / Anti-Tamper Security Protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowSecurityAlert(true);
      setTimeout(() => setShowSecurityAlert(false), 3500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 or Ctrl+Shift+I/J/C or Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['U', 'u', 'S', 's'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C', 'i', 'j', 'c', 'U', 'u'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShowSecurityAlert(true);
        setTimeout(() => setShowSecurityAlert(false), 3500);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOrderSuccess = (order: Order) => {
    // Optionally open dashboard to order tab
    setDashboardOpen(true);
  };

  const handleOpenSupport = () => {
    if (!currentUser) {
      setAuthModalView('login');
      setAuthModalOpen(true);
    } else {
      setDashboardOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative selection:bg-purple-600 selection:text-white flex flex-col justify-between select-none">
      {/* DevTools / Inspect Mode Security Popup Alert */}
      {showSecurityAlert && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-red-950/95 border border-red-700 text-red-200 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold text-white block">🔒 Untersucher-Modus deaktiviert!</span>
            <span className="text-red-300">Entwicklerwerkzeuge & Rechtsklick sind aus Sicherheitsgründen auf Graviq-Shop gesperrt.</span>
          </div>
        </div>
      )}

      {/* Anti-Spam / Account & IP Blocked Overlay */}
      <BlockedOverlay />

      {/* Maintenance Mode Overlay (Blocks standard customers if maintenance mode is enabled) */}
      <MaintenanceOverlay />

      {/* Staff Maintenance Active Alert Banner */}
      {shopSettings.isMaintenanceMode && isStaff && (
        <div className="bg-amber-950 border-b border-amber-800/80 text-amber-200 px-4 py-2 text-xs font-extrabold flex items-center justify-between z-40 relative">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>⚠️ WARTUNGSMODUS AKTIV: Der Shop ist für normale Kunden gesperrt. Du bist als {currentUser.role.toUpperCase()} eingeloggt.</span>
          </div>
          <button
            onClick={() => setAdminOpen(true)}
            className="bg-amber-900 hover:bg-amber-800 text-amber-100 px-3 py-1 rounded-xl border border-amber-700 font-bold transition-all cursor-pointer"
          >
            Wartung verwalten
          </button>
        </div>
      )}

      {/* Dynamic Seasonal Background Particles */}
      <SeasonalParticles season={shopSettings.activeSeason} />

      <div>
        {/* Navigation Bar */}
        <Navbar
          onOpenLiveSlider={() => setLiveSliderModalOpen(true)}
          onOpenDashboard={() => setDashboardOpen(true)}
          onOpenAdmin={() => setAdminOpen(true)}
          onOpenSupportModal={handleOpenSupport}
          onOpenFaq={() => setFaqModalOpen(true)}
        />

        {/* Hero Banner Section */}
        <HeroSection onOpenLiveSlider={() => setLiveSliderModalOpen(true)} />

        {/* Featured Live Viewer Slider Embedded Showcase */}
        <section className="py-12 px-4 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3">
              🔥 Interaktiver Schieberegler
            </span>
            <h2 className="text-3xl font-black text-white">
              Wähle Deine Exakte Live-Zuschauer Anzahl
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Passe Zuschauer & Stream-Dauer in Echtzeit an. Instant Preisberechnung!
            </p>
          </div>

          <LiveViewerSlider embedded={true} />
        </section>

        {/* Standard Packages Product Grid */}
        <ProductGrid />

        {/* S3 eSport Official Partnership & Application Section */}
        <PartnerSection />
      </div>

      {/* Footer */}
      <Footer
        onOpenSupportModal={handleOpenSupport}
        onOpenLiveSlider={() => setLiveSliderModalOpen(true)}
        onOpenFaq={() => setFaqModalOpen(true)}
      />

      {/* Live Viewer Slider Modal */}
      {liveSliderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <LiveViewerSlider onClose={() => setLiveSliderModalOpen(false)} />
          </div>
        </div>
      )}

      {/* FAQ & Support Help Modal */}
      {faqModalOpen && (
        <FaqModal
          onClose={() => setFaqModalOpen(false)}
          onOpenDashboardSupport={handleOpenSupport}
        />
      )}

      {/* S3 eSport & Graviq Partner Application Modal */}
      <PartnerModal />

      {/* Cart Side-Drawer */}
      <CartDrawer onOpenPayPal={() => setPayPalModalOpen(true)} />

      {/* Real PayPal Checkout Modal */}
      {payPalModalOpen && (
        <PayPalModal
          onClose={() => setPayPalModalOpen(false)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* Login / Register / Password Reset Modal */}
      <AuthModal />

      {/* Support Account Reset Code Modal */}
      {resetModalOpen && <AccountResetModal onClose={() => setResetModalOpen(false)} />}

      {/* Customer Dashboard */}
      {dashboardOpen && <UserDashboard onClose={() => setDashboardOpen(false)} />}

      {/* Admin / Support Management Dashboard */}
      {adminOpen && <AdminDashboard onClose={() => setAdminOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <MainShopView />
    </ShopProvider>
  );
}
