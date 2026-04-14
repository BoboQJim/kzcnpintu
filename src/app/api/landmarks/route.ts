import { NextRequest, NextResponse } from 'next/server';
import { generateLandmarkImage, getLandmarks } from '@/lib/landmarks';

export async function GET() {
  try {
    const landmarks = getLandmarks();
    return NextResponse.json({ landmarks });
  } catch (error) {
    console.error('Error getting landmarks:', error);
    return NextResponse.json({ error: 'Failed to get landmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { province, name } = body;
    
    if (!province || !name) {
      return NextResponse.json({ error: 'Missing province or name' }, { status: 400 });
    }
    
    const imageUrl = await generateLandmarkImage(province, name);
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
