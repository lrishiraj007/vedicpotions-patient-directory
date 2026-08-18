import PusherClient from 'pusher-js'

let pusherClientInstance: PusherClient | null = null

export const getPusherClient = (): PusherClient | null => {
  if (typeof window === 'undefined') return null

  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || ''
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2'
    
    pusherClientInstance = new PusherClient(key, {
      cluster,
      authEndpoint: '/api/pusher/auth',
    })
  }

  return pusherClientInstance
}
