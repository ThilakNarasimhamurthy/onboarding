import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ 
    message: 'POST method working',
    received: body,
    timestamp: new Date().toISOString()
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ 
    message: 'PUT method working',
    received: body,
    timestamp: new Date().toISOString()
  });
}

export async function DELETE() {
  return NextResponse.json({ 
    message: 'DELETE method working',
    timestamp: new Date().toISOString()
  });
}