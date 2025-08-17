import { useRouter, useSegments } from 'expo-router';
import { 
  ONBOARDING_PAGE_MAP, 
  TOTAL_ONBOARDING_PAGES,
  getPageNumber,
  getScreenName 
} from './onboardingConfig';

/**
 * Get the current page number based on the current route
 */
export function useCurrentPageNumber(): number {
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1] || '';
  
  // Get page number from screen name
  const pageNumber = getPageNumber(currentScreen);
  
  return pageNumber || 1; // Default to page 1 if not found
}

/**
 * Navigate to the next page in the onboarding flow
 */
export function useGoToNextPage() {
  const router = useRouter();
  const currentPageNumber = useCurrentPageNumber();
  
  return () => {
    const nextPageNumber = currentPageNumber + 1;
    
    // Check if we've reached the end
    if (nextPageNumber > TOTAL_ONBOARDING_PAGES) {
      // We've finished onboarding - this shouldn't happen as paywall handles dashboard navigation
      console.warn('Attempted to navigate past the last onboarding page');
      return;
    }
    
    const nextScreenName = getScreenName(nextPageNumber);
    
    if (nextScreenName) {
      router.push(`/(onboarding)/${nextScreenName}`);
    } else {
      console.error(`No screen mapped for page ${nextPageNumber}`);
    }
  };
}

/**
 * Navigate to the previous page in the onboarding flow
 */
export function useGoToPreviousPage() {
  const router = useRouter();
  const currentPageNumber = useCurrentPageNumber();
  
  return () => {
    const previousPageNumber = currentPageNumber - 1;
    
    // Check if we're at the beginning
    if (previousPageNumber < 1) {
      // Go back to wherever onboarding was started from
      router.back();
      return;
    }
    
    const previousScreenName = getScreenName(previousPageNumber);
    
    if (previousScreenName) {
      router.push(`/(onboarding)/${previousScreenName}`);
    } else {
      console.error(`No screen mapped for page ${previousPageNumber}`);
    }
  };
}

/**
 * Navigate to a specific page number
 */
export function useGoToPage() {
  const router = useRouter();
  
  return (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > TOTAL_ONBOARDING_PAGES) {
      console.error(`Invalid page number: ${pageNumber}`);
      return;
    }
    
    const screenName = getScreenName(pageNumber);
    
    if (screenName) {
      router.push(`/(onboarding)/${screenName}`);
    } else {
      console.error(`No screen mapped for page ${pageNumber}`);
    }
  };
}

/**
 * Calculate the current progress percentage
 */
export function useProgressPercentage(): number {
  const currentPageNumber = useCurrentPageNumber();
  
  // Calculate progress (0-100%)
  const progress = (currentPageNumber / TOTAL_ONBOARDING_PAGES) * 100;
  
  return Math.round(progress);
}

/**
 * Get information about the current page
 */
export function usePageInfo() {
  const currentPageNumber = useCurrentPageNumber();
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1] || '';
  
  return {
    pageNumber: currentPageNumber,
    screenName: currentScreen,
    totalPages: TOTAL_ONBOARDING_PAGES,
    isFirstPage: currentPageNumber === 1,
    isLastPage: currentPageNumber === TOTAL_ONBOARDING_PAGES,
    progressPercentage: useProgressPercentage(),
  };
} 