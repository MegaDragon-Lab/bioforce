export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profession, platform, keywords, tone, lang } = req.body;

  if (!profession) return res.status(400).json({ error: 'Missing profession' });

  const isEN = lang === 'en';

  const toneGuidanceEN = {
    'Professional': 'Formal, confident, achievement-focused. Strong action verbs. No emojis.',
    'Creative': 'Imaginative, original, unexpected word choices. Show personality. Can break conventions.',
    'Friendly and human': 'Warm, approachable, conversational. Feels like a real person, not a resume.',
    'Bold and direct': 'Short punchy sentences. No fluff. Provocative opening. Commands attention.',
    'Elegant and sophisticated': 'Refined vocabulary. Measured tone. Understated confidence. No hype.',
  };

  const toneGuidanceES = {
    'Profesional': 'Formal, seguro, orientado a logros. Verbos de acción fuertes. Sin emojis.',
    'Creativo': 'Original e imaginativo. Palabras inesperadas. Muestra personalidad. Puede romper convenciones.',
    'Cercano y humano': 'Cálido, cercano, conversacional. Que parezca una persona real, no un CV.',
    'Audaz y directo': 'Frases cortas y contundentes. Sin relleno. Apertura provocadora. Llama la atención.',
    'Elegante y sofisticado': 'Vocabulario refinado. Tono medido. Confianza discreta. Sin exageraciones.',
  };

  const platformLimits = {
    'LinkedIn': 220, 'Instagram': 150, 'Twitter / X': 160, 'Genérica': 200, 'Generic': 200,
  };

  const charLimit = platformLimits[platform] || 200;
  const toneGuide = isEN
    ? (toneGuidanceEN[tone] || 'Professional and confident.')
    : (toneGuidanceES[tone] || 'Profesional y seguro.');

  const prompt = isEN
    ? `You are an elite personal branding copywriter. Your bios have been featured in Forbes, LinkedIn Top Voices, and TED profiles.

TASK: Write exactly 3 distinct professional bios in ENGLISH for ${platform}.

PERSON PROFILE:
- Role: ${profession}
- Tone: ${tone} → ${toneGuide}
${keywords ? `- Key info: ${keywords}` : ''}

STRICT REQUIREMENTS:
1. Each bio MUST be under ${charLimit} characters
2. Each bio must use a completely different OPENING HOOK:
   - Bio A: Start with what they DO (action-first)
   - Bio B: Start with the IMPACT or result they create
   - Bio C: Start with a HUMAN element — personality, passion or story
3. Never use: "passionate about", "results-driven", "leverage", "synergies", "dynamic"
4. No bullet points, no hashtags, no quotes
5. Every word must earn its place — cut all filler
6. Separate each bio with exactly: ---BIO---

STRONG OPENING EXAMPLES:
- "Turns complex data into decisions that move markets."
- "Built 3 startups. Failed twice. Now I teach what actually works."
- "The architect behind systems used by 50M people daily."

Respond ONLY with the 3 bios separated by ---BIO---. No labels, no numbering, no extra text.`
    : `Eres un copywriter de personal branding de élite. Tus bios han aparecido en perfiles de Forbes, LinkedIn Top Voices y TED.

TAREA: Escribe exactamente 3 bios profesionales distintas en ESPAÑOL para ${platform}.

PERFIL DE LA PERSONA:
- Rol: ${profession}
- Tono: ${tone} → ${toneGuide}
${keywords ? `- Información clave: ${keywords}` : ''}

REQUISITOS ESTRICTOS:
1. Cada bio DEBE tener menos de ${charLimit} caracteres
2. Cada bio debe usar un GANCHO DE APERTURA completamente diferente:
   - Bio A: Empieza con lo que HACE (acción primero)
   - Bio B: Empieza con el IMPACTO o resultado que genera
   - Bio C: Empieza con un elemento HUMANO — personalidad, pasión o historia
3. Nunca uses: "apasionado por", "orientado a resultados", "sinergia", "dinámico", "proactivo"
4. Sin bullets, sin hashtags, sin comillas
5. Cada palabra debe ganarse su lugar — elimina todo el relleno
6. Separa cada bio con exactamente: ---BIO---

EJEMPLOS DE APERTURAS POTENTES:
- "Convierte datos complejos en decisiones que mueven mercados."
- "Construí 3 startups. Fallé dos veces. Ahora enseño lo que realmente funciona."
- "El arquitecto detrás de sistemas usados por 50 millones de personas."

Responde ÚNICAMENTE con las 3 bios separadas por ---BIO---. Sin etiquetas, sin numeración, sin texto extra.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: isEN
              ? 'You are an elite personal branding copywriter. You write sharp, memorable, human bios. You never use clichés. Every word counts.'
              : 'Eres un copywriter de personal branding de élite. Escribes bios memorables, directas y humanas. Nunca usas clichés. Cada palabra cuenta.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.85,
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
