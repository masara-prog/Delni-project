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

export async function fetchTripReviews(tripId: string, type: 'daily' | 'weekly' = 'daily'): Promise<TripReview[]> {
  if (!tripId) return [];
  try {
    const res = await fetch(`http://127.0.0.1:5001/api/db/reviews?trip_id=${encodeURIComponent(tripId)}&type=${type}`, {
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
    const res = await fetch("http://127.0.0.1:5001/api/db/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
