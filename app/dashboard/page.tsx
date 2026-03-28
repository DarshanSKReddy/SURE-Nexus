"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        console.error("Auth error:", userError);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (error) {
        console.error("Fetch error:", error.message);
      }

      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userData.user.id,
              email: userData.user.email,
              name: "New User",
              role: "student",
              avatar_url: "https://i.pravatar.cc/150",
              bio: "No bio yet",
            },
          ])
          .select()
          .single();

        if (!insertError) setProfile(newProfile);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* 🌌 Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]"></div>

      {/* 🧭 Navbar Placeholder */}
      <nav className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            SURE Nexus
          </h1>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* 📊 Main Content */}
      <main className="max-w-5xl mx-auto p-6 pt-12 z-10 relative">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 👤 Left Column: Profile Card (Glassmorphism) */}
            <div className="md:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
              <div className="relative">
                <img
                  src={profile.avatar_url || "https://i.pravatar.cc/150"}
                  alt="avatar"
                  className="w-32 h-32 rounded-full border-4 border-purple-500/50 object-cover shadow-lg shadow-purple-500/20"
                />
                <span className="absolute bottom-2 right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-[#1a1a1a]"></span>
              </div>
              
              <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
              <p className="text-gray-400 text-sm">{profile.email}</p>
              
              <span className="mt-3 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-wider rounded-full font-semibold">
                {profile.role}
              </span>

              <p className="mt-4 text-gray-300 text-sm leading-relaxed">
                {profile.bio}
              </p>

              <button
                className="mt-6 w-full bg-white/10 hover:bg-purple-600 border border-white/10 transition-all duration-300 py-2 rounded-lg text-sm font-medium"
                onClick={async () => {
                  const newName = prompt("Enter new name:", profile.name);
                  if (!newName) return;
                  const { error } = await supabase
                    .from("profiles")
                    .update({ name: newName })
                    .eq("id", profile.id);
                  if (!error) setProfile({ ...profile, name: newName });
                }}
              >
                Edit Profile
              </button>
            </div>

            {/* 📈 Right Column: Dashboard Stats/Content */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Your Learning Progress</h3>
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/20">
                  <p className="text-gray-500 text-sm">No courses enrolled yet. (Coming soon)</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Recent Projects</h3>
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/20">
                  <p className="text-gray-500 text-sm">Upload your first project to showcase it here.</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <p className="text-center text-gray-400">Failed to load profile.</p>
        )}
      </main>
    </div>
  );
}