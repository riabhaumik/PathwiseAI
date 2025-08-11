import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    // Get backend URL from environment variable
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
    
    // Forward request to backend
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: context || {}
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', response.status, errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get AI response',
          error: `Backend error: ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'AI response generated successfully'
    });

  } catch (error) {
    console.error('AI chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'AI chat endpoint - use POST method' },
    { status: 405 }
  );
} 