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
  community_link?: string;
};

type Project = { id: string; title: string; description: string; project_url?: string; };
type Certificate = { id: string; title: string; issuer: string; credential_url?: string; };

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [hasStartedCourses, setHasStartedCourses] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Nav Dropdown
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Edit State
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCommunity, setEditCommunity] = useState("");
  const [uploading, setUploading] = useState(false);

  // Project/Cert State
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");
  const [certType, setCertType] = useState<"external" | "sure_trust">("sure_trust");
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certUrl, setCertUrl] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) { window.location.href = "/login"; return; }

      // Fetch Profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
      if (profileData) setProfile(profileData as Profile);

      // Fetch Projects & Certs
      const { data: projectsData } = await supabase.from("projects").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false });
      setProjects((projectsData as Project[]) || []);

      const { data: certsData } = await supabase.from("certificates").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false });
      setCertificates((certsData as Certificate[]) || []);

      // Check Course Progress
      const { data: progressData, error: progressError } = await supabase.from("course_progress").select("id").eq("user_id", userData.user.id).limit(1);
      if (!progressError && progressData && progressData.length > 0) {
        setHasStartedCourses(true);
      }

      setLoading(false);
    }
    loadDashboardData();
  }, []);

  const handleSaveDashboardProfile = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ name: editName, bio: editBio, avatar_url: editAvatar, role: editRole, community_link: editCommunity })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, name: editName, bio: editBio, avatar_url: editAvatar, role: editRole, community_link: editCommunity });
      setIsEditing(false);
    }
  };

  const openDashboardEdit = () => {
    setEditName(profile?.name || "");
    setEditBio(profile?.bio || "");
    setEditAvatar(profile?.avatar_url || "");
    setEditRole(profile?.role || "");
    setEditCommunity(profile?.community_link || "");
    setIsEditing(true);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error("Select an image.");
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setEditAvatar(data.publicUrl);
    } catch (err) {
      if (err instanceof Error) alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleAddProject = async () => {
    if (!profile || !newProjectTitle || !newProjectDesc) return;
    const { data, error } = await supabase.from("projects").insert([{ user_id: profile.id, title: newProjectTitle, description: newProjectDesc, project_url: newProjectUrl || null }]).select().single();
    if (!error && data) { setProjects([data as Project, ...projects]); setIsAddingProject(false); setNewProjectTitle(""); setNewProjectDesc(""); setNewProjectUrl(""); }
  };
  
  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) setProjects(projects.filter((p) => p.id !== id));
  };
  
  const handleAddCertificate = async () => {
    if (!profile || !certTitle) return;
    const finalIssuer = certType === "sure_trust" ? "SURE Trust" : certIssuer;
    const { data, error } = await supabase.from("certificates").insert([{ user_id: profile.id, title: certTitle, issuer: finalIssuer, credential_url: certUrl || null }]).select().single();
    if (!error && data) { setCertificates([data as Certificate, ...certificates]); setIsAddingCert(false); setCertTitle(""); setCertIssuer(""); setCertUrl(""); }
  };
  
  const handleDeleteCertificate = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (!error) setCertificates(certificates.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden pb-12">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]"></div>

      <nav className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md p-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center relative px-2">
          
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter">
              SURE Nexus
            </h1>
            <Link href="/courses" className="flex items-center gap-2 bg-purple-600/10 text-purple-300 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-purple-500/30">
              SkillXplore
            </Link>
          </div>
          
          <div className="relative">
            <button onClick={() => setIsNavOpen(!isNavOpen)} className="flex items-center gap-3 focus:outline-none">
              <span className="hidden md:block text-sm font-medium">{profile?.name}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile?.avatar_url || DEFAULT_AVATAR} alt="nav-avatar" className="w-10 h-10 rounded-full border-2 border-purple-500 hover:scale-105 transition-transform" />
            </button>

            {isNavOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col z-[100]">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <p className="font-bold text-white truncate">{profile?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                </div>
                <Link href="/profile" className="p-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-2">Edit Profile</Link>
                <button onClick={() => {setIsNavOpen(false); setIsSettingsOpen(true);}} className="p-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 text-left w-full">Settings</button>
                <button onClick={handleLogout} className="p-3 text-sm hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2 text-left w-full border-t border-white/10">Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 md:p-6 pt-8 z-10 relative">
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar_url || DEFAULT_AVATAR} alt="avatar" className="w-32 h-32 rounded-full border-4 border-purple-500/50 object-cover shadow-lg shadow-purple-500/20 bg-[#111]" />
                <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
                <span className="mt-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs uppercase tracking-wider rounded-full font-semibold">{profile.role}</span>
                <p className="mt-4 text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
                
                {profile.community_link && (
                  <a href={profile.community_link} target="_blank" rel="noopener noreferrer" className="mt-4 w-full bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600 hover:text-white transition-all py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2">
                    Join Classroom / Group
                  </a>
                )}

                <button onClick={openDashboardEdit} className="mt-4 w-full bg-white/10 hover:bg-purple-600 border border-white/10 transition-all duration-300 py-2 rounded-lg text-sm font-medium">Quick Edit</button>

                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/portfolio/${profile.id}`;
                    navigator.clipboard.writeText(url);
                    alert("Public Portfolio Link Copied! Share this with anyone.");
                  }} 
                  className="mt-3 w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all duration-300 py-2 rounded-lg text-sm font-bold"
                >
                  Copy Public Portfolio Link
                </button>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Quick Glance</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-purple-400 font-semibold block mb-1">Skills</span> 
                    <span className="text-gray-300 line-clamp-2">{profile.skills || "Not added"}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold block mb-1">Languages Known</span> 
                    <span className="text-gray-300 line-clamp-2">{profile.languages || "Not added"}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold block mb-1">Internships & Experience</span> 
                    <span className="text-gray-300 line-clamp-3">{profile.experience || "Not added"}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold block mb-1">Career Interests</span> 
                    <span className="text-gray-300 line-clamp-2">{profile.career_interests || "Not added"}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold block mb-1">Extracurriculars</span> 
                    <span className="text-gray-300 line-clamp-2">{profile.extracurriculars || "Not added"}</span>
                  </div>
                  <Link href="/profile" className="text-xs text-blue-400 hover:underline mt-4 block text-center font-bold bg-blue-500/10 py-2 rounded-lg">Edit these in Advanced Profile -{">"}</Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              
              {/* 🟢 NEW: Compact Learning Banner linking directly to SkillXplore (/courses) */}
              <div className="bg-gradient-to-r from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div>
                  <h3 className="text-xl font-black text-white mb-1">
                    {hasStartedCourses ? "Resume Your Learning" : "Explore SkillXplore"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {hasStartedCourses 
                      ? "Jump back into your courses and earn your credentials."
                      : "Discover new courses, pass quizzes, and earn certificates."}
                  </p>
                </div>
                <Link href="/courses" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap z-10">
                  {hasStartedCourses ? "Continue ->" : "Browse Courses ->"}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/courses/python/day-1" className="bg-white/5 border border-purple-500/30 hover:border-purple-500 rounded-xl p-4 transition-all">
                  <p className="text-xs uppercase tracking-widest text-purple-300 mb-1 font-bold">Quick Start</p>
                  <p className="text-white font-bold">Python 100 Days - Day 1</p>
                  <p className="text-gray-400 text-sm mt-1">Start learning and unlock Day 2 by passing 8/10.</p>
                </Link>
                <Link href="/courses/webdev/section-1" className="bg-white/5 border border-blue-500/30 hover:border-blue-500 rounded-xl p-4 transition-all">
                  <p className="text-xs uppercase tracking-widest text-blue-300 mb-1 font-bold">Quick Start</p>
                  <p className="text-white font-bold">Web Development - Section 1</p>
                  <p className="text-gray-400 text-sm mt-1">Complete the quiz with 8/10 to unlock Section 2.</p>
                </Link>
              </div>

              {/* Course and Certifications */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-200">Course and Certifications</h3>
                  <button onClick={() => setIsAddingCert(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">Add Certificate(s)</button>
                </div>
                {certificates.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/20"><p className="text-gray-500 text-sm">No certificates added yet.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="bg-black/40 border border-white/5 rounded-lg p-4 flex justify-between items-center group">
                        <div>
                          {cert.credential_url ? <a href={cert.credential_url} target="_blank" className="text-blue-400 hover:underline font-bold text-lg block truncate">{cert.title} -{">"}</a> : <span className="text-white font-bold text-lg block truncate">{cert.title}</span>}
                          <span className="text-xs font-semibold px-2 py-1 mt-2 inline-block rounded bg-white/10 text-gray-300">Issuer: {cert.issuer}</span>
                        </div>
                        <button onClick={() => handleDeleteCertificate(cert.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors text-sm font-medium">Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-200">Projects</h3>
                  <button onClick={() => setIsAddingProject(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">Add Project(s)</button>
                </div>
                {projects.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-black/20"><p className="text-gray-500 text-sm">Add your first project to showcase it here.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col justify-between">
                        <div>
                          {project.project_url ? <a href={project.project_url} target="_blank" className="text-purple-400 hover:underline font-bold text-lg block truncate">{project.title} -{">"}</a> : <span className="text-white font-bold text-lg block truncate">{project.title}</span>}
                          <p className="text-gray-400 mt-2 text-sm line-clamp-3">{project.description}</p>
                        </div>
                        <button onClick={() => handleDeleteProject(project.id)} className="mt-4 self-end bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded transition-colors text-sm font-medium">Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : null}
      </main>

      {/* --- MODALS --- */}
      
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Dashboard Quick Edit</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div><label className="block text-sm text-gray-400 mb-1">Full Name</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" /></div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role(s)</label>
                <p className="text-xs text-gray-500 mb-2">You can type multiple (e.g., &quot;Student, Mentor, Intern&quot;)</p>
                <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Community Group Link</label>
                <p className="text-xs text-gray-500 mb-2">Paste a WhatsApp or Telegram link for students to join</p>
                <input type="url" value={editCommunity} onChange={(e) => setEditCommunity(e.target.value)} placeholder="https://chat.whatsapp.com/..." className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Profile Picture</label>
                <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-500/20 file:text-purple-400 cursor-pointer mb-2" />
                <input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="Or paste image URL here..." className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 text-sm" />
              </div>
              <div><label className="block text-sm text-gray-400 mb-1">Short Bio</label><textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 resize-none"></textarea></div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={handleSaveDashboardProfile} disabled={uploading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors">Save Updates</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-200 border-b border-white/10 pb-4">Platform Settings</h2>
            
            <div className="space-y-2">
              <button className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                <span className="font-medium text-gray-300">Notifications</span>
                <span className="text-gray-500">▼</span>
              </button>
              <button className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                <span className="font-medium text-gray-300">Password & Security</span>
                <span className="text-gray-500">▼</span>
              </button>
              <button className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                <span className="font-medium text-gray-300">Manage Devices</span>
                <span className="text-gray-500">▼</span>
              </button>
            </div>

            <button onClick={() => setIsSettingsOpen(false)} className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors">Done</button>
          </div>
        </div>
      )}

      {isAddingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"><h2 className="text-2xl font-bold mb-4 text-purple-400">Add New Project</h2><div className="space-y-4"><div><label className="block text-sm text-gray-400 mb-1">Project Title *</label><input type="text" value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" /></div><div><label className="block text-sm text-gray-400 mb-1">Project Link (Optional)</label><input type="url" value={newProjectUrl} onChange={(e) => setNewProjectUrl(e.target.value)} placeholder="https://" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" /></div><div><label className="block text-sm text-gray-400 mb-1">Description *</label><textarea value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} rows={3} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 resize-none"></textarea></div></div><div className="mt-6 flex gap-3"><button onClick={handleAddProject} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors">Publish Project</button><button onClick={() => setIsAddingProject(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors">Cancel</button></div></div></div>
      )}
      
      {isAddingCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"><h2 className="text-2xl font-bold mb-4 text-blue-400">Add Certificate</h2><div className="flex gap-4 mb-4"><label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"><input type="radio" checked={certType === "sure_trust"} onChange={() => setCertType("sure_trust")} className="text-blue-500 bg-black/50 border-white/10" />SURE Nexus Certificate</label><label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"><input type="radio" checked={certType === "external"} onChange={() => setCertType("external")} className="text-blue-500 bg-black/50 border-white/10" />External Certificate</label></div><div className="space-y-4"><div><label className="block text-sm text-gray-400 mb-1">Course/Certificate Title *</label><input type="text" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" /></div>{certType === "external" && (<div><label className="block text-sm text-gray-400 mb-1">Issuing Organization *</label><input type="text" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" /></div>)}<div><label className="block text-sm text-gray-400 mb-1">Credential URL (Optional)</label><input type="url" value={certUrl} onChange={(e) => setCertUrl(e.target.value)} placeholder="https://" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500" /></div></div><div className="mt-6 flex gap-3"><button onClick={handleAddCertificate} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">Add Certificate</button><button onClick={() => setIsAddingCert(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors">Cancel</button></div></div></div>
      )}
    </div>
  );
}