import { type GetServerSidePropsContext } from 'next'
import { createServerClient, serializeCookieHeader } from '@supabase/ssr'

export function getServerPropsClient({ req, res }: GetServerSidePropsContext) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({ name, value: req.cookies[name] || '' }))
        },
        setAll(cookiesToSet) {
          res.setHeader(
            'Set-Cookie',
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          )
        },
      },
    }
  )

  return supabase
}