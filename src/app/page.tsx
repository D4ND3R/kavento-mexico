import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="contenido">
        <Hero />
      </main>
    </>
  );
}
