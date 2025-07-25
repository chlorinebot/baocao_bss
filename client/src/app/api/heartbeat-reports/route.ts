import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Token not found' },
        { status: 401 }
      );
    }

    try {
      console.log('🚀 Forwarding PostgreHeartbeat data to backend:', JSON.stringify(body, null, 2));
      
      const response = await fetch(`${BACKEND_URL}/heartbeat-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Backend error:', errorData);
        } catch (parseError) {
          const errorText = await response.text();
          console.error('❌ Backend error text:', errorText);
          errorData = { message: errorText || 'Failed to create heartbeat report' };
        }
        return NextResponse.json(
          { error: errorData.message || 'Failed to create heartbeat report' },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('✅ Backend response data:', data);
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('❌ Network error to backend:', fetchError);
      return NextResponse.json(
        { error: `Không thể kết nối đến backend: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('❌ Internal server error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Token not found' },
        { status: 401 }
      );
    }

    // Lấy query parameters
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    
    let url = `${BACKEND_URL}/heartbeat-reports`;
    if (reportId) {
      url += `/by-report/${reportId}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          errorData = { message: errorText || 'Failed to fetch heartbeat reports' };
        }
        return NextResponse.json(
          { error: errorData.message || 'Failed to fetch heartbeat reports' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
      
    } catch (fetchError) {
      return NextResponse.json(
        { error: `Không thể kết nối đến backend: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 