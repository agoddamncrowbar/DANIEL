export default function Footer() {
  return (
    <footer className="bg-brand-black text-gray-300 py-6 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <p className="text-sm">
          © {new Date().getFullYear()} Constructify. All rights reserved.
        </p>
        <div className="space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-brand-green transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-green transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
