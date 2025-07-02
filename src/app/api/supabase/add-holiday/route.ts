import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Create a client for user authentication
const createSupabaseClient = (request: NextRequest) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') ?? '',
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const authClient = createSupabaseClient(request)
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const { name, destination, start_date, end_date, adults, children, description } = body

    // Validate required fields
    if (!name || !destination || !start_date || !end_date || !adults) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate data types
    if (typeof adults !== 'number' || typeof children !== 'number') {
      return NextResponse.json(
        { error: 'Adults and children must be numbers' },
        { status: 400 }
      )
    }

    // Validate date format and logic
    const start = new Date(start_date)
    const end = new Date(end_date)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Insert into Supabase with user_id
    const { data, error } = await supabase
      .from('holidays')
      .insert([
        {
          name,
          destination,
          start_date: start_date,
          end_date: end_date,
          adults,
          children,
          description: description || null,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create holiday' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Holiday created successfully',
        holiday: data[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}