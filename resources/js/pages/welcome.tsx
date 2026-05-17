import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Head, useForm } from '@inertiajs/react';
import envelopeVideo from '@/assets/1.mp4';
import terraceVideo from '@/assets/2.mp4';
import descendVideo from '@/assets/3.mp4';

interface WelcomeProps {
  settings: {
    bride_name: string;
    groom_name: string;
    wedding_date: string;
    venue_name: string;
    venue_city: string;
    venue_address: string;
    venue_maps_url: string;
    ceremony_time: string;
    reception_time: string;
    music_path: string | null;
  };
  guests: Array<{ name: string }>;
  wishes: Array<{ name: string; message: string; created_at: string }>;
}

const DEFAULT_VIDEOS = {
  envelope: envelopeVideo,
  terrace: terraceVideo,
  descend: descendVideo
};

export default function Welcome({ settings, guests, wishes }: WelcomeProps) {
  const [viewState, setViewState] = useState<'loading' | 'idle' | 'envelope' | 'terrace' | 'descend' | 'location' | 'guests' | 'messages'>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [videoUrls, setVideoUrls] = useState(DEFAULT_VIDEOS);
  const [showCountdown, setShowCountdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSent, setIsSent] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    name: '',
    message: ''
  });
  
  const envelopeVideoRef = useRef<HTMLVideoElement>(null);
  const terraceVideoRef = useRef<HTMLVideoElement>(null);
  const descendVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let isFinished = false; // Flag to prevent duplicate transition and preloading
    const newUrls = { ...DEFAULT_VIDEOS };
    const abortController = new AbortController();

    const fetchVideoWithProgress = async (
      key: keyof typeof DEFAULT_VIDEOS,
      src: string,
      onProgress?: (percent: number) => void
    ) => {
      try {
        const response = await fetch(src, { signal: abortController.signal });
        if (!response.ok) throw new Error('Network response was not ok');

        const contentLength = response.headers.get('Content-Length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('ReadableStream not supported');

        let receivedBytes = 0;
        const chunks: Uint8Array[] = [];

        while (isMounted) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedBytes += value.length;

          if (totalBytes > 0 && onProgress) {
            const percent = Math.min(99, Math.floor((receivedBytes / totalBytes) * 100));
            onProgress(percent);
          }
        }

        if (!isMounted) return;

        const blob = new Blob(chunks, { type: 'video/mp4' });
        newUrls[key] = URL.createObjectURL(blob);
        setVideoUrls({ ...newUrls });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`Fetch aborted for ${key}`);
        } else {
          console.warn(`Fallback to progressive streaming for ${key}:`, err);
        }
      }
    };

    const handleTransitionToIdle = () => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeoutId);
      setLoadProgress(100);
      setTimeout(() => {
        if (isMounted) {
          setViewState('idle');
          preloadRemainingVideos();
        }
      }, 500);
    };

    // Safety Timeout (3 seconds): Bypasses loading if download is too slow
    const timeoutId = setTimeout(() => {
      if (isMounted && !isFinished) {
        console.log('Video download timed out. Falling back to native progressive streaming.');
        abortController.abort(); // Cancel the fetch to save bandwidth
        handleTransitionToIdle();
      }
    }, 3000);

    // Helper to load subsequent videos in the background
    const preloadRemainingVideos = () => {
      fetchVideoWithProgress('terrace', DEFAULT_VIDEOS.terrace)
        .then(() => {
          if (isMounted) {
            fetchVideoWithProgress('descend', DEFAULT_VIDEOS.descend);
          }
        });
    };

    // Start loading first video (envelope) immediately
    fetchVideoWithProgress('envelope', DEFAULT_VIDEOS.envelope, (percent) => {
      if (isMounted && !isFinished) {
        setLoadProgress(percent);
      }
    })
    .then(() => {
      if (isMounted && !isFinished) {
        handleTransitionToIdle();
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, []);

  // Use database guests
  const guestList = guests || [];

  const filteredGuests = guestList.filter(guest => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStart = useCallback(() => {
    if (viewState === 'idle') {
      setViewState('envelope');
      envelopeVideoRef.current?.play().catch(console.error);
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(console.error);
      }
    }
  }, [viewState]);

  const handleEnvelopeEnd = useCallback(() => {
    setViewState('terrace');
    terraceVideoRef.current?.play().catch(console.error);
  }, []);

  const handleNext = useCallback(() => {
    if (viewState === 'terrace') {
      setViewState('descend');
      descendVideoRef.current?.play().catch(console.error);
    }
  }, [viewState]);

  // Helper to format the human-readable date
  const formatWeddingDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Countdown Logic
  const weddingDate = new Date((settings?.wedding_date || '2026-08-15 18:00:00').replace(' ', 'T')).getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) return;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  return (
    <>
      <Head title={`${settings?.bride_name} & ${settings?.groom_name} - Wedding Invitation`} />
      <div 
        className="fixed inset-0 w-full h-full bg-stone-950 overflow-hidden m-0 p-0 select-none"
        onClick={handleStart}
        id="main-app"
      >
        {/* Background Music */}
        <audio 
          ref={audioRef} 
          src={settings?.music_path || "https://ia800806.us.archive.org/15/items/CanonInD_261/CanoninD.mp3"} 
          loop 
          muted={isMuted}
        />

        {/* Music Toggle Button */}
        {viewState !== 'loading' && viewState !== 'idle' && (
          <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-[60]">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all ${
                ['location', 'guests', 'messages'].includes(viewState)
                  ? 'bg-stone-200/50 text-stone-600 border border-stone-300 hover:bg-stone-300/50'
                  : 'bg-black/20 border border-white/20 text-white hover:bg-black/40'
              }`}
            >
              {isMuted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Loading Screen */}
        <AnimatePresence>
          {viewState === 'loading' && (
            <motion.div
              key="loading-screen"
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-stone-950 text-stone-300"
            >
              <h2 className="font-script text-5xl sm:text-6xl mb-6">{settings?.bride_name} & {settings?.groom_name}</h2>
              <div className="w-48 h-[1px] bg-stone-800 relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 bottom-0 bg-stone-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="font-serif text-[10px] uppercase tracking-widest mt-4 opacity-50">Preparing your invitation...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint for interaction */}
        <AnimatePresence>
          {viewState === 'idle' && (
            <motion.div 
              key="interaction-guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 z-50 pointer-events-none cursor-pointer"
            >
              {/* Pulsing Elegant Circle & Play Symbol */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="relative flex items-center justify-center w-24 h-24 mb-6"
              >
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-60 [animation-duration:2s]" />
                <div className="absolute inset-2 rounded-full border border-white/30 animate-pulse [animation-duration:1.5s]" />
                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-2xl">
                  <svg className="w-6 h-6 text-white ml-1 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </motion.div>
              
              {/* Elegant Text Guide */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-2 px-6 text-center"
              >
                <span className="font-script text-4xl sm:text-5xl text-white/95 drop-shadow-md">
                  Press anywhere
                </span>
                <span className="font-serif text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/70">
                  to start the video
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video 1: Envelope (Top Layer) */}
        <AnimatePresence>
          {(viewState === 'idle' || viewState === 'envelope') && (
            <motion.video
              key="envelope-video"
              ref={envelopeVideoRef}
              src={videoUrls.envelope}
              playsInline
              muted
              onEnded={handleEnvelopeEnd}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Section 1: Terrace Video */}
        <AnimatePresence>
          {viewState === 'terrace' && (
            <motion.div 
              key="terrace-section"
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full overflow-hidden bg-stone-900 z-20"
            >
              <video
                ref={terraceVideoRef}
                src={videoUrls.terrace}
                playsInline
                muted
                autoPlay
                loop
                className="w-full h-full object-cover"
              />
              
              {/* Romantic Hero Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center gap-6"
                >
                  <span className="text-white/70 font-serif tracking-[0.5em] text-[10px] md:text-xs uppercase" id="subtitle-invite">
                    Wedding Invitation
                  </span>
                  
                  <div className="flex flex-col items-center">
                    <h1
                      className="font-script text-5xl sm:text-7xl md:text-9xl text-white drop-shadow-[0_8px_25px_rgba(0,0,0,0.4)] px-6 text-center leading-tight capitalize"
                      id="romantic-names"
                    >
                      {settings?.bride_name} & {settings?.groom_name}
                    </h1>
                    
                    {/* Decorative line */}
                    <div className="w-[80px] md:w-[120px] h-[1px] bg-white/30 mt-4" />
                  </div>

                  <div className="mt-6 text-white/80 font-serif italic text-lg tracking-[0.3em] uppercase">
                    {settings ? new Date(settings.wedding_date.replace(' ', 'T')).getFullYear() : '2026'}
                  </div>

                  {/* Navigation Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5, duration: 1.5, ease: "easeOut" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="mt-12 px-8 py-3 border border-white/40 rounded-full text-white font-serif text-[10px] tracking-[0.4em] uppercase hover:bg-white hover:text-stone-900 transition-all duration-500 group"
                    id="nav-to-countdown"
                  >
                    <span className="group-hover:tracking-[0.6em] transition-all duration-500">See Invitation</span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Subtle Cinematic Vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 2: Countdown (Base Layer) */}
        {/* This layer exists behind the terrace video so that when terrace video fades out, it reveals this layer seamlessly. */}
        {/* It's only really visible during the 'descend' phase but is mounted to handle the transition neatly. */}
        <div 
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-stone-100 z-10"
          id="countdown-section"
        >
          {/* Background Video */}
          <video
            ref={descendVideoRef}
            src={videoUrls.descend}
            playsInline
            muted
            onEnded={() => {
              setShowCountdown(true);
              if (descendVideoRef.current) {
                 descendVideoRef.current.pause();
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className={`absolute inset-0 transition-opacity duration-1000 z-10 flex flex-col items-center justify-center ${showCountdown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Back Button */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-30">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setViewState('terrace');
                  setShowCountdown(false);
                  if (descendVideoRef.current) {
                    descendVideoRef.current.currentTime = 0;
                    descendVideoRef.current.pause();
                  }
                }}
                className="text-stone-600 hover:text-stone-800 transition-colors flex items-center gap-2 group"
              >
                <div className="w-4 h-[1px] bg-stone-400 group-hover:w-8 transition-all" />
                <span className="font-serif text-[9px] sm:text-[10px] uppercase tracking-widest font-medium">Back</span>
              </button>
            </div>
            {/* Soft Elegant Overlay */}
            <div className="absolute inset-0 bg-stone-200/40 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/30 via-transparent to-stone-900/40" />
            
            <div className="relative z-20 flex flex-col items-center gap-6 sm:gap-12 text-stone-900 p-4 sm:p-8 max-w-4xl w-full text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={showCountdown ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="flex flex-col items-center gap-3 sm:gap-4"
              >
                <h2 className="font-script text-5xl sm:text-7xl md:text-8xl mb-2 drop-shadow-sm text-stone-800 px-2" id="countdown-title">Counting the days</h2>
                <div className="flex items-center gap-3 sm:gap-4 w-full justify-center">
                  <div className="h-[1px] w-6 sm:w-8 bg-stone-400" />
                  <p className="font-serif italic tracking-[0.2em] sm:tracking-[0.4em] text-stone-600 uppercase text-[9px] sm:text-[10px] md:text-xs">until our forever begins</p>
                  <div className="h-[1px] w-6 sm:w-8 bg-stone-400" />
                </div>
              </motion.div>

              {/* Timer Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-3xl px-4">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={showCountdown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                    className="flex flex-col items-center bg-stone-100/60 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-stone-200/50 shadow-sm group hover:bg-white/80 transition-all duration-700"
                  >
                    <span className="text-3xl sm:text-4xl md:text-5xl font-light mb-1 font-serif tracking-tighter text-stone-800" id={`val-${item.label.toLowerCase()}`}>
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[7px] sm:text-[8px] md:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] text-stone-400">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Location/Date Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={showCountdown ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 1.2, duration: 2 }}
                className="mt-2 sm:mt-4 flex flex-col items-center gap-4 sm:gap-6"
              >
                <p className="font-serif text-stone-800 tracking-widest text-xs sm:text-sm md:text-base">{settings ? formatWeddingDate(settings.wedding_date) : 'August 15th, 2026'}</p>
                
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4 font-medium">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewState('location');
                    }}
                    className="px-4 sm:px-6 py-2 border border-stone-400 rounded-full text-stone-600 font-serif text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase hover:bg-stone-800 hover:text-white transition-all duration-300"
                  >
                    Location
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewState('guests');
                    }}
                    className="px-4 sm:px-6 py-2 border border-stone-400 rounded-full text-stone-600 font-serif text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase hover:bg-stone-800 hover:text-white transition-all duration-300"
                  >
                    Guest List
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewState('messages');
                      setIsSent(false);
                    }}
                    className="px-4 sm:px-6 py-2 border border-stone-400 rounded-full text-stone-600 font-serif text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase hover:bg-stone-800 hover:text-white transition-all duration-300"
                  >
                    Send Wish
                  </button>
                </div>

                <div className="mt-2 sm:mt-4 flex items-center gap-3 sm:gap-4 text-stone-300 uppercase text-[8px] sm:text-[9px] tracking-[0.4em] sm:tracking-[0.6em]">
                  <div className="w-6 sm:w-8 h-[1px] bg-stone-300" />
                  See You There
                  <div className="w-6 sm:w-8 h-[1px] bg-stone-300" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Section 3: Location Details */}
        <AnimatePresence>
          {viewState === 'location' && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full bg-stone-50 z-40 flex flex-col overflow-y-auto no-scrollbar"
            >
              {/* Header */}
              <div className="p-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100">
                <button 
                  onClick={() => setViewState('descend')}
                  className="text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-2 group"
                >
                  <div className="w-6 h-[1px] bg-stone-300 group-hover:w-8 transition-all" />
                  <span className="font-serif text-[10px] uppercase tracking-widest">Back</span>
                </button>
                <h3 className="font-script text-4xl sm:text-5xl md:text-6xl text-stone-800">The Celebration</h3>
                <div className="w-12" /> {/* Spacer */}
              </div>

              <div className="flex-1 flex flex-col items-center">
                {/* Venue Info Header */}
                <div className="w-full py-16 px-8 flex flex-col items-center text-center bg-white">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <span className="text-stone-300 text-[10px] tracking-[0.5em] uppercase">The Venue</span>
                    <h4 className="font-serif text-3xl md:text-5xl text-stone-800 tracking-tight">{settings?.venue_name}</h4>
                    <p className="text-stone-400 font-serif italic text-lg uppercase tracking-widest">{settings?.venue_city}</p>
                  </motion.div>
                  
                  <motion.a 
                    href={settings?.venue_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 px-10 py-4 bg-stone-800 text-white rounded-full font-serif text-[10px] tracking-[0.3em] uppercase hover:bg-stone-700 transition-all duration-300 shadow-xl shadow-stone-200"
                  >
                    Open in Google Maps
                  </motion.a>
                </div>

                {/* Details Grid */}
                <div className="max-w-4xl w-full p-12 flex flex-col gap-24">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center text-center gap-6"
                    >
                      <div className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center text-stone-300 font-serif text-xs">01</div>
                      <span className="text-stone-300 text-[10px] tracking-[0.5em] uppercase">Ceremony</span>
                      <h5 className="font-serif text-xl text-stone-800">{settings?.venue_name}</h5>
                      <p className="text-stone-500 font-serif italic">{settings?.ceremony_time}</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center text-center gap-6"
                    >
                      <div className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center text-stone-300 font-serif text-xs">02</div>
                      <span className="text-stone-300 text-[10px] tracking-[0.5em] uppercase">Reception</span>
                      <h5 className="font-serif text-xl text-stone-800">{settings?.venue_name}</h5>
                      <p className="text-stone-500 font-serif italic">{settings?.reception_time}</p>
                    </motion.div>
                  </div>

                  <div className="flex flex-col items-center text-center gap-8">
                    <div className="w-24 h-[1px] bg-stone-100" />
                    <div className="flex flex-col items-center gap-4">
                       <span className="text-stone-300 text-[10px] tracking-[0.5em] uppercase">Address</span>
                      <p className="text-stone-600 font-serif leading-relaxed whitespace-pre-line">
                        {settings?.venue_address}
                      </p>
                    </div>
                    
                    {/* Final Remark */}
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      className="mt-12 font-script text-4xl sm:text-5xl text-stone-400"
                    >
                      Formal Attire Recommended
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 4: Guest List (Invitees) */}
        <AnimatePresence>
          {viewState === 'guests' && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full bg-stone-50 z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100">
                <button 
                  onClick={() => setViewState('descend')}
                  className="text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-2 group"
                >
                  <div className="w-6 h-[1px] bg-stone-300 group-hover:w-8 transition-all" />
                  <span className="font-serif text-[10px] uppercase tracking-widest">Back</span>
                </button>
                <h3 className="font-script text-3xl text-stone-800">Invitees</h3>
                <div className="w-12" />
              </div>

              <div className="flex-1 flex flex-col p-6 md:p-12 overflow-hidden">
                {/* Search Bar */}
                <div className="max-w-2xl w-full mx-auto mb-12">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Search your name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-stone-100 rounded-full py-4 px-8 font-serif text-stone-600 focus:outline-none focus:border-stone-300 transition-all shadow-sm italic"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto no-scrollbar max-w-2xl w-full mx-auto pb-24">
                  <div className="space-y-4">
                    {filteredGuests.length > 0 ? (
                      filteredGuests.map((guest, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={guest.name}
                          className="bg-white p-6 rounded-2xl border border-stone-100 flex items-center justify-between group hover:border-stone-300 transition-all shadow-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-serif text-lg text-stone-800">{guest.name}</span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-stone-400 font-serif italic">
                        No names found matching your search.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative Bottom */}
                <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 to-transparent pointer-events-none z-10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Section 5: Guestbook / Messages */}
        <AnimatePresence>
          {viewState === 'messages' && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full bg-stone-100 z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100">
                <button 
                  onClick={() => setViewState('descend')}
                  className="text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-2 group"
                >
                  <div className="w-6 h-[1px] bg-stone-300 group-hover:w-8 transition-all" />
                  <span className="font-serif text-[10px] uppercase tracking-widest">Back</span>
                </button>
                <h3 className="font-script text-4xl sm:text-5xl md:text-6xl text-stone-800">Wedding Wishes</h3>
                <div className="w-12" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 overflow-y-auto no-scrollbar">
                <div className="max-w-md w-full flex flex-col gap-6 sm:gap-8 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 mt-4 mb-4">
                  <AnimatePresence mode="wait">
                    {!isSent ? (
                      <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col gap-8"
                      >
                        <div className="flex flex-col gap-2 text-center">
                          <span className="text-stone-300 text-[10px] tracking-[0.5em] uppercase font-serif">Guestbook</span>
                          <h4 className="font-serif text-2xl text-stone-800">Leave a Message</h4>
                          <p className="text-stone-400 font-serif italic text-sm">Your words mean the world to us.</p>
                        </div>

                        <form 
                          className="flex flex-col gap-6"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!data.name || !data.message) return;
                            
                            post('/wishes', {
                              onSuccess: () => {
                                setIsSent(true);
                                reset();
                              }
                            });
                          }}
                        >
                          <div className="flex flex-col gap-2">
                            <label className="text-stone-400 text-[9px] uppercase tracking-widest font-serif">Name</label>
                            <input 
                              required
                              type="text"
                              value={data.name}
                              onChange={(e) => setData('name', e.target.value)}
                              className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3 px-6 font-serif text-stone-600 focus:outline-none focus:border-stone-400 transition-all"
                              placeholder="Your name"
                              disabled={processing}
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                          <label className="text-stone-400 text-[9px] uppercase tracking-widest font-serif">Message</label>
                            <textarea 
                              required
                              rows={5}
                              value={data.message}
                              onChange={(e) => setData('message', e.target.value)}
                              className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 px-6 font-serif text-stone-600 focus:outline-none focus:border-stone-400 transition-all resize-none"
                              placeholder="Wishing you a lifetime of happiness..."
                              disabled={processing}
                            />
                          </div>

                          <button 
                            type="submit"
                            disabled={processing}
                            className="mt-4 px-8 py-4 bg-stone-800 text-white rounded-full font-serif text-[10px] tracking-[0.3em] uppercase hover:bg-stone-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing ? 'Sending...' : 'Send Message'}
                          </button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6 py-12 text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-stone-800 mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="font-serif text-2xl text-stone-800">Thank You</h4>
                        <p className="text-stone-400 font-serif italic">Your message has been sent to the couple.</p>
                        <button 
                          onClick={() => setIsSent(false)}
                          className="mt-6 text-stone-400 hover:text-stone-800 font-serif text-[9px] tracking-widest uppercase transition-colors"
                        >
                          Send another message
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
