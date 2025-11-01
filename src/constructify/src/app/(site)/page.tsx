"use client";

export default function HomePage() {
  const features = [
    {
      title: "Affordable Classifieds",
      description: "Reach thousands of buyers with competitive pricing that maximizes your exposure.",
      highlight: "Great prices for your listings!"
    },
    {
      title: "High Visibility",
      description: "Your listings will be seen by the right audience with top placement and featured spots.",
      highlight: "Stand out and sell faster!"
    },
    {
      title: "Many Active Sellers",
      description: "Join a vibrant marketplace with hundreds of sellers, giving you more options and competition.",
      highlight: "Find the best deals or expand your reach!"
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Why Choose Our Platform?</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
            <p className="text-gray-600 mb-3">{feature.description}</p>
            <p className="text-green-600 font-bold">{feature.highlight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
