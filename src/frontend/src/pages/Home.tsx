import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

export default function Home() {

  // Simple fade-in animation trigger
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setTimeout(() => setLoaded(true), 50);
  }, []);

  return (
    <div className="bg-white text-brand-black font-sans">
      <Header />

      {/* Hero Section */}
      <section
        className={`
          relative bg-cover bg-center text-white text-center py-28 px-4 
          transition-opacity duration-200 
          ${loaded ? "opacity-100" : "opacity-0"}
        `}
        style={{
          backgroundImage: "url('/hero.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            The Marketplace for Construction Equipment & Services
          </h1>

          <p className="text-lg text-gray-300 mb-8">
            Buy, sell, or rent construction machinery, tools, and services with ease.
            Join thousands of professionals building the future on 
            <span className="text-[#B8860B] font-semibold"> Constructify</span>.
          </p>

          <Button 
            size="lg" 
            className="bg-[#B8860B] text-white font-semibold hover:bg-[#9A7209] transition-all duration-200"
            style={{ borderRadius: 0 }}
          >
            Get Started
          </Button>
        </div>
      </section>


      {/* Features */}
      <section 
        id="features" 
        className={`
          max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-8
          transition-all duration-200
          ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
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
          <Card 
            key={i} 
            className="
              border border-[#e5e5e5] shadow-md 
              hover:shadow-xl transition-all duration-200 
            "
            style={{ borderRadius: 0 }}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-[#B8860B]">
                {feature.title}
              </h3>
              <p className="text-gray-700">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>


      {/* About Section */}
      <section 
        id="about" 
        className={`
          bg-gray-50 py-16 px-6 text-center transition-all duration-200
          ${loaded ? "opacity-100" : "opacity-0"}
        `}
      >
        <h2 className="text-3xl font-bold mb-4 text-brand-black">
          Why Choose Constructify?
        </h2>

        <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
          Constructify is designed for builders, contractors, and suppliers who need a simple, 
          powerful platform to connect and trade construction assets. Whether you’re selling a 
          bulldozer, offering crane services, or searching for the best deals on materials — 
          Constructify puts your business on the map.
        </p>
      </section>


      {/* CTA */}
      <section 
        className="
          bg-[#B8860B] py-16 text-center text-white
          transition-all duration-200
        "
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Build Your Reach?</h2>

        <p className="mb-8 text-lg">
          Start sharing your construction supplies, equipment, and services today.
        </p>

        <Button 
          size="lg" 
          className="bg-black text-white hover:bg-gray-800 transition-all duration-200"
          style={{ borderRadius: 0 }}
        >
          <a href="/sell">Post Your First Listing</a>
        </Button>
      </section>

      <Footer />
    </div>
  );
}
