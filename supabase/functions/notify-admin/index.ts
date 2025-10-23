import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { SmtpClient } from "npm:smtp@1.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

const ADMIN_EMAIL = 'bstarly@asu.edu'

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
    const { name, organization, role } = metadata || {}

    // Create SMTP client
    const client = new SmtpClient()

    // Connect to ASU SMTP server
    await client.connectTLS({
      hostname: "smtp.asu.edu",
      port: 587,
      username: Deno.env.get("SMTP_USERNAME"),
      password: Deno.env.get("SMTP_PASSWORD"),
    })

    // Send email to admin
    await client.send({
      from: "noreply@asu.edu",
      to: ADMIN_EMAIL,
      subject: "New TalentVault Access Request",
      content: `
        New access request received:
        
        Name: ${name}
        Organization: ${organization}
        Role: ${role}
        Email: ${email}
        
        To approve this request, please visit the TalentVault admin dashboard.
      `,
    })

    await client.close()

    return new Response(
      JSON.stringify({ message: 'Admin notification sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending admin notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})