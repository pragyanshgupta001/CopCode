import { Link } from "react-router-dom";
import { Code2, Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const navLinks = ["About", "Blogs", "Contact"];

  return (
    <footer className="bg-[#0a0e15] border-t border-[#1e2a3a]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0e2233] border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
              <Code2 size={16} className="text-cyan-400" />
            </div>
            <span className="font-mono font-bold text-white">
              Cop<span className="text-cyan-400">Code</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-8">
            {navLinks.map((label) => (
              <Link
                key={label}
                to={`/${label.toLowerCase()}`}
                className="font-mono text-sm text-gray-400 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {[
              { href: "https://github.com", Icon: Github, label: "GitHub" },
              { href: "https://linkedin.com", Icon: Linkedin, label: "LinkedIn" },
              { href: "https://twitter.com", Icon: Twitter, label: "Twitter" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#1e2a3a] text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-[#1e2a3a] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-gray-600">
            © {new Date().getFullYear()} CopCode. Built for developers, by developers.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-gray-600">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
