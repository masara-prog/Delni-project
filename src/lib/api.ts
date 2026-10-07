// Delni API Client - الربط مع باك إند بايثون وقاعدة بيانات MySQL

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export interface RestaurantItem {
  facility_id: string;
  facility_name: string;
  facility_type: string;
  city: string;
  address_details: string;
  phone_number?: string;
  description?: string;
  cuisine_type?: string;
  specialty?: string;
  working_hours?: string;
  facility_image_1?: string;
  verification_status?: string;
}

export interface HotelItem {
  hotel_id: string;
  hotel_name: string;
  city: string;
  address_details: string;
  phone_number: string;
  star_rating: number;
  partnership_status: string;
  property_type?: string;
  amenities?: string;
  hotel_photo_1?: string;
  verification_status?: string;
}

export interface PrivateTripPayload {
  customer_name: string;
  customer_phone: string;
  preferred_start_date: string;
  duration_days: number;
  number_of_companions: number;
  customer_requirements?: string;
}

export interface AIChatResponse {
  reply: string;
  suggested_actions?: string[];
  source: string;
}

// فحص حالة اتصال الباك إند و MySQL
export async function checkBackendHealth(): Promise<{ online: boolean; database?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, database: data.database_type };
  } catch {
    return { online: false };
  }
}

// جلب المطاعم والمقاهي من قاعدة البيانات
export async function getRestaurants(city?: string, cuisineType?: string): Promise<RestaurantItem[]> {
  const params = new URLSearchParams();
  if (city && city !== "all") params.append("city", city);
  if (cuisineType && cuisineType !== "all") params.append("cuisine_type", cuisineType);
  
  const res = await fetch(`${API_BASE_URL}/restaurants?${params.toString()}`);
  if (!res.ok) throw new Error("تعذر جلب بيانات المطاعم من الخادم");
  return res.json();
}

// جلب الفنادق من قاعدة البيانات
export async function getHotels(city?: string, minStars?: number): Promise<HotelItem[]> {
  const params = new URLSearchParams();
  if (city && city !== "all") params.append("city", city);
  if (minStars) params.append("min_stars", minStars.toString());

  const res = await fetch(`${API_BASE_URL}/hotels?${params.toString()}`);
  if (!res.ok) throw new Error("تعذر جلب بيانات الفنادق من الخادم");
  return res.json();
}

// إرسال طلب حجز رحلة خاصة لقاعدة البيانات (MySQL)
export async function submitPrivateTrip(data: PrivateTripPayload) {
  const res = await fetch(`${API_BASE_URL}/trips/private`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "تعذر إرسال طلب الرحلة الخاصة");
  }
  return res.json();
}

// التحدث مع ذكاء دلّني السياحي
export async function chatWithDelniAI(message: string, history: { role: string; content: string }[] = []): Promise<AIChatResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("تعذر الاتصال بذكاء دلّني");
  return res.json();
}
