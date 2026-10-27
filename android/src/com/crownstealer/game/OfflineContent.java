package com.crownstealer.game;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

/** Shared URL boundary; independent of Android so it can be tested on the host. */
final class OfflineContent {
    static final String ORIGIN = "https://appassets.androidplatform.net";

    static String assetPath(String url) {
        try {
            URI uri = new URI(url);
            if (!"https".equals(uri.getScheme()) || !"appassets.androidplatform.net".equals(uri.getHost())
                    || uri.getPort() != -1 || uri.getUserInfo() != null) return null;
            String path = uri.getPath();
            if (path == null || !path.startsWith("/") || path.contains("\\") || path.indexOf(0) >= 0) return null;
            if (path.equals("/")) return "index.html";
            String local = path.substring(1);
            for (String part : local.split("/", -1))
                if (part.isEmpty() || part.equals(".") || part.equals("..")) return null;
            return local;
        } catch (URISyntaxException | IllegalArgumentException e) { return null; }
    }

    static String mimeType(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json") || lower.endsWith(".webmanifest")) return "application/json";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".ogg")) return "audio/ogg";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".wasm")) return "application/wasm";
        return "application/octet-stream";
    }
}
