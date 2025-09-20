/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from '@/lib/mongodb';
import { getPuzzle } from '@/utils/getPuzzle';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the 'n' parameter from URL search params
    const searchParams = request.nextUrl.searchParams;
    const n = parseInt(searchParams.get('n') || '1');

    if (isNaN(n) || n <= 0) {
      return NextResponse.json(
        { error: 'Invalid parameter: n must be a positive number' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    
    // Get n random characters using MongoDB aggregation
    const documents = await db
        .collection('characters')
        .aggregate([{ $sample: { size: n } }])
        .toArray();

    // Map documents to Character[]
    const characters = documents.map((doc: any) => ({
      _id: doc._id,
      name: doc.name,
      description: doc.description,
    }));

    // Get puzzle response
    const puzzleResponse = await getPuzzle(characters);
    
    return NextResponse.json(puzzleResponse);
    
  } catch (error) {
    console.error('Error fetching random characters:', error);
    return NextResponse.json(
      { error: `Error fetching random characters` },
      { status: 500 }
    );
  }
}