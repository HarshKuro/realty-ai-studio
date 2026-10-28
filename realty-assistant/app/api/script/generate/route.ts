import { NextRequest, NextResponse } from 'next/server';
import { PropertySchema } from '@/lib/validation/property';
import { generateFactualScript } from '@/lib/story/scriptGenerator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedProperty = PropertySchema.safeParse(body.property);

    if (!parsedProperty.success) {
      return NextResponse.json(
        { error: 'Invalid property specifications', details: parsedProperty.error.format() },
        { status: 400 }
      );
    }

    const sceneCount = Number(body.sceneCount) || 5;
    const script = generateFactualScript(parsedProperty.data, sceneCount);

    return NextResponse.json({ success: true, script });
  } catch (error: any) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate factual script' },
      { status: 500 }
    );
  }
}
