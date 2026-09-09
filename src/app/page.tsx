import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { Services } from "@/components/sections/services";
import { Team } from "@/components/sections/team";
import { StackRoot } from "@/components/stack-root";
import { WhatsappFab } from "@/components/ui/whatsapp-fab";

/**
 * La página es una baraja: cada sección lleva `data-stack` y se fija
 * mientras la siguiente se le monta encima. El orden de aquí es el
 * orden de la escalera de z-index declarada en globals.css
 * (stack-1 … stack-5); el pie cierra en `relative`.
 */
export default function Page() {
  return (
    <>
      <Navbar />
      <StackRoot>
        <main id="contenido" className="relative">
          <Hero />
          <About />
          <Services />
          <Team />
          <Contact />
        </main>
        <Footer />
      </StackRoot>
      <WhatsappFab />
    </>
  );
}
