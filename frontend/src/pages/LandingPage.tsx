import { Menu, PenTool, Tag, MessageSquare, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import IMAGES from "@/assets/images/image";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header
        className={`fixed w-full transition-all duration-300 border-b dark:border-0 z-50 ${
          scrolled
            ? "bg-background/90 backdrop-blur-md shadow-sm"
            : "bg-background/70 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
          <Link to="/">
            <div className="text-2xl font-bold flex items-center">
              <PenTool className="h-8 w-8 mr-2" />
              Wordly
            </div>
            </Link>
          </div>
          <nav className="flex items-center">
            <div className="mr-6">
              <ModeToggle />
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </nav>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden w-full bg-background py-2 px-4 border-t">
            <Link to="/login">
            <Button variant="ghost" className="block w-full text-left py-2">
              Login
            </Button>
            </Link>
            <Link to="/register">
            <Button variant="ghost" className="block w-full text-left py-2">
              Register
            </Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-grow pt-15">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-card/1 dark:bg-black/60 z-10"></div>
            <img
              src={IMAGES.typingImage}
              alt="Person typing on laptop"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="container mx-auto px-6 lg:px-12 py-32 md:py-40 lg:py-48 relative z-20">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                Discover the world through{" "}
                <span className="text-red-600">Articles</span>
              </h1>
              <p className="text-xl text-gray-200 mb-12">
                Your personalized feed of articles based on your interests.
                Create, share, and discover content that matters to you.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
  <Button size="lg" className="text-lg px-8">Get Started</Button>
</Link>

<Link to="/login">
  <Button
    size="lg"
    variant="outline"
    className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10"
  >
    Learn More
  </Button>
</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-background py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">
              Why Wordly?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-primary mb-4">
                  <PenTool className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Articles</h3>
                <p className="text-muted-foreground">
                  Share your knowledge and expertise with the world through
                  engaging articles.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-primary mb-4">
                  <Tag className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Personalized Feed
                </h3>
                <p className="text-muted-foreground">
                  See articles based on your interests and preferences.
                  Customize your feed anytime.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-primary mb-4">
                  <MessageSquare className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Engage & Interact
                </h3>
                <p className="text-muted-foreground">
                  Like, comment, and interact with the content that resonates
                  with you.
                </p>
              </div>
            </div>
          </div>
        </div>

       
        <div className="bg-accent/20 py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">
              How Wordly Works
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="rounded-lg overflow-hidden shadow-xl h-80 md:h-96">
                <img
                  src={IMAGES.workspceImage}
                  alt="Creative workspace with laptop and camera"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4">
                      1
                    </div>
                    <h3 className="text-xl font-semibold">Create an Account</h3>
                  </div>
                  <p className="text-muted-foreground pl-12">
                    Sign up in seconds and customize your profile.
                  </p>
                </div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4">
                      2
                    </div>
                    <h3 className="text-xl font-semibold">
                      Select Your Interests
                    </h3>
                  </div>
                  <p className="text-muted-foreground pl-12">
                    Tell us what topics you care about to personalize your feed.
                  </p>
                </div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4">
                      3
                    </div>
                    <h3 className="text-xl font-semibold">
                      Start Reading & Writing
                    </h3>
                  </div>
                  <p className="text-muted-foreground pl-12">
                    Dive into articles curated for you or share your own
                    expertise.
                  </p>
                </div>
                <Button size="lg" className="ml-12 mt-4">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-background py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-card p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg mr-4">
                    JD
                  </div>
                  <div>
                    <h4 className="font-semibold">Jane Doe</h4>
                    <p className="text-sm text-muted-foreground">
                      Writer & Editor
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Wordly has completely transformed how I share my writing. The
                  engagement from readers has been incredible!"
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg mr-4">
                    MS
                  </div>
                  <div>
                    <h4 className="font-semibold">Mark Smith</h4>
                    <p className="text-sm text-muted-foreground">Avid Reader</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "I love how Wordly curates content based on my interests. I
                  discover new perspectives every day."
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg mr-4">
                    AT
                  </div>
                  <div>
                    <h4 className="font-semibold">Alex Thompson</h4>
                    <p className="text-sm text-muted-foreground">
                      Content Creator
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The community on Wordly is unlike any other platform.
                  Thoughtful discussions and genuine connections."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/10 py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="bg-card p-8 md:p-12 rounded-xl shadow-lg text-center max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Ready to dive into a world of knowledge?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join Wordly today and start exploring articles tailored to your
                interests. Share your stories and connect with like-minded
                readers.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="px-8">
                  Get Started Now
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold flex items-center mb-4">
                <PenTool className="h-6 w-6 mr-2" />
                Wordly
              </div>
              <p className="text-muted-foreground">
                Your personalized platform for discovering and sharing valuable
                content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Guidelines
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-muted-foreground">
            &copy; 2025 Wordly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
