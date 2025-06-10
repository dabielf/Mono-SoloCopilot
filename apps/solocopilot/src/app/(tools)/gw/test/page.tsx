"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function TestPage() {
  const trpc = useTRPC();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test 1: List all data
  const { data: overview, isLoading, error } = useQuery({
    ...trpc.gw.listAll.queryOptions(),
    onSuccess: (data) => {
      addResult(`✅ Successfully fetched overview data: ${JSON.stringify(data?.[0] ? Object.keys(data[0]) : 'empty')}`);
    },
    onError: (error) => {
      addResult(`❌ Failed to fetch overview: ${error.message}`);
    },
  });

  // Test 2: Create ghostwriter
  const createGhostwriterMutation = useMutation({
    mutationFn: trpc.gw.ghostwriter.create.mutate,
    onSuccess: (data) => {
      addResult(`✅ Ghostwriter created successfully: ${JSON.stringify(data.ghostwriter.name)}`);
      toast.success("Ghostwriter created!");
    },
    onError: (error) => {
      addResult(`❌ Failed to create ghostwriter: ${error.message}`);
      toast.error(`Failed: ${error.message}`);
    },
  });

  const testCreateGhostwriter = async () => {
    addResult("Starting ghostwriter creation test...");
    
    const testData = {
      name: `Test Writer ${Date.now()}`,
      content: "This is the first sample of my writing. I love to write about technology and innovation.===This is the second sample. Here I'm discussing the future of AI and its impact on society.===This is the third sample where I explore creative writing techniques."
    };

    try {
      await createGhostwriterMutation.mutateAsync(testData);
    } catch (error) {
      console.error("Create ghostwriter error:", error);
    }
  };

  // Test 3: Generate content (only if we have a ghostwriter)
  const generateContentMutation = useMutation({
    mutationFn: trpc.gw.content.generate.mutate,
    onSuccess: (data) => {
      addResult(`✅ Content generated successfully: ${data.content.substring(0, 100)}...`);
      toast.success("Content generated!");
    },
    onError: (error) => {
      addResult(`❌ Failed to generate content: ${error.message}`);
      toast.error(`Failed: ${error.message}`);
    },
  });

  const testGenerateContent = async () => {
    const firstWriter = overview?.[0]?.ghostwriters?.[0];
    if (!firstWriter) {
      addResult("❌ No ghostwriter available for content generation test");
      toast.error("Create a ghostwriter first!");
      return;
    }

    addResult(`Starting content generation test with writer: ${firstWriter.name}...`);
    
    try {
      await generateContentMutation.mutateAsync({
        gwId: firstWriter.id.toString(),
        topic: "Write a short blog post about the importance of testing in software development"
      });
    } catch (error) {
      console.error("Generate content error:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Environment Variables:</h3>
            <div className="text-sm font-mono bg-muted p-2 rounded">
              <div>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</div>
              <div>GW API URL: {process.env.GW_API_URL || 'Not set (server-side only)'}</div>
              <div>User ID: {process.env.GW_USER_ID || 'Not set (server-side only)'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Current Data:</h3>
            <div className="text-sm bg-muted p-2 rounded">
              {isLoading && <div>Loading...</div>}
              {error && <div className="text-red-500">Error: {error.message}</div>}
              {overview?.[0] && (
                <div>
                  <div>Ghostwriters: {overview[0].ghostwriters?.length || 0}</div>
                  <div>Psy Profiles: {overview[0].psyProfiles?.length || 0}</div>
                  <div>Writing Profiles: {overview[0].writingProfiles?.length || 0}</div>
                  <div>Personas: {overview[0].personas?.length || 0}</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testCreateGhostwriter} disabled={createGhostwriterMutation.isPending}>
              {createGhostwriterMutation.isPending ? "Creating..." : "Test Create Ghostwriter"}
            </Button>
            <Button 
              onClick={testGenerateContent} 
              disabled={generateContentMutation.isPending || !overview?.[0]?.ghostwriters?.length}
              variant="outline"
            >
              {generateContentMutation.isPending ? "Generating..." : "Test Generate Content"}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Test Results:</h3>
            <div className="text-sm font-mono bg-muted p-2 rounded max-h-64 overflow-auto">
              {testResults.length === 0 ? (
                <div className="text-muted-foreground">No tests run yet</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="py-1">{result}</div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}