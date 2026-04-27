import PageShell from "./PageShell";
import { ArrowRight } from "lucide-react";

const posts = [
<<<<<<< HEAD
  { tag: "Engineering", tagColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5", title: "How We Built Sub-10ms Code Sync", summary: "A deep dive into CRDT-based operational transforms and how they power seamless real-time editing at scale.", date: "Mar 5, 2025", readTime: "8 min" },
  { tag: "Tutorial",    tagColor: "text-green-400 border-green-500/30 bg-green-500/5", title: "Creating Your First Collab Room", summary: "Step-by-step walkthrough from room setup to inviting your team and writing your first shared commit.", date: "Feb 22, 2025", readTime: "5 min" },
  { tag: "Product",     tagColor: "text-purple-400 border-purple-500/30 bg-purple-500/5",title: "Why Personal Workspaces Changed Everything", summary: "Isolated sandboxes alongside the shared editor eliminated 90% of merge conflicts in our user studies.", date: "Feb 10, 2025", readTime: "6 min" },
  { tag: "Engineering", tagColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5", title: "Scaling WebSockets to 10k Concurrent Users", summary: "How we architected our WebSocket layer to handle massive concurrent room sessions without dropping a single message.", date: "Jan 28, 2025", readTime: "10 min" },
  { tag: "Design",      tagColor: "text-amber-400 border-amber-500/30 bg-amber-500/5", title: "UX of Real-Time Code Conflict Resolution", summary: "Designing conflict indicators that inform without distracting — lessons from six months of user testing in live coding sessions.", date: "Jan 15, 2025", readTime: "7 min" },
  { tag: "Tutorial",    tagColor: "text-green-400 border-green-500/30 bg-green-500/5", title: "Using CodeSync for Remote Technical Interviews",summary: "A practical guide to running technical interviews with CodeSync rooms, language selection, and shared execution environments.", date: "Jan 3, 2025", readTime: "4 min" },
=======
  { tag: "Engineering", tagColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5", title: "How We Built Sub-10ms Cop Code", summary: "A deep dive into CRDT-based operational transforms and how they power seamless real-time editing at scale.", date: "Mar 5, 2026",  readTime: "8 min" },
  { tag: "Tutorial", tagColor: "text-green-400 border-green-500/30 bg-green-500/5", title: "Creating Your First Collab Room", summary: "Step-by-step walkthrough from room setup to inviting your team and writing your first shared commit.", date: "Feb 22, 2026", readTime: "5 min" },
  { tag: "Product", tagColor: "text-purple-400 border-purple-500/30 bg-purple-500/5", title: "Why Personal Workspaces Changed Everything", summary: "Isolated sandboxes alongside the shared editor eliminated 90% of merge conflicts in our user studies.", date: "Feb 10, 2026", readTime: "6 min" },
  { tag: "Engineering", tagColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5", title: "Scaling WebSockets to 10k Concurrent Users", summary: "How we architected our WebSocket layer to handle massive concurrent room sessions without dropping a single message.", date: "Jan 28, 2026", readTime: "10 min" },
  { tag: "Design", tagColor: "text-amber-400 border-amber-500/30 bg-amber-500/5", title: "UX of Real-Time Code Conflict Resolution", summary: "Designing conflict indicators that inform without distracting — lessons from six months of user testing in live coding sessions.", date: "Jan 15, 2026", readTime: "7 min" },
  { tag: "Tutorial", tagColor: "text-green-400 border-green-500/30 bg-green-500/5", title: "Using CodeSync for Remote Technical Interviews", summary: "A practical guide to running technical interviews with CopCode rooms, language selection, and shared execution environments.", date: "Jan 3, 2026",  readTime: "4 min" },
>>>>>>> a4a12d9 (full project implementation)
];

function BlogCard({ tag, tagColor, title, summary, date, readTime }) {
  return (
    <div className="card group flex flex-col p-6 gap-4 cursor-pointer">
      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs px-2.5 py-1 rounded border ${tagColor}`}>{tag}</span>
        <span className="font-mono text-xs text-gray-600">{readTime} read</span>
      </div>
      <div className="flex-1">
        <h3 className="font-mono font-bold text-white text-sm mb-2 leading-snug group-hover:text-cyan-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">{summary}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[#1e2a3a] mt-auto">
        <span className="font-mono text-xs text-gray-600">{date}</span>
        <span className="flex items-center gap-1 font-mono text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Read <ArrowRight size={11} />
        </span>
      </div>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <PageShell>
      <div className="pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="section-tag">// BLOGS</p>
            <h1 className="section-heading">
              From the <span className="text-cyan-400">devlog</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((p) => <BlogCard key={p.title} {...p} />)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
