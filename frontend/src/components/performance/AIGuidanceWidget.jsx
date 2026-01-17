// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * AI Guidance Widget
 * Shows real-time AI recommendations while solving problems
 */

import { useState, useEffect } from 'react';
import { usePerformanceTracker } from '../../hooks/usePerformanceTracker';

export default function AIGuidanceWidget() {
  const { getPrediction } = usePerformanceTracker();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    loadRecommendation();
  }, []);

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      const prediction = await getPrediction();
      if (prediction?.prediction?.recommendation) {
        setRecommendation(prediction.prediction.recommendation);
      }
    } catch (error) {
      console.error('Error loading recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'REVISE':
        return 'bg-orange-500';
      case 'EXPLORE':
        return 'bg-blue-500';
      case 'ADVANCE':
        return 'bg-green-500';
      case 'START':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActionEmoji = (actionType) => {
    switch (actionType) {
      case 'REVISE':
        return '🔄';
      case 'EXPLORE':
        return '🔍';
      case 'ADVANCE':
        return '🚀';
      case 'START':
        return '✨';
      default:
        return '🤖';
    }
  };

  if (!recommendation && !loading) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-purple-200 overflow-hidden">
        {/* Header */}
        <div
          className={`${getActionColor(recommendation?.action_type)} text-white px-4 py-3 cursor-pointer`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getActionEmoji(recommendation?.action_type)}</span>
              <span className="font-bold">AI Guidance</span>
            </div>
            <button className="text-white hover:text-gray-200 transition">
              {isExpanded ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : recommendation ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Action Type</div>
                  <div className="font-semibold text-gray-800">
                    {recommendation.action_type}
                  </div>
                </div>

                {recommendation.recommended_topic_name && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Recommended Topic</div>
                    <div className="font-semibold text-purple-600">
                      {recommendation.recommended_topic_name}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-500 mb-1">Guidance</div>
                  <div className="text-gray-700 text-sm">
                    {recommendation.reason}
                  </div>
                </div>

                {recommendation.mastery_distribution && (
                  <div className="bg-gray-50 rounded-lg p-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-gray-500">Weakest</div>
                        <div className="font-medium">
                          {(recommendation.mastery_distribution.weakest_mastery * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Strongest</div>
                        <div className="font-medium">
                          {(recommendation.mastery_distribution.strongest_mastery * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={loadRecommendation}
                  className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                >
                  🔄 Refresh Guidance
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No guidance available yet. Start solving problems!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
