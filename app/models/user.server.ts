import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import invariant from "tiny-invariant";

export type User = { id: string; email: string };

// Abstract this away
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

invariant(
  supabaseUrl,
  "SUPABASE_URL must be set in your environment variables."
);
invariant(
  supabaseAnonKey,
  "SUPABASE_ANON_KEY must be set in your environment variables."
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createUser_old(email: string, password: string) {
  
  const { data,error } = await supabase.auth.signUp({
    email,
    password
  });
  // get the user profile after created
  const profile = await getProfileByEmail(data?.user?.email);

  return profile;
}

export async function createUser(name: string, surname:string, sec_surname:string, rut:string, phone:string, email: string) {  
  const aux = rut.replace(/\./g,'').replace('-','');  
  const rutInt = parseInt(aux.substring(0,aux.length-1));  
  const dv = rut.substring(rut.length-1,rut.length);  
  const { data,error } = await supabase.auth.signUp({
    email: email,
    password: rutInt.toString(),
    options:{
      data:{
        rut: rutInt,
        dv:dv,
        nombres:name,
        apellidoPat: surname,
        apellidoMat: sec_surname,
        telefono:phone
      }}    
  });  
  if(data.user){
    return {email: data.user.email, id: data.user.id};
  }
  // get the user profile after created  
  return null;
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("email, id")
    .eq("id", id)
    .single();

  if (error) return null;
  if (data) return { id: data.id, email: data.email };
}

export async function getProfileByEmail(email?: string) {
  const { data, error } = await supabase
    .from("users")
    .select("email, id")
    .eq("email", email)
    .single();

  if (error) return null;
  if (data) return data;
}

export async function verifyLogin_old(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return undefined;
  const profile = await getProfileByEmail(data?.user?.email);

  return profile;
}

export async function verifyLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return undefined;  
  return {email: data.user?.email, id: data.user?.id};
}
