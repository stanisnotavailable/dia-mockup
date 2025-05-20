import { useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrialDataContext } from "@/contexts/TrialDataContext";

export default function ProfileTabs() {
  const { profiles, currentProfileId, setCurrentProfileId } = useContext(TrialDataContext);
  
  return (
    <div className="mb-6">
      <Tabs 
        defaultValue={currentProfileId} 
        value={currentProfileId}
        onValueChange={setCurrentProfileId}
        className="w-full"
      >
        <div className="border-b mb-4">
          <TabsList className="grid grid-cols-3">
            {profiles.map((profile) => (
              <TabsTrigger 
                key={profile.id}
                value={profile.id}
                className="py-3 text-base data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {profile.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}