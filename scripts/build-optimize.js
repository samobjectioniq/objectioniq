#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running build optimizations...');

// Check for required environment variables
const requiredEnvVars = [
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:', missingVars.join(', '));
  console.warn('   Some features may not work properly in production.');
} else {
  console.log('✅ All required environment variables are set');
}

// Validate build output
const buildDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Check bundle sizes
const staticDir = path.join(buildDir, 'static');
if (fs.existsSync(staticDir)) {
  const jsFiles = fs.readdirSync(staticDir)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(staticDir, file);
      const stats = fs.statSync(filePath);
      return { name: file, size: stats.size };
    })
    .sort((a, b) => b.size - a.size);

  console.log('\n📦 Bundle size analysis:');
  jsFiles.slice(0, 5).forEach(file => {
    const sizeInKB = (file.size / 1024).toFixed(2);
    console.log(`   ${file.name}: ${sizeInKB} KB`);
  });

  const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`   Total: ${totalSizeInMB} MB`);

  if (totalSize > 5 * 1024 * 1024) { // 5MB
    console.warn('⚠️  Warning: Bundle size is large. Consider code splitting.');
  }
}

// Check for common issues
const issues = [];

// Check if Supabase is configured
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  issues.push('Supabase URL not configured - authentication will not work');
}

// Check if Anthropic API is configured
if (!process.env.ANTHROPIC_API_KEY) {
  issues.push('Anthropic API key not configured - AI features will not work');
}

// Check for development dependencies in production
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const devDeps = Object.keys(packageJson.devDependencies || {});
const prodDeps = Object.keys(packageJson.dependencies || {});

const suspiciousDeps = devDeps.filter(dep => 
  ['@types/', 'eslint', 'prettier', 'jest', 'cypress'].some(pattern => 
    dep.includes(pattern)
  )
);

if (suspiciousDeps.length > 0) {
  issues.push(`Development dependencies found in production: ${suspiciousDeps.join(', ')}`);
}

// Report issues
if (issues.length > 0) {
  console.log('\n⚠️  Potential issues found:');
  issues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('\n✅ No issues found');
}

console.log('\n🚀 Build optimization complete!');
console.log('   Your app is ready for production deployment.');

// Generate deployment report
const report = {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
  hasSupabaseConfig: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  issues: issues,
  bundleSize: jsFiles ? jsFiles.map(f => ({ name: f.name, size: f.size })) : null
};

fs.writeFileSync(
  path.join(process.cwd(), 'build-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('📊 Build report saved to build-report.json'); 