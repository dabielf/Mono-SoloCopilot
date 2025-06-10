import { Button } from "@/components/ui/button";
import { TestClient } from "./test-client";

export default async function Home() {
  // const userData = await apiClient.get('gw').json()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl"><span className="font-bold">Solo</span>Copilot</h1>
      <Button variant="ghost">coming sooner than you think...</Button>
      <TestClient />
    </div>
  );
}
