"use server";

import { suggestAlternativeRoutes, type RouteSuggestionInput } from "@/ai/flows/route-suggestion";

export async function getAiRouteSuggestions(input: RouteSuggestionInput) {
  try {
    const result = await suggestAlternativeRoutes(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting AI route suggestions:", error);
    return { success: false, error: "Failed to get AI suggestions. Please try again." };
  }
}
