"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  "/gw": "Dashboard",
  "/gw/generate": "Generate Content",
  "/gw/writers": "Ghostwriters",
  "/gw/profiles": "Profiles",
  "/gw/history": "Content History",
  "/gw/training": "Training Center",
  "/gw/personas": "Personas",
  "/gw/resources": "Resources",
  "/gw/insights": "Insights"
};

export function GWHeader() {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    return {
      label: routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: path,
      isLast: index === pathSegments.length - 1
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
              
              {breadcrumbItems.length > 1 && (
                <>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3" />
                  </BreadcrumbSeparator>
                  {breadcrumbItems.slice(1).map((item, index) => (
                    <BreadcrumbItem key={item.href}>
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
                  ))}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Actions - will be customized per page */}
        <div className="flex items-center space-x-2">
          {/* Quick Generate Button - shows on non-generate pages */}
          {pathname !== "/gw/generate" && (
            <Button size="sm" asChild>
              <a href="/gw/generate">
                Quick Generate
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}