import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Users, Zap, Palette } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background min-h-screen flex items-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Main heading with enhanced styling */}
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
              <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                Collaborative Whiteboard
              </span>
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-primary leading-tight">
              Sketch,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Collaborate
              </span>
              ,{" "}
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Create
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              The intuitive whiteboard tool that brings your ideas to life with hand-drawn style diagrams and seamless
              team collaboration.
            </p>
          </div>

          {/* Enhanced CTA section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Link href="/canvas">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Zap className="mr-2 w-5 h-5" />
                Start Drawing Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Real-time collaboration</span>
              </div>
            </div>
          </div>

          {/* Enhanced feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/70 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-primary">Free to Start</h3>
              </div>
              <p className="text-sm text-muted-foreground">No credit card required. Start creating immediately.</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/70 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-primary">No Downloads</h3>
              </div>
              <p className="text-sm text-muted-foreground">Works directly in your browser. Instant access.</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/70 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-primary">Real-time Sync</h3>
              </div>
              <p className="text-sm text-muted-foreground">Collaborate with your team in real-time.</p>
            </div>
          </div>

          {/* Additional features showcase */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 bg-card/30 px-4 py-2 rounded-full border border-border/30">
              <Palette className="w-4 h-4" />
              <span>Multiple drawing tools</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/30 px-4 py-2 rounded-full border border-border/30">
              <Zap className="w-4 h-4" />
              <span>Export as images</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/30 px-4 py-2 rounded-full border border-border/30">
              <Users className="w-4 h-4" />
              <span>Team collaboration</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
