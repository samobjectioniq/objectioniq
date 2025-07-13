'use client';

import { useState } from 'react';
import { Lightbulb, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, MessageSquare, Users } from 'lucide-react';

interface CoachingRecommendationsProps {
  recommendations: any[];
}

export default function CoachingRecommendations({ recommendations }: CoachingRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: Lightbulb },
    { id: 'success_rate', label: 'Success Rate', icon: TrendingUp },
    { id: 'objections', label: 'Objection Handling', icon: MessageSquare },
    { id: 'practice', label: 'Practice', icon: Users }
  ];

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Clock;
      case 'low':
        return CheckCircle;
      default:
        return Lightbulb;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success_rate':
        return TrendingUp;
      case 'objections':
        return MessageSquare;
      case 'practice':
        return Users;
      default:
        return Target;
    }
  };

  const generateAdditionalRecommendations = () => {
    const additional = [];
    
    // Add personalized recommendations based on common patterns
    additional.push({
      id: 'personal_1',
      type: 'practice',
      title: 'Focus on Active Listening',
      description: 'Your responses could be more tailored. Practice active listening techniques to better understand customer needs.',
      priority: 'medium',
      action: 'Practice with Sarah persona and focus on asking clarifying questions',
      category: 'Communication Skills'
    });

    additional.push({
      id: 'personal_2',
      type: 'objections',
      title: 'Price Objection Mastery',
      description: 'Price objections are common. Develop specific value propositions for different customer segments.',
      priority: 'high',
      action: 'Create a value proposition template for each persona type',
      category: 'Sales Techniques'
    });

    additional.push({
      id: 'personal_3',
      type: 'success_rate',
      title: 'Build Rapport Faster',
      description: 'Stronger initial rapport leads to higher success rates. Focus on the first 30 seconds of each call.',
      priority: 'medium',
      action: 'Practice opening statements with each persona',
      category: 'Relationship Building'
    });

    return additional;
  };

  const allRecommendations = [...recommendations, ...generateAdditionalRecommendations()];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Coaching Recommendations</h2>
        <div className="text-sm text-gray-600">
          {allRecommendations.length} recommendations available
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map((recommendation) => {
          const PriorityIcon = getPriorityIcon(recommendation.priority);
          const TypeIcon = getTypeIcon(recommendation.type);
          
          return (
            <div
              key={recommendation.id}
              className={`border rounded-lg p-6 ${getPriorityColor(recommendation.priority)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <TypeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityIcon className={`w-4 h-4 ${
                        recommendation.priority === 'high' ? 'text-red-500' :
                        recommendation.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {recommendation.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {recommendation.description}
              </p>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Recommended Action</h4>
                    <p className="text-sm text-gray-600">{recommendation.action}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {recommendation.category || 'General'}
                </span>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                  Start Practice →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
          <p className="text-gray-600 mb-4">
            Complete more training sessions to receive personalized coaching recommendations.
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Start a new session
          </button>
        </div>
      )}

      {/* Coaching Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Pro Tips for Insurance Agents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Build Trust First</h4>
            <p className="text-sm text-gray-600">
              Always start by understanding the customer&apos;s current situation before discussing products.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Address Concerns Proactively</h4>
            <p className="text-sm text-gray-600">
              Anticipate common objections and address them before they become barriers to the sale.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Use Stories and Examples</h4>
            <p className="text-sm text-gray-600">
              Share relevant customer success stories to make benefits more tangible and relatable.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Practice Active Listening</h4>
            <p className="text-sm text-gray-600">
              Listen for emotional cues and underlying concerns that may not be explicitly stated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 