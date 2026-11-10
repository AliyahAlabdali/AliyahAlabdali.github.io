/* =========================================================================
   Language switch: English (the HTML as written) or Arabic.

   The pages stay authored in English, so search engines and no-JS visitors
   get the full site. When Arabic is chosen, this script swaps every piece of
   visible text, plus alt text, ARIA labels and placeholders, for its entry in
   window.I18N_AR (assets/js/i18n-ar.js) and flips the page to right-to-left.

   Keys are the English text itself, whitespace collapsed. A "unit" is either
   - an element whose content is text plus inline formatting only
     (strong, em, a, br...), keyed by its innerHTML, so a sentence with a bold
     phrase or a link is translated as one sentence; or
   - a single text node inside an element that also holds icons or blocks
     (a button with an SVG arrow), keyed by its text.
   Anything without an entry - tool names like Python or FastAPI, numbers -
   is simply left as it is, which is also why editing an English sentence
   without updating its translation degrades to English, never to a blank.

   Switching reloads the page. Every other script (word-split headlines,
   count-ups, the project stack measurements) then runs once on the final
   text, instead of having to be undone and redone in place.

   Runs before main.js (both deferred, this one first).
   ========================================================================= */
(function(){
  "use strict";
  var KEY = "lang";
  var root = document.documentElement;

  function readParam(){
    var m = /[?&]lang=(en|ar)\b/.exec(location.search);
    return m ? m[1] : null;
  }
  function readStored(){
    try{ return localStorage.getItem(KEY); }catch(e){ return null; }
  }
  function store(v){
    try{ localStorage.setItem(KEY, v); return true; }catch(e){ return false; }
  }

  var param = readParam();
  var lang = param || readStored() || "en";
  if(lang !== "ar") lang = "en";
  if(param) store(param);
  var dict = (lang === "ar" && window.I18N_AR) || null;
  var stored = readStored() === lang;

  /* ---- Unit discovery: shared by the runtime and the extraction tooling ---- */
  var SKIP = {SCRIPT:1, STYLE:1, NOSCRIPT:1, TEMPLATE:1, CODE:1, PRE:1, VIDEO:1, IFRAME:1};
  var INLINE = {STRONG:1, EM:1, B:1, I:1, BR:1, SMALL:1, U:1, MARK:1, SUP:1, SUB:1, A:1, WBR:1};
  var ATTRS = ["aria-label", "alt", "placeholder", "title", "data-embed-title"];
  var LETTER = /[A-Za-z]/;

  function norm(s){ return s.replace(/\s+/g, " ").trim(); }

  /* An element is one unit when it has text of its own and every child element
     is inline formatting that itself holds only text. */
  function isUnit(el){
    var hasText = false;
    for(var i = 0; i < el.childNodes.length; i++){
      var c = el.childNodes[i];
      if(c.nodeType === 3){ if(LETTER.test(c.nodeValue)) hasText = true; }
      else if(c.nodeType === 1){
        if(!INLINE[c.tagName]) return false;
        for(var j = 0; j < c.children.length; j++){
          if(!INLINE[c.children[j].tagName]) return false;
        }
      }
    }
    return hasText;
  }

  function units(start){
    var out = [];
    (function walk(el){
      if(SKIP[el.tagName] || el.getAttribute("translate") === "no") return;
      ATTRS.forEach(function(a){
        var v = el.getAttribute(a);
        if(v && LETTER.test(v)) out.push({type:"attr", el:el, attr:a, key:norm(v)});
      });
      if(el !== start && el.tagName !== "BODY" && isUnit(el)){
        out.push({type:"html", el:el, key:norm(el.innerHTML)});
        return;
      }
      for(var i = 0; i < el.childNodes.length; i++){
        var c = el.childNodes[i];
        if(c.nodeType === 3){
          if(LETTER.test(c.nodeValue)) out.push({type:"text", node:c, key:norm(c.nodeValue)});
        } else if(c.nodeType === 1){
          walk(c);
        }
      }
    })(start);
    return out;
  }

  function apply(start){
    units(start).forEach(function(u){
      var v = dict[u.key];
      if(v == null) return;
      if(u.type === "html") u.el.innerHTML = v;
      else if(u.type === "attr") u.el.setAttribute(u.attr, v);
      else {
        var raw = u.node.nodeValue;
        u.node.nodeValue = (/^\s/.test(raw) ? " " : "") + v + (/\s$/.test(raw) ? " " : "");
      }
    });
  }

  function t(s){ return (dict && dict[norm(s)]) || s; }

  /* ---- Apply ---- */
  if(dict){
    root.lang = "ar";
    root.dir = "rtl";
    var title = dict[norm(document.title)];
    if(title) document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    if(desc && dict[norm(desc.content)]) desc.content = dict[norm(desc.content)];
    apply(document.body);
    /* Without storage, carry the choice along internal links instead. */
    if(!stored){
      document.querySelectorAll('a[href$=".html"], a[href*=".html#"], a[href="../index.html"]').forEach(function(a){
        var h = a.getAttribute("href");
        if(/^(https?:|mailto:)/.test(h)) return;
        var i = h.indexOf("#");
        a.setAttribute("href", (i < 0 ? h + "?lang=ar" : h.slice(0, i) + "?lang=ar" + h.slice(i)));
      });
    }
  } else {
    root.lang = "en";
    root.dir = "ltr";
  }

  /* ---- Toggle ---- */
  document.querySelectorAll("[data-lang-toggle]").forEach(function(btn){
    var next = lang === "ar" ? "en" : "ar";
    btn.textContent = next === "ar" ? "العربية" : "English";
    btn.setAttribute("lang", next);
    btn.setAttribute("aria-label", next === "ar" ? "عرض الموقع باللغة العربية" : "View the site in English");
    btn.addEventListener("click", function(){
      store(next);
      var url = location.pathname + location.search.replace(/([?&])lang=(en|ar)&?/, "$1").replace(/[?&]$/, "");
      if(!readStored() || readStored() !== next){
        url += (url.indexOf("?") < 0 ? "?" : "&") + "lang=" + next;
      }
      location.replace(url + location.hash);
    });
  });

  root.classList.remove("i18n-pending");
  window.I18N = {lang: lang, t: t, units: units, norm: norm};
})();
