import { LARAVEL_API_URL } from "./api";

export interface TripReview {
  review_id: string;
  tourist_id: string;
  tourist_name?: string;
  tourist_phone?: string;
  trip_id: string;
  stars_rating: number;
  comment_text?: string;
  guide_license_number?: string;
  created_at: string;
  trip_type?: 'daily' | 'weekly';
}

export interface HotelReview {
  review_id: string;
  tourist_id: string;
  tourist_name?: string;
  tourist_phone?: string;
  hotel_id?: string;
  target_id: string;
  target_type: 'hotel';
  target_name?: string;
  stars_rating: number;
  comment_text?: string;
  created_at: string;
}

export interface FacilityReview {
  review_id: string;
  tourist_id: string;
  tourist_name?: string;
  tourist_phone?: string;
  facility_id?: string;
  target_id: string;
  target_type: 'facility';
  target_name?: string;
  stars_rating: number;
  comment_text?: string;
  created_at: string;
}

export type AnyReview = TripReview | HotelReview | FacilityReview;

export async function fetchTripReviews(tripId: string, type: 'daily' | 'weekly' = 'daily'): Promise<TripReview[]> {
  if (!tripId) return [];
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews?trip_id=${encodeURIComponent(tripId)}&type=${type}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Could not fetch trip reviews from DelniDB", e);
  }
  return [];
}

export async function submitTripReview(payload: {
  tourist_id: string;
  trip_id: string;
  type: 'daily' | 'weekly';
  stars_rating: number;
  comment_text?: string;
  guide_license_number?: string;
}): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.error || "تعذر تسجيل التقييم، يرجى التأكد من الشروط.",
        error: data.error,
      };
    }

    return {
      success: true,
      message: data.message || "تم تسجيل تقييمك بنجاح! شكراً لمشاركتك.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً.",
    };
  }
}

export async function fetchHotelReviews(hotelId?: string): Promise<HotelReview[]> {
  try {
    const query = hotelId ? `?hotel_id=${encodeURIComponent(hotelId)}&type=hotel` : `?type=hotel`;
    const res = await fetch(`${LARAVEL_API_URL}/reviews${query}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Could not fetch hotel reviews from DelniDB", e);
  }
  return [];
}

export async function submitHotelReview(payload: {
  tourist_id: string;
  hotel_id: string;
  stars_rating: number;
  comment_text?: string;
}): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...payload, type: 'hotel' }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.error || "تعذر تسجيل تقييم الفندق.",
        error: data.error,
      };
    }

    return {
      success: true,
      message: data.message || "تم تسجيل تقييمك للفندق بنجاح! شكراً لمشاركتك.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "حدث خطأ في الاتصال بالخادم.",
    };
  }
}

export async function fetchFacilityReviews(facilityId?: string): Promise<FacilityReview[]> {
  try {
    const query = facilityId ? `?facility_id=${encodeURIComponent(facilityId)}&type=facility` : `?type=facility`;
    const res = await fetch(`${LARAVEL_API_URL}/reviews${query}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Could not fetch facility reviews from DelniDB", e);
  }
  return [];
}

export async function submitFacilityReview(payload: {
  tourist_id: string;
  facility_id: string;
  stars_rating: number;
  comment_text?: string;
}): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...payload, type: 'facility' }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.error || "تعذر تسجيل تقييم المطعم أو المقهى.",
        error: data.error,
      };
    }

    return {
      success: true,
      message: data.message || "تم تسجيل تقييمك بنجاح! شكراً لمشاركتك.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "حدث خطأ في الاتصال بالخادم.",
    };
  }
}

export async function fetchAllReviews(): Promise<AnyReview[]> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Could not fetch all reviews from DelniDB", e);
  }
  return [];
}
