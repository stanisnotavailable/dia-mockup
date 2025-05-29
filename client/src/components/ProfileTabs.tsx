import { useContext } from "react";
import { TrialDataContext } from "@/contexts/TrialDataContext";
import { cn } from "@/lib/utils";

export default function ProfileTabs() {
  const { profiles, currentProfileId, setCurrentProfileId } = useContext(TrialDataContext);

  return (
    <div className="">
      <div className="w-full bg-white border-b border-gray-200" style={{ backgroundColor: 'transparent' }} >
        <div className="flex">
          {profiles.map((profile) => {
            const isActive = profile.id === currentProfileId;

            return (
              <button
                key={profile.id}
                className={cn(
                  "relative py-2 px-6 text-center font-medium text-sm transition-colors",
                  isActive
                    ? "text-[rgb(37,99,235)]"
                    : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setCurrentProfileId(profile.id)}
              >
                {profile.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[rgb(37,99,235)]"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}