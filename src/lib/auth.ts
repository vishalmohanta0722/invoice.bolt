import { supabase } from './supabase';

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCompany(userId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { data, error };
}

export async function createCompany(
  userId: string,
  companyData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    tax_id: string;
    currency: string;
    tax_rate: number;
    website: string;
    industry: string;
  }
) {
  const { data, error } = await supabase
    .from('companies')
    .insert([{ user_id: userId, ...companyData }])
    .select()
    .single();

  return { data, error };
}

export async function updateCompany(
  userId: string,
  companyData: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    tax_id: string;
    currency: string;
    tax_rate: number;
    website: string;
    industry: string;
  }>
) {
  const { data, error } = await supabase
    .from('companies')
    .update(companyData)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}
