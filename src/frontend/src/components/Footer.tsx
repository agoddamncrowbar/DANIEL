export default function Footer() {
  return (
    <footer className="bg-[#B8860B] text-white py-10  border-t border-[#9A7209]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Section */}
          <div>
            <h2 className="text-xl font-bold tracking-wide uppercase">
              Constructify
            </h2>
            <p className="text-sm mt-2 opacity-90">
              Building connections between buyers and sellers — one tool at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/listings"
                  className="hover:text-gray-200 hover:underline transition-colors"
                >
                  Browse Listings
                </a>
              </li>
              <li>
                <a
                  href="/sell"
                  className="hover:text-gray-200 hover:underline transition-colors"
                >
                  Post an Ad
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="hover:text-gray-200 hover:underline transition-colors"
                >
                  Your Account
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="hover:text-gray-200 hover:underline transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-gray-200 hover:underline transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-200 hover:underline transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#9A7209] mt-10 pt-6 text-center">
          <p className="text-sm opacity-90">
            © {new Date().getFullYear()} Constructify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
