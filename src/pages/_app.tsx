import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Hide navbar on landing, login, and register pages
  const hideNavbar = router.pathname === '/' || router.pathname === '/login' || router.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}