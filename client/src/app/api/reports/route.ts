import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function HEAD(request: NextRequest) {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

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
    // Lấy id_user từ userInfo localStorage (nếu có)
    let id_user = null;
    try {
      const userInfoStr = request.cookies.get('userInfo')?.value;
      if (userInfoStr) {
        const userInfo = JSON.parse(decodeURIComponent(userInfoStr));
        id_user = userInfo.id;
      }
    } catch (e) {}
    if (!id_user) {
      // fallback: lấy từ body hoặc báo lỗi
      id_user = body.id_user;
    }
    if (!id_user) {
      return NextResponse.json(
        { error: 'Không xác định được user. Vui lòng đăng nhập lại.' },
        { status: 400 }
      );
    }
    const content = body.content || '';
    try {
      const response = await fetch(`${BACKEND_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_user, content }),
      });
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          errorData = { message: errorText || 'Failed to create report' };
        }
        return NextResponse.json(
          { error: errorData.message || 'Failed to create report' },
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
    const userId = searchParams.get('user_id');
    
    let url = `${BACKEND_URL}/reports`;
    if (userId) {
      url += `?user_id=${userId}`;
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
          errorData = { message: errorText || 'Failed to fetch reports' };
        }
        return NextResponse.json(
          { error: errorData.message || 'Failed to fetch reports' },
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