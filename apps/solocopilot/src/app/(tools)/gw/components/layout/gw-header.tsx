"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";

const routeLabels: Record<string, string> = {
  "/gw": "Dashboard",
  "/gw/generate": "Generate Content",
  "/gw/writers": "Ghostwriters",
  "/gw/profiles": "Profiles",
  "/gw/generated-content": "Generated Content",
  "/gw/training": "Training Center",
  "/gw/personas": "Personas",
  "/gw/resources": "Resources",
  "/gw/insights": "Insights"
};

export function GWHeader() {
  const pathname = usePathname();
  const trpc = useTRPC();
  
  // Detect resource and insight detail pages
  const resourceMatch = pathname.match(/^\/gw\/resources\/(\d+)$/);
  const insightMatch = pathname.match(/^\/gw\/insights\/(\d+)$/);
  
  // Fetch resource data if on resource detail page
  const { data: resource, isLoading: resourceLoading } = useQuery({
    ...trpc.gw.resources.get.queryOptions({ id: Number(resourceMatch?.[1]) }),
    enabled: !!resourceMatch
  });
  
  // Fetch insight data if on insight detail page
  const { data: insight, isLoading: insightLoading } = useQuery({
    ...trpc.gw.insights.get.queryOptions({ id: Number(insightMatch?.[1]) }),
    enabled: !!insightMatch
  });
  
  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Filter out the last segment if it's an ID and we're still loading
  const filteredSegments = pathSegments.filter((segment, index) => {
    const isLastSegment = index === pathSegments.length - 1;
    
    // If it's the last segment and matches resource/insight ID pattern and we're loading, exclude it
    if (isLastSegment) {
      if (resourceMatch && segment === resourceMatch[1] && (resourceLoading || !resource)) {
        return false;
      }
      if (insightMatch && segment === insightMatch[1] && (insightLoading || !insight)) {
        return false;
      }
    }
    
    return true;
  });
  
  const breadcrumbItems = filteredSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, pathSegments.indexOf(segment) + 1).join('/');
    let label = routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Replace ID with actual title for resource and insight pages
    if (resourceMatch && segment === resourceMatch[1] && resource) {
      label = resource.title;
    } else if (insightMatch && segment === insightMatch[1] && insight) {
      label = insight.title;
    }
    
    return {
      label,
      href: path,
      isLast: index === filteredSegments.length - 1,
      isLoaded: (resourceMatch && segment === resourceMatch[1] && resource) ||
                (insightMatch && segment === insightMatch[1] && insight) ||
                (!resourceMatch && !insightMatch) ||
                segment !== resourceMatch?.[1] && segment !== insightMatch?.[1]
    };
  });

  const currentPageTitle = routeLabels[pathname] || "Ghostwriter";

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/gw" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              {breadcrumbItems.length > 0 && (
                <>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <AnimatePresence mode="wait">
                    {breadcrumbItems.slice(1).map((item) => (
                      <motion.div
                        key={`${item.href}-${item.label}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BreadcrumbItem>
                          {item.isLast ? (
                            <BreadcrumbPage className="font-medium">
                              {item.label}
                            </BreadcrumbPage>
                          ) : (
                            <>
                              <BreadcrumbLink href={item.href}>
                                {item.label}
                              </BreadcrumbLink>
                              <BreadcrumbSeparator>
                                <ChevronRight className="h-3 w-3" />
                              </BreadcrumbSeparator>
                            </>
                          )}
                        </BreadcrumbItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  );
}