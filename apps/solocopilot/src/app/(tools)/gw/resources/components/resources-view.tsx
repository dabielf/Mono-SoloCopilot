"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Book, 
  Type, 
  Upload, 
  FolderOpen,
  Trash2,
  Lightbulb,
  Calendar,
  FileX2
} from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ResourceCard } from "./resource-card";
import { cn } from "@/lib/utils";

export function ResourcesView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadTab, setUploadTab] = useState<"pdf" | "epub" | "text">("pdf");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [epubTitle, setEpubTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [epubFile, setEpubFile] = useState<File | null>(null);

  // Query resources
  const { data: resourcesData, isLoading } = useQuery(
    trpc.gw.resources.list.queryOptions({ page: currentPage, limit: 20 })
  );

  // File upload state for buttons
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingEpub, setIsUploadingEpub] = useState(false);

  const uploadTextOptions = trpc.gw.resources.uploadText.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.list.queryKey() });
      toast.success("Text resource created successfully!");
      setTextTitle("");
      setTextContent("");
    },
    onError: (error) => {
      toast.error("Failed to create text resource: " + error.message);
    }
  });
  const uploadText = useMutation(uploadTextOptions);

  // Delete mutation
  const deleteResourceOptions = trpc.gw.resources.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.list.queryKey() });
      toast.success("Resource deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete resource: " + error.message);
    }
  });
  const deleteResource = useMutation(deleteResourceOptions);

  // File handling
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: "pdf" | "epub") => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isEpub = file.type === "application/epub+zip" || file.name.endsWith(".epub");

    if (type === "pdf" && !isPdf) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (type === "epub" && !isEpub) {
      toast.error("Please upload an EPUB file");
      return;
    }

    // Just store the file, don't upload yet
    if (type === "pdf") {
      setPdfFile(file);
    } else {
      setEpubFile(file);
    }
  }, []);

  const handlePdfUpload = async () => {
    if (!pdfTitle.trim()) {
      toast.error("Please enter a title for the PDF");
      return;
    }

    if (!pdfFile) {
      toast.error("Please select a PDF file first");
      return;
    }

    setIsUploadingPdf(true);
    try {
      // Upload directly to API, bypassing TRPC
      const formData = new FormData();
      formData.append('pdfFile', pdfFile);
      formData.append('title', pdfTitle);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/gw/pdf-resource`, {
        method: 'POST',
        headers: {
          'User-Id': process.env.NEXT_PUBLIC_GW_USER_ID || '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Invalidate queries and show success
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.list.queryKey() });
      toast.success("PDF uploaded successfully!");
      setPdfTitle("");
      setPdfFile(null);
    } catch (error) {
      toast.error("Failed to upload PDF: " + (error as Error).message);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleEpubUpload = async () => {
    if (!epubTitle.trim()) {
      toast.error("Please enter a title for the EPUB");
      return;
    }

    if (!epubFile) {
      toast.error("Please select an EPUB file first");
      return;
    }

    setIsUploadingEpub(true);
    try {
      // Upload directly to API, bypassing TRPC
      const formData = new FormData();
      formData.append('epubFile', epubFile);
      formData.append('title', epubTitle);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/gw/epub-resource`, {
        method: 'POST',
        headers: {
          'User-Id': process.env.NEXT_PUBLIC_GW_USER_ID || '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Invalidate queries and show success
      queryClient.invalidateQueries({ queryKey: trpc.gw.resources.list.queryKey() });
      toast.success("EPUB uploaded successfully!");
      setEpubTitle("");
      setEpubFile(null);
    } catch (error) {
      toast.error("Failed to upload EPUB: " + (error as Error).message);
    } finally {
      setIsUploadingEpub(false);
    }
  };

  const handleTextSave = async () => {
    if (!textTitle.trim() || !textContent.trim()) {
      toast.error("Please enter both title and content");
      return;
    }

    await uploadText.mutateAsync({
      title: textTitle,
      content: textContent
    });
  };

  const resources = resourcesData?.data || [];
  const hasMore = resourcesData?.meta?.hasMore || false;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center-safe gap-4 relative">
          <h1 className="text-2xl font-bold">Resources</h1>
          <Badge variant="secondary"  className="text-sm font-light">
            {resourcesData?.meta?.total || 0} resources
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Upload and manage documents for insight extraction
        </p>
      </div>

      {/* Resources List */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-32" />
              </Card>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileX2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">No resources yet</p>
              <p className="text-sm text-muted-foreground">
                Upload your first document to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onDelete={() => deleteResource.mutate({ id: resource.id })}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {(currentPage > 1 || hasMore) && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasMore}
            >
              Next
            </Button>
          </div>
        )}
      </div>  

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Resource</CardTitle>
          <CardDescription>
            Add PDF, EPUB, or plain text documents to your library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as typeof uploadTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pdf">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="epub">
                <Book className="h-4 w-4 mr-2" />
                EPUB
              </TabsTrigger>
              <TabsTrigger value="text">
                <Type className="h-4 w-4 mr-2" />
                Plain Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-title">Document Title</Label>
                <Input
                  id="pdf-title"
                  placeholder="Enter a title for this PDF"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                />
              </div>
              
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  pdfFile ? "border-primary bg-primary/5" : "",
                  "hover:border-primary hover:bg-primary/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "pdf")}
              >
                {pdfFile ? (
                  <>
                    <FileText className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <p className="text-sm font-medium mb-2">{pdfFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                  </>
                )}
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  id="pdf-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPdfFile(file);
                  }}
                />
                {!pdfFile && (
                  <Label htmlFor="pdf-upload" className="cursor-pointer">
                    <Button variant="secondary" size="sm" asChild>
                      <span>Choose PDF</span>
                    </Button>
                  </Label>
                )}
              </div>
              
              <Button 
                onClick={handlePdfUpload}
                disabled={isUploadingPdf || !pdfTitle.trim() || !pdfFile}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploadingPdf ? "Uploading..." : "Save as Resource"}
              </Button>
            </TabsContent>

            <TabsContent value="epub" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="epub-title">Document Title</Label>
                <Input
                  id="epub-title"
                  placeholder="Enter a title for this EPUB"
                  value={epubTitle}
                  onChange={(e) => setEpubTitle(e.target.value)}
                />
              </div>
              
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  epubFile ? "border-primary bg-primary/5" : "",
                  "hover:border-primary hover:bg-primary/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "epub")}
              >
                {epubFile ? (
                  <>
                    <Book className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <p className="text-sm font-medium mb-2">{epubFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(epubFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your EPUB file here, or click to browse
                    </p>
                  </>
                )}
                <Input
                  type="file"
                  accept=".epub,application/epub+zip"
                  className="hidden"
                  id="epub-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setEpubFile(file);
                  }}
                />
                {!epubFile && (
                  <Label htmlFor="epub-upload" className="cursor-pointer">
                    <Button variant="secondary" size="sm" asChild>
                      <span>Choose EPUB</span>
                    </Button>
                  </Label>
                )}
              </div>
              
              <Button 
                onClick={handleEpubUpload}
                disabled={isUploadingEpub || !epubTitle.trim() || !epubFile}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploadingEpub ? "Uploading..." : "Save as Resource"}
              </Button>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-title">Document Title</Label>
                <Input
                  id="text-title"
                  placeholder="Enter a title for this document"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="text-content">Content</Label>
                <Textarea
                  id="text-content"
                  placeholder="Paste or type your content here..."
                  className="min-h-[300px] max-h-[500px]"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleTextSave}
                disabled={uploadText.isPending || !textTitle.trim() || !textContent.trim()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Save as Resource
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );    
}