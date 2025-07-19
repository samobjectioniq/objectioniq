import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    claude: {
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

// Test Claude API connectivity
async function testClaudeAPI(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return {
        status: 'unhealthy',
        error: 'ANTHROPIC_API_KEY not configured'
      };
    }
    
    const anthropic = new Anthropic({
      apiKey,
      timeout: 10000, // 10 second timeout for health check
    });
    
    // Make a simple test request
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: 'Say "OK"',
        },
      ],
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.content[0].type === 'text' && response.content[0].text.trim()) {
      return {
        status: 'healthy',
        responseTime
      };
    } else {
      return {
        status: 'unhealthy',
        error: 'Empty response from Claude API'
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
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return { status: 'healthy' };
    } else {
      return {
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message || 'Connection failed'
    };
  }
}

// Get memory usage
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memUsage = process.memoryUsage();
    const used = Math.round(memUsage.heapUsed / 1024 / 1024);
    const total = Math.round(memUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((used / total) * 100);
    
    return {
      used,
      total,
      percentage
    };
  }
  
  return {
    used: 0,
    total: 0,
    percentage: 0
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test all services in parallel
    const [claudeStatus, supabaseStatus] = await Promise.all([
      testClaudeAPI(),
      testSupabase()
    ]);
    
    // Determine overall health
    const allHealthy = claudeStatus.status === 'healthy' && supabaseStatus.status === 'healthy';
    const anyUnhealthy = claudeStatus.status === 'unhealthy' || supabaseStatus.status === 'unhealthy';
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (allHealthy) {
      overallStatus = 'healthy';
    } else if (anyUnhealthy) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        claude: claudeStatus,
        supabase: supabaseStatus
      },
      uptime: process.uptime(),
      memory: getMemoryUsage()
    };
    
    const responseTime = Date.now() - startTime;
    
    // Add response headers
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${responseTime}ms`,
      'X-Health-Status': overallStatus
    };
    
    // Return appropriate status code based on health
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers
    });
    
  } catch (error: any) {
    console.error('Health check error:', error);
    
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        claude: {
          status: 'unhealthy',
          error: 'Health check failed'
        },
        supabase: {
          status: 'unhealthy',
          error: 'Health check failed'
        }
      },
      uptime: process.uptime(),
      memory: getMemoryUsage()
    };
    
    return NextResponse.json(errorStatus, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
} 