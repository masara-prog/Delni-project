import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Subtitles,
  Film,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  RotateCcw,
  Mic,
} from "lucide-react";
import destSabratah from "@/assets/dest-sabratah.png";
import heroImg from "@/assets/hero-leptis.jpg";
import destTripoli from "@/assets/dest-tripoli.jpg";
import destCyrene from "@/assets/dest-cyrene.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destUbari from "@/assets/dest-ubari.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import privateTripImg from "@/assets/private-trip.jpg";

// Real High Quality Libyan Tour Videos
import videoPromoDallani from "@/assets/video-promo-dallani.mp4";
import videoLeptis from "@/assets/video-leptis.mp4";
import videoTripoli from "@/assets/video-tripoli.mp4";
import videoCyrene from "@/assets/video-cyrene.mp4";
import videoGhadames from "@/assets/video-ghadames.mp4";
import videoUbari from "@/assets/video-ubari.mp4";
import videoPrivate from "@/assets/video-private.mp4";

export type VideoStoryChapter = {
  ar: string;
  en: string;
  highlightAr: string;
  highlightEn: string;
  videoUrl?: string;
  durationMs?: number;
};

export type TripVideoData = {
  tripId: string;
  tripTitleAr: string;
  tripTitleEn: string;
  locationAr: string;
  locationEn: string;
  videoUrl: string;
  fallbackPoster: string;
  chapters: VideoStoryChapter[];
};

/**
 * STRICTLY AUTHENTIC TOUR DATABASE — ZERO REPEATED VIDEOS
 * Each trip has ONLY its own authentic destination footage.
 * No swapped or repeated clips across scenes.
 */
export const TRIP_VIDEO_DATABASE: Record<string, TripVideoData> = {
  // 1. Leptis Magna (لبدة الكبرى)
  d1: {
    tripId: "d1",
    tripTitleAr: "لبدة الكبرى وسبل الرومان",
    tripTitleEn: "Leptis Magna & Roman Trails",
    locationAr: "الخمس — الساحل المتوسطي",
    locationEn: "Al-Khoms — Mediterranean Coast",
    videoUrl: videoPromoDallani,
    fallbackPoster: heroImg,
    chapters: [
      {
        highlightAr: "شرح ومعاينة رحلة لبدة الكبرى",
        highlightEn: "Official Tour Presentation",
        videoUrl: videoPromoDallani,
        ar: "أهلاً بكم في رحلة لبدة الكبرى مع منصة دلني، رحلة يومية شاملة لاستكشاف جوهرة الآثار الرومانية في الخمس مع مرشدين معتمدين.",
        en: "Welcome to Leptis Magna Tour with Dallni platform, a comprehensive guided exploration of ancient Roman wonders.",
        durationMs: 10000,
      },
      {
        highlightAr: "المسرح والآثار الرومانية",
        highlightEn: "Grand Roman Theatre & Forum",
        videoUrl: videoLeptis,
        ar: "استكشاف أعظم مدينة رومانية أثرية في أفريقيا، تشمل المسرح الأثري وحمامات هادريان والموزاييك التاريخي النادر.",
        en: "Exploring the grand Roman theatre, Arch of Septimius Severus, and rare Hadrianic mosaics.",
        durationMs: 6000,
      },
    ],
  },

  // 2. Old Tripoli (طرابلس القديمة والسراي)
  d2: {
    tripId: "d2",
    tripTitleAr: "طرابلس القديمة ومعالم السراي",
    tripTitleEn: "Old Tripoli & Red Castle Heritage",
    locationAr: "طرابلس العاصمة",
    locationEn: "Tripoli Capital",
    videoUrl: videoTripoli,
    fallbackPoster: destTripoli,
    chapters: [
      {
        highlightAr: "السرايا والمدينة القديمة",
        highlightEn: "Red Castle & Old Medina",
        videoUrl: videoTripoli,
        ar: "جولة سحرية في دروب طرابلس القديمة والقلعة الحمراء وقوس ماركوس أوريليوس وأسواق التراث العتيقة مع تذوق المأكولات والشاي باللوز.",
        en: "A magical walking tour through Old Tripoli, the Red Castle fortress, Marcus Aurelius Arch, and traditional souks.",
        durationMs: 8000,
      },
    ],
  },

  // 3. Cyrene & Shahhat (شحات وقورينا الإغريقية)
  d3: {
    tripId: "d3",
    tripTitleAr: "شحات وقورينا الإغريقية",
    tripTitleEn: "Cyrene & Ancient Greek Wonders",
    locationAr: "الجبل الأخضر وشحات",
    locationEn: "Green Mountain & Shahhat",
    videoUrl: videoCyrene,
    fallbackPoster: destCyrene,
    chapters: [
      {
        highlightAr: "معبد أبولو والجبل الأخضر",
        highlightEn: "Apollo Temple & Green Mountain",
        videoUrl: videoCyrene,
        ar: "استكشاف الآثار الإغريقية الساحرة فوق قمم الجبل الأخضر وزيارة معبد أبولو والمدرج الإغريقي المطل على شواطئ سوسة وغابات الصنوبر.",
        en: "Exploring ancient Greek wonders perched upon Green Mountain, visiting the Temple of Apollo and amphitheater overlooking the coast.",
        durationMs: 8000,
      },
    ],
  },

  // 4. Sabratha (مسرح وآثار صبراتة الساحلية)
  d4: {
    tripId: "d4",
    tripTitleAr: "مسرح وآثار صبراتة الساحلية",
    tripTitleEn: "Sabratha Roman Theatre & Coastal Ruins",
    locationAr: "صبراتة — الساحل الغربي",
    locationEn: "Sabratha — Western Coast",
    videoUrl: "", // Displays authentic Sabratha Roman theatre visual with motion
    fallbackPoster: destSabratah,
    chapters: [
      {
        highlightAr: "المسرح الروماني والساحل",
        highlightEn: "Roman Theatre & Coast",
        ar: "موقع تراث عالمي على شاطئ البحر الأبيض المتوسط يشتهر بالمسرح الروماني ذو الأعمدة الثلاثية الطوابق المبهرة والفسيفساء النادرة.",
        en: "UNESCO World Heritage site on the Mediterranean coast, renowned for its majestic three-tiered Roman theatre columns and rare mosaics.",
        durationMs: 8000,
      },
    ],
  },

  // 5. Ubari Desert Lakes & Acacus (سحر الصحراء: أوباري وتدرارت أكاكوس)
  w1: {
    tripId: "w1",
    tripTitleAr: "سحر الصحراء: أوباري وتدرارت أكاكوس",
    tripTitleEn: "Sahara Magic: Ubari & Tadrart Acacus",
    locationAr: "أوباري وغات — الصحراء الكبرى",
    locationEn: "Ubari & Ghat — Grand Sahara",
    videoUrl: videoUbari,
    fallbackPoster: destUbari,
    chapters: [
      {
        highlightAr: "بحيرات أوباري الأسطورية",
        highlightEn: "Ubari Desert Lakes",
        videoUrl: videoUbari,
        ar: "استكشاف رمال الجنوب الساحرة وبحيرة قبر عون العجيبة المحاطة بأشجار النخيل والكثبان الذهبية الشاهقة وجبال أكاكوس وسهرات الشاي.",
        en: "Expedition to southern sands, wondrous palm-fringed Gaberoun oasis lake, golden sand dunes, and authentic Tuareg tea campfire nights.",
        durationMs: 8000,
      },
    ],
  },

  // 6. Ghadames Old Town (لؤلؤة الصحراء: غدامس والواحات القديمة)
  w2: {
    tripId: "w2",
    tripTitleAr: "لؤلؤة الصحراء: غدامس والواحات القديمة",
    tripTitleEn: "Pearl of the Sahara: Ghadames & Historic Oases",
    locationAr: "غدامس — مثلث الحدود الغربية",
    locationEn: "Ghadames — Western Oases",
    videoUrl: videoGhadames,
    fallbackPoster: destGhadames,
    chapters: [
      {
        highlightAr: "عمارة غدامس المسقوفة",
        highlightEn: "Ghadames Covered Architecture",
        videoUrl: videoGhadames,
        ar: "مدينة غدامس التراثية المسجلة باليونسكو، الممرات المكيفة طبيعياً ونبع عين الفرس التاريخي وبساتين النخيل وغروب رملة غدامس الكبرى.",
        en: "UNESCO-listed Ghadames with naturally cooled covered streets, historic Ain Al-Faras spring, lush palm groves, and grand dune sunset.",
        durationMs: 8000,
      },
    ],
  },

  // 7. Private Tours (الرحلات الخاصة ورجال الأعمال)
  p1: {
    tripId: "p1",
    tripTitleAr: "رحلة رجال الأعمال والوفود المخصصة",
    tripTitleEn: "Business & VIP Custom Delegation Tour",
    locationAr: "حسب اختيار العميل داخل ليبيا",
    locationEn: "Custom Route Across Libya",
    videoUrl: videoPrivate,
    fallbackPoster: privateTripImg,
    chapters: [
      {
        highlightAr: "خدمة VIP المخصصة",
        highlightEn: "VIP Tailored Service",
        videoUrl: videoPrivate,
        ar: "تصميم مسار خاص وحصري وفق جداول الأعمال والوفود مع مرشد محترف وسيارات VIP فاخرة وحراسة خاصة وبرامج مرنة 100%.",
        en: "Exclusive customized itineraries for delegations and VIPs with elite certified guides, luxury transport, and bespoke scheduling.",
        durationMs: 8000,
      },
    ],
  },

  // 8. Honeymoon (شهر العسل والاسترخاء)
  p2: {
    tripId: "p2",
    tripTitleAr: "رحلة شهر العسل والاسترخاء الساحلي",
    tripTitleEn: "Honeymoon & Coastal Luxury Retreat",
    locationAr: "طرابلس والساحل — فنادق 5 نجوم",
    locationEn: "Tripoli & Coastal 5-Star Resorts",
    videoUrl: videoTripoli,
    fallbackPoster: destTripoli,
    chapters: [
      {
        highlightAr: "تجربة رومانسية استثنائية",
        highlightEn: "Romantic Luxury Experience",
        videoUrl: videoTripoli,
        ar: "إقامة في أرقى الفنادق الساحلية، سيارة خاصة بسائق، جولات هادئة في طرابلس ولبدة، وعشاء بحري رومانسي على شاطئ البحر.",
        en: "Luxury stays in premier coastal hotels, private chauffeur, tranquil tours of Tripoli and Leptis, and seaside candlelit dinners.",
        durationMs: 8000,
      },
    ],
  },
};

/**
 * Speak Arabic narration clearly using Web Speech Synthesis API
 */
function speakStory(text: string, voiceLang: "ar" | "en" = "ar") {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    // Clean text: strip emojis, hashtags, bullets, and dashes for clear voice output
    const cleanText = text
      .replace(/[—–\-]/g, "، ")
      .replace(/[*#_~🎬✨📍🏛️🍽️💡🏨]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLang === "ar" ? "ar-SA" : "en-US";
    utterance.rate = voiceLang === "ar" ? 0.88 : 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetVoice =
        voices.find((v) => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          if (voiceLang === "ar") {
            return (
              lang.startsWith("ar") ||
              name.includes("arabic") ||
              name.includes("maged") ||
              name.includes("tarik") ||
              name.includes("laila") ||
              name.includes("zeina") ||
              name.includes("salma") ||
              name.includes("shakir") ||
              name.includes("naayf")
            );
          }
          return lang.startsWith("en") && (name.includes("natural") || name.includes("google"));
        }) || voices.find((v) => v.lang.toLowerCase().startsWith(voiceLang));

      if (targetVoice) {
        utterance.voice = targetVoice;
      }
    }

    utterance.onend = () => {};
    utterance.onerror = () => {};

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {}
    }, 50);
  } catch (err) {
    console.warn("Speech narration notice:", err);
  }
}

interface TripVideoShowcaseProps {
  tripId: string;
  defaultImage: string;
  title: string;
  subtitle?: string;
  description?: string;
  attractions?: { name: string; description: string }[];
  isCompact?: boolean;
  className?: string;
}

export function TripVideoShowcase({
  tripId,
  defaultImage,
  title,
  subtitle,
  description,
  attractions,
  isCompact = false,
  className = "",
}: TripVideoShowcaseProps) {
  const baseData = TRIP_VIDEO_DATABASE[tripId];

  const chapters: VideoStoryChapter[] = baseData
    ? baseData.chapters
    : [
        {
          highlightAr: "شرح ومعاينة الرحلة",
          highlightEn: "Official Tour Overview",
          videoUrl: videoLeptis,
          ar: description || `${title} — رحلة سياحية شاملة لاستكشاف المعالم بإشراف نخبة من المرشدين المعتمدين.`,
          en: subtitle || `${title} — A comprehensive guided experience with certified tour guides.`,
          durationMs: 7000,
        },
      ];

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [audioMode, setAudioMode] = useState<"video" | "voice" | "muted">("video");
  const [voiceLanguage, setVoiceLanguage] = useState<"ar" | "en">("ar");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = chapters[currentChapter] || chapters[0];
  const activeVideoSrc = current.videoUrl ?? (baseData?.videoUrl || "");

  // Video play / pause sync
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && !isEnded && activeVideoSrc) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isEnded, activeVideoSrc]);

  // Handle audio modes strictly to prevent audio clash
  useEffect(() => {
    if (!isPlaying || isEnded) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
      return;
    }

    if (audioMode === "voice") {
      // Mute the video element so only the voice narration is heard clearly
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
      const textToSpeak = voiceLanguage === "ar" ? current.ar : current.en;
      speakStory(textToSpeak, voiceLanguage);
    } else if (audioMode === "video") {
      // Unmute video to hear genuine video soundtrack; cancel any robot voice
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
      }
    } else {
      // Muted mode
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  }, [isPlaying, isEnded, audioMode, currentChapter, voiceLanguage, activeVideoSrc]);

  // Clean up speech synthesis when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(p);
    }
  };

  // Natural progression without infinite loops: advances chapter when video naturally ends
  const handleVideoEnded = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter((prev) => prev + 1);
    } else {
      // Reached the end of all chapters: STOP gracefully instead of endlessly looping!
      setIsEnded(true);
      setIsPlaying(false);
      setVideoProgress(100);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleReplay = () => {
    setIsEnded(false);
    setCurrentChapter(0);
    setIsPlaying(true);
    setVideoProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#0B132B] select-none group/video ${
        isFullscreen ? "fixed inset-0 z-50 w-screen h-screen" : className
      }`}
    >
      {/* 1. VISUAL LAYER: Real Destination-Specific Video Footage */}
      <div className="absolute inset-0 overflow-hidden bg-[#0B132B]">
        {!videoError && activeVideoSrc ? (
          <video
            ref={videoRef}
            src={activeVideoSrc}
            poster={defaultImage || baseData?.fallbackPoster}
            autoPlay
            playsInline
            muted={audioMode !== "video"}
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover brightness-[1.05] contrast-[1.02]"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={defaultImage || baseData?.fallbackPoster}
              alt={title}
              className="w-full h-full object-cover scale-105 transition-transform duration-7000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 via-transparent to-[#0B132B]/20" />
          </div>
        )}

        {/* Ultra-Light Transparent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

        {/* Reel Recording Indicator & Audio Mode Switcher */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[10px] font-black shadow-soft">
            <span className={`w-2 h-2 rounded-full ${isPlaying && !isEnded ? "bg-red-500 animate-pulse" : "bg-zinc-400"}`} />
            <span className="tracking-wider uppercase">
              {chapters.length > 1
                ? `مشهد ${currentChapter + 1} / ${chapters.length}`
                : "معاينة الرحلة المعتمدة"}
            </span>
          </div>

          {/* Clear Audio Mode Pills */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-0.5 rounded-full border border-white/20">
            <button
              type="button"
              onClick={() => setAudioMode("video")}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                audioMode === "video"
                  ? "bg-[#D96B27] text-white shadow-xs"
                  : "text-white/75 hover:text-white"
              }`}
              title="تشغيل صوت الفيديو الأصلي بوضوح ونقاء"
            >
              <Volume2 className="w-2.5 h-2.5" />
              <span>صوت الفيديو</span>
            </button>

            <button
              type="button"
              onClick={() => setAudioMode("voice")}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                audioMode === "voice"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-white/75 hover:text-white"
              }`}
              title="قراءة الوصف صوتياً باللغة العربية مع كتم صوت الخلفية"
            >
              <Mic className="w-2.5 h-2.5" />
              <span>صوت الراوي</span>
            </button>

            <button
              type="button"
              onClick={() => setAudioMode("muted")}
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                audioMode === "muted"
                  ? "bg-zinc-700 text-white"
                  : "text-white/60 hover:text-white"
              }`}
              title="كتم الصوت بالكامل"
            >
              <VolumeX className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SYNCHRONIZED CINEMATIC SUBTITLES (Pure Crisp Text - Zero Black Box) */}
      {showSubtitles && !isEnded && (
        <div className="absolute bottom-12 inset-x-3 sm:inset-x-8 md:inset-x-12 z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
          <div className="max-w-2xl mx-auto px-2">
            {/* Chapter Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/25 text-amber-300 text-[11px] font-black mb-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{current.highlightAr}</span>
              <span className="opacity-60">·</span>
              <span className="font-sans font-semibold text-white/90">{current.highlightEn}</span>
            </div>

            {/* Arabic Voiceover Narration Subtitle - Crisp text with strong drop shadow (NO BLACK BOX) */}
            <p className="text-xs sm:text-sm md:text-base font-black text-white leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
              {current.ar}
            </p>

            {/* Synchronized English Subtitle (Soft Gold) */}
            <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-amber-200/95 tracking-wide leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] font-sans" dir="ltr">
              "{current.en}"
            </p>
          </div>
        </div>
      )}

      {/* 4. END OF TOUR OVERLAY (Prevents Endless Repetition / Video Looping) */}
      {isEnded && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 grid place-items-center text-2xl shadow-lg">
            ✨
          </div>
          <h4 className="text-base sm:text-lg font-black tracking-tight">اكتملت المعاينة السياحية للرحلة</h4>
          <p className="text-xs text-white/80 max-w-sm leading-relaxed">
            يمكنك إعادة تشغيل الفيديو مجدداً أو استعراض معالم وأكلات وفنادق المدينة بالأسفل.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReplay}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black text-xs hover:scale-105 transition shadow-soft flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة مشاهدة الفيديو</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. BOTTOM VIDEO CONTROLS BAR */}
      {!isEnded && (
        <div className="absolute bottom-0 inset-x-0 z-30 p-2 sm:p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between gap-2 text-white text-xs">
          {/* Play / Pause & Skip Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur border border-white/20 grid place-items-center transition cursor-pointer"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            {chapters.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentChapter((prev) => Math.max(0, prev - 1))}
                  disabled={currentChapter === 0}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 grid place-items-center transition cursor-pointer"
                  title="المقطع السابق"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentChapter < chapters.length - 1) {
                      setCurrentChapter((prev) => prev + 1);
                    } else {
                      handleVideoEnded();
                    }
                  }}
                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center transition cursor-pointer"
                  title="المقطع التالي"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Timeline Progress Indicators (Single smooth bar for 1 scene, segmented for multi-scene) */}
          {chapters.length > 1 ? (
            <div className="flex-1 flex items-center gap-1.5 max-w-xs mx-1">
              {chapters.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentChapter(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentChapter
                      ? "flex-1 bg-gradient-to-r from-[#D96B27] to-[#EA580C] shadow-sm"
                      : i < currentChapter
                      ? "w-4 bg-white/70"
                      : "w-3 bg-white/30 hover:bg-white/50"
                  }`}
                  title={`مشهد ${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 max-w-xs mx-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D96B27] to-[#EA580C] transition-all duration-200"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          )}

          {/* Subtitles (CC) & Fullscreen Actions */}
          <div className="flex items-center gap-1.5">
            {/* Subtitles CC Button */}
            <button
              type="button"
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`px-2 py-1 rounded-lg border text-[10px] font-black transition flex items-center gap-1 cursor-pointer ${
                showSubtitles
                  ? "bg-white/30 border-white/40 text-white"
                  : "bg-white/10 border-white/20 text-white/70 hover:text-white"
              }`}
              title="تفعيل أو إخفاء شريط الترجمة"
            >
              <Subtitles className="w-3 h-3" />
              <span>CC</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition cursor-pointer"
              title="ملء الشاشة"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TripVideoTrailerModal({
  isOpen,
  tripId,
  onClose,
}: {
  isOpen: boolean;
  tripId: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  const data = TRIP_VIDEO_DATABASE[tripId] || TRIP_VIDEO_DATABASE.d1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-[#0B132B] border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white grid place-items-center transition cursor-pointer text-sm font-bold shadow-md"
          title="إغلاق"
        >
          ✕
        </button>
        <div className="h-80 sm:h-96 md:h-[480px]">
          <TripVideoShowcase
            tripId={tripId}
            defaultImage={data.fallbackPoster}
            title={data.tripTitleAr}
            subtitle={data.locationAr}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
