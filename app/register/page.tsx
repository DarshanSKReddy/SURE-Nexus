"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // 🔐 Step 1: Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 🧠 Step 2: Insert into profiles table
      if (data.user) {
        const { error: dbError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: data.user.email,
            role: "student", // ✅ IMPORTANT
          },
        ]);

        if (dbError) {
          console.error("DB ERROR:", dbError.message);
          alert("Database error: " + dbError.message);
          return;
        }
      }

      alert("Check your email for confirmation ✅");
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Register</h1>

      <input
        className="border p-2 m-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 m-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2"
        onClick={handleRegister}
      >
        Register
      </button>
    </div>
  );
}