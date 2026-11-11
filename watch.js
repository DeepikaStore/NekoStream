function extractServers(data) {
    const list = [];
    // Ambil dari nested details
    const details = data.details || data.detail || data;
    const streamUrl = details.streamingUrl || details.streamUrl || details.iframeUrl || "";

    if (streamUrl) {
        list.push({ name: "Default Server", url: streamUrl });
    }

    // Fallback kalau ada multi-server
    const multiServer = data.servers || details.servers || [];
    if (Array.isArray(multiServer)) {
        multiServer.forEach(s => {
            const name = s.name || s.server || "Server";
            const url = s.url || s.iframeUrl || s.streamUrl || "";
            if (url) list.push({ name, url });
        });
    }
    return list;
}
