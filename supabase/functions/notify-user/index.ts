import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { SmtpClient } from "npm:smtp@1.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { record } = await req.json()

    if (!record) {
      throw new Error('No record provided')
    }

    const { email, metadata } = record
    const { name } = metadata || {}

    // Create SMTP client
    const client = new SmtpClient()

    // Connect to ASU SMTP server
    await client.connectTLS({
      hostname: "smtp.asu.edu",
      port: 587,
      username: Deno.env.get("SMTP_USERNAME"),
      password: Deno.env.get("SMTP_PASSWORD"),
    })

    // Send approval email to user
    await client.send({
      from: "noreply@asu.edu",
      to: email,
      subject: "Your TalentVault Access Request Has Been Approved",
      content: `
        Dear ${name},

        Your request for access to TalentVault has been approved! You can now create your account and start accessing our platform.

        Please visit https://talentvault.asu.edu to get started.

        Best regards,
        The TalentVault Team
      `,
    })

    await client.close()

    return new Response(
      JSON.stringify({ message: 'User notification sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending user notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})