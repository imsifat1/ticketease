'use server';

/**
 * @fileOverview AI-powered route suggestion flow.
 *
 * - suggestAlternativeRoutes - A function that suggests alternative bus routes based on traffic, weather, and user preferences.
 * - RouteSuggestionInput - The input type for the suggestAlternativeRoutes function.
 * - RouteSuggestionOutput - The return type for the suggestAlternativeRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RouteSuggestionInputSchema = z.object({
  origin: z.string().describe('The origin location for the bus route.'),
  destination: z.string().describe('The destination location for the bus route.'),
  departureDate: z.string().describe('The departure date for the bus route (YYYY-MM-DD).'),
  departureTime: z.string().describe('The departure time for the bus route (HH:MM).'),
  trafficConditions: z.string().describe('Real-time traffic conditions for the route.'),
  weatherConditions: z.string().describe('Current weather conditions for the route.'),
  userPreferences: z
    .string()
    .describe(
      'User preferences such as preferred travel time, number of transfers, and cost.'
    ),
});
export type RouteSuggestionInput = z.infer<typeof RouteSuggestionInputSchema>;

const RouteSuggestionOutputSchema = z.object({
  alternativeRoutes: z
    .array(z.string())
    .describe('A list of alternative bus routes with details.'),
  reasoning: z.string().describe('The reasoning behind the suggested routes.'),
  shouldSuggestAlternatives: z
    .boolean()
    .describe('Whether alternative routes should be suggested based on the input.'),
});
export type RouteSuggestionOutput = z.infer<typeof RouteSuggestionOutputSchema>;

export async function suggestAlternativeRoutes(
  input: RouteSuggestionInput
): Promise<RouteSuggestionOutput> {
  return routeSuggestionFlow(input);
}

const routeSuggestionPrompt = ai.definePrompt({
  name: 'routeSuggestionPrompt',
  input: {schema: RouteSuggestionInputSchema},
  output: {schema: RouteSuggestionOutputSchema},
  prompt: `You are a helpful AI assistant that suggests alternative bus routes based on real-time traffic, weather conditions, and user preferences.

Given the following information:

Origin: {{{origin}}}
Destination: {{{destination}}}
Departure Date: {{{departureDate}}}
Departure Time: {{{departureTime}}}
Traffic Conditions: {{{trafficConditions}}}
Weather Conditions: {{{weatherConditions}}}
User Preferences: {{{userPreferences}}}

Consider the traffic and weather conditions to determine if the current route is optimal. Also, consider the user's preferences for travel time, the number of transfers, and cost.

Based on this information, determine whether you should suggest alternative routes or not. Set the shouldSuggestAlternatives field accordingly.

If you should suggest alternative routes, provide a list of alternative bus routes with details. If not, leave the alternativeRoutes field empty and explain the reasoning why no alternative routes are suggested.

Reasoning: Explain your reasoning for suggesting or not suggesting alternative routes.
Alternative Routes: A list of suggested alternative routes, including route details, estimated travel time, and cost.
ShouldSuggestAlternatives: Whether alternative routes should be suggested based on the input.`,
});

const routeSuggestionFlow = ai.defineFlow(
  {
    name: 'routeSuggestionFlow',
    inputSchema: RouteSuggestionInputSchema,
    outputSchema: RouteSuggestionOutputSchema,
  },
  async input => {
    const {output} = await routeSuggestionPrompt(input);
    return output!;
  }
);
