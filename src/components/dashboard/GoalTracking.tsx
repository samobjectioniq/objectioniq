'use client';

import { useState } from 'react';
import { Target, Plus, Edit, Trash2, TrendingUp, Calendar, Award } from 'lucide-react';


interface GoalTrackingProps {
  goals: any[];
  onUpdate: () => void;
}

export default function GoalTracking({ goals, onUpdate }: GoalTrackingProps) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 0,
    type: 'sessions',
    deadline: '',
    description: ''
  });

  const goalTypes = [
    { id: 'sessions', label: 'Training Sessions', icon: Calendar },
    { id: 'objections', label: 'Objections Handled', icon: TrendingUp },
    { id: 'success_rate', label: 'Success Rate', icon: Award },
    { id: 'duration', label: 'Training Duration', icon: Calendar }
  ];

  const getGoalProgress = (goal: any) => {
    const progress = (goal.current / goal.target) * 100;
    return Math.min(progress, 100);
  };

  const getGoalStatus = (goal: any) => {
    const progress = getGoalProgress(goal);
    if (progress >= 100) return 'completed';
    if (progress >= 75) return 'on-track';
    if (progress >= 50) return 'in-progress';
    return 'at-risk';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'on-track':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'at-risk':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return Award;
      case 'on-track':
        return TrendingUp;
      case 'in-progress':
        return Target;
      case 'at-risk':
        return TrendingUp;
      default:
        return Target;
    }
  };

  const handleAddGoal = async () => {
    try {
      // In a real app, this would save to the backend
      const goalData = {
        id: Date.now(),
        ...newGoal,
        current: 0,
        createdAt: new Date().toISOString()
      };
      
      // Add to goals array (in real app, this would be handled by the parent component)
      console.log('Adding goal:', goalData);
      
      setNewGoal({
        title: '',
        target: 0,
        type: 'sessions',
        deadline: '',
        description: ''
      });
      setShowAddGoal(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleEditGoal = async (goal: any) => {
    try {
      // In a real app, this would update the backend
      console.log('Updating goal:', goal);
      setEditingGoal(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      // In a real app, this would delete from the backend
      console.log('Deleting goal:', goalId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Goal Tracking</h2>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const status = getGoalStatus(goal);
          const StatusIcon = getStatusIcon(status);
          const progress = getGoalProgress(goal);
          
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusIcon className={`w-4 h-4 ${
                        status === 'completed' ? 'text-green-500' :
                        status === 'on-track' ? 'text-blue-500' :
                        status === 'in-progress' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                        {status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingGoal(goal)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{goal.current} / {goal.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'on-track' ? 'bg-blue-500' :
                      status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {progress.toFixed(1)}% complete
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {goal.description || 'No description provided'}
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
          <p className="text-gray-600 mb-4">
            Set training goals to track your progress and stay motivated.
          </p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first goal
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Complete 20 training sessions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {goalTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your goal..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title || newGoal.target <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Achievement Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Achievement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {goals.filter(g => getGoalStatus(g) === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Goals Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {goals.filter(g => getGoalStatus(g) === 'on-track').length}
            </div>
            <div className="text-sm text-gray-600">On Track</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {goals.filter(g => getGoalStatus(g) === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
} 