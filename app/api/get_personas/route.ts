import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectDB();
    const characters = await db.collection('characters').find({}).toArray();
    
    const personas = {};
    
    characters.forEach((char) => {
      personas[char.name] = {
        name: char.name,
        building: char.building || 'Unknown Location',
        systemPrompt: char.description || `You are ${char.name}. Help the player with hints and guidance.`,
        avatarId: char.avatarId || 'dvp_Alinna_realisticbg_20241224',
        voiceId: char.voiceId,
        language: char.language || 'en',
        modeType: 2,
        backgroundUrl: char.backgroundUrl,
      };
    });
    
    return NextResponse.json(personas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json({ error: 'Failed to load personas' }, { status: 500 });
  }
}