import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  initial: string;
  review: string;
  source: string;
  color: string;
  bgColor: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Bob A.",
    initial: "B",
    review: "Initially a bit skeptical as the process was too simple. The website has no account creation so it looked a bit shady. Anyway after the quoted price they sent a package with a shipping label and I sent my phone with it. Three days later I had my money!",
    source: "Google Review",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100"
  },
  {
    id: 2,
    name: "Carling L.",
    initial: "C",
    review: "Great Service! Super quick and reliable! I received the exact amount by e-transfer that I was expecting with absolutely no hassle. I would definitely recommend to others!",
    source: "Google Review",
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100"
  },
  {
    id: 3,
    name: "Denage S.",
    initial: "D",
    review: "Exceptional service. Everything I researched about your company was true to word and better. A price that was quoted I received within a day of you receiving my iPad.",
    source: "Trustpilot",
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100"
  },
  {
    id: 4,
    name: "Sarah M.",
    initial: "S",
    review: "Amazing experience! I was hesitant at first but the process was incredibly smooth. Got my payment within 24 hours. Highly recommend!",
    source: "Google Review",
    color: "from-pink-500 to-pink-600",
    bgColor: "from-pink-50 to-pink-100"
  },
  {
    id: 5,
    name: "Mike R.",
    initial: "M",
    review: "Best trade-in experience I've ever had. The quote was fair, shipping was free, and payment was lightning fast. Will definitely use again!",
    source: "Trustpilot",
    color: "from-orange-500 to-orange-600",
    bgColor: "from-orange-50 to-orange-100"
  },
  {
    id: 6,
    name: "Jennifer K.",
    initial: "J",
    review: "Incredible service! The whole process was seamless from start to finish. Got my payment faster than expected. Highly recommend to anyone looking to sell their devices.",
    source: "Google Review",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "from-indigo-50 to-indigo-100"
  }
];

export function TestimonialsCarousel() {
  const [currentGroup, setCurrentGroup] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonialsPerGroup = 3;
  const totalGroups = Math.ceil(testimonials.length / testimonialsPerGroup);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentGroup((prevGroup) => (prevGroup + 1) % totalGroups);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalGroups]);

  const goToNext = () => {
    setCurrentGroup((prevGroup) => (prevGroup + 1) % totalGroups);
  };

  const goToPrevious = () => {
    setCurrentGroup((prevGroup) => 
      prevGroup === 0 ? totalGroups - 1 : prevGroup - 1
    );
  };

  const goToGroup = (groupIndex: number) => {
    setCurrentGroup(groupIndex);
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentGroup * testimonialsPerGroup;
    return testimonials.slice(startIndex, startIndex + testimonialsPerGroup);
  };

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGroup}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="grid md:grid-cols-3 gap-6 p-6"
          >
            {getCurrentTestimonials().map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`bg-gradient-to-br ${testimonial.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div className="text-center">
                  {/* Stars */}
                  <div className="flex items-center justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>

                  {/* Quote Icon */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-6 leading-relaxed italic text-sm">
                    "{testimonial.review}"
                  </p>

                  {/* Customer Info */}
                  <div className="flex items-center justify-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center mr-3`}>
                      <span className="text-white font-semibold">{testimonial.initial}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.source}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalGroups }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToGroup(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentGroup 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
          <div className={`w-2 h-2 rounded-full mr-2 ${isAutoPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          {isAutoPlaying ? 'Auto-playing' : 'Paused'}
        </div>
      </div>
    </div>
  );
} 