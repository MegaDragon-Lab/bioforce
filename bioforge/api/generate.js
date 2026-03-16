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

  const platformLengthEN = {
    'LinkedIn': 'Write 3 to 5 sentences. LinkedIn allows long bios — use the space to tell a compelling story, mention key achievements, and end with what you offer or are looking for.',
    'Instagram': 'Write 2 to 3 punchy sentences. Instagram bios are short but must pack a punch — every word counts.',
    'Twitter / X': 'Write 1 to 2 sharp sentences. Twitter bios are ultra-short — make it memorable and intriguing.',
    'Generic': 'Write 3 to 4 sentences. Balance substance with readability.',
  };

  const platformLengthES = {
    'LinkedIn': 'Escribe entre 3 y 5 frases. LinkedIn permite bios largas — usa el espacio para contar una historia convincente, mencionar logros clave y terminar con lo que ofreces o buscas.',
    'Instagram': 'Escribe entre 2 y 3 frases contundentes. Las bios de Instagram son cortas pero deben impactar — cada palabra cuenta.',
    'Twitter / X': 'Escribe 1 o 2 frases precisas. Las bios de Twitter son ultracortas — hazla memorable e intrigante.',
    'Genérica': 'Escribe entre 3 y 4 frases. Equilibra sustancia con legibilidad.',
  };

  const toneGuide = isEN
    ? (toneGuidanceEN[tone] || 'Professional and confident.')
    : (toneGuidanceES[tone] || 'Profesional y seguro.');

  const lengthGuide = isEN
    ? (platformLengthEN[platform] || platformLengthEN['Generic'])
    : (platformLengthES[platform] || platformLengthES['Genérica']);

  const prompt = isEN
    ? `You are an elite personal branding copywriter. Your bios have been featured in Forbes, LinkedIn Top Voices, and TED profiles.

TASK: Write exactly 3 distinct professional bios in ENGLISH for ${platform}.

PERSON PROFILE:
- Role: ${profession}
- Tone: ${tone} → ${toneGuide}
${keywords ? `- Key info to weave in naturally: ${keywords}` : ''}

LENGTH & DEPTH GUIDE:
${lengthGuide}
Go deep — mention specific skills, experiences, impact, and personality. A great bio feels rich, not thin.

STRUCTURE — each bio must use a different OPENING HOOK:
- Bio A: Start with what they DO (action-first) — then expand with context, achievements and value
- Bio B: Start with the IMPACT or result they create — then explain how and what drives them
- Bio C: Start with a HUMAN element — personality, passion or story — then connect it to their professional value

STRICT RULES:
- Never use: "passionate about", "results-driven", "leverage", "synergies", "dynamic", "proactive", "go-getter"
- No bullet points, no hashtags, no quotes
- Write in flowing, natural prose
- Every sentence must add new information — no repetition
- Separate each bio with exactly: ---BIO---

STRONG OPENING EXAMPLES:
- "Turns complex data into decisions that move markets. With 15 years bridging engineering and business strategy, I've helped Fortune 500 companies cut costs by 30% without losing an ounce of innovation."
- "The systems running quietly behind 50 million daily users? I built several of them. As a Solutions Architect with two decades of experience, I specialize in designing infrastructure that scales without drama."
- "I fell in love with technology at 12, took apart my first computer, and never really stopped. Today I lead architecture teams across cloud, AI, and data — turning chaos into elegant, resilient systems."

Respond ONLY with the 3 bios separated by ---BIO---. No labels, no numbering, no extra text.`
    : `Eres un copywriter de personal branding de élite. Tus bios han aparecido en perfiles de Forbes, LinkedIn Top Voices y TED.

TAREA: Escribe exactamente 3 bios profesionales distintas en ESPAÑOL para ${platform}.

PERFIL DE LA PERSONA:
- Rol: ${profession}
- Tono: ${tone} → ${toneGuide}
${keywords ? `- Información clave a integrar de forma natural: ${keywords}` : ''}

GUÍA DE LONGITUD Y PROFUNDIDAD:
${lengthGuide}
Ve a fondo — menciona habilidades específicas, experiencias, impacto y personalidad. Una gran bio se siente rica, no vacía.

ESTRUCTURA — cada bio debe usar un GANCHO DE APERTURA diferente:
- Bio A: Empieza con lo que HACE (acción primero) — luego expande con contexto, logros y valor
- Bio B: Empieza con el IMPACTO o resultado que genera — luego explica cómo y qué le motiva
- Bio C: Empieza con un elemento HUMANO — personalidad, pasión o historia — y conéctalo con su valor profesional

REGLAS ESTRICTAS:
- Nunca uses: "apasionado por", "orientado a resultados", "sinergia", "dinámico", "proactivo"
- Sin bullets, sin hashtags, sin comillas
- Escribe en prosa fluida y natural
- Cada frase debe añadir información nueva — sin repetición
- Separa cada bio con exactamente: ---BIO---

EJEMPLOS DE APERTURAS POTENTES:
- "Convierte datos complejos en decisiones que mueven mercados. Con 15 años conectando ingeniería y estrategia de negocio, he ayudado a empresas del Fortune 500 a reducir costes un 30% sin perder capacidad de innovación."
- "Los sistemas que corren silenciosamente detrás de 50 millones de usuarios diarios? He construido varios. Como Arquitecto de Soluciones con dos décadas de experiencia, me especializo en infraestructuras que escalan sin dramas."
- "Me enamoré de la tecnología a los 12 años, desmontando mi primer ordenador, y nunca paré. Hoy lidero equipos de arquitectura en cloud, IA y datos — convirtiendo el caos en sistemas elegantes y resilientes."

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
              ? 'You are an elite personal branding copywriter. You write rich, sharp, memorable bios that feel human and specific. You never use clichés or generic phrases. You go deep, not shallow.'
              : 'Eres un copywriter de personal branding de élite. Escribes bios ricas, memorables y humanas, específicas y directas. Nunca usas clichés ni frases genéricas. Vas a fondo, no a lo superficial.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
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
