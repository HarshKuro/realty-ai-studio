import { NextRequest, NextResponse } from 'next/server';
import { jobTracker } from '@/server/rendering/jobTracker';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const state = jobTracker.get(jobId);

  if (!state) {
    return NextResponse.json({ error: 'Render job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, job: state });
}
