
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
    }
  };
  
  const recordImpression = async (adId: string) => {
    try {
      await supabase.rpc('increment_ad_impression', { ad_id: adId });
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };
  
  const recordClick = async (adId: string) => {
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
  
  // Find banner ads
  const bannerAds = ads.filter(ad => ad.type === 'banner');
  
  return (
    <>
      {/* Banner ads */}
      {bannerAds.map(ad => (
        <div 
          key={ad.id}
          className="bg-gradient-to-r from-blue-900/90 to-green-900/90 backdrop-blur-sm text-white py-2.5 px-4 text-sm z-10 shadow-lg cursor-pointer"
          onClick={() => handleAdClick(ad)}
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      ))}
      
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
            <div 
              className="ad-content"
              dangerouslySetInnerHTML={{ __html: currentPopupAd.content }}
              onClick={() => handleAdClick(currentPopupAd)}
            />
          </div>
        </div>
      )}
    </>
  );
}