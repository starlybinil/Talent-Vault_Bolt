import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()

    if (!record) {
      throw new Error('No record provided')
    }

    const { name, email, message, role_type } = record

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: superAdmins, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('role', 'super_admin')

    if (adminError) {
      throw new Error(`Failed to fetch super admins: ${adminError.message}`)
    }

    if (!superAdmins || superAdmins.length === 0) {
      console.warn('No super admin users found')
      return new Response(
        JSON.stringify({ message: 'No super admin users to notify' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const client = new SmtpClient()

    await client.connectTLS({
      hostname: "smtp.asu.edu",
      port: 587,
      username: Deno.env.get("SMTP_USERNAME"),
      password: Deno.env.get("SMTP_PASSWORD"),
    })

    const emailPromises = superAdmins.map(admin => 
      client.send({
        from: "noreply@asu.edu",
        to: admin.email,
        subject: "New Contact Message - TalentVault",
        content: `
New contact message received on TalentVault:

From: ${name}
Email: ${email}
Role Type: ${role_type}

Message:
${message}

Please log in to the admin dashboard to view and respond to this message.

TalentVault Admin System
        `,
      })
    )

    await Promise.all(emailPromises)
    await client.close()

    return new Response(
      JSON.stringify({ 
        message: 'Email notifications sent successfully',
        recipientCount: superAdmins.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending contact message notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})