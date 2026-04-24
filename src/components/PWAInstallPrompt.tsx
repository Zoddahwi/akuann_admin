"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the install prompt
    const hasDismissed = localStorage.getItem("pwa-install-dismissed");
    
    // Show modal after 5 seconds on first visit if not dismissed
    const timer = setTimeout(() => {
      if (!hasDismissed) {
        setIsAnimating(true);
        setShowModal(true);
        setShowInstallButton(true);
      }
    }, 5000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsAnimating(false);
        setTimeout(() => {
          setShowInstallButton(false);
          setShowModal(false);
        }, 300);
      }
      
      setDeferredPrompt(null);
    } else {
      // In development, show a fun success message
      setIsAnimating(false);
      setTimeout(() => {
        setShowModal(false);
        
        // Create success modal
        const successModal = document.createElement('div');
        successModal.className = 'fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4';
        successModal.innerHTML = `
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-neutral-100 transform scale-100 animate-bounce">
            <div class="text-center">
              <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-neutral-900 mb-2">Yay! 🎉</h3>
              <p class="text-sm text-neutral-600 mb-4">Akuann Admin has been<br/>"installed" successfully!</p>
              <div class="space-y-2 text-xs text-neutral-500 mb-6">
                <p class="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  💡 This is just for fun!<br/>
                  In production, this will install the real app on your device
                </p>
              </div>
              <button onclick="this.closest('.fixed').remove()" class="bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors font-medium w-full">
                Awesome! 🚀
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(successModal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          if (successModal.parentNode) {
            successModal.remove();
          }
        }, 5000);
      }, 300);
    }
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowModal(false);
      setShowInstallButton(false);
      localStorage.setItem("pwa-install-dismissed", "true");
      
      // Show friendly message in development
      if (process.env.NODE_ENV === "development") {
        console.log(`💡 Tip: PWA install prompt dismissed. 
To test PWA installation:
1. Deploy to production (Vercel/Netlify)
2. Or use ngrok: npx ngrok http 3000
3. Visit the HTTPS URL on mobile`);
      }
    }, 300);
  };

  if (!showInstallButton) return null;

  return (
    <>
      {/* Floating button (always visible when install is available) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          onClick={() => {
            setIsAnimating(true);
            setShowModal(true);
          }}
          className="group relative flex items-center gap-2 bg-neutral-900 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neutral-800 to-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <svg
            className="w-5 h-5 relative z-10"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
          </svg>
          <span className="text-sm font-medium relative z-10">Install</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`relative bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-neutral-100 transform transition-all duration-300 ${isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-transparent rounded-bl-2xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neutral-100 to-transparent rounded-tr-2xl opacity-50"></div>
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-full hover:bg-neutral-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Install Akuann Admin</h3>
                  <p className="text-sm text-neutral-500">Get the native app experience</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Lightning Fast</p>
                    <p className="text-xs text-neutral-600">Instant access to your dashboard</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Offline Ready</p>
                    <p className="text-xs text-neutral-600">Work without internet connection</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Native Feel</p>
                    <p className="text-xs text-neutral-600">Smooth animations & gestures</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-neutral-900 text-white py-3 px-4 rounded-xl hover:bg-neutral-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 border border-neutral-300 text-neutral-700 py-3 px-4 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium hover:border-neutral-400"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
