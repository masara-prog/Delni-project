import React from "react";
import { Car, X, Phone, Users, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";

export interface VehicleDetailsData {
  plate_number?: string;
  plateNumber?: string;
  vehicle_type?: string;
  model_name?: string;
  name?: string;
  capacity?: number;
  seating_capacity?: number;
  seats?: number;
  daily_rate?: number;
  dailyRate?: number;
  vehicle_status?: string;
  company_name?: string;
  companyName?: string;
  transport_company_name?: string;
  phone_number?: string;
  companyPhone?: string;
  transport_company_phone?: string;
  vehicle_image?: string;
  image?: string;
  category?: string;
  city?: string;
}

interface VehicleDetailsModalProps {
  vehicle: VehicleDetailsData | null;
  onClose: () => void;
}

export function VehicleDetailsModal({ vehicle, onClose }: VehicleDetailsModalProps) {
  if (!vehicle) return null;

  const plate = vehicle.plate_number || vehicle.plateNumber || "—";
  const model = vehicle.vehicle_type || vehicle.model_name || vehicle.name || "مركبة نقل سياحي مخصصة";
  const capacity = vehicle.capacity || vehicle.seating_capacity || vehicle.seats || 25;
  const rate = vehicle.daily_rate || vehicle.dailyRate || 500;
  const status = vehicle.vehicle_status || "جاهزة ومرخصة";
  const company = vehicle.transport_company_name || vehicle.company_name || vehicle.companyName || "شركة نقل سياحي معتمدة";
  const phone = vehicle.transport_company_phone || vehicle.phone_number || vehicle.companyPhone || "";
  const photo = vehicle.vehicle_image || vehicle.image || "/assets/office-bus.jpg";
  const category = vehicle.category || (capacity <= 15 ? "حافلة صغيرة VIP" : capacity <= 30 ? "حافلة متوسطة سياحية" : "حافلة كبرى فاخرة");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#003580] to-[#00224f] text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 text-xl">🚍</span>
            <div>
              <h3 className="text-base font-black">{model}</h3>
              <p className="text-xs text-blue-200 font-mono">رقم اللوحة: {plate}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Photo & Main Spec */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-7 h-48 sm:h-56 rounded-2xl overflow-hidden relative border border-slate-200 bg-slate-100 shadow-inner">
              <img
                src={photo}
                alt={model}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/office-bus.jpg";
                }}
              />
              <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold">
                👥 سعة {capacity} راكب
              </span>
              <span className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-white text-[11px] font-bold">
                ✓ {status}
              </span>
            </div>

            <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 h-full">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">سعر التأجير اليومي المعتمد:</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-[#003580]">{rate}</span>
                  <span className="text-xs font-bold text-slate-600">د.ل / اليوم</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>شامل السائق المحترف والوقود</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 block">شركة النقل المشغلة:</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">{company}</span>
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-mono">{phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-primary" />
              <span>المواصفات الفنية المعتمدة للمركبة:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-bold">رقم اللوحة المعدنية</div>
                <div className="font-mono font-black text-[#003580] mt-0.5">{plate}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-bold">عدد المقاعد</div>
                <div className="font-black text-slate-900 mt-0.5">{capacity} مقعد مريح</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-bold">الفئة والتصنيف</div>
                <div className="font-black text-slate-900 mt-0.5">{category}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-bold">نظام التكييف</div>
                <div className="font-black text-emerald-700 mt-0.5">تكييف مركزي عالي الكفاءة ❄️</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-bold">حالة الفحص الدوري</div>
                <div className="font-black text-emerald-700 mt-0.5">ساري ومعتمد سياحياً ✓</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] text-slate-400 font-bold">تجهيزات المسار الطويل</div>
                <div className="font-black text-slate-900 mt-0.5">ثلاجة ضيافة + مساحة حقائب</div>
              </div>
            </div>
          </div>

          {/* Safety & Comfort Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black block text-emerald-900">معايير السلامة والراحة لرحلات VIP الخاصة:</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                تخضع كافة مركبات النقل المخصصة للرحلات الخاصة للفحص الميكانيكي الشامل، وتجهيزها بمقاعد جلدية مريحة، وأحزمة أمان لجميع الركاب، وسائقين ذوي خبرة بالطرق السياحية في كافة المدن والمناطق الليبية.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs transition cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
