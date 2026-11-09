import React from "react";
import { X, Phone } from "lucide-react";

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

/* Vehicle details: only what is stored for the vehicle (vehicles + its transport company), nothing invented */
export function VehicleDetailsModal({ vehicle, onClose }: VehicleDetailsModalProps) {
  if (!vehicle) return null;

  const plate = vehicle.plate_number || vehicle.plateNumber || "";
  const model = vehicle.vehicle_type || vehicle.model_name || vehicle.name || "مركبة نقل";
  const capacity = vehicle.capacity || vehicle.seating_capacity || vehicle.seats;
  const rate = vehicle.daily_rate || vehicle.dailyRate;
  const status = vehicle.vehicle_status;
  const company = vehicle.transport_company_name || vehicle.company_name || vehicle.companyName;
  const phone = vehicle.transport_company_phone || vehicle.phone_number || vehicle.companyPhone || "";
  const photo = vehicle.vehicle_image || vehicle.image;
  const category = vehicle.category;

  const facts = [
    { label: "رقم اللوحة", value: plate, mono: true },
    { label: "عدد المقاعد", value: capacity ? `${capacity} مقعد` : "" },
    { label: "الفئة", value: category || "" },
    { label: "الحالة", value: status || "" },
    { label: "سعر التأجير اليومي", value: rate ? `${rate} د.ل / اليوم` : "" },
  ].filter((f) => f.value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl" onClick={onClose}>
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#00736F] text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 text-xl">🚍</span>
            <div>
              <h3 className="text-base font-black">{model}</h3>
              {plate && <p className="text-xs text-teal-200 font-mono">رقم اللوحة: {plate}</p>}
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
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {photo ? (
            <div className="h-52 sm:h-60 rounded-2xl overflow-hidden relative border border-slate-200 bg-slate-100">
              <img src={photo} alt={model} className="w-full h-full object-cover" />
              {capacity && (
                <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold">
                  👥 {capacity} راكب
                </span>
              )}
            </div>
          ) : (
            <div className="h-28 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">
              🚍 لا توجد صورة مسجلة لهذه المركبة
            </div>
          )}

          {facts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {facts.map((f) => (
                <div key={f.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-bold">{f.label}</div>
                  <div className={`font-black text-[#0F172A] mt-0.5 ${f.mono ? "font-mono" : ""}`}>{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {(company || phone) && (
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block">شركة النقل المشغلة</span>
                <span className="text-sm font-black text-[#0F172A] block truncate">{company || "—"}</span>
              </div>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition flex-shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-mono">{phone}</span>
                </a>
              )}
            </div>
          )}
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
