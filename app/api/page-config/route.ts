import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Ensure this runs on the Edge Runtime
export const runtime = 'nodejs';

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
    const body = await request.json();
    const { page2Components, page3Components } = body;
    
    if (!page2Components || !page3Components) {
      return NextResponse.json({ error: 'Missing required components' }, { status: 400 });
    }
    
    if (page2Components.length === 0 || page3Components.length === 0) {
      return NextResponse.json({ error: 'Each page must have at least one component' }, { status: 400 });
    }
    
    // Check for duplicate components across pages
    const duplicates = page2Components.filter((component: string) => 
      page3Components.includes(component)
    );
    
    if (duplicates.length > 0) {
      return NextResponse.json({ 
        error: `Duplicate components found: ${duplicates.join(', ')}. Each component can only be assigned to one page.` 
      }, { status: 400 });
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

// Explicitly export all HTTP methods we support
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
