import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { ActivityCard, ActivityCardProps, Metric, Goal } from './activity-card';

const meta: Meta<ActivityCardProps> = {
  title: 'UI/ActivityCard',
  component: ActivityCard,
  argTypes: {
    title: {
      control: 'text',
      description: 'The main title of the activity card'
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle text shown below the title'
    },
    metrics: {
      control: 'object',
      description: 'Array of metrics to display with circular progress indicators'
    },
    goals: {
      control: 'object',
      description: 'Optional array of goals to display as checkboxes'
    },
    onGoalToggle: {
      action: 'goal-toggled',
      description: 'Callback fired when a goal checkbox is toggled'
    },
    onAddGoal: {
      action: 'add-goal-clicked',
      description: 'Callback fired when the add goal button is clicked'
    },
    onViewDetails: {
      action: 'view-details-clicked',
      description: 'Callback fired when the view details link is clicked'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    },
  },
  args: {
    title: "Today's Progress",
    subtitle: "Activity",
    metrics: [
      {
        label: 'Orders',
        value: '24',
        unit: 'completed',
        percentage: 75,
        color: 'text-blue-600',
      },
      {
        label: 'Deliveries',
        value: '18',
        unit: 'on time',
        percentage: 90,
        color: 'text-green-600',
      },
      {
        label: 'Efficiency',
        value: '87%',
        unit: 'avg',
        percentage: 87,
        color: 'text-purple-600',
      },
    ],
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 max-w-4xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<ActivityCardProps>;

export const Playground: Story = {
  render: (args) => <ActivityCard {...args} />,
};

export const WithMetricsOnly: Story = {
  name: 'With Metrics Only',
  args: {
    title: "Today's Progress",
    subtitle: "Activity Overview",
    metrics: [
      {
        label: 'Orders',
        value: '24',
        unit: 'completed',
        percentage: 75,
        color: 'text-blue-600',
      },
      {
        label: 'Deliveries',
        value: '18',
        unit: 'on time',
        percentage: 90,
        color: 'text-green-600',
      },
      {
        label: 'Efficiency',
        value: '87%',
        unit: 'avg',
        percentage: 87,
        color: 'text-purple-600',
      },
    ],
  },
};

export const WithMetricsAndGoals: Story = {
  name: 'With Metrics and Goals',
  args: {
    title: "Today's Progress",
    subtitle: "Daily Activity",
    metrics: [
      {
        label: 'Orders',
        value: '24',
        unit: 'completed',
        percentage: 75,
        color: 'text-blue-600',
      },
      {
        label: 'Deliveries',
        value: '18',
        unit: 'on time',
        percentage: 90,
        color: 'text-green-600',
      },
      {
        label: 'Efficiency',
        value: '87%',
        unit: 'avg',
        percentage: 87,
        color: 'text-purple-600',
      },
    ],
    goals: [
      {
        id: '1',
        label: 'Complete morning route deliveries',
        completed: true,
      },
      {
        id: '2',
        label: 'Review pending orders',
        completed: true,
      },
      {
        id: '3',
        label: 'Update vehicle maintenance logs',
        completed: false,
      },
      {
        id: '4',
        label: 'Contact 3 customers for feedback',
        completed: false,
      },
    ],
    onGoalToggle: (goalId: string) => {
      console.log('Goal toggled:', goalId);
    },
    onAddGoal: () => {
      console.log('Add goal clicked');
    },
    onViewDetails: () => {
      console.log('View details clicked');
    },
  },
};
