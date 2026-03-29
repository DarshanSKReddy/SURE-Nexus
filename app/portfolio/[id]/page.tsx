"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import Link from "next/link";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%239333ea'/%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/%3E%3C/svg%3E";

// 🟢 Strict Types Added Here
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
  community_link?: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  project_url?: string;
};

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  credential_url?: string;
};

export default function PublicPortfolio() {
  const params = useParams();
  const userId = params.id as string;

  // 🟢 'any' removed and replaced with strict types
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchPublicData = async () => {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError || !profileData) {
        setError(true);
        setLoading(false);
        return;
      }
      setProfile(profileData as Profile);

      // 2. Fetch Projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setProjects((projectsData as Project[]) || []);

      // 3. Fetch Certificates
      const { data: certsData } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setCertificates((certsData as Certificate[]) || []);

      setLoading(false);
    };

    fetchPublicData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold text-gray-500 mb-4">Profile Not Found</h1>
        <p className="text-gray-400">This portfolio link is invalid or has been removed.</p>
        <Link href="/" className="mt-6 text-purple-400 hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden pb-12">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Public Header */}
      <nav className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md p-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter">
              SURE Nexus
            </h1>
            <span className="hidden md:inline-block text-gray-500 text-sm font-medium border-l border-white/10 pl-4">
              Public Portfolio
            </span>
          </div>
          <Link href="/" className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-4 py-2 rounded-lg">
            Build Your Own
          </Link>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 md:p-6 pt-12 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Left Column: Identity Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center sticky top-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.avatar_url || DEFAULT_AVATAR} alt="avatar" className="w-40 h-40 rounded-full border-4 border-purple-500/50 object-cover shadow-lg shadow-purple-500/20 bg-[#111]" />
              <h2 className="text-3xl font-black mt-6 tracking-tight text-white">{profile.name}</h2>
              <span className="mt-3 px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-widest rounded-full font-bold">
                {profile.role || "Professional"}
              </span>
              <p className="mt-6 text-gray-300 text-sm leading-relaxed max-w-xs">{profile.bio}</p>
              
              {profile.community_link && (
                <a href={profile.community_link} target="_blank" rel="noopener noreferrer" className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white transition-all py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20">
                  Connect / Join Group
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Portfolio Details */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-6">Professional Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <span className="text-purple-400 font-bold block mb-2 uppercase tracking-wider text-xs">Core Skills</span> 
                  <span className="text-gray-300 leading-relaxed block">{profile.skills || "Not specified."}</span>
                </div>
                <div>
                  <span className="text-purple-400 font-bold block mb-2 uppercase tracking-wider text-xs">Languages Known</span> 
                  <span className="text-gray-300 leading-relaxed block">{profile.languages || "Not specified."}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-purple-400 font-bold block mb-2 uppercase tracking-wider text-xs">Internships & Experience</span> 
                  <span className="text-gray-300 leading-relaxed block whitespace-pre-wrap">{profile.experience || "Not specified."}</span>
                </div>
                <div>
                  <span className="text-purple-400 font-bold block mb-2 uppercase tracking-wider text-xs">Career Interests</span> 
                  <span className="text-gray-300 leading-relaxed block">{profile.career_interests || "Not specified."}</span>
                </div>
                <div>
                  <span className="text-purple-400 font-bold block mb-2 uppercase tracking-wider text-xs">Extracurriculars</span> 
                  <span className="text-gray-300 leading-relaxed block">{profile.extracurriculars || "Not specified."}</span>
                </div>
              </div>
            </div>

            {/* Certifications Showcase */}
            {certificates.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-6">Verified Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                      {cert.credential_url ? (
                        <a href={cert.credential_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-bold text-lg block truncate">{cert.title} -{">"}</a>
                      ) : (
                        <span className="text-white font-bold text-lg block truncate">{cert.title}</span>
                      )}
                      <span className="text-xs font-semibold px-3 py-1 mt-3 inline-block rounded-full bg-white/10 text-gray-300">
                        Issuer: {cert.issuer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Showcase */}
            {projects.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-6">Project Portfolio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-colors flex flex-col justify-between h-full">
                      <div>
                        {project.project_url ? (
                          <a href={project.project_url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline font-bold text-lg block truncate mb-2">{project.title} -{">"}</a>
                        ) : (
                          <span className="text-white font-bold text-lg block truncate mb-2">{project.title}</span>
                        )}
                        <p className="text-gray-400 text-sm leading-relaxed">{project.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}