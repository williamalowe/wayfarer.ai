// TODO: Resolve Typing Issues
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'


// Make sure you're using the same variable name
// const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
})

// Schema for a single activity
const ActivitySchema = z.object({
  activity_name: z.string().describe('Name of the activity'),
  venue_name: z.string().describe('Location/venue where the activity takes place'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).describe('Start time in HH:MM format (24-hour)'),
  description: z.string().optional().describe('Optional description or notes about the activity'),
  sort_order: z.number().int().min(1).describe('Order of the activity in the day (starting from 1)')
})

// Schema for the complete day plan
const DayPlanSchema = z.object({
  activities: z.array(ActivitySchema).min(1).max(8).describe('List of activities for the day (1-8 activities)')
})

// Database interaction function (you'll need to implement based on your DB setup)
async function saveActivitiesToDatabase(holidayId: string, dayNumber: number, dayDate: string, activities: z.infer<typeof ActivitySchema>[]) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  try {
    const savePromises = activities.map(async (activity) => {
      const response = await fetch(`${baseUrl}/api/supabase/holiday-activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          holiday_id: holidayId,
          day_number: dayNumber,
          activity_date: dayDate, // Add the activity date
          activity_name: activity.activity_name,
          venue_name: activity.venue_name,
          start_time: activity.start_time,
          description: activity.description,
          sort_order: activity.sort_order,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to save activity: ${errorData.error}`)
      }

      return response.json()
    })

    await Promise.all(savePromises)
    return { success: true }
  } catch (error) {
    console.error('Error saving activities to database:', error)
    throw error
  }
}

// Function to get existing activities for the holiday
async function getExistingActivities(holidayId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/supabase/holiday-activities?holiday_id=${holidayId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch existing activities')
    }
    
    const data = await response.json()
    return data.activities || []
  } catch (error) {
    console.error('Error fetching existing activities:', error)
    return []
  }
}

// Function to get holiday context (you might want to fetch from your database)
async function getHolidayContext(holidayId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/supabase/holidays/${holidayId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch holiday details')
    }
    
    const holiday = await response.json()
    return holiday
  } catch (error) {
    console.error('Error fetching holiday context:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { holidayId, dayNumber, dayDate, preferences } = body

    // Validate required fields
    if (!holidayId || !dayNumber || !dayDate) {
      return NextResponse.json(
        { error: 'Missing required fields: holidayId, dayNumber, or dayDate' },
        { status: 400 }
      )
    }

    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dayDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD format.' },
        { status: 400 }
      )
    }

    // Get holiday context for better planning
    const holidayContext = await getHolidayContext(holidayId)
    
    // Get existing activities to avoid duplicates
    const existingActivities = await getExistingActivities(holidayId)
    
    // Filter out activities for the current day (in case we're re-planning)
    const activitiesFromOtherDays = existingActivities.filter(
      (activity: any) => activity.day_number !== dayNumber
    )
    
    // Extract activity and venue names for duplicate checking
    const existingActivityNames = activitiesFromOtherDays.map((activity: any) => activity.activity_name)
    const existingVenueNames = activitiesFromOtherDays.map((activity: any) => activity.venue_name)
    
    // Format the date for better context
    const formattedDate = new Date(dayDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Build the system prompt
    const systemPrompt = `You are a professional travel planner creating detailed daily itineraries. Your task is to generate a realistic and enjoyable day plan with specific activities, venues, and timing.

Context:
- Holiday: ${holidayContext?.name || 'Holiday'} in ${holidayContext?.destination || 'destination'}
- Day: ${dayNumber} (${formattedDate})
- Date: ${dayDate}

IMPORTANT - Avoid Duplicates:
${existingActivityNames.length > 0 ? 
  `Do NOT suggest any of these activities that are already planned for other days:
${existingActivityNames.map((name: any) => `- ${name}`).join('\n')}

Do NOT suggest any of these venues that are already being visited:
${existingVenueNames.map((name: any) => `- ${name}`).join('\n')}

Make sure to suggest completely different activities and venues from those listed above.` 
  : 'This is the first day being planned, so no existing activities to avoid.'}

Guidelines:
- Plan 3-6 activities for a full day (can be fewer for relaxed days)
- Include a mix of activities: sightseeing, dining, entertainment, relaxation
- Use realistic timing (consider travel time, meal times, opening hours)
- Start the day around 8:00-9:00 AM
- Include at least one meal (lunch or dinner)
- Ensure activities are logically sequenced geographically when possible
- Provide specific venue names (real places when possible, or realistic examples)
- Consider the day of the week for opening hours and availability
- Suggest activities and venues that are different from any already planned

Time format: Use 24-hour format (HH:MM) for all times.`

    // Build the user prompt
    let userPrompt = `Plan activities for day ${dayNumber} of a trip to ${holidayContext?.destination || 'the destination'}.`
    
    if (preferences && preferences.trim()) {
      userPrompt += `\n\nUser preferences: ${preferences.trim()}`
    } else {
      userPrompt += `\n\nNo specific preferences provided - create a well-rounded day with popular attractions, good food, and a mix of activities.`
    }

    if (existingActivityNames.length > 0) {
      userPrompt += `\n\nIMPORTANT: This holiday already has ${existingActivityNames.length} activities planned for other days. Make sure to suggest completely different activities and venues to avoid repetition and ensure variety throughout the trip.`
    }

    userPrompt += `\n\nGenerate a structured day plan with activities, specific venues, realistic timing, and helpful descriptions.`

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "day_plan",
          schema: {
            type: "object",
            properties: {
              activities: {
                type: "array",
                minItems: 1,
                maxItems: 8,
                items: {
                  type: "object",
                  properties: {
                    activity_name: {
                      type: "string",
                      description: "Name of the activity"
                    },
                    venue_name: {
                      type: "string", 
                      description: "Location/venue where the activity takes place"
                    },
                    start_time: {
                      type: "string",
                      pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
                      description: "Start time in HH:MM format (24-hour)"
                    },
                    description: {
                      type: "string",
                      description: "Optional description or notes about the activity"
                    },
                    sort_order: {
                      type: "integer",
                      minimum: 1,
                      description: "Order of the activity in the day (starting from 1)"
                    }
                  },
                  required: ["activity_name", "venue_name", "start_time", "sort_order"],
                  additionalProperties: false
                }
              }
            },
            required: ["activities"],
            additionalProperties: false
          }
        }
      },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const result = completion.choices[0]?.message?.parsed

    if (!result) {
      throw new Error('Failed to generate day plan - no result from OpenAI')
    }

    // Validate the response with Zod
    const validatedPlan = DayPlanSchema.parse(result)

    // Save activities to database
    await saveActivitiesToDatabase(holidayId, dayNumber, dayDate, validatedPlan.activities)

    return NextResponse.json({
      success: true,
      message: `Generated ${validatedPlan.activities.length} activities for day ${dayNumber}`,
      dayPlan: validatedPlan
    })

  } catch (error) {
    console.error('Error in plan-day API:', error)

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid response format from AI', details: error.errors },
        { status: 500 }
      )
    }

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API configuration error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate day plan',
        type: 'generation_error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate a day plan.' },
    { status: 405 }
  )
}