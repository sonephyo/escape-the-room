import { GenerateContentRequest, GoogleGenerativeAI, Part } from '@google/generative-ai';
import { puzzlePrompt } from './puzzlePrompt';
import { Character } from '@/types/types';

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}
const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(geminiApiKey);

async function generatePuzzle(puzzlePrompt: string | GenerateContentRequest | (string | Part)[]) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(puzzlePrompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating puzzle:', error);
    throw error;
  }
}

export async function getPuzzle(data: Character[]): Promise<Character[]> {
  try {
    const tasks = data.map(() => generatePuzzle(puzzlePrompt));
    const results = await Promise.all(tasks);

    const updatedData = data.map((character, index) => ({
      ...character,
      puzzle: results[index].Puzzle
    }));

    return updatedData;
  } catch (error) {
    console.error('Error in getPuzzle:', error);
    throw error;
  }
}