import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const activityId = params.id

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      )
    }

    // Verify the activity exists before deleting
    const { data: existingActivity, error: fetchError } = await supabase
      .from('holiday_activities')
      .select('id, holiday_id')
      .eq('id', activityId)
      .single()

    if (fetchError || !existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    // Delete the activity
    const { error: deleteError } = await supabase
      .from('holiday_activities')
      .delete()
      .eq('id', activityId)

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete activity', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Activity deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// export async function PUT(request: NextRequest, { params }: RouteParams) {
//   try {
//     const activityId = params.id
//     const body = await request.json()

//     if (!activityId) {
//       return NextResponse.json(
//         { error: 'Activity ID is required' },
//         { status: 400 }
//       )
//     }

//     // Verify the activity exists
//     const { data: existingActivity, error: fetchError } = await supabase
//       .from('holiday_activities')
//       .select('*')
//       .eq('id', activityId)
//       .single()

//     if (fetchError || !existingActivity) {
//       return NextResponse.json(
//         { error: 'Activity not found' },
//         { status: 404 }
//       )
//     }

//     // Prepare update data
//     const updateData = {
//       ...body,
//       updated_at: new Date().toISOString()
//     }

//     // Remove fields that shouldn't be updated
//     delete updateData.id
//     delete updateData.created_at

//     // Update the activity
//     const { data: updatedActivity, error: updateError } = await supabase
//       .from('holiday_activities')
//       .update(updateData)
//       .eq('id', activityId)
//       .select()
//       .single()

//     if (updateError) {
//       console.error('Supabase update error:', updateError)
//       return NextResponse.json(
//         { error: 'Failed to update activity', details: updateError.message },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json(
//       { 
//         message: 'Activity updated successfully',
//         activity: updatedActivity
//       },
//       { status: 200 }
//     )

//   } catch (error) {
//     console.error('API Route Error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }