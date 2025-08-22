import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    company: "TechFlow",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "SketchBoard has revolutionized how our design team collaborates. The hand-drawn style makes our wireframes feel more approachable and less intimidating to stakeholders.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Engineering Manager",
    company: "DataViz Inc",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "We use SketchBoard for system architecture diagrams. The real-time collaboration feature has cut our planning meetings in half.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "UX Researcher",
    company: "StartupLab",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "The simplicity is what sold me. No complex menus or overwhelming features - just pure creativity and collaboration.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-card">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-card-foreground">Loved by teams worldwide</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what creative professionals are saying about SketchBoard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                <blockquote className="text-card-foreground mb-6 leading-relaxed">`&apos;`{testimonial.content}`&apos;`</blockquote>

                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
