import { FileCode, Database, Server, Terminal, FolderTree, BookOpen } from "lucide-react";

const Index = () => {
  const files = [
    { name: "package.json", path: "docs/nodejs-backend/package.json" },
    { name: ".env.example", path: "docs/nodejs-backend/.env.example" },
    { name: "src/index.js", path: "docs/nodejs-backend/src/index.js" },
    { name: "src/config/database.js", path: "docs/nodejs-backend/src/config/database.js" },
    { name: "src/models/Article.js", path: "docs/nodejs-backend/src/models/Article.js" },
    { name: "src/controllers/articleController.js", path: "docs/nodejs-backend/src/controllers/articleController.js" },
    { name: "src/routes/articleRoutes.js", path: "docs/nodejs-backend/src/routes/articleRoutes.js" },
    { name: "src/services/scraperService.js", path: "docs/nodejs-backend/src/services/scraperService.js" },
    { name: "src/utils/logger.js", path: "docs/nodejs-backend/src/utils/logger.js" },
    { name: "src/scripts/scrapeArticles.js", path: "docs/nodejs-backend/src/scripts/scrapeArticles.js" },
    { name: "README.md", path: "docs/nodejs-backend/README.md" },
  ];

  const apiRoutes = [
    { method: "GET", endpoint: "/api/articles", description: "Get all articles (paginated)" },
    { method: "GET", endpoint: "/api/articles/:id", description: "Get single article by ID" },
    { method: "POST", endpoint: "/api/articles", description: "Create new article" },
    { method: "PUT", endpoint: "/api/articles/:id", description: "Update article" },
    { method: "DELETE", endpoint: "/api/articles/:id", description: "Delete article" },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "POST": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PUT": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "DELETE": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-[#0d0d14]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">BeyondChats Article Scraper</h1>
              <p className="text-sm text-gray-500">Node.js + Express + MongoDB</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800/60">
            <Database className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-medium text-white mb-1">MongoDB Storage</h3>
            <p className="text-sm text-gray-400">Store scraped articles with full CRUD operations</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800/60">
            <Terminal className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-medium text-white mb-1">Web Scraper</h3>
            <p className="text-sm text-gray-400">Axios + Cheerio for extracting blog content</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800/60">
            <BookOpen className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-medium text-white mb-1">REST API</h3>
            <p className="text-sm text-gray-400">Full article management endpoints</p>
          </div>
        </div>

        {/* Quick Start */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Quick Start
          </h2>
          <div className="rounded-xl bg-gray-900/50 border border-gray-800/60 overflow-hidden">
            <div className="p-4 space-y-3 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="text-gray-500 select-none">1.</span>
                <code className="text-gray-300">cd docs/nodejs-backend</code>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-500 select-none">2.</span>
                <code className="text-gray-300">npm install</code>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-500 select-none">3.</span>
                <code className="text-gray-300">cp .env.example .env</code>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-500 select-none">4.</span>
                <code className="text-gray-300">npm run dev</code>
                <span className="text-gray-500 ml-2"># Start server</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-500 select-none">5.</span>
                <code className="text-gray-300">npm run scrape</code>
                <span className="text-gray-500 ml-2"># Run scraper</span>
              </div>
            </div>
          </div>
        </section>

        {/* API Routes */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            API Endpoints
          </h2>
          <div className="rounded-xl bg-gray-900/50 border border-gray-800/60 overflow-hidden">
            <div className="divide-y divide-gray-800/60">
              {apiRoutes.map((route, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getMethodColor(route.method)}`}>
                    {route.method}
                  </span>
                  <code className="text-gray-300 font-mono text-sm flex-1">{route.endpoint}</code>
                  <span className="text-gray-500 text-sm hidden md:block">{route.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Files */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-purple-400" />
            Project Files
          </h2>
          <div className="rounded-xl bg-gray-900/50 border border-gray-800/60 overflow-hidden">
            <div className="divide-y divide-gray-800/60">
              {files.map((file, i) => (
                <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-800/30 transition-colors">
                  <FileCode className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300 font-mono text-sm">{file.name}</span>
                  <span className="text-gray-600 text-xs hidden md:block ml-auto">{file.path}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Note */}
        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-amber-300/80 text-sm">
            <strong className="text-amber-300">Note:</strong> This is a Node.js backend project. Copy the files from{" "}
            <code className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-xs">docs/nodejs-backend/</code>{" "}
            to your local machine and run with Node.js v18+.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
          BeyondChats Article Scraper • Node.js + Express + MongoDB
        </div>
      </footer>
    </div>
  );
};

export default Index;
