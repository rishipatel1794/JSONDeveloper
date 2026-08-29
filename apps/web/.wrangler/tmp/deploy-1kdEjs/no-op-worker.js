// ../../node_modules/.pnpm/wrangler@4.127.1_@cloudflare+workers-types@5.20260829.1/node_modules/wrangler/templates/no-op-worker.js
var no_op_worker_default = {
  fetch() {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }
};
export {
  no_op_worker_default as default
};
//# sourceMappingURL=no-op-worker.js.map
