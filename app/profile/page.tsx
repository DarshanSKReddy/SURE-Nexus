"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%239333ea'/%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/%3E%3C/svg%3E";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  skills?: string;
  languages?: string;
  experience?: string;
  extracurriculars?: string;
  career_interests?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setEditForm(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update(editForm)
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, ...editForm } as Profile);
      setIsEditing(false);
    } else {
      alert("Error saving profile: " + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden pb-12">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>

      <nav className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            SURE Nexus
          </h1>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">Go to Dashboard -{">"}</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 pt-12 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Basic Info (Read Only Here) */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile?.avatar_url || DEFAULT_AVATAR} alt="avatar" className="w-32 h-32 rounded-full border-4 border-purple-500/50 object-cover bg-[#111]" />
              <h2 className="text-2xl font-bold mt-4">{profile?.name}</h2>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
              <span className="mt-3 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-wider rounded-full font-semibold">{profile?.role}</span>
              <p className="mt-4 text-gray-300 text-sm leading-relaxed">{profile?.bio}</p>
              
              <p className="text-xs text-gray-500 mt-4 border-t border-white/10 pt-4">To change Name, Photo, or Bio, please use the Quick Edit button on the main Dashboard.</p>

              <button onClick={() => setIsEditing(true)} className="mt-6 w-full bg-white/10 hover:bg-purple-600 border border-white/10 transition-all py-2 rounded-lg text-sm font-medium">Edit Resume Profile</button>
            </div>
          </div>

          {/* Right Column: Detailed Resume Sections */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4">Skills</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{profile?.skills || "No skills added yet."}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4">Languages Known</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{profile?.languages || "No languages added yet."}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4">Internships & Experience</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{profile?.experience || "No internship experience added yet."}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4">Career Interests</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{profile?.career_interests || "No career interests added yet."}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 mb-4">Extra Curricular Activities</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{profile?.extracurriculars || "No extracurricular activities added yet."}</p>
            </div>

          </div>
        </div>
      </main>

      {/* Refined Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Update Resume Profile</h2>
            <p className="text-sm text-gray-400 mb-6">Update your advanced details below. To change your Name, Avatar, or Bio, please use the main Dashboard.</p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Skills (e.g., Python, React, Next.js)</label>
                <textarea value={editForm.skills || ""} onChange={(e) => setEditForm({...editForm, skills: e.target.value})} rows={2} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Languages Known</label>
                <input type="text" value={editForm.languages || ""} onChange={(e) => setEditForm({...editForm, languages: e.target.value})} placeholder="e.g. English, Hindi, Spanish" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Internships & Experience</label>
                <p className="text-xs text-gray-500 mb-2">Tip: Format as Role at Company (Start Date - End Date)</p>
                <textarea value={editForm.experience || ""} onChange={(e) => setEditForm({...editForm, experience: e.target.value})} rows={3} placeholder="e.g. Software Intern at Google (Jan 2023 - Present)" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Career Interests</label>
                <textarea value={editForm.career_interests || ""} onChange={(e) => setEditForm({...editForm, career_interests: e.target.value})} rows={2} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Extra Curricular Activities</label>
                <textarea value={editForm.extracurriculars || ""} onChange={(e) => setEditForm({...editForm, extracurriculars: e.target.value})} rows={2} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"></textarea>
              </div>

            </div>
            
            <div className="mt-6 flex gap-3">
              <button onClick={handleSaveProfile} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors">Save Resume</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}