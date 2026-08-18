import { getAuthSession } from "@/lib/auth-session"
import { pusherServer } from "@/lib/pusher-server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const contentType = req.headers.get("content-type") || ""
    let socketId = ""
    let channelName = ""

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData()
      socketId = formData.get("socket_id") as string
      channelName = formData.get("channel_name") as string
    } else {
      const body = await req.json()
      socketId = body.socket_id
      channelName = body.channel_name
    }

    if (!socketId || !channelName) {
      return new NextResponse("Bad Request: Missing socket_id or channel_name", { status: 400 })
    }

    // Authorize private channel access
    const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        email: session.user.email,
      },
    })

    return NextResponse.json(authResponse)
  } catch (err) {
    console.error("Pusher authentication error:", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
