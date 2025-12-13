import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { contractAddress, tokenAddress, deployer, amount, unlockTime, tokenName, tokenSymbol, transactionHash } = await req.json()

    // Insert the deployed lock
    const { data: lockData, error: lockError } = await supabaseClient
      .from('tlc_deployed_locks')
      .insert({
        contract_address: contractAddress,
        token_address: tokenAddress,
        deployer_wallet: deployer,
        lock_amount: amount,
        unlock_timestamp: unlockTime,
        token_name: tokenName,
        token_symbol: tokenSymbol,
        transaction_hash: transactionHash,
        platform_source: 'TLC'
      })
      .select()
      .single()

    if (lockError) throw lockError

    // Award trust points for lock deployment
    const { data: pointsResult, error: pointsError } = await supabaseClient
      .rpc('update_trust_points', {
        wallet_addr: deployer,
        points_to_add: 5,
        action_type: 'LOCK_DEPLOYED',
        platform: 'TLC'
      })

    if (pointsError) {
      console.error('Failed to award trust points:', pointsError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        lockId: lockData.id,
        pointsAwarded: pointsError ? 0 : 5,
        message: 'Lock deployment recorded successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in lock-deployed function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})