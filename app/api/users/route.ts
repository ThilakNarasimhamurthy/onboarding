import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash, current_step: 2 })
      .select('id, current_step')
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ userId: data.id, currentStep: data.current_step });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, current_step')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return NextResponse.json({ exists: false });
    }
    
    return NextResponse.json({ exists: true, userId: data.id, currentStep: data.current_step });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
