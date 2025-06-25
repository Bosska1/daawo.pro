
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

interface Advertisement {
  id: string;
  name: string;
  type: 'popup' | 'banner' | 'video' | 'interstitial';
  content: string;
  target_page?: string;
  delay_seconds?: number;
  is_active: boolean;
  click_url?: string;
}

export function Advertisement() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopupAd, setCurrentPopupAd] = useState<Advertisement | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    fetchAds();
  }, [location.pathname]);
  
  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .or(`target_page.eq.${location.pathname},target_page.is.null`);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // If no ads in database, create a default banner ad
        const defaultBannerAd: Advertisement = {
          id: 'default-banner',
          name: 'Default Banner',
          type: 'banner',
          content: `<div class="flex-1 text-center">
            🔥 Live Football - Free HD Streams - No Login Required!
          </div>`,
          is_active: true
        };
        
        setAds([defaultBannerAd]);
        return;
      }
      
      setAds(data as Advertisement[]);
      
      // Find popup ads for this page
      const popupAds = data.filter((ad: Advertisement) => ad.type === 'popup');
      
      if (popupAds.length > 0) {
        // Select a random popup ad
        const randomPopupAd = popupAds[Math.floor(Math.random() * popupAds.length)];
        setCurrentPopupAd(randomPopupAd);
        
        // Show popup after delay
        const delay = randomPopupAd.delay_seconds || 5;
        setTimeout(() => {
          setShowPopup(true);
          // Record impression
          recordImpression(randomPopupAd.id);
        }, delay * 1000);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      
      // Create a default banner ad if there's an error
      const defaultBannerAd: Advertisement = {
        id: 'default-banner',
        name: 'Default Banner',
        type: 'banner',
        content: `<div class="flex-1 text-center">
          🔥 Live Football - Free HD Streams - No Login Required!
        </div>`,
        is_active: true
      };
      
      setAds([defaultBannerAd]);
    }
  };
  
  const recordImpression = async (adId: string) => {
    if (adId === 'default-banner') return;
    
    try {
      await supabase.rpc('increment_ad_impression', { ad_id: adId });
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };
  
  const recordClick = async (adId: string) => {
    if (adId === 'default-banner') return;
    
    try {
      await supabase.rpc('increment_ad_click', { ad_id: adId });
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };
  
  const handleAdClick = (ad: Advertisement) => {
    recordClick(ad.id);
    
    if (ad.click_url) {
      window.open(ad.click_url, '_blank');
    }
  };
  
  const closePopup = () => {
    setShowPopup(false);
  };
  
  const closeBanner = () => {
    setShowBanner(false);
  };
  
  // Find banner ads
  const bannerAds = ads.filter(ad => ad.type === 'banner');
  const bannerAd = bannerAds.length > 0 ? bannerAds[0] : null;
  
  return (
    <>
      {/* Banner ad */}
      {showBanner && bannerAd && (
        <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-r from-blue-900/90 to-green-900/90 backdrop-blur-sm text-white py-2.5 px-4 text-sm z-10 shadow-lg flex items-center justify-between">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => handleAdClick(bannerAd)}
            dangerouslySetInnerHTML={{ __html: bannerAd.content }}
          />
          <button 
            onClick={closeBanner}
            className="ml-2 text-gray-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Popup ad */}
      {showPopup && currentPopupAd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full relative shadow-2xl animate-float">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none rounded-xl"></div>
            <button 
              className="absolute top-3 right-3 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
              onClick={closePopup}
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Default popup content if none provided */}
            {!currentPopupAd.content || currentPopupAd.content.trim() === '' ? (
              <div className="ad-content">
                <div className="text-center mb-4 text-primary text-4xl">📱</div>
                <h3 className="text-xl font-bold mb-4 text-center gradient-text">Enjoying the Match?</h3>
                <p className="text-gray-300 mb-6 text-center">
                  Follow Us on Telegram for More Free Streams and Exclusive Content!
                </p>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors animate-pulse-glow"
                  onClick={() => {
                    if (currentPopupAd.click_url) {
                      window.open(currentPopupAd.click_url, '_blank');
                    } else {
                      window.open('https://t.me/streamgoal', '_blank');
                    }
                    closePopup();
                    recordClick(currentPopupAd.id);
                  }}
                >
                  Join Now
                </button>
              </div>
            ) : (
              <div 
                className="ad-content"
                dangerouslySetInnerHTML={{ __html: currentPopupAd.content }}
                onClick={() => handleAdClick(currentPopupAd)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}