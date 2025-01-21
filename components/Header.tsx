import Nav from "./Nav";
import Logo from "./brand/LogoHeader";

export default function Header() {
    return (
        <header className="px-3 md:px-6 py-1 md:py-2 bg-accent w-full sticky top-0 z-10">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Logo />
                <Nav />
            </div>
        </header>
    );
}
