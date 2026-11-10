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
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
  signUpUser: (
    fullName: string, 
    password: string, 
    role: UserRole, 
    team?: string,
    email?: string
  ) => Promise<{ error: string | null; message?: string; status?: UserStatus }>;
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
        
        // Regra de Liberação:
        // Eduardo Piccini e Nicole stark sempre aprovados
        // Voluntários aprovados
        const isOfficialBase = 
          data.email === 'eduardopiccinimartins@gmail.com' || 
          data.email === 'nicolestarksantos2007@gmail.com' ||
          data.full_name?.toLowerCase() === 'eduardo piccini' ||
          data.full_name?.toLowerCase() === 'nicole stark';

        if (data.status === 'pending' && !isOfficialBase) {
          setIsPendingApproval(true);
        } else {
          setIsPendingApproval(false);
        }
      } else if (userEmail === 'eduardopiccinimartins@gmail.com') {
        // Fallback garantido para Eduardo Piccini como Líder Base
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

  const signIn = async (identifier: string, password: string) => {
    try {
      const cleanId = identifier.trim();
      let emailToUse = cleanId.toLowerCase();

      // Se o usuário digitou NOME e SENHA (não contém @):
      if (!cleanId.includes('@')) {
        // Busca na tabela de perfis pelo nome completo
        const { data: matchedProfiles } = await supabase
          .from('profiles')
          .select('email, full_name')
          .ilike('full_name', cleanId)
          .limit(1);

        if (matchedProfiles && matchedProfiles.length > 0 && matchedProfiles[0].email) {
          emailToUse = matchedProfiles[0].email;
        } else {
          // Gera o email interno padronizado
          const slug = cleanId
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
          emailToUse = `${slug || 'membro'}@hangout.local`;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        return { error: 'Nome ou senha incorretos. Verifique seus dados e tente novamente.' };
      }

      setSession(data.session);
      setUser(data.user);

      if (data.user) {
        await loadUserProfile(data.user.id, emailToUse);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao realizar login.' };
    }
  };

  const signUpUser = async (
    fullName: string, 
    password: string, 
    role: UserRole, 
    team?: string,
    email?: string
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          password,
          role,
          team,
          email: email?.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return { error: data.error || 'Erro ao realizar cadastro.' };
      }

      // Se já foi aprovado (ex: Voluntário ou Líder Base oficial), entra direto com Nome e Senha!
      if (data.status === 'approved') {
        await signIn(data.email || fullName, password);
      }

      return {
        error: null,
        message: data.message,
        status: data.status
      };
    } catch (err: any) {
      return { error: err.message || 'Erro ao comunicar com o servidor.' };
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
