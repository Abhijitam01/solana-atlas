'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function AuthButton() {
  const { user, loading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <LoadingSpinner size="sm" className="text-white/50" text="Loading" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14F195] to-[#00D18C] p-[1px]"
        >
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
            {user.user_metadata.avatar_url ? (
              <Image 
                src={user.user_metadata.avatar_url} 
                alt="User" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <UserIcon className="w-5 h-5 text-[#14F195]" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-white/10">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata.full_name || user.email}
                  </p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
                
                <div className="p-1">
                  <Link 
                    href="/my-code"
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <UserIcon className="w-4 h-4" />
                    My Code
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-base font-medium text-white/60 hover:text-white transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-base font-medium"
      >
        Sign Up
      </Link>
    </div>
  );
}
