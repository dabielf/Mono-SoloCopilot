"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { 
  Users, 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Calendar,
  FileText,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function DashboardOverview() {
  const trpc = useTRPC();
  const { data: overview, isLoading } = useQuery(trpc.gw.listAll.queryOptions());

  if (isLoading || !overview || !overview[0]) {
    return <div>Loading...</div>;
  }

  const data = overview[0];
  const ghostwriters = data.ghostwriters || [];
  const psyProfiles = data.psyProfiles || [];
  const writingProfiles = data.writingProfiles || [];
  const personas = data.personas || [];
  const resources = data.resourceContents || [];

  const stats = [
    {
      title: "Ghostwriters",
      value: ghostwriters.length,
      description: "Active AI writers",
      icon: Users,
      color: "text-blue-600",
      href: "/gw/writers"
    },
    {
      title: "Profiles",
      value: psyProfiles.length + writingProfiles.length,
      description: "Psychology & writing styles",
      icon: Brain,
      color: "text-purple-600",
      href: "/gw/profiles"
    },
    {
      title: "Personas",
      value: personas.length,
      description: "Target audiences",
      icon: Sparkles,
      color: "text-emerald-600",
      href: "/gw/personas"
    },
    {
      title: "Resources",
      value: resources.length,
      description: "Documents & insights",
      icon: FileText,
      color: "text-orange-600",
      href: "/gw/resources"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Generate */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Generate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Start creating content with your AI writers
              </p>
              
              {ghostwriters.length > 0 ? (
                <div className="space-y-3">
                  {ghostwriters.slice(0, 2).map((writer) => (
                    <div key={writer.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xs">
                            {writer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{writer.name}</p>
                          <p className="text-xs text-muted-foreground">Ready to generate</p>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/gw/generate?writer=${writer.id}`}>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Generate
                        </Link>
                      </Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/gw/generate">
                      View All Writers
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No ghostwriters yet. Create your first one!
                  </p>
                  <Button asChild>
                    <Link href="/gw/writers/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ghostwriter
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your latest AI writing activities
              </p>
              
              {/* Mock recent activity - replace with real data */}
              <div className="space-y-3">
                {[
                  { action: "Created ghostwriter", name: "Personal Blog Writer", time: "2 hours ago" },
                  { action: "Generated content", name: "LinkedIn Post", time: "5 hours ago" },
                  { action: "Updated profile", name: "Technical Writing Style", time: "1 day ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.time}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/gw/history">
                  View Full History
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Getting Started */}
      {ghostwriters.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Started with Ghostwriter</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first AI ghostwriter by uploading some of your writing samples. 
                The AI will learn your style and help you generate content that sounds just like you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild>
                  <Link href="/gw/writers/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Ghostwriter
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/gw/resources">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Resources
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}