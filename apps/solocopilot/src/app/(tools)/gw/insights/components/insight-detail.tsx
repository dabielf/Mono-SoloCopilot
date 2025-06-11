"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft,
  Calendar,
  User,
  FileText,
  Lightbulb,
  Target,
  CheckCircle,
  Copy,
  Share2,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InsightDetailProps {
  id: string;
}

export function InsightDetail({ id }: InsightDetailProps) {
  const trpc = useTRPC();
  const router = useRouter();

  const { data: insight, isLoading, error } = useQuery(
    trpc.gw.insights.get.queryOptions({ id: Number(id) })
  );

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleGenerateContent = () => {
    const params = new URLSearchParams();
    params.set('insight', id);
    if (insight?.persona?.id) {
      params.set('persona', insight.persona.id.toString());
    }
    router.push(`/gw/generate?${params.toString()}`);
  };

  if (isLoading) {
    return null; // The skeleton is shown by Suspense
  }

  if (error || !insight) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">Failed to load insight</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{insight.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(insight.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </div>
          {insight.persona && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              For {insight.persona.name}
            </div>
          )}
        </div>
      </div>

      {/* Main content card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {insight.persona && (
                <Badge variant="secondary">
                  <User className="h-3 w-3 mr-1" />
                  {insight.persona.name}
                </Badge>
              )}
              {insight.resourceContent && (
                <Badge variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  {insight.resourceContent.title}
                </Badge>
              )}
            </div>
            <Button variant="default" size="sm" onClick={handleGenerateContent}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Key Points
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(insight.keyPoints.join('\n'), "Key points")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {insight.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Main Content */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Content</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(insight.content, "Content")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{insight.content}</p>
            </div>
          </div>

          {insight.actionItems && insight.actionItems.length > 0 && (
            <>
              <Separator />
              
              {/* Action Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Action Items
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(insight.actionItems.join('\n'), "Action items")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {insight.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-semibold">{index + 1}.</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Related information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {insight.resourceContent && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Source Resource</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.resourceContent.title}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 p-0 h-auto"
                    onClick={() => router.push(`/gw/resources/${insight.resourceContent.id}`)}
                  >
                    View Resource →
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {insight.persona && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Target Persona</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.persona.name}</p>
                  {insight.persona.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.persona.description}
                    </p>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 p-0 h-auto"
                    onClick={() => router.push(`/gw/personas/${insight.persona.id}`)}
                  >
                    View Persona →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}