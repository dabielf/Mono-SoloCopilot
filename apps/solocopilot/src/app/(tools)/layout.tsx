
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "sonner";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <Toaster />
    {children}
    </ClerkProvider>
  );
}
