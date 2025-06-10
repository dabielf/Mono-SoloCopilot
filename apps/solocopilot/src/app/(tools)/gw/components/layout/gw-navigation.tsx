"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Sparkles, 
  Users, 
  Brain, 
  History, 
  GraduationCap,
  UserCheck,
  FolderOpen,
  Lightbulb,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/gw",
        icon: LayoutDashboard,
        description: "Overview & quick actions"
      }
    ]
  },
  {
    title: "Create",
    items: [
      {
        title: "Generate",
        href: "/gw/generate",
        icon: Sparkles,
        description: "Content generation workspace",
        isHighlight: true
      }
    ]
  },
  {
    title: "Manage",
    items: [
      {
        title: "Writers",
        href: "/gw/writers",
        icon: Users,
        description: "Ghostwriter profiles",
        badge: "writers"
      },
      {
        title: "Profiles",
        href: "/gw/profiles",
        icon: Brain,
        description: "Psychology & writing styles",
        badge: "profiles"
      },
      {
        title: "History",
        href: "/gw/history",
        icon: History,
        description: "Generated content",
        badge: "generated"
      }
    ]
  },
  {
    title: "Improve",
    items: [
      {
        title: "Training",
        href: "/gw/training",
        icon: GraduationCap,
        description: "Profile improvement center"
      }
    ]
  },
  {
    title: "Resources",
    items: [
      {
        title: "Personas",
        href: "/gw/personas",
        icon: UserCheck,
        description: "Target audiences",
        badge: "personas"
      },
      {
        title: "Resources",
        href: "/gw/resources",
        icon: FolderOpen,
        description: "Documents & files",
        badge: "resources"
      },
      {
        title: "Insights",
        href: "/gw/insights",
        icon: Lightbulb,
        description: "Extracted knowledge",
        badge: "insights"
      }
    ]
  }
];

export function GWNavigation() {
  const pathname = usePathname();
  const trpc = useTRPC();
  const { data: overview } = useQuery(trpc.gw.listAll.queryOptions());

  const getBadgeCount = (badgeType: string) => {
    if (!overview || !overview[0]) return 0;
    
    switch (badgeType) {
      case "writers":
        return overview[0].ghostwriters?.length || 0;
      case "profiles":
        return (overview[0].psyProfiles?.length || 0) + (overview[0].writingProfiles?.length || 0);
      case "personas":
        return overview[0].personas?.length || 0;
      case "resources":
        return overview[0].resourceContents?.length || 0;
      case "insights":
        return 0; // TODO: Add insights count from API
      case "generated":
        return 0; // TODO: Add generated content count from API
      default:
        return 0;
    }
  };

  return (
    <div className="w-64 border-r bg-muted/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Ghostwriter</h1>
            <p className="text-xs text-muted-foreground">AI Writing Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {navigationItems.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                {section.title}
              </h2>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const badgeCount = item.badge ? getBadgeCount(item.badge) : 0;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`
                            w-full justify-start gap-3 h-10 px-3 text-left
                            ${isActive ? "bg-muted shadow-sm" : "hover:bg-muted/50"}
                            ${item.isHighlight ? "border border-primary/20 bg-primary/5 hover:bg-primary/10" : ""}
                          `}
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium truncate ${isActive ? "text-foreground" : ""}`}>
                                {item.title}
                              </span>
                              {badgeCount > 0 && (
                                <Badge variant="secondary" className="text-xs h-5 px-1.5 ml-2">
                                  {badgeCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                        </Button>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}