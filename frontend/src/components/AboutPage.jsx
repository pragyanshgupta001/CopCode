import PageShell from "./PageShell";
import CodeWindow from "./CodeWindow";
import { Users, Zap, Shield, Globe } from "lucide-react";

const values = [
  { icon: Zap,    title: "Speed First",       desc: "Sub-10ms sync latency via CRDT operational transforms.",            color: "text-cyan-400",   bg: "bg-cyan-500/10"   },
  { icon: Users,  title: "Team Focused",      desc: "Designed for 2 to 20+ developers collaborating simultaneously.",   color: "text-green-400",  bg: "bg-green-500/10"  },
  { icon: Shield, title: "Secure by Default", desc: "End-to-end encrypted rooms with permission-based access control.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Globe,  title: "Works Everywhere",  desc: "Browser-based. No installs. Any device, any OS.",                  color: "text-blue-400",   bg: "bg-blue-500/10"   },
];

export default function AboutPage() {
  return (
    <PageShell>
      <div className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Hero block — mirrors homepage About section */}
          <CodeWindow filename="about.md" className="shadow-2xl mb-12">
            <div className="relative px-8 py-10 md:px-12 md:py-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0e1e2e]/80 via-[#161b22] to-[#1a1230]/60 pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <p className="font-mono text-xs text-cyan-400 tracking-widest mb-5">## ABOUT COPCODE</p>
                <h1 className="font-mono font-bold text-3xl md:text-4xl mb-6 leading-tight">
                  <span className="text-white">Built for developers, </span>
                  <span className="text-cyan-400">by developers</span>
                </h1>
                <p className="text-gray-300 text-base leading-relaxed mb-4">
                  This platform enables multiple developers to collaborate in real time using a shared main
                  editor and individual workspaces to reduce conflicts and improve productivity. Whether
                  you're pair programming, running a coding workshop, or building with a distributed team —
                  CopCode keeps everyone in sync.
                </p>
                <p className="text-gray-400 text-base leading-relaxed">
                  We built CopCode because we were tired of screen-sharing sessions, copy-pasting code
                  into Slack, and merge conflicts from collaborative debugging. The result is a platform that
                  feels as natural as coding alone — but with your whole team beside you.
                </p>
              </div>
            </div>
          </CodeWindow>

          {/* Values grid */}
          <h2 className="font-mono font-bold text-2xl text-white mb-6">
            Our <span className="text-cyan-400">principles</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="card p-6 group cursor-default"
              >
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={18} className={color} />
                </div>
                <h3 className="font-mono font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
