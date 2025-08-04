import { NextRequest, NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    openai: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    supabase: {
      status: 'healthy' | 'unhealthy';
      error?: string;
    };
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Test OpenAI API connectivity
async function testOpenAIAPI(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        status: 'unhealthy',
        error: 'OPENAI_API_KEY not configured'
      };
    }
    
    // Test OpenAI API with a simple request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        status: 'healthy',
        responseTime
      };
    } else {
      const errorText = await response.text();
      return {
        status: 'unhealthy',
        responseTime,
        error: `OpenAI API error: ${response.status} - ${errorText}`
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'unhealthy',
      responseTime,
      error: error.message || 'Unknown error'
    };
  }
}

// Test Supabase connectivity
async function testSupabase(): Promise<{ status: 'healthy' | 'unhealthy'; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'unhealthy',
        error: 'Supabase configuration missing'
      };
    }
    
    // Simple connectivity test - try to fetch a small amount of data
    const response = await fetch(`${supabaseUrl}/rest/v1/sessions?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return {
        status: 'healthy'
      };
    } else {
      return {
        status: 'unhealthy',
        error: `Supabase error: ${response.status}`
      };
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message || 'Unknown error'
    };
  }
}

// Get memory usage
function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  const total = memUsage.heapTotal;
  const used = memUsage.heapUsed;
  const percentage = Math.round((used / total) * 100);
  
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Run health checks in parallel
    const [openaiStatus, supabaseStatus] = await Promise.all([
      testOpenAIAPI(),
      testSupabase(),
    ]);
    
    // Determine overall health
    const allHealthy = openaiStatus.status === 'healthy' && supabaseStatus.status === 'healthy';
    const anyUnhealthy = openaiStatus.status === 'unhealthy' || supabaseStatus.status === 'unhealthy';
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    
    if (allHealthy) {
      overallStatus = 'healthy';
    } else if (anyUnhealthy) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }
    
    // Build response
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        openai: openaiStatus,
        supabase: supabaseStatus,
      },
      uptime: process.uptime(),
      memory: getMemoryUsage(),
    };
    
    // Set appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error: any) {
    console.error('Health check error:', error);
    
    const errorResponse: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        openai: {
          status: 'unhealthy',
          error: 'Health check failed'
        },
        supabase: {
          status: 'unhealthy',
          error: 'Health check failed'
        },
      },
      uptime: process.uptime(),
      memory: getMemoryUsage(),
    };
    
    return NextResponse.json(errorResponse, { status: 503 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 