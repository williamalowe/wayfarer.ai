import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { HolidayActivity } from '@/types/HolidayActivity'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use service role key for server-side operations
)

interface CreateActivityRequest {
  holiday_id: string
  activity_name: string
  venue_name: string
  start_time: string
  activity_date: string
  day_number: number
  // Optional fields that could be added later
  description?: string
  activity_type?: string
  address?: string
  city?: string
  state_province?: string
  country?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  end_time?: string
  duration_minutes?: number
  estimated_cost?: number
  actual_cost?: number
  cost_per_person?: boolean
  currency?: string
  booking_status?: string
  is_booked?: boolean
  category?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateActivityRequest = await request.json()

    // Validate required fields
    if (!body.holiday_id) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      )
    }

    if (!body.activity_name?.trim()) {
      return NextResponse.json(
        { error: 'Activity name is required' },
        { status: 400 }
      )
    }

    if (!body.venue_name?.trim()) {
      return NextResponse.json(
        { error: 'Venue/location name is required' },
        { status: 400 }
      )
    }

    if (!body.start_time?.trim()) {
      return NextResponse.json(
        { error: 'Start time is required' },
        { status: 400 }
      )
    }

    if (!body.activity_date?.trim()) {
      return NextResponse.json(
        { error: 'Activity date is required' },
        { status: 400 }
      )
    }

    if (typeof body.day_number !== 'number') {
      return NextResponse.json(
        { error: 'Day number is required' },
        { status: 400 }
      )
    }

    // Verify the holiday exists and get user authentication
    const { data: holiday, error: holidayError } = await supabase
      .from('holidays')
      .select('id, user_id')
      .eq('id', body.holiday_id)
      .single()

    if (holidayError || !holiday) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      )
    }

    // Get the current sort order for this day
    const { data: existingActivities, error: sortError } = await supabase
      .from('holiday_activities')
      .select('sort_order')
      .eq('holiday_id', body.holiday_id)
      .eq('day_number', body.day_number)
      .order('sort_order', { ascending: false })
      .limit(1)

    if (sortError) {
      console.error('Error getting sort order:', sortError)
    }

    const nextSortOrder = existingActivities && existingActivities.length > 0 
      ? (existingActivities[0].sort_order || 0) + 1 
      : 1

    // Create the activity object
    const activityData: Partial<HolidayActivity> = {
      holiday_id: body.holiday_id,
      activity_name: body.activity_name.trim(),
      venue_name: body.venue_name.trim(),
      start_time: body.start_time,
      activity_date: body.activity_date,
      day_number: body.day_number,
      sort_order: nextSortOrder,
      
      // Optional fields with defaults
      activity_type: body.activity_type || null,
      description: body.description?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city?.trim() || null,
      state_province: body.state_province?.trim() || null,
      country: body.country?.trim() || null,
      postal_code: body.postal_code?.trim() || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      end_time: body.end_time || null,
      duration_minutes: body.duration_minutes || null,
      estimated_cost: body.estimated_cost || null,
      actual_cost: body.actual_cost || null,
      cost_per_person: body.cost_per_person || null,
      currency: body.currency || null,
      booking_status: body.booking_status || null,
      is_booked: body.is_booked || false,
      category: body.category || null,
      notes: body.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the activity into Supabase
    const { data: newActivity, error: insertError } = await supabase
      .from('holiday_activities')
      .insert([activityData])
      .select()
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create activity', details: insertError.message },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Activity created successfully',
        activity: newActivity
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const holidayId = searchParams.get('holiday_id')

    if (!holidayId) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      )
    }

    // Get all activities for a holiday
    const { data: activities, error } = await supabase
      .from('holiday_activities')
      .select('*')
      .eq('holiday_id', holidayId)
      .order('day_number', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      activities: activities || []
    })

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

