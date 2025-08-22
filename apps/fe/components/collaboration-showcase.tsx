import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function CollaborationShowcase() {
  return (
    <section id="collaboration" className="py-20 bg-muted">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
            Collaboration
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Built for teams that think together</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how teams around the world use SketchBoard to brainstorm, plan, and create together.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-accent-foreground text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Invite your team</h3>
                  <p className="text-muted-foreground">
                    Share a link and start collaborating instantly. No accounts required for viewers.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-accent-foreground text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Sketch together</h3>
                  <p className="text-muted-foreground">
                    See everyone's cursors and changes in real-time. No more "can you see my screen?"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-accent-foreground text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Share and iterate</h3>
                  <p className="text-muted-foreground">
                    Export, embed, or share your creations. Keep the conversation going.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-background">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>MK</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-background">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div className="w-8 h-8 bg-muted border-2 border-background rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+5</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Join 50,000+ teams already collaborating</p>
            </div>
          </div>

          <div className="relative">
            <img
              src="/placeholder.svg?height=500&width=600"
              alt="Team collaboration showcase"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>3 people editing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
