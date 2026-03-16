export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profession, platform, keywords, tone } = req.body;

  if (!profession) return res.status(400).json({ error: 'Falta la profesión' });

  const prompt = `Eres un experto en personal branding. Genera exactamente 3 bios profesionales distintas para ${platform} para alguien con este perfil:
- Profesión/Rol: ${profession}
- Tono deseado: ${tone}
${keywords ? `- Palabras clave / logros: ${keywords}` : ''}

Reglas:
- Cada bio debe ser diferente en estructura y enfoque
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
    if (!response.ok) throw new Error(data.error?.message || 'Error en Groq');

    const text = data.choices?.[0]?.message?.content || '';
    const bios = text.split('---BIO---').map(b => b.trim()).filter(b => b.length > 10);

    if (bios.length === 0) throw new Error('No se generaron bios');

    res.status(200).json({ bios: bios.slice(0, 3) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
