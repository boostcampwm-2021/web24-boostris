import { Helmet } from 'react-helmet';

function SEO({ children }: { children: React.ReactNode }) {
  return (
    <Helmet defaultTitle="Boostris" titleTemplate="%s | Boostris">
      {children}
    </Helmet>
  );
}

export default SEO;
