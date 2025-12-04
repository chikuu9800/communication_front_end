import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Avatar from "../ui/Avatar";

interface ProfileProps {
  userId: string | null;
  setuserM: React.Dispatch<React.SetStateAction<boolean>>;
}

const Profile: React.FC<ProfileProps> = ({ userId, setuserM }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await api.get(`/users/profilebyid/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API PROFILE RESPONSE:", res.data);

        // ✅ FIX — store entire object
        setProfile(res.data);

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-5 rounded-xl">Loading...</div>
      </div>
    );
  }

  console.log("RENDER PROFILE:", profile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn overflow-y-auto">

        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => setuserM(false)}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">User Profile</h2>

        <div className="flex flex-col items-center gap-3 mt-2">
          <Avatar
            name={profile.name}
            size="xl"
            className="ring-4 ring-white w-32 h-32"
            src={
              profile.avatar?.path
                ? `http://localhost:4000${profile.avatar.path}`
                : undefined
            }
            key={profile.avatar?.path || profile.name}
          />

          <h3 className="text-lg font-bold">{profile?.name}</h3>
          <p className="text-sm text-gray-500">{profile?.occupation || "—"}</p>
        </div>

        <div className="mt-5 space-y-3 text-sm">

          <div className="flex gap-2">
            <span className="font-semibold w-24">Email:</span>
            <span>{profile?.email}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold w-24">Phone:</span>
            <span>{profile?.phone}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold w-24">Location:</span>
            <span>{profile?.location}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold w-24">Joined:</span>
            <span>{profile?.joinDate}</span>
          </div>

          <div>
            <h4 className="font-semibold">Bio</h4>
            <p className="text-gray-600 mt-1">{profile?.bio || "No bio available"}</p>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Social Links</h4>
            <div className="flex gap-4 mt-2">
              {profile?.socialLinks?.github && (
                <a href={profile.socialLinks.github} target="_blank" className="text-gray-800">GitHub</a>
              )}
              {profile?.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" className="text-blue-400">Twitter</a>
              )}
              {profile?.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" className="text-blue-700">LinkedIn</a>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
