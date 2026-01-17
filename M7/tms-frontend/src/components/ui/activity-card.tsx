import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/tailwind/utils';
import { Plus, ExternalLink, TrendingUp } from 'lucide-react';

export interface Metric {
  label: string;
  value: string;
  unit: string;
  percentage: number;
  color: string;
}

export interface Goal {
  id: string;
  label: string;
  completed: boolean;
}

export interface ActivityCardProps {
  title?: string;
  subtitle?: string;
  metrics: Metric[];
  goals?: Goal[];
  onGoalToggle?: (goalId: string) => void;
  onAddGoal?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

const CircularProgress: React.FC<{
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}> = ({ percentage, color, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-600">{percentage}%</span>
      </div>
    </div>
  );
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title = "Today's Progress",
  subtitle = "Activity",
  metrics,
  goals = [],
  onGoalToggle,
  onAddGoal,
  onViewDetails,
  className,
}) => {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics with circular progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-3 group hover:scale-105 transition-transform duration-200"
            >
              <CircularProgress
                percentage={metric.percentage}
                color={metric.color}
                size={100}
                strokeWidth={10}
              />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {metric.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">{metric.unit}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Goals Section */}
        {goals.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Today's Goals</h3>
              {onAddGoal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddGoal}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={goal.completed}
                    onCheckedChange={() => onGoalToggle?.(goal.id)}
                    className={cn(
                      goal.completed && "border-green-500 bg-green-50"
                    )}
                  />
                  <label
                    className={cn(
                      "flex-1 text-sm cursor-pointer",
                      goal.completed && "line-through text-gray-400"
                    )}
                    onClick={() => onGoalToggle?.(goal.id)}
                  >
                    {goal.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details Link */}
        {onViewDetails && (
          <div className="pt-2">
            <Button
              variant="link"
              onClick={onViewDetails}
              className="text-sm text-gray-600 hover:text-gray-900 p-0 h-auto"
            >
              View Activity Details
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
