// סוכן הסושיאל: בונה פרומפט לפי פלטפורמה ומריץ ספק AI אם מחובר.
// בלי ספק מחובר העבודה עוברת למצב waiting_for_input: היוצר מקבל את הפרומפט
// ומדביק תוצאה ידנית. שום ריצה לא מדומה.

export const PLATFORMS = {
  linkedin: {
    label: 'LinkedIn — מאמא בוי',
    maxChars: 3000,
    voice: [
      'אתה כותב את חשבון הלינקדאין של מאמא בוי, מנכ"ל זמני של "השושלת הקיסרית", תאגיד בידור של אימפריה חייזרית שולטת שבה רייטינג הוא כוח.',
      'הפוסט הוא פארודיה על לינקדאין: האדרה עצמית שמתחפשת לשיתוף מקצועי, "למדתי משהו מדהים השבוע", הודיה מנופחת, שורות קצרות, האשטגים.',
      'אמו היא השליטה האמיתית, והוא לא מודה בזה. אפשר לרמוז לכך בעדינות.',
      'מספר 2 ברייטינג הגלקטי הוא פרט בדיוני שמותר להזכיר. אל תציג אותו כנתון עסקי אמיתי.',
    ],
  },
};

export const QUOTE_STATUS = {
  verified: 'ציטוט שנבדק מול הסרט',
  machine: 'תמלול מכונה, לא מאומת',
  creator_fix: 'תיקון של היוצר',
  none: 'אין ציטוט',
};

export function buildPrompt(platform, brief) {
  const p = PLATFORMS[platform];
  if (!p) throw new Error(`פלטפורמה לא נתמכת: ${platform}`);
  const lines = [
    ...p.voice,
    '',
    'כללים מחייבים:',
    '- כתוב בעברית טבעית.',
    '- אל תמציא ציטוט מהסרט ואל תייחס לסרט משפט שלא ניתן לך כאן. אם יש ציטוט, השתמש בו בדיוק כפי שהוא.',
    '- אל תבטיח מוצר שזמין לרכישה. המוצרים "לא זמינים כרגע בכדור הארץ", ואפשר להזמין לעדכון בלבד.',
    '- אל תמציא נתוני קהל, מכירות או הזמנות.',
    `- אורך מרבי: ${p.maxChars} תווים.`,
    '- החזר רק את נוסח הפוסט, בלי הסברים.',
    '',
    'הקשר ליצירה:',
  ];
  if (brief.scene) lines.push(`- סצנה: ${brief.scene}`);
  if (brief.product) lines.push(`- מוצר: ${brief.product}`);
  if (brief.character) lines.push(`- דמות: ${brief.character}`);
  if (brief.quote) {
    lines.push(`- ציטוט: "${brief.quote}" (${QUOTE_STATUS[brief.quoteStatus] || QUOTE_STATUS.machine})`);
  }
  if (brief.note) lines.push(`- הערת היוצר: ${brief.note}`);
  return lines.join('\n');
}

export function providerStatus(env = process.env) {
  if (env.ANTHROPIC_API_KEY) {
    return { connected: true, provider: 'anthropic', model: env.SOCIAL_MODEL || 'claude-sonnet-5-5' };
  }
  return {
    connected: false,
    provider: 'manual',
    message: 'לא מחובר ספק AI. הפרומפט נשמר כעבודה שממתינה, ואפשר להדביק תוצאה ידנית.',
  };
}

export async function runProvider(prompt, env = process.env, fetchImpl = fetch) {
  const st = providerStatus(env);
  if (!st.connected) return { ok: false, waiting: true };
  const res = await fetchImpl('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: st.model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) return { ok: false, error: `ספק ה-AI החזיר ${res.status}` };
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  if (!text) return { ok: false, error: 'ספק ה-AI לא החזיר טקסט' };
  return { ok: true, text, model: st.model };
}
