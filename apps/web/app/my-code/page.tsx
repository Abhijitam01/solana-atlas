'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useAuth } from '@/components/providers/AuthProvider';
import { motion } from 'framer-motion';
import { Code2, Clock, Star, Trash2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function MyCodePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: userCode, isLoading } = trpc.code.getMyCode.useQuery();
  const deleteMutation = trpc.code.delete.useMutation({
    onSuccess: () => {
      // Invalidate query to refresh list
      // utils.code.getMyCode.invalidate() would be better if utils was available here
      // But react-query handles refetch on window focus or we can force it.
      // Better to use useUtils() and invalidate.
    }
  });
  const utils = trpc.useUtils();
  const toggleFavoriteMutation = trpc.code.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.code.getMyCode.invalidate();
    }
  });

  // Override delete mutation to use utils
  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => utils.code.getMyCode.invalidate()
    });
  };

  const filteredCode = userCode?.filter((code) =>
    code.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to view your code</h2>
          <p className="text-white/60">Your saved code will appear here</p>
          <Link href="/" className="text-[#14F195] hover:underline mt-4 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Code</h1>
          <p className="text-white/60">Your saved Solana programs</p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your code..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#14F195] transition-colors"
            />
          </div>
          <Link
            href="/playground/hello-solana"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#14F195] to-[#00D18C] text-black font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Code
          </Link>
        </div>

        {/* Code Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="md" className="text-white/60" text="Loading..." />
          </div>
        ) : filteredCode && filteredCode.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCode.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/playground/${code.templateId}?code=${code.id}`}
                  className="group block h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14F195]/20 to-[#9945FF]/20 border border-[#14F195]/20 flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-[#14F195]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavoriteMutation.mutate({
                            id: code.id,
                            isFavorite: !code.isFavorite,
                          });
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            code.isFavorite
                              ? 'fill-[#fbbf24] text-[#fbbf24]'
                              : 'text-white/40'
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Delete this code?')) {
                            handleDelete(code.id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#14F195] transition-colors">
                    {code.title}
                  </h3>

                  <p className="text-sm text-white/60 mb-4 line-clamp-2 font-mono">
                    {code.code.split('\n')[0]}...
                  </p>

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(code.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5">
                      {code.templateId}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Code2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No code yet</h3>
            <p className="text-white/60 mb-6">
              Start creating Solana programs in the playground
            </p>
            <Link
              href="/playground/hello-solana"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#14F195] to-[#00D18C] text-black font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Create Your First Program
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
