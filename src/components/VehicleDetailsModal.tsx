import React from "react";
import { X, Bus, ShieldCheck, UserCheck, CheckCircle2, Phone } from "lucide-react";
import officeBusImg from "@/assets/office-bus.jpg";

export type VehicleData = {
  model: string;
  company: string;
  driver: string;
  licensePlate?: string;
  seats?: number;
  phone?: string;
  features?: string[];
};

interface VehicleDetailsModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: VehicleData | null;
}

export function VehicleDetailsModal({ open, onClose, vehicle }: VehicleDetailsModalProps) {
  if (!open || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8E2D6] my-4 flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0F172A] via-[#D96B27] to-[#0F172A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 grid place-items-center text-xl shadow-xs">
              🚌
            </div>
            <div>
              <div className="text-[11px] font-black text-teal-200">تفاصيل مركبة النقل والسائق</div>
              <h3 className="text-lg sm:text-xl font-black text-white">{vehicle.company}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white grid place-items-center text-sm font-bold transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Bus Image */}
          <div className="relative h-44 rounded-2xl overflow-hidden border border-[#E8E2D6] shadow-sm">
            <img src={officeBusImg} alt={vehicle.model} className="w-full h-full object-cover animate-zoom-slow" />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur text-white text-xs font-black">
              🚌 {vehicle.model}
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-950/85 backdrop-blur border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مفحوصة ومعتمدة الفحص الفني</span>
            </div>
          </div>

          {/* Details Breakdown */}
          <div className="space-y-3 text-xs font-semibold text-[#0F172A]">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#718096]">شركة النقل السياحي:</span>
                <span className="font-black text-[#1B5A78] text-sm">{vehicle.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#718096]">طراز الحافلة/السيارة:</span>
                <span className="font-black text-[#0F172A]">{vehicle.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#718096]">السائق الكابتن المكلف:</span>
                <span className="font-black text-[#D96B27] flex items-center gap-1">
                  <span>👨‍✈️</span>
                  <span>{vehicle.driver}</span>
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
              <div className="font-black text-[#D96B27] mb-2">مميزات وتجهيزات الحافلة:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#0F172A]">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D96B27]" />
                  <span>تكييف مركزي شامل</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D96B27]" />
                  <span>شواحن USB ومقاعد VIP مريحة</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D96B27]" />
                  <span>حقيبة إسعافات تبريد مياه</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D96B27]" />
                  <span>تأمين شامل للمسافرين</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E2D6] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
          >
            إغلاق نافذة المركبة
          </button>
        </div>
      </div>
    </div>
  );
}
