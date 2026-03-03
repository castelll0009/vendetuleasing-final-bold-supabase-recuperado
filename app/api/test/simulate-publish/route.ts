// Simulation route disabled per request.  
// Original code allowed updating a property directly without Bold payment
// for testing purposes.  
// Keep the file in case the developer wants to re-enable it later.

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[simulate-publish] route hit but simulation disabled")
  return NextResponse.json({ error: "Simulation disabled" }, { status: 410 })
}
