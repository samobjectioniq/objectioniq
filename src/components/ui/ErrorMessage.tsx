import { AlertCircle, RefreshCw, Wifi, Mic, Settings, HelpCircle } from 'lucide-react';

interface ErrorMessageProps {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  errorCode?: string;
  suggestions?: string[];
  onRetry?: () => void;
  onHelp?: () => void;
  showRetry?: boolean;
}

const errorTypes = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-600'
  },
  info: {
    icon: HelpCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600'
  }
};

const commonErrorSuggestions = {
  'NETWORK_ERROR': [
    'Check your internet connection',
    'Try refreshing the page',
    'Contact support if the issue persists'
  ],
  'MICROPHONE_PERMISSION': [
    'Allow microphone access in your browser',
    'Check browser settings for microphone permissions',
    'Try using a different browser (Chrome recommended)'
  ],
  'VOICE_RECOGNITION': [
    'Use Chrome, Edge, or Safari for best compatibility',
    'Ensure microphone is working in other applications',
    'Try refreshing the page and granting permissions again'
  ],
  'AI_SERVICE': [
    'Our AI service is temporarily unavailable',
    'Try again in a few minutes',
    'Contact support if the issue continues'
  ],
  'SESSION_EXPIRED': [
    'Your session has expired',
    'Please sign in again to continue',
    'Your progress has been saved'
  ]
};

export default function ErrorMessage({ 
  title, 
  message, 
  type = 'error',
  errorCode,
  suggestions,
  onRetry,
  onHelp,
  showRetry = true
}: ErrorMessageProps) {
  const errorStyle = errorTypes[type];
  const Icon = errorStyle.icon;
  
  // Get suggestions based on error code or use provided suggestions
  const errorSuggestions = suggestions || 
    (errorCode ? commonErrorSuggestions[errorCode as keyof typeof commonErrorSuggestions] : []);

  return (
    <div className={`${errorStyle.bgColor} border ${errorStyle.borderColor} rounded-xl p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${errorStyle.iconColor} flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${errorStyle.textColor} mb-2`}>
            {title}
          </h3>
          
          <p className={`${errorStyle.textColor} mb-4 leading-relaxed`}>
            {message}
          </p>

          {/* Error Code */}
          {errorCode && (
            <div className="mb-4">
              <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-mono">
                {errorCode}
              </code>
            </div>
          )}

          {/* Suggestions */}
          {errorSuggestions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Try these solutions:</h4>
              <ul className="space-y-1">
                {errorSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            {onHelp && (
              <button
                onClick={onHelp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <HelpCircle className="w-4 h-4" />
                Get Help
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions for Common Errors */}
      {errorCode === 'MICROPHONE_PERMISSION' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">Quick actions:</span>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Page
            </button>
            <button
              onClick={() => window.open('/training', '_blank')}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline"
            >
              <Settings className="w-3 h-3" />
              Open in New Tab
            </button>
          </div>
        </div>
      )}

      {errorCode === 'NETWORK_ERROR' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">Network status:</span>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Checking connection...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 