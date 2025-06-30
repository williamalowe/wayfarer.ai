import HeroSection from "@/components/ui/HeroSection"
import Navbar from "@/components/ui/Navbar"

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection backgroundColor="light">
        <div className="flex gap-x-8">
          <div className="flex-1 flex flex-col items-start">
        <h3 className="text-xl font-bold">AI Travel Stuff</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus obcaecati aut alias enim quo consectetur exercitationem repellendus, itaque amet numquam consequatur debitis placeat provident, inventore unde culpa nisi error cum.</p></div>
          <div className="flex-1 flex flex-col items-center justify-center">Image here</div>
        </div>
      </HeroSection>
      <p>Hello world</p>
    </div>
  );
}
