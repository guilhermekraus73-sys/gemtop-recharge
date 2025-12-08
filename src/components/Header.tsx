import garenaLogo from "@/assets/garena-logo.png";

const Header = () => {
  return (
    <header className="bg-white py-3 px-4 border-b border-border">
      <div className="container flex items-center gap-2">
        <img src={garenaLogo} alt="Garena" className="h-6" />
        <span className="text-muted-foreground text-sm ml-1">Centro Oficial de Recargas</span>
      </div>
    </header>
  );
};

export default Header;
