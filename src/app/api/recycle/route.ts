import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Step 1: Use Gemini to identify the object in the image ──
async function identifyWithGemini(imageBase64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
    'Identify every object you can see in this image. List them as a comma-separated list. Be specific (e.g. "plastic water bottle", "banana peel", "cardboard box"). Only list the objects, nothing else.',
  ]);

  const text = result.response.text();
  return text;
}

// ── Step 2: Use OpenRouter (GPT-3.5-turbo) to classify the items ──
async function classifyWithOpenRouter(itemDescription: string): Promise<{
  classification: string;
  labels: string[];
  tips: string;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a waste classification expert at the University of Georgia. Given a list of objects, classify the overall waste disposal method. Respond ONLY in valid JSON with this exact structure:
{
  "classification": "Recyclable" | "Compostable" | "Landfill (Trash)" | "Mixed — See Tips",
  "labels": ["item1", "item2"],
  "tips": "One concise paragraph with UGA-specific disposal advice."
}
UGA recycling accepts: paper, cardboard, plastic bottles #1-#2, aluminum/steel cans, glass bottles.
UGA composting: food scraps, napkins, paper towels, coffee grounds/filters.
Landfill: styrofoam, chip bags, plastic wrap, straws, contaminated items.
Always mention UGA bins are color coded: blue = recycling, green = compost, black = landfill.`,
        },
        {
          role: 'user',
          content: `Objects identified in photo: ${itemDescription}`,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse JSON from the response (handle markdown code fences)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      classification: 'Unknown',
      labels: itemDescription.split(',').map((s: string) => s.trim()).filter(Boolean),
      tips: content,
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      classification: parsed.classification || 'Unknown',
      labels: parsed.labels || [],
      tips: parsed.tips || '',
    };
  } catch {
    return {
      classification: 'Unknown',
      labels: itemDescription.split(',').map((s: string) => s.trim()).filter(Boolean),
      tips: content,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Step 1: Gemini identifies what's in the image
    let itemDescription: string;
    try {
      itemDescription = await identifyWithGemini(base64, mimeType);
    } catch (err: any) {
      console.error('Gemini vision error:', err?.message || err);
      return NextResponse.json({ error: 'Could not identify objects. Check GEMINI_API_KEY.' }, { status: 500 });
    }

    // Step 2: OpenRouter classifies recycling/compost/trash
    const result = await classifyWithOpenRouter(itemDescription);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Recycle API error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
