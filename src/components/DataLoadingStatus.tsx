import React from 'react';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface DataLoadingStatusProps {
  loadingStates: Record<string, any>;
  errors: Record<string, string>;
  onRetry?: () => void;
  className?: string;
}

const DataLoadingStatus: React.FC<DataLoadingStatusProps> = ({
  loadingStates,
  errors,
  onRetry,
  className = ''
}) => {
  const isLoading = Object.values(loadingStates).some((state: any) => state?.isLoading);
  const hasErrors = Object.keys(errors).length > 0;
  const isLoaded = Object.values(loadingStates).some((state: any) => state?.isLoaded);

  if (!isLoading && !hasErrors && !isLoaded) {
    return null; // Don't show anything if no data is being loaded
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-gray-900/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Data Status</h3>
          {onRetry && hasErrors && (
            <button
              onClick={onRetry}
              className="p-1 hover:bg-gray-700/50 rounded transition-colors"
              title="Retry loading"
            >
              <RefreshCw size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Loading States */}
        {isLoading && (
          <div className="space-y-2 mb-3">
            {Object.entries(loadingStates).map(([key, state]: [string, any]) => {
              if (!state?.isLoading) return null;
              
              return (
                <div key={key} className="flex items-center space-x-2">
                  <Loader2 size={14} className="text-blue-400 animate-spin" />
                  <span className="text-xs text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error States */}
        {hasErrors && (
          <div className="space-y-2 mb-3">
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} className="flex items-start space-x-2">
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-red-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-400 truncate" title={error}>
                    {error}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success States */}
        {isLoaded && !isLoading && !hasErrors && (
          <div className="flex items-center space-x-2">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-green-300">All data loaded successfully</span>
          </div>
        )}

        {/* Summary */}
        <div className="pt-2 border-t border-gray-700/50">
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              {Object.values(loadingStates).filter((state: any) => state?.isLoaded).length} loaded
            </span>
            <span>
              {Object.values(loadingStates).filter((state: any) => state?.isLoading).length} loading
            </span>
            <span>
              {Object.keys(errors).length} errors
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataLoadingStatus;
