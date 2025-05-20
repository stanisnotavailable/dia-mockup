import { useContext } from "react";
import { TrialDataContext } from "@/contexts/TrialDataContext";

export default function ProfileTabs() {
  const { profiles, currentProfileId, setCurrentProfileId } = useContext(TrialDataContext);
  
  return (
    <div className="mb-8 mt-4">
      <div className="w-full bg-white rounded-md shadow-sm">
        <div className="flex justify-around relative">
          {profiles.map((profile) => {
            const isActive = profile.id === currentProfileId;
            
            return (
              <button
                key={profile.id}
                className={`relative py-4 px-6 w-full text-center font-medium text-base transition-colors ${
                  isActive 
                    ? "text-gray-900" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setCurrentProfileId(profile.id)}
              >
                {profile.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}