import Constants from "expo-constants";
import * as FileSystem from 'expo-file-system';

// Access the API key from environment variables via Constants
const OPENAI_KEY = Constants.expoConfig?.extra?.openaiApiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// --- Original Simple Interface (the function will now return this again) ---
export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

// --- Internal Interfaces for parsing the detailed API response ---
interface NutriLensItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

interface NutriLensTotal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

interface NutriLensResult {
  meal_name: string;
  items: NutriLensItem[];
  total: NutriLensTotal;
  notes: string;
}

// --- Updated function returning the ORIGINAL simple format ---
export async function analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResult> {
  try {
    // Convert image to base64 (same as before)
    let base64Image = imageUri;
    if (imageUri.startsWith('file://')) {
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    if (!base64Image.startsWith('data:image')) {
      base64Image = `data:image/jpeg;base64,${base64Image}`;
    }
    
    // Define the detailed NutriLens prompts (same as previous edit)
    const systemPrompt = `You are “NutriLens,” a certified dietitian using ONLY the supplied image plus your general world knowledge. Your job: Output precise nutrition data in clean JSON.\n\nINTERNAL_SCRATCHPAD (do NOT reveal):\n1. Identify every distinct food item.\n2. Infer primary ingredients of each item.\n3. Estimate portion size for every item (metric units).\n4. Lookup or derive kcal, protein g, carbs g, fat g per portion.\n5. Add totals for the whole plate.\n6. Assign a confidence score (0-100 %) to each item and to the meal total.\n7. Keep your reasoning here—never expose it.\n\nReturn ONLY the JSON below (no text outside the braces):\n\n{\n  "meal_name": "<concise meal label>",\n  "items": [\n    {\n      "name": "<item 1>",\n      "portion": "<metric quantity>",\n      "calories": <number>,\n      "protein": <number>,\n      "carbs": <number>,\n      "fat": <number>,\n      "confidence": <percent>\n    }\n    // …repeat for each visible item\n  ],\n  "total": {\n    "calories": <number>,\n    "protein": <number>,\n    "carbs": <number>,\n    "fat": <number>,\n    "confidence": <percent>\n  },\n  "notes": "Key visual clues (plate size, garnish, cooking method) + major assumptions."\n}`;    
    const userPromptText = `Analyse the attached meal photo. If uncertain about an item, label it “unknown” with 0 values and ≤40 % confidence.`;

    // Make the API call (same as previous edit)
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1000, 
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              { type: "text", text: userPromptText },
              { type: "image_url", image_url: { url: base64Image, detail: "high" } }
            ]
          }
        ],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI error ${res.status}: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await res.json();
    const contentString = data.choices?.[0]?.message?.content ?? "{}";
    
    try {
      // Parse the DETAILED response using internal interface
      const parsedContent: NutriLensResult = JSON.parse(contentString);
      
      // --- Extraction Step --- 
      // Extract the necessary fields from the detailed response
      const name = parsedContent.meal_name || "Unknown Food";
      const calories = parsedContent.total?.calories ?? 0;
      const protein = parsedContent.total?.protein ?? 0;
      const carbs = parsedContent.total?.carbs ?? 0;
      const fat = parsedContent.total?.fat ?? 0;
      const description = parsedContent.notes || "No analysis notes provided."; // Use notes as description

      // Construct and return the ORIGINAL SIMPLE format
      return {
        name: name,
        calories: Number(calories) || 0, // Ensure numbers
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        description: description
      };

    } catch (parseError) {
      console.error('Error parsing NutriLens OpenAI response:', parseError, contentString);
      // Throw an error so the calling function can handle it appropriately (e.g., show an alert and navigate back)
      throw new Error(`Failed to parse OpenAI response. Content: ${contentString}`);
    }
  } catch (error) {
    console.error('Error in analyzeFoodImage:', error);
     // Return a default error structure matching the SIMPLE format
     return {
        name: "Analysis Error",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        description: error instanceof Error ? error.message : String(error)
      };
  }
}
