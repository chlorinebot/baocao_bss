import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Lấy token từ cookie hoặc header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Token not found' },
        { status: 401 }
      );
    }

    // Gửi request đến NestJS backend
    const response = await fetch(`${BACKEND_URL}/server-metrics/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData || 'Failed to sync server metrics' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in server-metrics sync API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 