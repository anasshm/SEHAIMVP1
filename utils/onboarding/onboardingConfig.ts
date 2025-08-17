/**
 * Onboarding Configuration
 * 
 * This file controls the order and mapping of onboarding pages.
 * To change the order, simply change the number assignments.
 * The progress bar will automatically adjust based on total pages.
 */

export const ONBOARDING_PAGE_MAP = {
  1: 'step5_gender',                // Gender selection
  2: 'step4_workouts',              // Workout frequency per week
  3: 'step1_calorie_apps',          // Have tried other calorie tracking apps
  4: 'step_lasting_results',        // Long term/lasting results
  5: 'step_height_weight',          // Height and weight
  6: 'step_date_of_birth',          // Birthday
  7: 'step6_goal',                  // What is your goal (losing weight/maintaining...)
  8: 'step_desired_weight',         // Desired weight (horizontal ruler)
  9: 'step_seh_ai_comparison',      // Lose twice with Seh AI (comparison page)
  10: 'step9_obstacles',            // What's stopping you (obstacles)
  11: 'step7_diet',                 // Diet type (classic, vegan...)
  12: 'step8_accomplishments',      // What would you like to accomplish
  13: 'calculating_plan',           // Plan customization/calculation
  14: 'plan_results',               // Results of calculation
  15: 'paywall',                    // Paywall - always goes to dashboard
} as const;

// Automatically calculate total pages
export const TOTAL_ONBOARDING_PAGES = Object.keys(ONBOARDING_PAGE_MAP).length;

// Create reverse mapping (screen name -> page number)
export const PAGE_NAME_TO_NUMBER = Object.entries(ONBOARDING_PAGE_MAP).reduce(
  (acc, [pageNum, screenName]) => {
    acc[screenName] = parseInt(pageNum);
    return acc;
  },
  {} as Record<string, number>
);

// Type for page numbers
export type PageNumber = keyof typeof ONBOARDING_PAGE_MAP;

// Type for screen names
export type ScreenName = typeof ONBOARDING_PAGE_MAP[PageNumber];

// Helper to get screen name from page number
export function getScreenName(pageNumber: number): ScreenName | null {
  return ONBOARDING_PAGE_MAP[pageNumber as PageNumber] || null;
}

// Helper to get page number from screen name
export function getPageNumber(screenName: string): number | null {
  return PAGE_NAME_TO_NUMBER[screenName] || null;
} 