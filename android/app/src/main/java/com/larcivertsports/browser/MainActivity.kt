package com.larcivertsports.browser

import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.view.ViewGroup
import android.webkit.DownloadListener
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebResourceRequest
import android.widget.*

class MainActivity : Activity() {
    private val home = "https://www.larcivertsports.com/"
    private val pages = mutableListOf<WebView>()
    private var active = -1
    private lateinit var address: EditText
    private lateinit var frame: FrameLayout
    private lateinit var tabsLabel: TextView
    private val prefs by lazy { getSharedPreferences("larcivert", Context.MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(10, 16, 32)
        window.navigationBarColor = Color.rgb(10, 16, 32)
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(Color.rgb(12,22,49)) }
        val bar = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(4, 6, 4, 6) }
        fun button(label: String, action: () -> Unit): Button = Button(this).apply {
            text = label; textSize = 13f; setOnClickListener { action() }
            bar.addView(this, LinearLayout.LayoutParams(0, 48.dp(), 1f))
        }
        button("‹") { current()?.let { if (it.canGoBack()) it.goBack() } }
        button("›") { current()?.let { if (it.canGoForward()) it.goForward() } }
        button("⟳") { current()?.reload() }
        button("⌂") { current()?.loadUrl(home) }
        button("＋") { newTab(home) }
        button("★") { saveBookmark() }
        button("☷") { showMenu() }
        root.addView(bar)
        val searchRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        address = EditText(this).apply {
            setSingleLine(true); hint = "Adres veya arama"; textSize = 15f
            setBackgroundColor(Color.WHITE); setTextColor(Color.BLACK)
            setOnEditorActionListener { _, _, _ -> navigate(text.toString()); true }
        }
        searchRow.addView(address, LinearLayout.LayoutParams(0, 48.dp(), 1f))
        val go = Button(this).apply { text = "Git"; setOnClickListener { navigate(address.text.toString()) } }
        searchRow.addView(go)
        root.addView(searchRow)
        tabsLabel = TextView(this).apply { setTextColor(Color.WHITE); setPadding(12,5,8,5); setOnClickListener { showTabs() } }
        root.addView(tabsLabel)
        frame = FrameLayout(this)
        root.addView(frame, LinearLayout.LayoutParams(-1,0,1f))
        setContentView(root)
        newTab(home)
    }
    private fun Int.dp() = (this * resources.displayMetrics.density).toInt()
    private fun current(): WebView? = pages.getOrNull(active)
    private fun normalize(input: String): String {
        val s = input.trim()
        if (s.startsWith("https://") || s.startsWith("http://")) return s
        if (s.contains('.') && !s.contains(' ') && !s.contains("://")) return "https://$s"
        return "https://www.google.com/search?q=" + Uri.encode(s)
    }
    private fun navigate(input: String) { current()?.loadUrl(normalize(input)) }
    private fun newTab(url: String) {
        val web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        web.settings.javaScriptCanOpenWindowsAutomatically = false
        web.settings.setSupportMultipleWindows(false)
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val scheme = request.url.scheme
                return scheme != "https" && scheme != "http"
            }
            override fun onPageFinished(view: WebView, url: String) {
                if (current() === view) address.setText(url)
                updateTabs()
            }
        }
        web.webChromeClient = WebChromeClient()
        web.setDownloadListener(DownloadListener { url, agent, disposition, mime, _ ->
            try {
                if (!url.startsWith("https://")) return@DownloadListener
                val request = DownloadManager.Request(Uri.parse(url))
                    .addRequestHeader("User-Agent", agent)
                    .setMimeType(mime)
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS,
                        android.webkit.URLUtil.guessFileName(url, disposition, mime))
                (getSystemService(DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
                Toast.makeText(this, "İndirme başlatıldı", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) { Toast.makeText(this, "İndirme başarısız", Toast.LENGTH_SHORT).show() }
        })
        pages.add(web)
        selectTab(pages.lastIndex)
        web.loadUrl(url)
    }
    private fun selectTab(index: Int) {
        if (index !in pages.indices) return
        active = index; frame.removeAllViews()
        val web = pages[index]
        (web.parent as? ViewGroup)?.removeView(web)
        frame.addView(web, FrameLayout.LayoutParams(-1,-1))
        address.setText(web.url ?: home); updateTabs()
    }
    private fun updateTabs() { tabsLabel.text = "LARCIVERT SPORTS BROWSER    •    Sekme ${active+1}/${pages.size}  ▾" }
    private fun showTabs() {
        val labels = pages.mapIndexed { index, web -> "${index+1}. ${web.title ?: web.url ?: "Yeni sekme"}" }.toTypedArray()
        android.app.AlertDialog.Builder(this).setTitle("Sekmeler").setItems(labels) { _, which -> selectTab(which) }
            .setPositiveButton("Yeni sekme") { _, _ -> newTab(home) }
            .setNeutralButton("Sekmeyi kapat") { _, _ -> closeTab() }.show()
    }
    private fun closeTab() {
        if (active !in pages.indices) return
        val web=pages.removeAt(active); frame.removeView(web); web.destroy()
        if (pages.isEmpty()) newTab(home) else selectTab((active-1).coerceAtLeast(0))
    }
    private fun saveBookmark() {
        val url=current()?.url ?: return
        val set=prefs.getStringSet("bookmarks", emptySet())!!.toMutableSet()
        set.add(url);prefs.edit().putStringSet("bookmarks",set).apply()
        Toast.makeText(this,"Yer imlerine eklendi",Toast.LENGTH_SHORT).show()
    }
    private fun showMenu() {
        val options=arrayOf("Yer imleri", "İndirilenler", "Ana sayfa", "Yeni sekme")
        android.app.AlertDialog.Builder(this).setTitle("Menü").setItems(options) { _, which ->
            when(which) {
                0 -> { val items=prefs.getStringSet("bookmarks",emptySet())!!.toTypedArray()
                    android.app.AlertDialog.Builder(this).setTitle("Yer imleri").setItems(items) { _, i -> navigate(items[i]) }.show() }
                1 -> startActivity(Intent(DownloadManager.ACTION_VIEW_DOWNLOADS))
                2 -> current()?.loadUrl(home)
                3 -> newTab(home)
            }
        }.show()
    }
    @Deprecated("Use OnBackPressedDispatcher in AndroidX migration")
    override fun onBackPressed() { val web=current(); if(web?.canGoBack()==true)web.goBack() else super.onBackPressed() }
    override fun onDestroy() { pages.forEach { it.destroy() };pages.clear();super.onDestroy() }
}
