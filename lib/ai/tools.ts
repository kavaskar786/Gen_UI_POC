import { tool } from "ai";
import { z } from "zod";

export const pocTools = {
  weather: tool({
    description: "Get the current weather in a location, in Fahrenheit.",
    inputSchema: z.object({
      location: z.string().describe("City and region, for example Berlin"),
    }),
    execute: async ({ location }) => {
      const temperature = Math.round(Math.random() * (90 - 32) + 32);

      return {
        location,
        temperature,
        unit: "fahrenheit",
        condition: temperature > 75 ? "warm" : "mild",
        source: "simulated",
      };
    },
  }),
  convertFahrenheitToCelsius: tool({
    description: "Convert a temperature in Fahrenheit to Celsius.",
    inputSchema: z.object({
      temperature: z.number().describe("Temperature in Fahrenheit"),
    }),
    execute: async ({ temperature }) => {
      const celsius = Math.round((temperature - 32) * (5 / 9));

      return {
        fahrenheit: temperature,
        celsius,
      };
    },
  }),
};
