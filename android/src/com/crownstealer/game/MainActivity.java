package com.crownstealer.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import org.json.JSONException;
import org.json.JSONObject;

/** Offline-only shell. Every network-shaped request resolves to a bundled asset or a denial. */
public final class MainActivity extends Activity {
    private static final int IMPORT_SAVE = 100;
    private static final int EXPORT_SAVE = 101;
    private static final int MAX_SAVE_BYTES = 2 * 1024 * 1024;
    private WebView game;
    private ValueCallback<Uri[]> importCallback;
    private String pendingExport;
    private boolean exitDialogVisible;

    @Override @SuppressLint("SetJavaScriptEnabled")
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(16, 24, 32));
        getWindow().setNavigationBarColor(Color.rgb(16, 24, 32));
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(16, 24, 32));
        setContentView(game);
        // API 35 enforces edge-to-edge. Keep controls clear of the status/navigation bars.
        if (Build.VERSION.SDK_INT >= 30) {
            game.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
        }
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Document-picker content URIs for explicit save imports.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        game.addJavascriptInterface(new SaveBridge(), "Android");
        game.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (!"GET".equals(request.getMethod())) return error(403, "Forbidden");
                return localResponse(request.getUrl().toString());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return OfflineContent.assetPath(request.getUrl().toString()) == null;
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (importCallback != null) importCallback.onReceiveValue(null);
                importCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[] { "application/json", "text/plain", "application/octet-stream" });
                try { startActivityForResult(intent, IMPORT_SAVE); }
                catch (ActivityNotFoundException e) {
                    importCallback.onReceiveValue(null);
                    importCallback = null;
                    toast("No document picker is available.");
                }
                return true;
            }
        });
        if (Build.VERSION.SDK_INT >= 33)
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        game.loadUrl(OfflineContent.ORIGIN + "/");
    }

    private WebResourceResponse localResponse(String url) {
        String path = OfflineContent.assetPath(url);
        if (path == null) return error(403, "Forbidden");
        try {
            InputStream input = getAssets().open(path);
            return new WebResourceResponse(OfflineContent.mimeType(path), "UTF-8", 200, "OK",
                    Collections.singletonMap("Cache-Control", "no-store"), input);
        } catch (IOException e) { return error(404, "Not Found"); }
    }

    private static WebResourceResponse error(int status, String reason) {
        return new WebResourceResponse("text/plain", "UTF-8", status, reason, Collections.emptyMap(),
                new ByteArrayInputStream(reason.getBytes(StandardCharsets.UTF_8)));
    }

    private final class SaveBridge {
        @JavascriptInterface public void exportSave(String json) {
            if (json == null || json.getBytes(StandardCharsets.UTF_8).length > MAX_SAVE_BYTES) {
                runOnUiThread(() -> toast("Save export is too large."));
                return;
            }
            try { new JSONObject(json); }
            catch (JSONException e) { runOnUiThread(() -> toast("Save export is not valid JSON.")); return; }
            runOnUiThread(() -> {
                if (pendingExport != null) return;
                pendingExport = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, "crownstealer-save.json");
                try { startActivityForResult(intent, EXPORT_SAVE); }
                catch (ActivityNotFoundException e) { pendingExport = null; toast("No document picker is available."); }
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        Uri selected = result == RESULT_OK && data != null ? data.getData() : null;
        if (selected != null && !"content".equals(selected.getScheme())) selected = null;
        if (request == IMPORT_SAVE && importCallback != null) {
            importCallback.onReceiveValue(selected == null ? null : new Uri[] {selected});
            importCallback = null;
        } else if (request == EXPORT_SAVE) {
            String json = pendingExport;
            pendingExport = null;
            if (selected != null && json != null) {
                final Uri destination = selected;
                new Thread(() -> {
                    try (OutputStream output = getContentResolver().openOutputStream(destination, "wt")) {
                        if (output == null) throw new IOException("No output stream");
                        output.write(json.getBytes(StandardCharsets.UTF_8));
                        runOnUiThread(() -> toast("Save exported."));
                    } catch (IOException | SecurityException e) { runOnUiThread(() -> toast("Could not export the save.")); }
                }, "save-export").start();
            }
        }
    }

    @Override protected void onPause() {
        if (game != null) {
            game.evaluateJavascript("window.dispatchEvent(new Event('androidpause'));", null);
            game.onPause();
            game.pauseTimers();
        }
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if (game != null) {
            game.resumeTimers();
            game.onResume();
            game.evaluateJavascript("window.dispatchEvent(new Event('androidresume'));", null);
        }
    }

    @Override public void onBackPressed() { handleBack(); }

    private void handleBack() {
        game.evaluateJavascript("(function(){if(typeof window.CrownStealerAndroidBack==='function' && window.CrownStealerAndroidBack())return true;var d=document.querySelector('dialog[open]');if(d){d.close();return true;}return false;})()", handled -> {
            if (!"true".equals(handled) && !exitDialogVisible && !isFinishing()) {
                exitDialogVisible = true;
                new AlertDialog.Builder(this).setTitle("Leave CrownStealer?")
                    .setMessage("Your autosave stays on this device.")
                    .setNegativeButton("Keep playing", null)
                    .setPositiveButton("Exit", (dialog, which) -> finish())
                    .setOnDismissListener(dialog -> exitDialogVisible = false).show();
            }
        });
    }

    private void toast(String text) { Toast.makeText(this, text, Toast.LENGTH_SHORT).show(); }

    @Override protected void onDestroy() {
        if (importCallback != null) importCallback.onReceiveValue(null);
        if (game != null) { game.removeJavascriptInterface("Android"); game.destroy(); }
        super.onDestroy();
    }
}
