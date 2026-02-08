import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useDebounce } from './useDebounce';

interface UseAutoSaveProps {
  code: string;
  title: string;
  templateId: string;
  codeId?: string; // If editing existing
  onSaveSuccess?: (id: string) => void;
}

export function useAutoSave({ code, title, templateId, codeId, onSaveSuccess }: UseAutoSaveProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const saveMutation = trpc.code.save.useMutation({
    onSuccess: (data) => {
      utils.code.getMyCode.invalidate();
      if (onSaveSuccess && data.id) {
        onSaveSuccess(data.id);
      }
    },
  });
  
  const debouncedCode = useDebounce(code, 2000); // 2 second delay
  const initialLoad = useRef(true);

  useEffect(() => {
    // Skip auto-save on initial load
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    // Only auto-save if user is logged in
    if (!user) return;

    // Only auto-save if code has changed (debounced)
    // Note: This logic triggers save even if code reverts to original, 
    // but usually checking against lastSavedCode is better. 
    // For V1, simple debounce is fine.
    
    // Check if we have a title (required)
    if (!title) return;

    saveMutation.mutate({
      id: codeId,
      code: debouncedCode,
      title,
      templateId,
    });
  }, [debouncedCode, user, title, templateId, codeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isSaving: saveMutation.isPending,
    lastSaved: saveMutation.data?.updatedAt,
  };
}
