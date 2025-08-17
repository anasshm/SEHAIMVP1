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

  const systemPrompt = `You are a helpful AI nutrition assistant. Based on the user data provided, generate a personalized nutrition recommendation.
Your response must be a JSON object only.
The JSON object must include the following keys:
- targetCalories: number (e.g., 2000)
- targetProteinGrams: number (e.g., 150)
- targetCarbsGrams: number (e.g., 200)
- targetFatsGrams: number (e.g., 70)
- briefRationale: string (A short, 1-2 sentence motivational message FOR THE USER. It should be cheerful and inviting. Start with "${greeting}". Directly address the user (e.g., 'you', 'your'). Specifically mention their [user's goal] and how sticking to the [targetCalories] will help them achieve it. For example: '${greeting}To help you with your goal to [user's goal], aiming for around [targetCalories] calories daily is a great start. This plan is designed just for you to get there!')
Ensure the output is ONLY the JSON object.`;

  // Convert activity level code to descriptive text for AI
  const getActivityDescription = (activityLevel: string | null) => {
    switch (activityLevel) {
      case '0-2': return '0-2 workouts per week (sedentary lifestyle)';
      case '3-5': return '3-5 workouts per week (moderately active)';
      case '6+': return '6+ workouts per week (very active/athlete)';
      default: return activityLevel || 'Not specified';
    }
  };

  const userMessageContent = `User Profile:
    - Age: ${formattedUser.age || 'Not provided'}
    - Gender: ${formattedUser.gender}
    - Height: ${formattedUser.heightCm} cm
    - Weight: ${formattedUser.weightKg} kg
    - Activity Level: ${getActivityDescription(formattedUser.activityLevel)}
    - Primary Goal: ${formattedUser.goal}
    - Dietary Preferences/Restrictions: ${formattedUser.dietPreferences}
    - Fitness/Nutrition Experience: ${formattedUser.experienceLevel || 'Not specified'}`;

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
