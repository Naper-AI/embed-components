import { serve } from "bun";
import { file } from "bun";

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve the main HTML file for root path
    if (pathname === "/" || pathname === "/index.html") {
      try {
        const htmlFile = file("./index.html");
        return new Response(htmlFile, {
          headers: {
            "Content-Type": "text/html",
          },
        });
      } catch (error) {
        return new Response("index.html not found", { status: 404 });
      }
    }

    // Serve main.js from dist folder
    if (pathname === "/app.js") {
      try {
        const jsFile = file("./dist/app.js");
        return new Response(jsFile, {
          headers: {
            "Content-Type": "application/javascript",
          },
        });
      } catch (error) {
        return new Response("app.js not found", { status: 404 });
      }
    }

    // Serve other static files from dist folder
    if (pathname.startsWith("/dist/")) {
      try {
        const filePath = `.${pathname}`;
        const staticFile = file(filePath);
        return new Response(staticFile);
      } catch (error) {
        return new Response("File not found", { status: 404 });
      }
    }

    // Default 404 response
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`); 