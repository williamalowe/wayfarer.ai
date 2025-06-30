import HeroSection from "@/components/ui/HeroSection";
import Navbar from "@/components/ui/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection backgroundColor="light">
        <div className="flex gap-x-8">
          <div className="flex-1 flex flex-col items-start justify-center gap-y-2">
            <h3 className="text-2xl">AI Travel Stuff</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
              obcaecati aut alias enim quo consectetur exercitationem
              repellendus, itaque amet numquam consequatur debitis placeat
              provident, inventore unde culpa nisi error cum.
            </p>
            <ul className="mt-4">
              <li>&gt; AI-Assisted Travel Planning</li>
              <li>&gt; Budget Tracking</li>
              <li>&gt; Itinerary Builder</li>
            </ul>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-gray-800 aspect-square w-[320px] flex items-center justify-center rounded-lg text-white">
              Image Here
            </div>
          </div>
        </div>
      </HeroSection>
      <HeroSection backgroundColor="white">
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-4 items-center justify-center">
            <h3 className="text-2xl capitalize">
              How can Wayfarer help simplify your travel?
            </h3>
            <div className="h-1 w-full bg-black"></div>
            <h5>
              We&apos;re on a mission to bring focus back to the adventure, not
              the planning
            </h5>
          </div>
          <div className="flex gap-x-4 items-center justify-center">
            <div className="w-[160px] aspect-square flex flex-col items-center">
              <div className="aspect-square w-[64px] bg-gray-800 flex items-center justify-center text-white text-center rounded">
                Image Here
              </div>
              <h5 className="text-xl font-bold">Thing 1</h5>
              <p className="text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <div className="w-[160px] aspect-square flex flex-col items-center">
              <div className="aspect-square w-[64px] bg-gray-800 flex items-center justify-center text-white text-center rounded">
                Image Here
              </div>
              <h5 className="text-xl font-bold">Thing 2</h5>
              <p className="text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <div className="w-[160px] aspect-square flex flex-col items-center">
              <div className="aspect-square w-[64px] bg-gray-800 flex items-center justify-center text-white text-center rounded">
                Image Here
              </div>
              <h5 className="text-xl font-bold">Thing 3</h5>
              <p className="text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
          </div>
        </div>
      </HeroSection>
      <HeroSection backgroundColor="dark">
        <div className="flex gap-x-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-gray-800 aspect-square w-[320px] flex items-center justify-center rounded-lg text-white">
              Image Here
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start justify-center gap-y-4">
            <div className="flex flex-col gap-y-4">
              <div className="flex gap-x-4 items-center justify-center">
                <div className="aspect-square flex items-center justify-center text-center text-white bg-gray-800 rounded">
                  Icon Here
                </div>
                <div className="">
                  <h5 className="text-xl font-bold">Thing 1</h5>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                </div>
              </div>
              <div className="flex gap-x-4 items-center justify-center">
                <div className="aspect-square flex items-center justify-center text-center text-white bg-gray-800 rounded">
                  Icon Here
                </div>
                <div className="">
                  <h5 className="text-xl font-bold">Thing 2</h5>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                </div>
              </div>
              <div className="flex gap-x-4 items-center justify-center">
                <div className="aspect-square flex items-center justify-center text-center text-white bg-gray-800 rounded">
                  Icon Here
                </div>
                <div className="">
                  <h5 className="text-xl font-bold">Thing 3</h5>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroSection>
      <HeroSection backgroundColor="white">
        <div className="flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-4 items-center justify-center">
            <h3 className="text-2xl capitalize">
              Recent Blog Posts
            </h3>
            <div className="h-1 w-full bg-black"></div>
            <h5>
              Check out our <span>blog</span>.
            </h5>
          </div>
          <div className="flex gap-x-4 items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-[320px] w-[240px] bg-gray-800 flex items-center justify-center text-white text-center rounded">
                Image Here
              </div>
              <h5 className="text-xl font-bold">Thing 1</h5>
              <p className="text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-[320px] w-[240px] bg-gray-800 flex items-center justify-center text-white text-center rounded">
                Image Here
              </div>
              <h5 className="text-xl font-bold">Thing 2</h5>
              <p className="text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-[320px] w-[240px] bg-gray-800 flex items-center justify-center text-white text-center rounded">
                Image Here
              </div>
              <h5 className="text-xl font-bold">Thing 3</h5>
              <p className="text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
          </div>
        </div>
      </HeroSection>
    </div>
  );
}
