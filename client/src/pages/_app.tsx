import { type ReactElement, type ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
 
export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}
 
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const queryClient = new QueryClient()
 
export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION === 'true'

  return (
    <QueryClientProvider client={queryClient}>
      {isProduction ? 
        <div></div>
        :
        getLayout(<Component {...pageProps} />)
      }
    </QueryClientProvider>
  )
}