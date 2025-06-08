
import { ClerkProvider } from '@clerk/nextjs'


export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <ClerkProvider>

            {children}

    </ClerkProvider>
  );
}
