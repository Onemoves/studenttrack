package com.studenttrack.app

import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Opens the StudentTrack website inside the app.
 * When new files are uploaded to the hosting, they show up here right away. No new APK is needed.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private var chooserCallback: ValueCallback<Array<Uri>>? = null

    private val pickFile =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val cb = chooserCallback
            chooserCallback = null
            cb?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data))
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        web = WebView(this)
        setContentView(web)

        val cookies = CookieManager.getInstance()
        cookies.setAcceptCookie(true)
        cookies.setAcceptThirdPartyCookies(web, false)

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            setSupportZoom(false)
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            userAgentString = userAgentString + " StudentTrackApp/1.0"
        }
        web.addJavascriptInterface(Bridge(), "AndroidBridge")

        val home = Uri.parse(BuildConfig.SITE_URL)

        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.scheme == "blob" || uri.scheme == "about" || uri.scheme == "data") return false
                if (uri.host == home.host) return false
                // another website: open it in the browser
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                } catch (e: Exception) {
                    // no app can open it, do nothing
                }
                return true
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) {
                    val html = "<html><body style='font-family:sans-serif;background:#F5EEE0;color:#1B1A2E;" +
                        "display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center'>" +
                        "<h2>No connection</h2><p>StudentTrack could not be reached. Check your internet.</p>" +
                        "<p><a href='${BuildConfig.SITE_URL}' style='background:#3B5BFF;color:#fff;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:bold'>Try again</a></p>" +
                        "</body></html>"
                    view.loadDataWithBaseURL(null, html, "text/html", "utf-8", null)
                }
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                chooserCallback?.onReceiveValue(null)
                chooserCallback = filePathCallback
                return try {
                    pickFile.launch(fileChooserParams.createIntent())
                    true
                } catch (e: Exception) {
                    chooserCallback = null
                    false
                }
            }
        }

        // Backup download. The website uses a blob: link, so we read it with JavaScript.
        web.setDownloadListener { url, _, _, mimeType, _ ->
            if (url.startsWith("blob:")) {
                val ext = when {
                    mimeType.contains("json") -> "json"
                    mimeType.contains("csv") -> "csv"
                    else -> "txt"
                }
                val stamp = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
                val name = "studenttrack-$stamp.$ext"
                val js = "(function(){var x=new XMLHttpRequest();x.open('GET','$url',true);x.responseType='blob';" +
                    "x.onload=function(){var r=new FileReader();r.onloadend=function(){" +
                    "AndroidBridge.save(r.result.split(',')[1],'$name','$mimeType');};r.readAsDataURL(x.response);};x.send();})();"
                web.evaluateJavascript(js, null)
            } else {
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (e: Exception) {
                    toast("Could not download the file.")
                }
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) {
                    web.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        if (savedInstanceState != null) web.restoreState(savedInstanceState) else web.loadUrl(BuildConfig.SITE_URL)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onDestroy() {
        chooserCallback?.onReceiveValue(null)
        chooserCallback = null
        web.destroy()
        super.onDestroy()
    }

    private fun toast(msg: String) {
        runOnUiThread { Toast.makeText(this, msg, Toast.LENGTH_LONG).show() }
    }

    /** Called by the website to save the backup file to the Downloads folder. */
    inner class Bridge {
        @JavascriptInterface
        fun save(base64: String, name: String, mime: String) {
            try {
                val bytes = Base64.decode(base64, Base64.DEFAULT)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val values = ContentValues().apply {
                        put(MediaStore.Downloads.DISPLAY_NAME, name)
                        put(MediaStore.Downloads.MIME_TYPE, mime.ifEmpty { "application/octet-stream" })
                        put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }
                    val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                        ?: throw IllegalStateException("Could not create the file")
                    contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
                } else {
                    val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    dir.mkdirs()
                    File(dir, name).writeBytes(bytes)
                }
                toast("Saved to Downloads: $name")
            } catch (e: Exception) {
                toast("Could not save the file.")
            }
        }
    }
}
