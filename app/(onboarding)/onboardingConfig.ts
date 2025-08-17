/**
 * Onboarding Configuration
 * 
 * This file controls the order and mapping of onboarding pages.
 * To change the order, simply change the number assignments.
 * The progress bar will automatically adjust based on total pages.
 */

export const ONBOARDING_PAGE_MAP = {
  1: 'step_lasting_results',
  2: 'step_seh_ai_comparison',
  3: 'step_desired_weight',
  4: 'step1_calorie_apps',
  5: 'step_date_of_birth',
  6: 'step_height_weight',
  7: 'step2_experience',
  8: 'step3_source',
  9: 'step4_workouts',
  10: 'step5_gender',
  11: 'step6_goal',
  12: 'step_activity_level',
  13: 'step7_diet',
  14: 'step8_accomplishments',
  15: 'step9_obstacles',
  16: 'calculating_plan',
  17: 'plan_results',
  18: 'paywall', // Always last - navigates to dashboard
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