import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Users, Zap, Download, Globe, Shield } from "lucide-react"

const features = [
  {
    icon: Palette,
    title: "Hand-drawn Style",
    description: "Create beautiful diagrams with a natural, sketchy aesthetic that feels organic and engaging.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together seamlessly with your team. See changes instantly and collaborate in real-time.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No lag, no delays. Experience smooth drawing and instant synchronization across all devices.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Export your creations as PNG, SVG, or PDF. Share your work in any format you need.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Access your whiteboard from any device, anywhere. No downloads or installations required.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is encrypted and secure. We respect your privacy and never share your content.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-card">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-card-foreground">
            Everything you need to bring ideas to life
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for modern teams who value creativity and collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
