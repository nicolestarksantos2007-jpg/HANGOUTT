'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, UserRole, UserStatus } from '@/types/hangout';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isPendingApproval: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpUser: (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole, 
    team?: string
  ) => Promise<{ error: string | null; message?: string }>;
  signOut: () => Promise<void>;
  getAllProfiles: () => Promise<UserProfile[]>;
  updateUserStatus: (profileId: string, status: UserStatus) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const loadUserProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
      }

      if (data) {
        setProfile(data as UserProfile);
        // Se for pendente e não for o líder base oficial, bloquear acesso
        if (data.status === 'pending' && data.email !== 'eduardopiccinimartins@gmail.com') {
          setIsPendingApproval(true);
        } else {
          setIsPendingApproval(false);
        }
      } else if (userEmail === 'eduardopiccinimartins@gmail.com') {
        // Fallback garantido para Eduardo como Líder Base
        const adminProfile: UserProfile = {
          id: userId,
          full_name: 'Eduardo Piccini',
          email: 'eduardopiccinimartins@gmail.com',
          role: 'lider_base',
          team: 'Liderança Base',
          status: 'approved',
          is_active: true,
          created_at: new Date().toISOString()
        };
        setProfile(adminProfile);
        setIsPendingApproval(false);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserProfile(session.user.id, session.user.email);
        }
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
          setIsPendingApproval(false);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      setSession(data.session);
      setUser(data.user);

      if (data.user) {
        await loadUserProfile(data.user.id, cleanEmail);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao realizar login.' };
    }
  };

  const signUpUser = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole, 
    team?: string
  ) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isBaseLeader = cleanEmail === 'eduardopiccinimartins@gmail.com' || role === 'lider_base';
      const initialStatus: UserStatus = isBaseLeader ? 'approved' : 'pending';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
            team: team || (isBaseLeader ? 'Liderança Base' : 'Time 1'),
            status: initialStatus
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Gravar no profiles explicitamente
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: cleanEmail,
          role,
          team: team || (isBaseLeader ? 'Liderança Base' : 'Time 1'),
          status: initialStatus,
          is_active: true
        });
      }

      if (initialStatus === 'pending') {
        return {
          error: null,
          message: 'Cadastro realizado com sucesso! Sua conta foi enviada para o Líder Base e você terá acesso assim que ele aprovar seu cadastro no painel de administração.'
        };
      }

      return {
        error: null,
        message: 'Cadastro de Líder Base realizado com sucesso! Faça login para continuar.'
      };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao cadastrar.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Erro ao encerrar sessão:', err);
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsPendingApproval(false);
  };

  const getAllProfiles = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar perfis:', error);
      return [];
    }
    return (data || []) as UserProfile[];
  };

  const updateUserStatus = async (profileId: string, status: UserStatus): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', profileId);

    if (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      isPendingApproval,
      signIn,
      signUpUser,
      signOut,
      getAllProfiles,
      updateUserStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
