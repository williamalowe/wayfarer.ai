const HeroSection = ({ children, backgroundColor }: {
    children: React.ReactNode;
    backgroundColor: string;
}) => {
  return (
    <div className={`flex items-center justify-center px-32 py-12 ${backgroundColor === 'light' ? 'bg-[#F9F9F9]' : backgroundColor === 'dark' ? 'bg-[#1C1D20] text-white' : 'bg-white'}`}>
        {children}
    </div>
  )
}

export default HeroSection