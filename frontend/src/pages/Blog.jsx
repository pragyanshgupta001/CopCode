import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    tag: "Engineering",
    tagColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
<<<<<<< HEAD
    title: "How We Built Sub-10ms Code Sync",
=======
    title: "How We Built Sub-10ms Cop Code",
>>>>>>> a4a12d9 (full project implementation)
    summary: "A deep dive into CRDT-based operational transforms and how they power seamless real-time editing.",
    date: "Mar 5, 2025",
    readTime: "8 min read",
  },
  {
    tag: "Tutorial",
    tagColor: "text-green-400 border-green-500/30 bg-green-500/5",
    title: "Creating Your First Collab Room",
    summary: "Step-by-step walkthrough from room setup to inviting your team and writing your first shared commit.",
    date: "Feb 22, 2025",
    readTime: "5 min read",
  },
  {
    tag: "Product",
    tagColor: "text-purple-400 border-purple-500/30 bg-purple-500/5",
    title: "Why Personal Workspaces Changed Everything",
    summary: "Isolated sandboxes alongside the shared editor eliminated 90% of merge conflicts in user studies.",
    date: "Feb 10, 2025",
    readTime: "6 min read",
  },
];

function BlogCard({ tag, tagColor, title, summary, date, readTime }) {
  return (
    <div className="card group flex flex-col p-6 gap-4 cursor-pointer">
      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs px-2.5 py-1 rounded border ${tagColor}`}>{tag}</span>
        <span className="font-mono text-xs text-gray-600">{readTime}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-mono font-bold text-white text-sm mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">{summary}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[#1e2a3a] mt-auto">
        <span className="font-mono text-xs text-gray-600">{date}</span>
        <span className="flex items-center gap-1 font-mono text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Read more <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}

export default function Blog() {
  return (
    <section id="blogs" className="py-24 px-6 bg-[#0a0e15]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="section-tag">// BLOGS</p>
            <h2 className="section-heading">
              From the <span className="text-cyan-400">devlog</span>
            </h2>
          </div>
          <Link to="/blogs" className="flex items-center gap-2 font-mono text-sm text-gray-400 hover:text-cyan-400 transition-colors">
            View all posts <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((p) => <BlogCard key={p.title} {...p} />)}
        </div>
      </div>
    </section>
  );
}
