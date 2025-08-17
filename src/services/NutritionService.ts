import OpenAI from 'openai';
// Assuming OnboardingData is exported from your context file
// Adjust the import path if it's different
import { OnboardingData } from '../../app/OnboardingContext'; // Adjusted path
import { differenceInYears, parseISO } from 'date-fns'; // Added for age calculation

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  console.error(
    'OpenAI API key (EXPO_PUBLIC_OPENAI_API_KEY) is not set in .env file or not accessible.',
  );
  // In a real app, you might throw an error or have a fallback mechanism
}

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

interface FormattedUserData {
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: string | null;
  goal: string | null;
  dietPreferences: string | null; // Combined from diet and obstacles
  experienceLevel: string | null;
}

export interface NutritionRecommendation {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatsGrams: number;
  briefRationale: string;
}

/**
 * Prepares user data from OnboardingContext for the OpenAI prompt.
 * @param onboardingData - The raw onboarding data.
 * @returns FormattedUserData object or null if essential data is missing.
 */
const formatUserDataForAI = (
  onboardingData: OnboardingData,
): FormattedUserData | null => {
  let age: number | null = null;
  if (onboardingData.dateOfBirth) {
    try {
      const dob = parseISO(onboardingData.dateOfBirth);
      age = differenceInYears(new Date(), dob);
    } catch (error) {
      console.error('[NutritionService] Error parsing dateOfBirth:', error);
    }
  }

  let heightCm: number | null = null;
  if (onboardingData.height?.value) {
    heightCm = parseFloat(onboardingData.height.value);
    if (isNaN(heightCm)) heightCm = null; // Handle parsing failure
  }

  let weightKg: number | null = null;
  if (onboardingData.weight?.value) {
    weightKg = parseFloat(onboardingData.weight.value);
    if (isNaN(weightKg)) weightKg = null; // Handle parsing failure
  }

  let dietDescription = 'User has no specific named diet.';
  if (onboardingData.diet) {
    dietDescription = `User follows a ${onboardingData.diet} diet.`;
  }

  let obstaclesDescription = 'No specific food intolerances or allergies reported.';
  if (onboardingData.obstacles && onboardingData.obstacles.length > 0) {
    obstaclesDescription = `Known food intolerances or allergies: ${onboardingData.obstacles.join(', ')}.`;
  }
  const finalDietPreferences = `${dietDescription} ${obstaclesDescription}`.trim();

  if (!onboardingData.gender || heightCm === null || weightKg === null || !onboardingData.activityLevel || !onboardingData.goal || age === null) {
    console.warn('[NutritionService] Missing essential user data (gender, height, weight, activity, goal, or valid age) for AI prompt.');
    return null;
  }

  return {
    age,
    gender: onboardingData.gender,
    heightCm,
    weightKg,
    activityLevel: onboardingData.activityLevel,
    goal: onboardingData.goal,
    dietPreferences: finalDietPreferences,
    experienceLevel: onboardingData.experience,
  };
};

/**
 * Fetches personalized nutrition recommendations from OpenAI.
 * @param userData - The formatted user data.
 * @returns NutritionRecommendation object or null if an error occurs.
 */
export const getNutritionRecommendations = async (
  onboardingData: OnboardingData,
  userName: string | null | undefined
): Promise<NutritionRecommendation | null> => {
  if (!apiKey) {
    console.error('OpenAI API key is missing. Cannot fetch recommendations.');
    return null;
  }

  const formattedUser = formatUserDataForAI(onboardingData);
  if (!formattedUser) {
    return null;
  }

  // Construct greeting based on userName
  const usersFirstName = userName ? userName.split(' ')[0] : null; // Get first name
  const greeting = usersFirstName ? `Hi ${usersFirstName}, ` : 'Exciting! ';

  const systemPrompt = `You are a nutrition engine. Given a user's profile, you must compute calorie and macro targets using evidence-based rules and return ONLY a JSON object with EXACTLY these keys:
targetCalories, targetProteinGrams, targetCarbsGrams, targetFatsGrams, briefRationale.
No additional keys. No surrounding text. No code fences.

## Inputs you will receive
age (years), gender ("male"|"female"), height_cm, weight_kg, sessions_per_week (integer >=0), primary_goal ("maintain"|"lose"|"gain"), dietary_preferences (array), allergies_or_intolerances (array).

## Calculations
1) Basal Metabolic Rate (BMR), Mifflin–St Jeor:
   - Male: BMR = 10*weight_kg + 6.25*height_cm − 5*age + 5
   - Female: BMR = 10*weight_kg + 6.25*height_cm − 5*age − 161
2) Activity factor mapping from sessions_per_week:
   0 ⇒ 1.20 (sedentary)
   1–2 ⇒ 1.375 (lightly active)
   3–4 ⇒ 1.55 (moderately active)
   5–6 ⇒ 1.725 (very active)
   7+  ⇒ 1.90 (athlete)
   TDEE = BMR * activity_factor
3) Goal adjustment:
   - maintain ⇒ 0%
   - lose ⇒ 10–20% deficit (default 15%); do not imply >1% body weight loss/week.
   - gain ⇒ 5–15% surplus (default 10%).
   Set targetCalories = TDEE adjusted and round to nearest 5 kcal.
4) Macros:
   - Protein (g/kg):
       maintain: 1.2–1.6 (default 1.4)
       lose:     1.6–2.2 (default 1.8)
       gain:     1.6–2.0 (default 1.6)
   - Fat (g/kg): baseline 0.8 (allow 0.6–1.0); try to keep ≥20% calories.
   - Carbs: remaining calories after protein & fat.
   Energy factors: protein 4 kcal/g, carbs 4 kcal/g, fat 9 kcal/g.
   Round grams to whole numbers; after rounding, adjust carbs so that calories from macros match targetCalories within ±5 kcal.

## Dietary constraints
Respect provided diets/allergies. If conflicts exist or assumptions are made (e.g., missing sessions_per_week → assume 0), mention them briefly in \`briefRationale\` (since only that field can carry notes).

## Output format (STRICT)
Return ONLY a JSON object with EXACTLY:
- "targetCalories": number
- "targetProteinGrams": number
- "targetCarbsGrams": number
- "targetFatsGrams": number
- "briefRationale": string (When writing briefRationale, use ONE of the following templates (≤2 sentences). Only mention the user's current weight and their goal to lose weight—no calories, macros, or extra numbers.

1) "You're at {{weight_kg}} kg and aiming to lose weight; this plan moves you forward at a steady, sustainable pace. You can absolutely do this—consistency wins."

2) "{{weight_kg}} kg today, goal: lose weight. Follow this plan, stay steady, and the change will come—you've got this."

3) "At {{weight_kg}} kg with a goal to lose weight, this is set for real progress without burnout. Keep showing up—you can do this."

4) "Current weight: {{weight_kg}} kg; goal: weight loss. This keeps things sustainable and doable—stick with it and you'll make it happen."

5) "You're at {{weight_kg}} kg and choosing to lose weight; this keeps the path steady and kind. Trust the process—you've got this.")
No extra keys. No arrays or objects other than those five fields.`;

  // Convert activity level code to sessions per week for the new prompt format
  const getSessionsPerWeek = (activityLevel: string | null): number => {
    switch (activityLevel) {
      case '0-2': return 1; // Use middle of range
      case '3-5': return 4; // Use middle of range  
      case '6+': return 7; // Use 7+ for athlete level
      default: return 0; // Default to sedentary
    }
  };

  // Extract dietary preferences and allergies from our current data
  const dietaryPreferences: string[] = [];
  const allergiesIntolerances: string[] = [];
  
  if (onboardingData.diet && onboardingData.diet !== 'classic') {
    dietaryPreferences.push(onboardingData.diet);
  }
  
  if (onboardingData.obstacles && onboardingData.obstacles.length > 0) {
    allergiesIntolerances.push(...onboardingData.obstacles);
  }

  const userMessageContent = `age: ${formattedUser.age}
gender: "${formattedUser.gender}"
height_cm: ${formattedUser.heightCm}
weight_kg: ${formattedUser.weightKg}
sessions_per_week: ${getSessionsPerWeek(formattedUser.activityLevel)}
primary_goal: "${formattedUser.goal}"
dietary_preferences: [${dietaryPreferences.map(d => `"${d}"`).join(', ')}]
allergies_or_intolerances: [${allergiesIntolerances.map(a => `"${a}"`).join(', ')}]`;

  console.log('[NutritionService] Sending prompt to OpenAI:', userMessageContent);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Or 'gpt-4o' as a fallback
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessageContent },
      ],
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    console.log('[NutritionService] OpenAI response received:', responseContent);

    if (responseContent) {
      try {
        const parsedResponse = JSON.parse(responseContent) as NutritionRecommendation;
        // Basic validation of the parsed response structure
        if (
          typeof parsedResponse.targetCalories === 'number' &&
          typeof parsedResponse.targetProteinGrams === 'number' &&
          typeof parsedResponse.targetCarbsGrams === 'number' &&
          typeof parsedResponse.targetFatsGrams === 'number' &&
          typeof parsedResponse.briefRationale === 'string'
        ) {
          return parsedResponse;
        }
        console.error('[NutritionService] OpenAI response JSON does not match expected structure:', parsedResponse);
        return null;
      } catch (parseError) {
        console.error('[NutritionService] Failed to parse OpenAI JSON response:', parseError, 'Raw response:', responseContent);
        return null;
      }
    }
    console.error('[NutritionService] OpenAI response content is empty.');
    return null;
  } catch (error) {
    console.error('[NutritionService] Error calling OpenAI API:', error);
    return null;
  }
};
