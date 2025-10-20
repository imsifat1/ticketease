'use server';
/**
 * @fileOverview A flow for sending OTP via Twilio.
 *
 * - sendOtp - A function that sends an OTP to a given phone number.
 * - SendOtpInput - The input type for the sendOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Twilio } from 'twilio';

// Define the input type for the client-side usage.
export type SendOtpInput = {
  to: string;
  otp: string;
};

// This is the server action that will be called from the client.
export async function sendOtp(input: SendOtpInput): Promise<{ success: boolean; error?: string }> {
  return sendOtpFlow(input);
}


// The Genkit flow is defined here and is not exported directly.
const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    // The Zod schema is now defined directly within the flow definition.
    inputSchema: z.object({
      to: z.string().describe("The recipient's phone number in E.164 format."),
      otp: z.string().describe('The One-Time Password to send.'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
    }),
  },
  async ({ to, otp }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber || accountSid.startsWith('ACxxx')) {
      console.log('----------------------------------------------------');
      console.log('--- Twilio is in development mode. ---');
      console.log(`--- OTP for ${to}: ${otp} ---`);
      console.log('----------------------------------------------------');
      return { success: true };
    }

    const client = new Twilio(accountSid, authToken);

    try {
      await client.messages.create({
        body: `Your Shohoz Yatra verification code is: ${otp}`,
        from: twilioPhoneNumber,
        to: to,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      return { success: false, error: error.message || 'Failed to send OTP.' };
    }
  }
);
