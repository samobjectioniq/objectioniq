'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Star, Award, Calendar, Clock, Users, Zap, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface Streak {
  current: number;
  longest: number;
  lastSession: Date | null;
}

interface EngagementFeaturesProps {
  onShowAchievements: () => void;
  onShowGoals: () => void;
}

export default function EngagementFeatures({ onShowAchievements, onShowGoals }: EngagementFeaturesProps) {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastSession: null });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);

  useEffect(() => {
    loadEngagementData();
    checkMotivationalMessage();
  }, [user]);

  const loadEngagementData = async () => {
    // Simulate loading engagement data
    const mockAchievements: Achievement[] = [
      {
        id: 'first-session',
        title: 'First Steps',
        description: 'Complete your first training session',
        icon: <Star className="w-5 h-5" />,
        unlocked: true
      },
      {
        id: 'voice-master',
        title: 'Voice Master',
        description: 'Complete 10 voice training sessions',
        icon: <Mic className="w-5 h-5" />,
        unlocked: false,
        progress: 7,
        maxProgress: 10
      },
      {
        id: 'objection-handler',
        title: 'Objection Handler',
        description: 'Handle 50 objections successfully',
        icon: <Target className="w-5 h-5" />,
        unlocked: false,
        progress: 23,
        maxProgress: 50
      },
      {
        id: 'streak-champion',
        title: 'Streak Champion',
        description: 'Maintain a 7-day training streak',
        icon: <TrendingUp className="w-5 h-5" />,
        unlocked: false,
        progress: 3,
        maxProgress: 7
      }
    ];

    setAchievements(mockAchievements);
    setStreak({ current: 3, longest: 5, lastSession: new Date() });
  };

  const checkMotivationalMessage = () => {
    const hour = new Date().getHours();
    const messages = [
      "Ready to crush today's training goals? 💪",
      "Your future self will thank you for this practice! 🎯",
      "Every objection handled makes you stronger! 💪",
      "Time to level up your sales skills! 🚀"
    ];
    
    if (hour >= 9 && hour <= 17) {
      setShowMotivationalMessage(true);
      setTimeout(() => setShowMotivationalMessage(false), 5000);
    }
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to crush today's training goals? 💪",
      "Your future self will thank you for this practice! 🎯",
      "Every objection handled makes you stronger! 💪",
      "Time to level up your sales skills! 🚀"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      {/* Motivational Message */}
      {showMotivationalMessage && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl animate-slide-up">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <p className="font-medium">{getMotivationalMessage()}</p>
          </div>
        </div>
      )}

      {/* Streak Counter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Training Streak</h3>
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{streak.current}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{streak.longest}</div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </div>
        </div>

        {streak.current > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Keep it up! You&apos;re on a roll! Keep practicing to maintain your streak.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Sessions</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">47</div>
          <div className="text-sm text-gray-600">Objections</div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
          <button
            onClick={onShowAchievements}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {unlockedAchievements.slice(0, 2).map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-800">{achievement.title}</div>
                <div className="text-sm text-green-600">{achievement.description}</div>
              </div>
              <Award className="w-5 h-5 text-green-600" />
            </div>
          ))}
        </div>

        {lockedAchievements.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Next Up:</h4>
            {lockedAchievements.slice(0, 1).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-700">{achievement.title}</div>
                  <div className="text-sm text-gray-500">{achievement.description}</div>
                  {achievement.progress && achievement.maxProgress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Goal */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Today&apos;s Goal</h3>
          <Target className="w-6 h-6" />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Complete 1 training session</span>
            <span>0/1</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full w-0 transition-all duration-500" />
          </div>
        </div>
        
        <button
          onClick={onShowGoals}
          className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Set Custom Goals
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center hover:shadow-xl transition-shadow">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">Schedule Session</div>
        </button>
        
        <button className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center hover:shadow-xl transition-shadow">
          <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900">Quick Practice</div>
        </button>
      </div>
    </div>
  );
} 