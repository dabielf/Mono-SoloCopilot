"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ViewProfileDialog } from "./view-profile-dialog";
import { EditProfileDialog } from "./edit-profile-dialog";
import type { PsyProfile, WritingProfile } from "@repo/zod-types";

export function ProfilesView() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.gw.listAll.queryOptions());
  const [viewProfile, setViewProfile] = useState<{
    profile: PsyProfile | WritingProfile | null;
    type: "psychology" | "writing";
  }>({ profile: null, type: "psychology" });
  const [editProfile, setEditProfile] = useState<{
    profile: PsyProfile | WritingProfile | null;
    type: "psychology" | "writing";
  }>({ profile: null, type: "psychology" });

  const psyProfiles = data?.[0]?.psyProfiles || [];
  const writingProfiles = data?.[0]?.writingProfiles || [];

  const handleView = (profile: PsyProfile | WritingProfile, type: "psychology" | "writing") => {
    setViewProfile({ profile, type });
  };

  const handleEdit = (profile: PsyProfile | WritingProfile, type: "psychology" | "writing") => {
    setEditProfile({ profile, type });
  };

  const ProfileList = ({ 
    profiles, 
    type 
  }: { 
    profiles: PsyProfile[] | WritingProfile[]; 
    type: "psychology" | "writing";
  }) => (
    <div className="space-y-2">
      {profiles.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No {type} profiles found
        </p>
      ) : (
        profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <h3 className="font-medium">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(profile, type)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(profile, type)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground mt-2">
            Manage your psychology and writing profiles
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="psychology" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="psychology">Psychology Profiles</TabsTrigger>
                <TabsTrigger value="writing">Writing Profiles</TabsTrigger>
              </TabsList>

              <TabsContent value="psychology" className="mt-6">
                <ProfileList profiles={psyProfiles} type="psychology" />
              </TabsContent>

              <TabsContent value="writing" className="mt-6">
                <ProfileList profiles={writingProfiles} type="writing" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ViewProfileDialog
        open={!!viewProfile.profile}
        onOpenChange={(open) => !open && setViewProfile({ profile: null, type: "psychology" })}
        profile={viewProfile.profile}
        type={viewProfile.type}
      />

      <EditProfileDialog
        open={!!editProfile.profile}
        onOpenChange={(open) => !open && setEditProfile({ profile: null, type: "psychology" })}
        profile={editProfile.profile}
        type={editProfile.type}
      />
    </>
  );
}