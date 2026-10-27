package com.crownstealer.game;

/** Host-side tests for the APK's offline URL boundary and module MIME types. */
public final class OfflineContentTest {
    public static void main(String[] args) throws Exception {
        Class<?> router;
        try { router = Class.forName("com.crownstealer.game.OfflineContent"); }
        catch (ClassNotFoundException e) { throw new AssertionError("Offline URL routing is not implemented", e); }
        java.lang.reflect.Method path = router.getDeclaredMethod("assetPath", String.class);
        java.lang.reflect.Method mime = router.getDeclaredMethod("mimeType", String.class);
        equal("index.html", path.invoke(null, "https://appassets.androidplatform.net/"));
        equal("game/main.js", path.invoke(null, "https://appassets.androidplatform.net/game/main.js?v=1"));
        equal("assets/a b.png", path.invoke(null, "https://appassets.androidplatform.net/assets/a%20b.png"));
        for (String url : new String[] {
            "https://example.com/game/main.js", "http://appassets.androidplatform.net/",
            "https://appassets.androidplatform.net.evil.test/", "https://user@appassets.androidplatform.net/",
            "https://appassets.androidplatform.net:443/", "file:///android_asset/index.html",
            "https://appassets.androidplatform.net/../secret", "https://appassets.androidplatform.net/%2e%2e/secret",
            "https://appassets.androidplatform.net/a/%2e%2e/secret", "https://appassets.androidplatform.net/a%5cb.js",
            "https://appassets.androidplatform.net/a%00.js", "https://appassets.androidplatform.net//secret"
        }) equal(null, path.invoke(null, url));
        equal("application/javascript", mime.invoke(null, "game/main.js"));
        equal("application/javascript", mime.invoke(null, "game/main.mjs"));
        equal("application/json", mime.invoke(null, "game/data.json"));
        equal("image/svg+xml", mime.invoke(null, "assets/icon.svg"));
        equal("audio/wav", mime.invoke(null, "assets/tone.wav"));
        System.out.println("OfflineContent: 20 routing and MIME checks passed.");
    }

    private static void equal(Object expected, Object actual) {
        if (!java.util.Objects.equals(expected, actual))
            throw new AssertionError("Expected " + expected + ", got " + actual);
    }
}
