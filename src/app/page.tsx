import { About } from "@/components/sections/about";
import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { Services } from "@/components/sections/services";

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenido">
        <Hero />
        <About />
        <Services />
      </main>
    </>
  );
}
