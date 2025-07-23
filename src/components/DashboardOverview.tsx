import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Wrench, MessageSquare, Link } from 'lucide-react';

interface OverviewStats {
  projects: number;
  skills: number;
  messages: number;
  urls: number;
}

interface DashboardOverviewProps {
  stats: OverviewStats;
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const cards = [
    {
      title: 'Projects',
      value: stats.projects,
      description: 'Total portfolio projects',
      icon: FolderOpen,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Skills',
      value: stats.skills,
      description: 'Technical skills listed',
      icon: Wrench,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Messages',
      value: stats.messages,
      description: 'Contact messages received',
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Short URLs',
      value: stats.urls,
      description: 'URLs created',
      icon: Link,
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your portfolio management dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </div>
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates to your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard accessed successfully
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  System is running smoothly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Manage your portfolio projects
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Update your technical skills
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Check contact messages
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                • Create short URLs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
