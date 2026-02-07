import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import fs from 'fs';
import path from 'path';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'openai/gpt-3.5-turbo',
  temperature: 0.7,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
});

// ── Load community guide JSON ──
let communityGuide: Record<string, unknown> | null = null;

function loadCommunityGuide(): Record<string, unknown> {
  if (communityGuide) return communityGuide;
  const filePath = path.join(process.cwd(), 'backend', 'jsons', 'community_guide.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  communityGuide = JSON.parse(raw);
  return communityGuide!;
}

// Flatten JSON into readable text sections the LLM can consume
function flattenJson(obj: unknown, prefix = ''): string {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return `${prefix}: ${obj}`;
  }
  if (Array.isArray(obj)) {
    if (obj.every((item) => typeof item === 'string' || typeof item === 'number')) {
      return `${prefix}: ${obj.join(', ')}`;
    }
    return obj.map((item, i) => flattenJson(item, `${prefix}[${i}]`)).join('\n');
  }
  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>)
      .map(([key, value]) => {
        const label = key.replace(/_/g, ' ');
        const newPrefix = prefix ? `${prefix} > ${label}` : label;
        return flattenJson(value, newPrefix);
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

// Extract sections relevant to the user's query by keyword matching
function getRelevantSections(query: string): string {
  const guide = loadCommunityGuide();
  const queryLower = query.toLowerCase();

  // Map common question keywords to JSON top-level keys
  const keywordMap: Record<string, string[]> = {
    'quiet hours': ['policies.noise_courtesy_and_quiet_hours'],
    'noise': ['policies.noise_courtesy_and_quiet_hours'],
    'courtesy hours': ['policies.noise_courtesy_and_quiet_hours'],
    'guest': ['policies.visitation'],
    'visitor': ['policies.visitation'],
    'visitation': ['policies.visitation'],
    'overnight': ['policies.visitation'],
    'alcohol': ['policies.alcohol_and_other_drugs'],
    'drug': ['policies.alcohol_and_other_drugs'],
    'pet': ['policies.pets', 'services_for_students_with_disabilities.emotional_support_animals', 'services_for_students_with_disabilities.service_animals'],
    'animal': ['policies.pets', 'services_for_students_with_disabilities.emotional_support_animals', 'services_for_students_with_disabilities.service_animals'],
    'fire': ['policies.fire_safety', 'fire_evacuation_and_severe_weather_shelter'],
    'evacuation': ['fire_evacuation_and_severe_weather_shelter'],
    'tornado': ['general_information.tornado_warning', 'general_information.tornado_watch'],
    'weapon': ['policies.firearms_weapons_and_explosives'],
    'gun': ['policies.firearms_weapons_and_explosives'],
    'knife': ['policies.firearms_weapons_and_explosives'],
    'appliance': ['policies.appliances_and_electronic_devices'],
    'microwave': ['policies.appliances_and_electronic_devices'],
    'fridge': ['policies.appliances_and_electronic_devices'],
    'refrigerator': ['policies.appliances_and_electronic_devices'],
    'cooking': ['policies.cooking_guidelines'],
    'cook': ['policies.cooking_guidelines'],
    'kitchen': ['policies.cooking_guidelines'],
    'decoration': ['policies.decorations'],
    'poster': ['policies.decorations'],
    'candle': ['policies.decorations', 'policies.fire_safety'],
    'key': ['policies.lock_security'],
    'lock': ['policies.lock_security'],
    'lockout': ['policies.lock_security'],
    'bike': ['policies.bicycles_and_transportation_devices'],
    'scooter': ['policies.bicycles_and_transportation_devices'],
    'parking': ['policies.bicycles_and_transportation_devices'],
    'smoke': ['policies.smoking'],
    'tobacco': ['policies.smoking'],
    'vape': ['policies.smoking'],
    'mail': ['general_information.mail_and_packages'],
    'package': ['general_information.mail_and_packages'],
    'laundry': ['general_information.laundry_facilities'],
    'wifi': ['general_information.internet_connectivity'],
    'internet': ['general_information.internet_connectivity'],
    'ethernet': ['general_information.internet_connectivity'],
    'maintenance': ['general_information.work_requests'],
    'work request': ['general_information.work_requests'],
    'repair': ['general_information.work_requests'],
    'recycl': ['policies.recycling_and_trash'],
    'trash': ['policies.recycling_and_trash'],
    'compost': ['policies.recycling_and_trash'],
    'conduct': ['student_conduct'],
    'roommate': ['community_living_standards'],
    'room change': ['policies.room_apartment_entry'],
    'furniture': ['policies.room_apartment_furnishings'],
    'bed': ['policies.lofts', 'policies.room_apartment_furnishings'],
    'loft': ['policies.lofts'],
    'damage': ['policies.vandalism_and_damages'],
    'vandal': ['policies.vandalism_and_damages'],
    'insurance': ['general_information.responsibility_for_student_property'],
    'staff': ['housing_staff'],
    'ra ': ['housing_staff.resident_assistants'],
    'phone': ['important_phone_numbers'],
    'number': ['important_phone_numbers'],
    'contact': ['important_phone_numbers'],
    'front desk': ['important_phone_numbers.community_offices', 'general_information.community_desk'],
    'summer': ['summer_housing'],
    'disability': ['services_for_students_with_disabilities'],
    'accommodation': ['services_for_students_with_disabilities'],
    'health check': ['general_information.health_and_safety_checks'],
    'inspection': ['general_information.health_and_safety_checks'],
    'camera': ['general_information.cameras'],
    'emergency': ['general_information.uga_alert', 'important_phone_numbers.safety_numbers'],
    'uga alert': ['general_information.uga_alert'],
    'solicitation': ['policies.solicitation_and_fundraising'],
    'window': ['policies.windows_and_screens'],
    'screen': ['policies.windows_and_screens'],
    'oil diffuser': ['policies.essential_oil_diffusers'],
    'diffuser': ['policies.essential_oil_diffusers'],
    'contract': ['contract_review_process'],
    'appeal': ['contract_review_process.review_appeal'],
    'community council': ['community_activities.community_councils'],
    'rha': ['community_activities.residence_hall_association'],
    'event': ['community_activities'],
    'census': ['policies.us_census_surveys'],
    'access': ['policies.access_control'],
    'ugacard': ['policies.access_control'],
    'buzzcard': ['policies.access_control'],
  };

  // Find matching sections
  const matchedPaths = new Set<string>();
  for (const [keyword, paths] of Object.entries(keywordMap)) {
    if (queryLower.includes(keyword)) {
      paths.forEach((p) => matchedPaths.add(p));
    }
  }

  // If no specific match, include general policies + phone numbers as fallback
  if (matchedPaths.size === 0) {
    matchedPaths.add('policies');
    matchedPaths.add('general_information');
  }

  // Resolve dot-path keys from the guide
  const sections: string[] = [];
  for (const dotPath of matchedPaths) {
    const keys = dotPath.split('.');
    let current: unknown = guide;
    for (const key of keys) {
      if (current && typeof current === 'object' && !Array.isArray(current)) {
        current = (current as Record<string, unknown>)[key];
      } else {
        current = undefined;
        break;
      }
    }
    if (current !== undefined) {
      sections.push(flattenJson(current, dotPath.replace(/\./g, ' > ')));
    }
  }

  // Also always include phone numbers for the student's building if we can find it
  return sections.join('\n\n');
}

// Look up building-specific phone numbers from the community guide
function getBuildingPhoneInfo(userLocation: string): string {
  const guide = loadCommunityGuide();
  const offices = (guide as any)?.important_phone_numbers?.community_offices;
  if (!Array.isArray(offices) || !userLocation) return '';

  const loc = userLocation.toLowerCase().trim();
  const match = offices.find((o: any) => o.building?.toLowerCase().includes(loc) || loc.includes(o.building?.toLowerCase()));
  if (!match) return '';

  const parts = [`Phone info for ${match.building}:`];
  if (match.front_desk) parts.push(`  Front Desk: ${match.front_desk}${match.front_desk_location ? ` (at ${match.front_desk_location})` : ''}`);
  if (match.community_office) parts.push(`  Community Office: ${match.community_office}${match.community_office_location ? ` (at ${match.community_office_location})` : ''}`);
  if (match.ra_on_call) parts.push(`  RA On-Call: ${match.ra_on_call}`);
  return parts.join('\n');
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateRAGResponse(
  userQuery: string,
  conversationHistory: Message[] = [],
  userLocation?: string,
): Promise<{ response: string; sources: string[] }> {
  try {
    // Get relevant sections from the community guide JSON
    const relevantInfo = getRelevantSections(userQuery);
    const buildingInfo = userLocation ? getBuildingPhoneInfo(userLocation) : '';

    // Build the system prompt
    const locationContext = userLocation
      ? `\nThe student lives in ${userLocation}. Tailor your answers to their specific dorm when the community guide has building-specific info (phone numbers, evacuation procedures, etc.).`
      : `\nThe student has NOT specified which dorm they live in. If they ask a question that depends on their specific dorm or community (e.g. quiet hours, front desk phone, evacuation location, RA on-call number), you MUST ask them which dorm or residence hall they live in FIRST before answering. Say something like "Which dorm do you live in? That way I can give you the exact info for your building!" Do NOT guess or give a generic answer for dorm-specific questions.`;

    const systemPrompt = `You are a friendly and knowledgeable UGA (University of Georgia) Dorm RA (Resident Assistant) chatbot. You help UGA students with questions about UGA dorm policies, UGA Housing community guidelines, campus resources, and residential life.
${locationContext}

IMPORTANT: Use the UGA Community Guide data provided below to answer questions accurately. Quote specific policies, numbers, rules, and details from the guide. Do NOT make up information — if the guide doesn't cover something, say so honestly and suggest contacting UGA Housing at 706-542-1421 or housing@uga.edu.

Be friendly, supportive, and professional. Keep responses concise and helpful. Go Dawgs!`;

    // Convert conversation history to LangChain messages
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(systemPrompt),
    ];

    for (const msg of conversationHistory) {
      messages.push(
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );
    }

    // Add current query with community guide context
    const contextBlock = [relevantInfo, buildingInfo].filter(Boolean).join('\n\n');
    messages.push(
      new HumanMessage(
        `Question: "${userQuery}"\n\nUGA Community Guide Information:\n${contextBlock || 'No specific section matched. Use your general knowledge of UGA Housing policies.'}`
      )
    );

    const result = await chatModel.invoke(messages);
    const response = result.content.toString();

    return {
      response,
      sources: ['UGA Community Guide 2025-2026'],
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
}

export async function generateStreamingRAGResponse(
  userQuery: string,
  conversationHistory: Message[] = [],
  userLocation?: string,
) {
  const relevantInfo = getRelevantSections(userQuery);
  const buildingInfo = userLocation ? getBuildingPhoneInfo(userLocation) : '';

  const locationContext = userLocation
    ? `\nThe student lives in ${userLocation}. Tailor answers to their dorm when possible.`
    : `\nThe student has NOT told you their dorm. If the question is dorm-specific, ask which dorm they live in first.`;

  const systemPrompt = `You are a friendly UGA Dorm RA chatbot. Use the UGA Community Guide data below to answer accurately. Do NOT make up info.
${locationContext}
Be concise and helpful. Go Dawgs!`;

  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];

  for (const msg of conversationHistory) {
    messages.push(
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );
  }

  const contextBlock = [relevantInfo, buildingInfo].filter(Boolean).join('\n\n');
  messages.push(
    new HumanMessage(
      `Question: "${userQuery}"\n\nUGA Community Guide Information:\n${contextBlock || 'No specific match found.'}`
    )
  );

  return chatModel.stream(messages);
}
