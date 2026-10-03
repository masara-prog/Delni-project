import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/i18n";
import { MapPin, Mail } from "lucide-react";

import destAcacus from "@/assets/dest-acacus.jpg";
import destSabratah from "@/assets/dest-sabratha.jpg";
import destUbari from "@/assets/dest-ubari-gaberoun.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destTripoli from "@/assets/dest-tripoli.jpg";
import destJabalAkhdar from "@/assets/dest-jabal-akhdar-panorama.jpg";
import destGharyan from "@/assets/dest-gharyan-cave.jpg";

const footerImages = [
  { img: destAcacus, titleAr: "جبال تدرارت أكاكوس", titleEn: "Acacus Mountains" },
  { img: destSabratah, titleAr: "مسرح صبراتة الأثري", titleEn: "Sabratha Roman Theatre" },
  { img: destUbari, titleAr: "بحيرات أوباري الصحراوية", titleEn: "Ubari Desert Lakes" },
  { img: destGhadames, titleAr: "مدينة غدامس القديمة", titleEn: "Old Ghadames City" },
  { img: destTripoli, titleAr: "المدينة القديمة طرابلس", titleEn: "Old Tripoli Medina" },
  { img: destJabalAkhdar, titleAr: "مناظر الجبل الأخضر", titleEn: "Green Mountain Panorama" },
  { img: destGharyan, titleAr: "بيوت الحفر بغريان", titleEn: "Gharyan Cave Houses" },
];

export function Footer() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % footerImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeImage = footerImages[currentIdx];

  return (
    <footer id="contact" className="relative overflow-hidden group text-white border-t border-white/20" dir={dir}>
      {/* Changing Background Image Slideshow with Smooth Fade & Lightened Overlay for Clarity */}
      {footerImages.map((item, index) => (
        <img
          key={item.img}
          src={item.img}
          alt={isAr ? item.titleAr : item.titleEn}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out brightness-105 ${
            index === currentIdx ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      ))}

      {/* Clear overlay for high image visibility */}
      <div className="absolute inset-0 bg-black/45 backdrop-contrast-[1.02]" />

      {/* Floating Image Landmark Badge */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white/90 shadow-md">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>📍 {isAr ? activeImage.titleAr : activeImage.titleEn}</span>
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right border-b border-white/20 pb-5">
          {/* Logo & Meaningful Phrase */}
          <div className="space-y-2 max-w-xl">
            <Link to="/" className="inline-block">
              <Logo size="md" showText={false} />
            </Link>
            <h3 className="text-base sm:text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {isAr ? "منصتكم الأولى لاكتشاف سحر وحضارة ليبيا" : "Your Premier Gate to Discovering Libya"}
            </h3>
            <p className="text-white/95 text-xs sm:text-sm font-medium leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {isAr
                ? "دَلِّني هي منصتكم المعتمدة لاكتشاف سحر التاريخ، الآثار الخالدة، والتراث الطبيعي في ليبيا برفقة نخبة المرشدين السياحيين والمحترفين."
                : "Dallani is your official platform to discover Libya's heritage and natural wonders with top certified guides."}
            </p>
          </div>

          {/* Contact Information & Email */}
          <div className="space-y-2 bg-black/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/30 text-right min-w-[260px] shadow-xl">
            <h4 className="font-black text-xs text-amber-300 uppercase tracking-wider drop-shadow-sm">
              {isAr ? "معلومات التواصل والمدن" : "Contact & Cities"}
            </h4>
            <ul className="space-y-2 text-xs font-bold text-white drop-shadow-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-300 shrink-0" />
                <span>info@dallani.ly</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{isAr ? "طرابلس - بنغازي - ليبيا" : "Tripoli - Benghazi - Libya"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          <p>© {new Date().getFullYear()} {isAr ? "دَلِّني للسياحة والسفر. جميع الحقوق محفوظة." : "Dallani Travel & Tourism. All rights reserved."}</p>
          <div className="flex items-center gap-3">
            <span>{isAr ? "الأمان والخصوصية" : "Security & Privacy"}</span>
            <span>•</span>
            <span>{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

