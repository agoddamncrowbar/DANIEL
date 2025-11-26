import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/libz/constants";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { useAuth } from "@/context/useAuth";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#B8860B] text-white border-b border-[#9A7209]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold tracking-tight uppercase transition-opacity duration-200 hover:opacity-80"
          >
            Constructify
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/listings"
              className="px-4 py-2 transition-all duration-200 hover:bg-[#9A7209]"
            >
              Listings
            </Link>
            <Link
              to="/"
              className="px-4 py-2 transition-all duration-200 hover:bg-[#9A7209]"
            >
              About
            </Link>
            <Link
              to="/account"
              className="px-4 py-2 transition-all duration-200 hover:bg-[#9A7209]"
            >
              Account
            </Link>

            {user ? (
              <>
                <Button
                  onClick={() => navigate("/sell")}
                  className="ml-4 bg-white text-[#B8860B] hover:bg-gray-100 font-semibold transition-all duration-200 px-6"
                  style={{ borderRadius: 0 }}
                >
                  Post an Ad
                </Button>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-[#9A7209]">
                  <Avatar className="h-8 w-8 border border-white" style={{ borderRadius: 0 }}>
                    <img
                      src={
                        user.profile_picture
                          ? `${API_BASE_URL}/uploads/${user.profile_picture}`
                          : `https://ui-avatars.com/api/?background=B8860B&color=fff&name=${encodeURIComponent(user.name)}`
                      }
                      alt={user.name}
                      className="h-full w-full object-cover"
                      style={{ borderRadius: 0 }}
                    />
                  </Avatar>
                  <span className="text-sm font-medium hidden xl:inline">{user.name}</span>
                  <Button
                    onClick={handleLogout}
                    className="bg-red-600 text-white hover:bg-red-800 transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="border-white bg-[#B8860B] text-white hover:bg-white hover:text-[#B8860B] transition-all duration-200"
                  style={{ borderRadius: 0 }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-[#B8860B] hover:bg-gray-100 transition-all duration-200"
                  style={{ borderRadius: 0 }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 transition-all duration-200 hover:bg-[#9A7209]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-[#9A7209] py-4">
            <div className="flex flex-col space-y-1">
              <Link
                to="/listings"
                className="px-4 py-3 transition-all duration-200 hover:bg-[#9A7209]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Listings
              </Link>
              <Link
                to="/"
                className="px-4 py-3 transition-all duration-200 hover:bg-[#9A7209]"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/account"
                className="px-4 py-3 transition-all duration-200 hover:bg-[#9A7209]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Account
              </Link>

              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 border-t border-[#9A7209] mt-2 pt-4">
                    <Avatar className="h-10 w-10 border border-white" style={{ borderRadius: 0 }}>
                      <img
                        src={
                          user.profile_picture
                            ? `${API_BASE_URL}/uploads/${user.profile_picture}`
                            : `https://ui-avatars.com/api/?background=B8860B&color=fff&name=${encodeURIComponent(user.name)}`
                        }
                        alt={user.name}
                        className="h-full w-full object-cover"
                        style={{ borderRadius: 0 }}
                      />
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Button
                    onClick={() => {
                      navigate("/sell");
                      setMobileMenuOpen(false);
                    }}
                    className="mx-4 mt-2 bg-white text-[#B8860B] hover:bg-gray-100 font-semibold transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  >
                    Post an Ad
                  </Button>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-600 text-white hover:bg-red-800 transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4 mt-2 pt-4 border-t border-[#9A7209]">
                  <Button
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#B8860B] transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/signup");
                      setMobileMenuOpen(false);
                    }}
                    className="bg-white text-[#B8860B] hover:bg-gray-100 transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}