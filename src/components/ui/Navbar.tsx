import Link from "next/link";

const navlinks = [
  {
    title: "About.",
    link: "#about",
  },
  {
    title: "Pricing.",
    link: "#pricing",
  },
  {
    title: "Blog.",
    link: "/blog",
  },
  {
    title: "Contact.",
    link: "#contact",
  },
];

const Navbar = () => {
  return (
    <div className="w-full flex text-[#666666] px-18 py-12">
      <div className="flex-1">
        <h3 className="font-bold uppercase tracking-wide text-xl">
          Wayfarer.ai
        </h3>
      </div>
      <nav className="flex-1">
        <ul className="flex uppercase font-bold gap-x-4 items-center justify-center">
          {navlinks.map((link) => (
            <li key={link.title}>
              <Link href={link.link} className="hover:text-black">
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-1 flex items-end justify-center uppercase font-bold">
        <Link href={"/sign-up"}>
          <div className="px-4 py-2 bg-black text-white hover:bg-[#666666] transition">
            Get Started
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
