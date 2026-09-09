import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { Services } from "@/components/sections/services";
import { Team } from "@/components/sections/team";
import { WhatsappFab } from "@/components/ui/whatsapp-fab";

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenido">
        <Hero />
        <About />
        <Services />
        <Team />
        <Contact />
      </main>
      <Footer />
      <WhatsappFab />
    </>
  );
}
