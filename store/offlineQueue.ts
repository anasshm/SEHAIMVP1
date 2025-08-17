import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "offlineNutritionQueue";

/**
 * Types of actions that can be queued for offline use
 */
export type QueueAction = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  id?: string;
  data?: any;
};

/**
 * Add an action to the offline queue
 * @param action The action to queue
 */
export async function addToQueue(action: QueueAction) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push(action);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(arr));
}

// Keep the original enqueue function for backward compatibility
export const enqueue = addToQueue;

/**
 * Process all queued actions
 * @param cb Callback function to process each action
 */
export async function flushQueue(cb: (a: QueueAction) => Promise<void>) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return;
  const arr = JSON.parse(raw);
  for (const act of arr) {
    await cb(act);
  }
  await AsyncStorage.removeItem(QUEUE_KEY);
}
