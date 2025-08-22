import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
      <div className="container px-4 mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
            <span className="text-primary-foreground/80 font-medium">Ready to get started?</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground leading-tight">
            Start sketching your ideas today
          </h2>

          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Join thousands of teams who have already discovered the joy of collaborative sketching. No credit card
            required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Start Drawing Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              View Examples
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-primary-foreground/60">
            <span>✓ Free forever plan</span>
            <span>✓ No setup required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
