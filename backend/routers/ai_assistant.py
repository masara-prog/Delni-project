import os
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from config import GEMINI_API_KEY
from schemas import AIChatRequest, AIChatResponse

logger = logging.getLogger("delni_ai")
router = APIRouter(prefix="/api/ai", tags=["Delni Smart AI - ذكاء دلّني"])

# Configure Gemini if API key is provided
gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        system_instruction = (
            "أنت «مرشد دلّني الذكي» (Delni AI)، المساعد السياحي الذكي الرسمي لمنصة دلّني للسياحة في ليبيا.\n"
            "مهامك وقواعدك:\n"
            "1. أنت خبير بالسياحة الليبية، الجغرافيا، والآثار والتاريخ العريق (لبدة الكبرى، صبراتة، شحات/قورينا، جبال تاسيلي وأكاكوس، غدامس لؤلؤة الصحراء، جرمة، طرابلس القديمة والسرايا، بنغازي، الجبل الأخضر وجبل نفوسة).\n"
            "2. تفهم اللهجة الليبية الأصيلة بطلاقة ودفء (مرحب، مرحبتين، شن الجو، باهي، كيف نوصل، شن أحسن مطاعم، قداش تبعد، شاهي العالة، إلخ).\n"
            "3. تقدم نصائح حول مسارات الرحلات، أفضل المطاعم (مشاوي وطنية، بازين، كسكسي، حوت شواية)، وسائل النقل المناسبة، والفنادق المعتمدة.\n"
            "4. أسلوبك فصيح وسلس مع لمسة ليبية ودودة ومضيافة.\n"
            "5. كن دقيقاً، مختصراً، وشجع السياح على استكشاف جمال ليبيا وإنشاء رحلات خاصة عبر المنصة."
        )
        
        # Initialize model
        gemini_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_instruction
        )
        logger.info("Delni Gemini AI initialized successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini AI: {e}")
        gemini_model = None

# Smart rule-based fallback if no Gemini key or offline
def libyan_fallback_responder(message: str) -> tuple[str, list[str]]:
    msg = message.lower()
    
    if any(k in msg for k in ["لبدة", "لبده", "leptis"]):
        return (
            "لبدة الكبرى (Leptis Magna) هي درة الآثار الرومانية في شمال إفريقيا ومصنفة ضمن مواقع التراث العالمي لليونسكو في الخمس، تبعد حوالي 120 كم شرق طرابلس. تتميز بقوس سيبتيموس سيفيروس، والميدان القديم، والمسرح البانورامي المطل على البحر. ننصح بزيارتها صباحاً واستكشافها مع مرشد محلي.",
            ["إنشاء رحلة خاصة للبده", "حجز سيارة دفع رباعي", "فنادق قريبة في الخمس"]
        )
    elif any(k in msg for k in ["صبراتة", "صبراته", "sabratha"]):
        return (
            "صبراتة تشتهر بمسرحها الروماني الخلاب المكوّن من ثلاثة طوابق من الأعمدة الرخامية الساحرة على شاطئ البحر الأبيض المتوسط مباشرة، وتبعد حوالي 70 كم غرب طرابلس. الموقع استثنائي لالتقاط الصور عند الغروب.",
            ["استكشاف معالم صبراتة", "طلب رحلة خاصة", "مطاعم الأسماك في الساحل"]
        )
    elif any(k in msg for k in ["غدامس", "ghadames"]):
        return (
            "غدامس «لؤلؤة الصحراء» وعاصمة الواحات القديمة، إحدى أقدم المدن الصحراوية المسجلة في اليونسكو. تتميز بهندستها المعمارية الطينية الفريدة وممراتها المغطاة وبساتين النخيل، إضافة لجمال بحيرة مجزم الكبريتية وعين الفرس.",
            ["رحلات الصحراء وغدامس", "سيارات الدفع الرباعي 4x4", "بيوت الضيافة التقليدية"]
        )
    elif any(k in msg for k in ["أكل", "مطعم", "ماكلة", "مطاعم", "مشاوي", "بازين", "كسكسي", "حوت"]):
        return (
            "المطبخ الليبي غني بالنكهات الأصيلة! يمكنك تجربة «البازين باللحم الوطني» أو «الكسكسي بالبصلة»، بالإضافة للمشاوي الليبية الطازجة على الفحم، والأسماك المشوية الطازجة على طول الساحل في طرابلس وبنغازي والخمس وزوارة.",
            ["تصفح مطاعم المشاوي", "مطاعم المأكولات الشعبية", "مطاعم الأسماك البحرية"]
        )
    elif any(k in msg for k in ["نقل", "سيارة", "سيارات", "باص", "تأجير"]):
        return (
            "توفر منصة دلّني أسطول مركبات مجهز وموثق: سيارات دفع رباعي 4x4 للرحلات الجبلية والصحراوية، حافلات سياحية VIP للمجموعات، وسيارات صالون حديثة للتنقل بين المدن مع سائقين مرخصين ومحترفين.",
            ["عرض أسطول السيارات", "حجز سيارة دفع رباعي", "طلب رحلة خاصة"]
        )
    elif any(k in msg for k in ["رحلة خاصة", "رحلات خاصة", "برنامج"]):
        return (
            "يمكنك تصميم رحلة سياحية خاصة بالكامل عبر منصة دلّني: اختر تاريخ البداية، عدد الأيام، وعدد المرافقين، وسيتولى فريقنا تنسيق المرشد السياحي والسيارة والمسار الأمثل لك!",
            ["إنشاء رحلة خاصة الآن", "عرض المعالم المقترحة", "التواصل مع الإدارة"]
        )
    else:
        return (
            "مرحباً بك في «دلّني»! أنا دليلك الذكي لاستكشاف كنوز ليبيا من شواطئ البحر المتوسط حتى رمال الصحراء الكبرى والواحات والآثار الخالدة. كيف نقدر نساعدك اليوم في رحلتك؟",
            ["أبرز المعالم السياحية", "أفضل الفنادق المعتمدة", "المطاعم الشعبية والمشاوي", "إنشاء رحلة خاصة"]
        )

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_delni_ai(request: AIChatRequest):
    """
    محادثة ذكية مع ذكاء دلّني عبر Google Gemini مع استجابة فورية ونظام أمان
    """
    user_msg = request.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="الرسالة فارغة")

    if gemini_model:
        try:
            # Build conversation history if provided
            contents = []
            for item in (request.history or []):
                role = "user" if item.role in ["user", "human"] else "model"
                contents.append({"role": role, "parts": [item.content]})
            contents.append({"role": "user", "parts": [user_msg]})

            response = gemini_model.generate_content(contents)
            reply_text = response.text.strip()
            
            return AIChatResponse(
                reply=reply_text,
                suggested_actions=["معالم مقترحة", "طلب رحلة خاصة", "فنادق معتمدة"],
                source="gemini"
            )
        except Exception as e:
            logger.warning(f"Gemini API request failed, falling back to local intelligence: {e}")
            reply, actions = libyan_fallback_responder(user_msg)
            return AIChatResponse(
                reply=reply,
                suggested_actions=actions,
                source="rule-based-fallback"
            )
    else:
        # Fallback knowledge responder
        reply, actions = libyan_fallback_responder(user_msg)
        return AIChatResponse(
            reply=reply,
            suggested_actions=actions,
            source="rule-based-fallback"
        )

@router.post("/vision")
async def recognize_landmark_image(
    file: UploadFile = File(...),
    prompt: Optional[str] = Form("تعرف على هذا المعلم السياحي الليبي واشرح أهميته التاريخية والسياحية")
):
    """
    التعرف البصري على المعالم السياحية الليبية من خلال الصور المرفوعة
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="الملف المرفوع يجب أن يكون صورة")

    image_bytes = await file.read()

    if gemini_model:
        try:
            import google.generativeai as genai
            vision_model = genai.GenerativeModel("gemini-1.5-flash")
            
            image_part = {
                "mime_type": file.content_type,
                "data": image_bytes
            }
            
            custom_prompt = (
                f"{prompt}\n"
                "ركز على تحديد المعلم السياحي أو الأثري الليبي بدقة (مثلاً: لبدة، صبراتة، مسرح شحات، غدامس، قلعة السرايا الحمراء، جبال أكاكوس...)، "
                "وقدم ملخصاً ممتعاً باللغة العربية مع نصيحة للزائر."
            )
            
            response = vision_model.generate_content([custom_prompt, image_part])
            return {
                "success": True,
                "analysis": response.text.strip(),
                "landmark_detected": True,
                "source": "gemini-vision"
            }
        except Exception as e:
            logger.error(f"Vision API failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_message": "تعذر تحليل الصورة عبر النموذج السحابي حالياً. يرجى التأكد من مفتاح GEMINI_API_KEY."
            }
    else:
        return {
            "success": True,
            "analysis": "صورة لمعلم أثري ليبي أصيل. لتفعيل خاصية التعرف الآلي الكامل بالذكاء الاصطناعي، يرجى وضع GEMINI_API_KEY في ملف backend/.env",
            "source": "local-preview"
        }
