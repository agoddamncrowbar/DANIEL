import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { useAuth } from "@/context/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white text-gray-800 flex justify-between items-center px-6 py-4 shadow-sm border-b border-gray-200">
      {/* Logo */}
      <Link
        to="/"
        className="text-3xl font-extrabold tracking-wider text-brand-green font-[Montserrat] uppercase hover:opacity-90 hover:text-blue-900 transition-opacity"
      >
        Constructify
      </Link>


      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        <Link
          to="/listings"
          className="hover:text-brand-green transition-colors"
        >
          Listings
        </Link>

        <Link
          to="/"
          className="hover:text-brand-green transition-colors"
        >
          About
        </Link>

        <Link
          to="/account"
          className="hover:text-brand-green transition-colors"
        >
          Account
        </Link>

        {/* Auth Conditional */}
        {user ? (
          <>
            <Button
              onClick={() => navigate("/sell")}
              variant="default"
              className="bg-brand-green text-white hover:bg-green-600"
            >
              Post an Ad
            </Button>

            <div className="flex items-center space-x-3 ml-4">
              <Avatar className="h-8 w-8 rounded-full border border-gray-300">
                <img
                  src={
                      user.profile_picture
                      ? `${API_BASE_URL}/uploads/${user.profile_picture}`
                      : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="h-full w-full object-cover rounded-full"
                />
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white text-sm"
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
              className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="default"
              className="bg-brand-green text-white hover:bg-green-600"
            >
              Sign Up
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
