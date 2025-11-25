import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="bg-white text-brand-black font-sans">
      <Header />

      {/* Hero Section */}
        <section
        className="relative bg-cover bg-center text-white text-center py-28 px-4"
        style={{
            backgroundImage: "url('/hero.jpg')",
        }}
        >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4">
            The Marketplace for Construction Equipment & Services
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Buy, sell, or rent construction machinery, tools, and services with ease. Join thousands of professionals building the future on <span className="text-brand-green font-semibold">Constructify</span>.
            </p>
            <Button size="lg" className="bg-brand-green text-white font-semibold hover:bg-blue-500">
            Get Started
            </Button>
        </div>
        </section>


      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "List Your Equipment",
            desc: "Post your tools, vehicles, or materials in minutes and reach verified buyers across the region.",
          },
          {
            title: "Find Trusted Suppliers",
            desc: "Discover reliable sellers and service providers for your next big project — all in one place.",
          },
          {
            title: "Boost Your Visibility",
            desc: "Expand your reach beyond your local market and showcase your construction solutions to the world.",
          },
        ].map((feature, i) => (
          <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-brand-green">{feature.title}</h3>
              <p className="text-gray-700">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-50 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-brand-black">Why Choose Constructify?</h2>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
          Constructify is designed for builders, contractors, and suppliers who need a simple, powerful platform 
          to connect and trade construction assets. Whether you’re selling a bulldozer, offering crane services, 
          or searching for the best deals on materials — Constructify puts your business on the map.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-brand-green py-16 text-center text-black">
        <h2 className="text-3xl font-bold mb-4">Ready to Build Your Reach?</h2>
        <p className="mb-8 text-lg">Start sharing your construction supplies, equipment, and services today.</p>
        <Button size="lg" className="bg-black text-white hover:bg-gray-800">
         <a href="/sell"> Post Your First Listing</a>
        </Button>
      </section>

      <Footer />
    </div>
  );
}
