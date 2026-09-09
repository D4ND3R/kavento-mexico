import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { Reviews } from "@/components/sections/reviews";
import { Services } from "@/components/sections/services";
import { Team } from "@/components/sections/team";
import { StackRoot } from "@/components/stack-root";
import { Loader } from "@/components/ui/loader";
import { WhatsappFab } from "@/components/ui/whatsapp-fab";

/**
 * La página es una baraja: cada sección lleva `data-stack` y se fija
 * mientras la siguiente se le monta encima. El orden de aquí es el de
 * la escalera de z-index declarada en globals.css (stack-1 … stack-6);
 * el pie cierra en `relative`.
 *
 * El corte entre secciones no es una recta: cada una lleva su propia
 * cresta orgánica arriba, del color de la sección, así que la cortina
 * que se ve es una silueta y no una línea.
 */
export default function Page() {
  return (
    <>
      <Loader />
      <Navbar />
      <StackRoot>
        <main id="contenido" className="relative">
          <Hero />
          <About />
          <Services />
          <Reviews />
          <Team />
          <Contact />
        </main>
        <Footer />
      </StackRoot>
      <WhatsappFab />
    </>
  );
}
