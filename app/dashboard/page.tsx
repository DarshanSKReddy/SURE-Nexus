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
  
  // Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [uploading, setUploading] = useState(false); // 🟢 Tracks image upload status

  useEffect(() => {
    const getProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        window.location.href = "/login";
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
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert([{
            id: userData.user.id,
            email: userData.user.email,
            name: "New User",
            role: "student",
            avatar_url: "https://i.pravatar.cc/150",
            bio: "I am a student at SURE Trust eager to learn!",
          }])
          .select()
          .single();
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    getProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name: editName,
        bio: editBio,
        avatar_url: editAvatar,
      })
      .eq("id", profile.id);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setProfile({ ...profile, name: editName, bio: editBio, avatar_url: editAvatar });
      setIsEditing(false);
    }
  };

  const openEditModal = () => {
    setEditName(profile?.name || "");
    setEditBio(profile?.bio || "");
    setEditAvatar(profile?.avatar_url || "");
    setIsEditing(true);
  };

  // 🟢 Handle Image File Uploads
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile?.id}-${Math.random()}.${fileExt}`; // Unique file name

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL of the uploaded image
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      // 3. Set the URL in the input field so the user sees it
      setEditAvatar(data.publicUrl);
      alert("Image uploaded successfully! Click 'Save Changes' to update your profile.");

    } catch (err) {
      if (err instanceof Error) {
        alert("Error uploading image: " + err.message);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]"></div>

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

      <main className="max-w-5xl mx-auto p-6 pt-12 z-10 relative">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Profile Card */}
            <div className="md:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
              <img
                src={profile.avatar_url || "https://i.pravatar.cc/150"}
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-purple-500/50 object-cover shadow-lg shadow-purple-500/20"
              />
              <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
              <p className="text-gray-400 text-sm">{profile.email}</p>
              <span className="mt-3 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-wider rounded-full font-semibold">
                {profile.role}
              </span>
              <p className="mt-4 text-gray-300 text-sm leading-relaxed">{profile.bio}</p>

              <button
                onClick={openEditModal}
                className="mt-6 w-full bg-white/10 hover:bg-purple-600 border border-white/10 transition-all duration-300 py-2 rounded-lg text-sm font-medium"
              >
                Edit Profile
              </button>
            </div>

            {/* Content Placeholders */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Your Learning Progress</h3>
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/20">
                  <p className="text-gray-500 text-sm">No courses enrolled yet. (Coming soon)</p>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </main>

      {/* 🟢 THE EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Edit Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* File Upload OR Paste URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Profile Picture</label>
                
                {/* File Upload Button */}
                <div className="mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 transition-all cursor-pointer"
                  />
                  {uploading && <span className="text-xs text-purple-400 mt-1 block">Uploading image... Please wait.</span>}
                </div>

                <div className="flex items-center gap-2 my-2 text-xs text-gray-500 uppercase font-bold">
                  <hr className="flex-1 border-white/10" /> OR <hr className="flex-1 border-white/10" />
                </div>

                {/* Manual URL Input */}
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Short Bio</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleSaveProfile}
                disabled={uploading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}