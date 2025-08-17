import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_DATA_KEY = '@onboardingData';

export interface OnboardingData {
  dateOfBirth: string | null;
  height: { value: string; unit: string } | null;
  weight: { value: string; unit: string } | null;
  gender: string | null;
  activityLevel: string | null;
  isOnboardingComplete?: boolean;
  source: string | null;
  experience: string | null;
  calorieAppsExperience: string | null;
  goal: string | null;
  diet: string | null;
  accomplishments: string[] | null;
  obstacles: string[] | null;
}

const defaultState: OnboardingData = {
  dateOfBirth: null,
  height: null,
  weight: null,
  gender: null,
  activityLevel: null,
  isOnboardingComplete: false,
  source: null,
  experience: null,
  calorieAppsExperience: null,
  goal: null,
  diet: null,
  accomplishments: null,
  obstacles: null,
};

interface OnboardingContextType {
  onboardingData: OnboardingData;
  setDateOfBirth: (date: string | null) => void;
  setHeight: (height: { value: string; unit: string } | null) => void;
  setWeight: (weight: { value: string; unit: string } | null) => void;
  setGender: (gender: string | null) => void;
  setActivityLevel: (activityLevel: string | null) => void;
  setIsOnboardingComplete: (isComplete: boolean) => void;
  setSource: (source: string | null) => void;
  setExperience: (experience: string | null) => void;
  setCalorieAppsExperience: (calorieAppsExperience: string | null) => void;
  setGoal: (goal: string | null) => void;
  setDiet: (diet: string | null) => void;
  setAccomplishments: (accomplishments: string[] | null) => void;
  setObstacles: (obstacles: string[] | null) => void;
  isLoading: boolean;
}

const defaultContextValue: OnboardingContextType = {
  onboardingData: defaultState,
  setDateOfBirth: () => { console.warn('setDateOfBirth called before provider setup'); },
  setHeight: () => { console.warn('setHeight called before provider setup'); },
  setWeight: () => { console.warn('setWeight called before provider setup'); },
  setGender: () => { console.warn('setGender called before provider setup'); },
  setActivityLevel: () => { console.warn('setActivityLevel called before provider setup'); },
  setIsOnboardingComplete: () => { console.warn('setIsOnboardingComplete called before provider setup'); },
  setSource: () => { console.warn('setSource called before provider setup'); },
  setExperience: () => { console.warn('setExperience called before provider setup'); },
  setCalorieAppsExperience: () => { console.warn('setCalorieAppsExperience called before provider setup'); },
  setGoal: () => { console.warn('setGoal called before provider setup'); },
  setDiet: () => { console.warn('setDiet called before provider setup'); },
  setAccomplishments: () => { console.warn('setAccomplishments called before provider setup'); },
  setObstacles: () => { console.warn('setObstacles called before provider setup'); },
  isLoading: true,
};

export const OnboardingContext = createContext<OnboardingContextType>(defaultContextValue);

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log('[OnboardingContext] Attempting to load data from AsyncStorage...');
      try {
        const storedData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
        console.log('[OnboardingContext] Raw storedData from AsyncStorage:', storedData);
        if (storedData) {
          const parsedData = JSON.parse(storedData) as Partial<OnboardingData>;
          console.log('[OnboardingContext] Parsed data from AsyncStorage:', parsedData);
          setOnboardingData(prev => ({ ...defaultState, ...prev, ...parsedData }));
        } else {
          console.log('[OnboardingContext] No data found in AsyncStorage, using default state.');
          setOnboardingData(defaultState);
        }
      } catch (error) {
        console.error('[OnboardingContext] Failed to load onboarding data from AsyncStorage', error);
        setOnboardingData(defaultState);
      } finally {
        setIsLoading(false);
        console.log('[OnboardingContext] Loading finished. isLoading set to false.');
      }
    };
    loadData();
  }, []);

  const updateAndSaveData = async (partialData: Partial<OnboardingData>) => {
    let finalDataToSave: OnboardingData | null = null;
    setOnboardingData(prevData => {
      const newData = { ...prevData, ...partialData };
      finalDataToSave = newData;
      console.log('[OnboardingContext] Updating state with partial data:', partialData, 'New state:', newData);
      return newData;
    });

    if (finalDataToSave) {
      try {
        console.log('[OnboardingContext] Attempting to save data to AsyncStorage:', finalDataToSave);
        await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(finalDataToSave));
        console.log('[OnboardingContext] Data saved successfully to AsyncStorage.');
      } catch (error) {
        console.error('[OnboardingContext] Failed to save onboarding data to AsyncStorage', error);
      }
    }
  };

  const setDateOfBirth = (date: string | null) => updateAndSaveData({ dateOfBirth: date });
  const setHeight = (height: { value: string; unit: string } | null) => updateAndSaveData({ height });
  const setWeight = (weight: { value: string; unit: string } | null) => updateAndSaveData({ weight });
  const setIsOnboardingComplete = (isComplete: boolean) => updateAndSaveData({ isOnboardingComplete: isComplete });
  const setSource = (source: string | null) => updateAndSaveData({ source });
  const setExperience = (experience: string | null) => updateAndSaveData({ experience });
  const setCalorieAppsExperience = (calorieAppsExperience: string | null) => updateAndSaveData({ calorieAppsExperience });
  const setGoal = (goal: string | null) => updateAndSaveData({ goal });
  const setDiet = (diet: string | null) => updateAndSaveData({ diet });
  const setAccomplishments = (accomplishments: string[] | null) => updateAndSaveData({ accomplishments });
  const setObstacles = (obstacles: string[] | null) => updateAndSaveData({ obstacles });
  const setGender = (gender: string | null) => updateAndSaveData({ gender });
  const setActivityLevel = (activityLevel: string | null) => updateAndSaveData({ activityLevel });

  console.log('[OnboardingContext] Current context value:', { onboardingData, isLoading });

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        setDateOfBirth,
        setHeight,
        setWeight,
        setGender,
        setActivityLevel,
        setIsOnboardingComplete,
        setSource,
        setExperience,
        setCalorieAppsExperience,
        setGoal,
        setDiet,
        setAccomplishments,
        setObstacles,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
