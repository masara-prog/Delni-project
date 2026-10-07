"""
Delni Platform - Python AI Microservice (FastAPI)
Provides intelligent tourism chat assistance, automated VIP itinerary planning,
and semantic destination recommendations for Libya.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="Delni Tourism AI Service",
    description="خدمة الذكاء الاصطناعي السياحية لمنصة دَلِّني (ليبيا)",
    version="1.0.0"
)

# Enable CORS for Frontend & Laravel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Libyan Tourism Knowledge Base ---
LIBYAN_DESTINATIONS = {
    "لبدة الكبرى": {
        "city": "الخمس",
        "type": "آثار رومانية - يونسكو",
        "description": "واحدة من أجمل وأكبر المدن الرومانية الأثرية في حوض البحر الأبيض المتوسط، تضم المسرح والكابيتول وقوس سبتيموس سيفيروس وميدان السيفيران.",
        "best_season": "الربيع والخريف والشتاء",
        "suggested_duration_hours": 5
    },
    "صبراتة": {
        "city": "صبراتة",
        "type": "آثار فينيقية ورومانية - يونسكو",
        "description": "تشتهر بمسرحها الروماني الساحلي المطل على البحر المتوسط ومتحف الفسيفساء الأثري ومينائها القديم.",
        "best_season": "على مدار العام",
        "suggested_duration_hours": 4
    },
    "قورينا وشحات": {
        "city": "شحات - الجبل الأخضر",
        "type": "آثار إغريقية ويونانية - يونسكو",
        "description": "مدينة قورينا التاريخية، معبد أبولو، النوافير المقدسة، ومناظر الجبل الأخضر الخلابة وغابات وادي الكوف.",
        "best_season": "الربيع والصيف والخريف",
        "suggested_duration_hours": 6
    },
    "غدامس القديمة": {
        "city": "غدامس",
        "type": "تراث صحراوي ومعماري - يونسكو",
        "description": "لؤلؤة الصحراء بممراتها المسقوفة ونظام توزيع المياه التراثي وعين الفرس وعمارتها الطينية الفريدة.",
        "best_season": "من أكتوبر حتى أبريل",
        "suggested_duration_hours": 8
    },
    "بحيرات أوباري": {
        "city": "أوباري - فزان",
        "type": "سياحة صحراوية وواحات",
        "description": "بحيرة قبر عون وأم الماء والطرونة بين كثبان الرمال الذهبية في الصحراء الكبرى، مثالية لرحلات التخييم والسفاري.",
        "best_season": "من نوفمبر حتى مارس",
        "suggested_duration_hours": 24
    },
    "جبال تدرارت أكاكوس": {
        "city": "غات",
        "type": "نقوش صخرية وتراث عالمي - يونسكو",
        "description": "متحف مفتوح في الهواء الطلق للوحات والنقوش الصخرية التي تعود لآلاف السنين وأقواس صخرية طبيعية مهيبة.",
        "best_season": "من نوفمبر حتى مارس",
        "suggested_duration_hours": 48
    }
}

# --- Request / Response Models ---
class ChatMessage(BaseModel):
    message: str
    user_type: Optional[str] = "tourist"

class ChatResponse(BaseModel):
    reply: str
    suggested_places: List[str]
    suggested_trips: List[str]

class PlanTripRequest(BaseModel):
    duration_days: int = Field(gt=0, description="عدد أيام الرحلة")
    budget: Optional[float] = Field(default=None, description="الميزانية التقديرية بالدينار الليبي")
    companions_count: int = Field(default=1, description="عدد المرافقين")
    interests: List[str] = Field(default=["آثار", "صحراء"], description="الاهتمامات: آثار، صحراء، شواطئ، ثقافة")

class DayPlan(BaseModel):
    day_number: int
    title: str
    morning: str
    afternoon: str
    evening: str
    stay_city: str

class PlanTripResponse(BaseModel):
    summary: str
    estimated_cost_lyd: float
    recommended_vehicle: str
    requires_guide: bool
    itinerary: List[DayPlan]


# --- API Routes ---
@app.get("/")
def read_root():
    return {
        "service": "Delni Tourism AI Microservice",
        "status": "online",
        "version": "1.0.0",
        "features": ["chat", "plan-trip", "recommendations"]
    }

@app.post("/api/ai/chat", response_model=ChatResponse)
def ai_tourism_chat(payload: ChatMessage):
    """
    مساعد دَلِّني السياحي الذكي: يجيب على أسئلة السياح بذكاء ولباقة
    """
    msg = payload.message.strip().lower()

    # Rule-based intelligence enriched with platform knowledge base
    if any(k in msg for k in ["أوباري", "بحيرة", "قبر عون", "صحراء", "سفاري"]):
        reply = (
            "مرحباً بك! 🐪 بحيرات أوباري وصحراء فزان هي واحدة من أروع وجهات العالم للتخييم والسفاري. "
            "ننصحك بزيارة بحيرة قبر عون وأم الماء، وأفضل توقيت للزيارة هو بين شهري نوفمبر ومارس. "
            "تتوفر عبر منصة دلّني رحلات أسبوعية مجهزة بسيارات دفع رباعي 4x4 وسائقين محترفين مع مرشدين صحراويين معتمدين. هل تريد الاطلاع على مواعيد الرحلة الأسبوعية القادمة؟"
        )
        return ChatResponse(
            reply=reply,
            suggested_places=["بحيرات أوباري", "قبر عون", "جبال أكاكوس"],
            suggested_trips=["مغامرة أوباري وبحيرات الصحراء (6 أيام)"]
        )

    elif any(k in msg for k in ["لبدة", "رومان", "خمس", "آثار", "صبراتة"]):
        reply = (
            "أهلاً بك! 🏛️ لبدة الكبرى وصبراتة هما درتا التراث الروماني على البحر المتوسط، ومصنفتان رسمياً في قائمة اليونسكو. "
            "تتميز لبدة بمسرحها الروماني العميق وميدان السيفيران، بينما صبراتة تبهرك بمسرحها الشاطئي الاستثنائي. "
            "نوفر في منصة دلّني رحلات يومية تنطلق أسبوعياً بحافلات سياحية مريحة مع مرشدين متخصصين بالتاريخ. يمكنك حجز مقعدك مباشرة من صفحة الرحلات!"
        )
        return ChatResponse(
            reply=reply,
            suggested_places=["لبدة الكبرى", "مسرح صبراتة الروماني"],
            suggested_trips=["جولة لبدة الكبرى اليومية", "رحلة صبراتة الأثرية"]
        )

    elif any(k in msg for k in ["جبل", "شحات", "قورينا", "كوف", "أخضر"]):
        reply = (
            "طاب يومك! 🌲 الجبل الأخضر وشحات (قورينا) يجمعان بين السحر الطبيعي الأخضر وعبق الحضارة الإغريقية القديمة. "
            "الطقس هناك معتدل ومنعش جداً. رحلتنا تشمل زيارة معبد أبولو ووادي الكوف وشواطئ رأس الهلال الساحرة."
        )
        return ChatResponse(
            reply=reply,
            suggested_places=["قورينا وشحات", "وادي الكوف", "غابات الجبل الأخضر"],
            suggested_trips=["رحلة شحات والجبل الأخضر الأسبوعية"]
        )

    elif any(k in msg for k in ["سعر", "أسعار", "تكلفة", "حجز"]):
        reply = (
            "أسعار رحلات دلّني واضحة ومدروسة للغاية: 💳\n"
            "• الرحلات اليومية (لبدة / صبراتة): تبدأ من 100 إلى 120 د.ل للمقعد تشمل المواصلات والمرشد ودخول المعالم.\n"
            "• الرحلات الأسبوعية (أوباري / الجبل الأخضر): تبدأ من 1850 د.ل شاملة الإقامة والمخيمات والنقل.\n"
            "• الرحلات الخاصة VIP: يتم تسعيرها بحسب المسار وعدد الأيام باختيارك.\n"
            "علماً بأن تسديد الحجز يتم نقداً بمقر شركة النقل المعتمدة."
        )
        return ChatResponse(
            reply=reply,
            suggested_places=["لبدة الكبرى", "أوباري"],
            suggested_trips=["جولة لبدة الكبرى اليومية", "مغامرة أوباري الصحراوية"]
        )

    else:
        reply = (
            "أهلاً وسهلاً بك في منصة دَلِّني — بوابتك لاكتشاف كنوز ليبيا السياحية! ✨ "
            "أنا مساعدك السياحي الذكي. يمكنني مساعدتك في اختيار أفضل الرحلات (اليومية أو الأسبوعية)، "
            "أو التخطيط لرحلة خاصة مخصصة لعائلتك، أو استعراض الفنادق والمعالم الأثرية والصحراوية في ليبيا. ما هي وجهتك المفضلة؟"
        )
        return ChatResponse(
            reply=reply,
            suggested_places=["لبدة الكبرى", "بحيرات أوباري", "غدامس القديمة", "قورينا وشحات"],
            suggested_trips=["جولة لبدة الكبرى اليومية", "مغامرة أوباري وبحيرات الصحراء"]
        )


@app.post("/api/ai/plan-trip", response_model=PlanTripResponse)
def plan_custom_trip(payload: PlanTripRequest):
    """
    المخطط الذكي للرحلات الخاصة VIP: يولد خطة مسار يومية مقترحة
    """
    days = payload.duration_days
    people = max(1, payload.companions_count)
    
    # Estimate base operational cost (vehicle + fuel + guide baseline)
    vehicle_type = "سيارة دفع رباعي Toyota Land Cruiser 4x4" if "صحراء" in payload.interests or days >= 4 else "حافلة سياحية ميني باص VIP"
    vehicle_daily_rate = 500.0 if "دفع رباعي" in vehicle_type else 350.0
    guide_daily_rate = 200.0
    
    total_est = (vehicle_daily_rate + guide_daily_rate) * days

    itinerary: List[DayPlan] = []
    
    # Generate tailored daily schedule
    for d in range(1, days + 1):
        if d == 1:
            itinerary.append(DayPlan(
                day_number=1,
                title="الاستقبال والانطلاق واستكشاف العاصمة",
                morning="الاستقبال في نقطة التجمع والانطلاق بمركبة سياحية مكيفة.",
                afternoon="جولة استكشافية بالمدينة القديمة وقوس ماركوس أوريليوس والسرايا الحمراء.",
                evening="عشاء تقليدي ليبي في أحد المطاعم التراثية والاستعداد لرحلة اليوم التالي.",
                stay_city="طرابلس"
            ))
        elif d == 2:
            itinerary.append(DayPlan(
                day_number=2,
                title="روائع الآثار الرومانية الكبرى (لبدة الكبرى)",
                morning="الانطلاق إلى الخمس وزيارة مسرح لبدة الروماني العظيم وقوس سبتيموس.",
                afternoon="استكشاف ميدان السيفيران وحمامات هادريان وشاطئ لبدة الأثري.",
                evening="تناول وجبة غداء بحرية بالخمس والعودة مساءً.",
                stay_city="الخمس / طرابلس"
            ))
        elif d == 3:
            itinerary.append(DayPlan(
                day_number=3,
                title="مسرح صبراتة الأثري والتراث الفينيقي",
                morning="التوجه غرباً إلى صبراتة وزيارة المسرح الروماني المطل على الشاطئ.",
                afternoon="زيارة متحف الفسيفساء الأثري والمعالم البيزنطية في صبراتة.",
                evening="جلسة شاطئية للاستمتاع بغروب الشمس على البحر المتوسط.",
                stay_city="صبراتة"
            ))
        elif d == 4:
            itinerary.append(DayPlan(
                day_number=4,
                title="سحر جبل نفوسة وغريان وقصور نالوت",
                morning="الصعود إلى جبال نفوسة وزيارة بيوت الحفر التراثية بغريان ومعامل الخزف.",
                afternoon="زيارة قصر نالوت وقصر كاباو التراثي الشاهد على عبقرية العمارة الأمازيغية.",
                evening="المبيت في نزل جبلي تقليدي مع إطلالات ساحرة على السهل.",
                stay_city="غريان / نالوت"
            ))
        else:
            itinerary.append(DayPlan(
                day_number=d,
                title=f"مغامرة اليوم {d}: الطبيعة والتراث المحلي",
                morning=f"انطلاق صباحي مبكر وزيارة واحات النخيل والأسواق الشعبية المحلية.",
                afternoon="جلسة شاي باللوز ورصد المعالم الطبيعية والتصوير الفوتوغرافي التذكاري.",
                evening="عشاء ختامي واستراحة تجهيزاً للعودة وسلامة الوصول.",
                stay_city="المدينة المحددة بالمسار"
            ))

    return PlanTripResponse(
        summary=f"برنامج سياحي مخصص لمدة {days} أيام لعدد {people} أفراد، يركز على {', '.join(payload.interests)}.",
        estimated_cost_lyd=total_est,
        recommended_vehicle=vehicle_type,
        requires_guide=True,
        itinerary=itinerary
    )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
