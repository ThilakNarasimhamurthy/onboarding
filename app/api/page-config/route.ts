import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('page_config')
      .select('*');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    const config = {
      page2_components: data.filter(d => d.page_number === 2).map(d => d.component),
      page3_components: data.filter(d => d.page_number === 3).map(d => d.component)
    };
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { page2Components, page3Components } = await request.json();
    
    if (page2Components.length === 0 || page3Components.length === 0) {
      return NextResponse.json({ error: 'Each page must have at least one component' }, { status: 400 });
    }
    
    // Delete ALL existing config first
    const { error: deleteError } = await supabase
      .from('page_config')
      .delete()
      .gte('page_number', 1);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }
    
    // Insert new config
    const updates = [
      ...page2Components.map((c: string) => ({ component: c, page_number: 2 })),
      ...page3Components.map((c: string) => ({ component: c, page_number: 3 }))
    ];
    
    const { error: insertError } = await supabase
      .from('page_config')
      .insert(updates);
    
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
