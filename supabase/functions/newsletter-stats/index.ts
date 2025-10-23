import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get statistics about articles
    const [
      totalArticlesResult,
      categoryCountsResult,
      featuredCountResult,
      employerOnlyCountResult
    ] = await Promise.all([
      // Total articles count
      supabase.from("news_articles").select("*", { count: "exact", head: true }),
      
      // Category distribution
      supabase.from("news_articles")
        .select("category")
        .then(({ data }) => {
          const counts: Record<string, number> = {};
          data?.forEach(article => {
            counts[article.category] = (counts[article.category] || 0) + 1;
          });
          return counts;
        }),
      
      // Featured articles count
      supabase.from("news_articles")
        .select("*", { count: "exact", head: true })
        .eq("featured_status", true),
      
      // Employer-only articles count
      supabase.from("news_articles")
        .select("*", { count: "exact", head: true })
        .eq("employer_visibility", true)
    ]);

    // Prepare response data
    const stats = {
      totalArticles: totalArticlesResult.count || 0,
      categoryCounts: categoryCountsResult,
      featuredCount: featuredCountResult.count || 0,
      employerOnlyCount: employerOnlyCountResult.count || 0,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(stats),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching newsletter stats:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});