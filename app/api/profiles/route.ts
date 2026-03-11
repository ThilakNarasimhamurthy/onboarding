import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, data: profileData, currentStep } = await request.json();
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(
        { user_id: userId, ...profileData, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }
    
    if (currentStep) {
      const { error: userError } = await supabase
        .from('users')
        .update({ current_step: currentStep })
        .eq('id', userId);
      
      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 400 });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ users: data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
