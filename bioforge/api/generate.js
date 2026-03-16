export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profession, platform, keywords, tone, lang } = req.body;

  if (!profession) return res.status(400).json({ error: 'Missing profession' });

  const isEN = lang === 'en';

  const prompt = isEN
    ? `You are a personal branding expert. Generate exactly 3 distinct professional bios in ENGLISH for ${platform} for someone with this profile:
- Profession/Role: ${profession}
- Desired tone: ${tone}
${keywords ? `- Keywords / achievements: ${keywords}` : ''}

Rules:
- Each bio must differ in structure and approach
- Write entirely in English
- Adapt length to ${platform} limits (LinkedIn: up to 220 chars, Instagram: 150 chars, Twitter/X: 160 chars, Generic: 200 chars)
- No quotes, plain text only
- Separate each bio with exactly: ---BIO---

Respond ONLY with the 3 bios separated by ---BIO--- and nothing else.`
    : `Eres un experto en personal branding. Genera exactamente 3 bios profesionales distintas en ESPAÑOL para ${platform} para alguien con este perfil:
- Profesión/Rol: ${profession}
- Tono deseado: ${tone}
${keywords ? `- Palabras clave / logros: ${keywords}` : ''}

Reglas:
- Cada bio debe ser diferente en estructura y enfoque
- Escribe completamente en español
- Adapta la longitud al límite de ${platform} (LinkedIn: hasta 220 chars, Instagram: 150 chars, Twitter/X: 160 chars, Genérica: 200 chars)
- No uses comillas, solo el texto puro
- Separa cada bio con exactamente: ---BIO---

Responde ÚNICAMENTE con las 3 bios separadas por ---BIO--- sin ningún otro texto.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const text = data.choices?.[0]?.message?.content || '';
    const bios = text.split('---BIO---').map(b => b.trim()).filter(b => b.length > 10);

    if (bios.length === 0) throw new Error('No bios generated');

    res.status(200).json({ bios: bios.slice(0, 3) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
