import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/servers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const servers = await response.json();
    
    return NextResponse.json(servers);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách servers:', error);
    return NextResponse.json(
      { 
        error: 'Không thể lấy danh sách servers', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 