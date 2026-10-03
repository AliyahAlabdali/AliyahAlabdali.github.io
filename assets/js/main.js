/* =========================================================================
   Portfolio interactions: vanilla JS, no dependencies.
   Nav state · mobile menu · scroll reveal · scrollspy · metric count-up ·
   lazy video autoplay · hero load · word-stagger headlines · scroll
   progress · magnetic tilt · nav pill · cursor spotlight ·
   sticky stacking project cards · magnetic buttons.
   Respects prefers-reduced-motion.
   ========================================================================= */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;

  /* ---- Word-stagger headline split (runs before .loaded is applied) ---- */
  function splitWords(root){
    var textNodes = [];
    (function collect(node){
      for(var i=0;i<node.childNodes.length;i++){
        var c = node.childNodes[i];
        if(c.nodeType===3) textNodes.push(c);
        else if(c.nodeType===1) collect(c);
      }
    })(root);
    var idx = 0;
    textNodes.forEach(function(node){
      var parts = node.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function(p){
        if(p==="") return;
        if(/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
        var span = document.createElement("span");
        span.className = "word";
        span.style.transitionDelay = (idx*45)+"ms";
        idx++;
        span.textContent = p;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  if(!reduce){
    document.querySelectorAll("[data-split]").forEach(splitWords);
  }

  /* ---- Hero load-in ---- */
  var hero = document.querySelector(".hero, .case-hero");
  function startHero(){
    if(hero){ requestAnimationFrame(function(){ hero.classList.add("loaded"); }); }
  }

  /* ---- Entry intro: a short cinematic reveal, shown once per browser
     session and skipped entirely for prefers-reduced-motion. The hero's
     own load-in starts as the intro begins its exit wipe, so the two
     sequences overlap instead of leaving a dead gap. ---- */
  var intro = document.getElementById("intro");
  var introAlreadyShown = false;
  try{ introAlreadyShown = !!sessionStorage.getItem("introShown"); }catch(e){}
  if(intro && !reduce && !introAlreadyShown){
    document.body.style.overflow = "hidden";
    setTimeout(function(){
      intro.classList.add("is-out");
      document.body.style.overflow = "";
      try{ sessionStorage.setItem("introShown","1"); }catch(e){}
      startHero();
      setTimeout(function(){ intro.remove(); }, 1100);
    }, 1200);
  } else {
    if(intro) intro.remove();
    startHero();
  }

  /* ---- Sticky nav shadow + scroll progress ---- */
  var nav = document.querySelector(".nav");
  var progressBar = document.querySelector(".scroll-progress");
  function onScroll(){
    if(nav) nav.classList.toggle("is-stuck", window.scrollY > 12);
    if(progressBar){
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      progressBar.style.width = (max>0 ? (h.scrollTop/max*100) : 0) + "%";
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  /* ---- Sliding nav pill (desktop hover indicator) ---- */
  var navLinksWrap = document.querySelector(".nav__links");
  var navPill = navLinksWrap && navLinksWrap.querySelector(".nav__pill");
  if(navLinksWrap && navPill && canHover){
    var navAnchors = navLinksWrap.querySelectorAll("a");
    var movePill = function(el){
      var wrapRect = navLinksWrap.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      navPill.style.width = (r.width+16)+"px";
      navPill.style.transform = "translateX("+(r.left-wrapRect.left-8)+"px)";
      navPill.style.opacity = "1";
    };
    navAnchors.forEach(function(a){
      a.addEventListener("mouseenter", function(){ movePill(a); });
    });
    navLinksWrap.addEventListener("mouseleave", function(){
      var current = navLinksWrap.querySelector('a[aria-current="true"]');
      if(current){ movePill(current); } else { navPill.style.opacity = "0"; }
    });
  }

  /* ---- Cursor spotlight (hero / case-hero) ---- */
  if(!reduce && canHover){
    document.querySelectorAll(".hero, .case-hero").forEach(function(section){
      var spot = section.querySelector(".spotlight");
      if(!spot) return;
      section.addEventListener("mousemove", function(e){
        var r = section.getBoundingClientRect();
        spot.style.setProperty("--x", (e.clientX-r.left)+"px");
        spot.style.setProperty("--y", (e.clientY-r.top)+"px");
      });
    });
  }

  /* ---- Magnetic tilt on cards / media ---- */
  if(!reduce && canHover){
    document.querySelectorAll(".skill-card, .pcard__shot, .role-card").forEach(function(el){
      var max = el.classList.contains("pcard__shot") ? 4 : 6;
      el.addEventListener("mousemove", function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX-r.left)/r.width - .5;
        var py = (e.clientY-r.top)/r.height - .5;
        el.style.transform = "perspective(800px) rotateX("+(-py*max)+"deg) rotateY("+(px*max)+"deg) translateY(-2px)";
      });
      el.addEventListener("mouseleave", function(){ el.style.transform = ""; });
    });
  }

  /* ---- Projects: sticky stacking cards ----
     Each card scales down only while the NEXT card is physically travelling over it,
     never before. Overlap for card i+1 is measured straight off its own top edge:
     0 when that edge is at the fold, 1 when it has reached its pinned offset and is
     fully covering what's underneath. A card's depth in the deck is the sum of every
     overlap above it, so the oldest card ends up smallest - the same deck look as
     before, but nothing moves during a card's own reading phase. */
  var pstack = document.querySelector(".pstack");
  var pcards = pstack ? Array.prototype.slice.call(pstack.querySelectorAll(".pstack__card")) : [];
  if(pstack && pcards.length){
    var pn = pcards.length;
    var pSteps = 0.03;
    /* Viewports too short to pin a whole card fall back to plain vertical flow below
       the two-column breakpoint, so the deck scaling has to stand down with them. */
    var pStacking = window.matchMedia("(min-width:1024px),(min-height:700px)");
    /* Below the two-column breakpoint the cards are one column and stack as a deck. */
    var pSingle = window.matchMedia("(max-width:1023.98px) and (min-height:700px)");
    var pTicking = false;
    var pRoQueued = false;
    var pRadius = 0;
    var pStep = 0;
    var pPinned = [];
    var pRung = [];

    /* Each card is anchored by its own height, so the stylesheet needs that height,
       plus the few constants the per-frame pass reads back. Nothing forces the cards,
       so these are simply what they measure. */
    function pstackMeasure(){
      if(!pSingle.matches){
        pcards.forEach(function(c){ c.parentNode.style.removeProperty("--card-h"); });
        return;
      }
      pcards.forEach(function(c){
        c.parentNode.style.setProperty("--card-h", c.offsetHeight + "px");
      });
      /* Where each item comes to rest: the denominator for arrival, and the basis
         for the rung ladder below. */
      pPinned = pcards.map(function(c){
        return parseFloat(getComputedStyle(c.parentNode).top) || 0;
      });
      pRadius = parseFloat(getComputedStyle(pcards[0]).borderTopLeftRadius) || 0;
      pStep = pn > 1
        ? (parseFloat(getComputedStyle(pcards[1].parentNode).getPropertyValue("--pstack-offset")) || 0)
        : 0;
      /* Where each card comes to rest once it has been covered: one step above the
         card in front of it, counted back from the frontmost card's own pin. */
      pRung = [];
      pRung[pn - 1] = pPinned[pn - 1] || 0;
      for(var r = pn - 2; r >= 0; r--){ pRung[r] = pRung[r + 1] - pStep; }
    }

    /* One invariant drives the whole deck: a card paints from its own effective top
       down to the effective top of the card above it, and no further. Everything
       else - the stacked edges, the fact that a covered card's body and demo stay
       hidden, the behaviour while the deck releases - follows from that.

       A covered card is carried to a fixed rung, P[i] = P[i+1] - step, derived from
       the pinned positions rather than from where the cards happen to be this frame.
       How far it has travelled to that rung is just how far the card above it has
       arrived, so coverage advances with scroll progress and unwinds the same way
       backwards. Nothing is rediscovered per frame, so nothing can be forgotten when
       the items unpin - which they do one at a time, in order of their offsets, and
       which is what let card 01's demo surface again at the end of the run. */
    function pstackUpdate(){
      pTicking = false;
      if(reduce || !pStacking.matches){
        pcards.forEach(function(c){ c.style.transform = ""; c.style.clipPath = ""; });
        return;
      }
      var vh = window.innerHeight;
      var single = pSingle.matches;
      var i, j;

      /* The item is never transformed, so it reports each card's untouched position.
         Arrival is read straight off the scroll and stays that way: a card sits
         exactly where the scroll position puts it, with nothing added on top of it. */
      var natTop = [], arrived = [];
      for(j = 0; j < pn; j++){
        natTop[j] = pcards[j].parentNode.getBoundingClientRect().top;
        var travel = vh - (pPinned[j] || 0);
        var q = travel > 0 ? (vh - natTop[j]) / travel : 1;
        arrived[j] = q < 0 ? 0 : (q > 1 ? 1 : q);
      }

      var scale = [];
      for(i = 0; i < pn; i++){
        var depth = 0;
        for(j = i + 1; j < pn; j++){ depth += arrived[j]; }
        scale[i] = 1 - depth * pSteps;
      }

      if(!single){
        for(i = 0; i < pn; i++){
          pcards[i].style.transform = "scale(" + scale[i].toFixed(4) + ")";
          if(pcards[i].style.clipPath) pcards[i].style.clipPath = "";
        }
        return;
      }

      /* How far each card has been taken over: once anything above it has landed, it
         belongs on its rung. */
      var covered = [];
      for(i = 0; i < pn; i++){
        var c = 0;
        for(j = i + 1; j < pn; j++){ if(arrived[j] > c) c = arrived[j]; }
        covered[i] = c;
      }

      /* Walk front to back. The rung is where a covered card belongs once the deck
         is at rest; while the card above is still on its way in that rung is the
         higher of the two, so an arriving card never drags the one behind it down.
         Once the deck unpins and travels up, the card above is higher than the rung
         and the edges follow it off the screen together, instead of being stranded
         at a fixed offset for the front card to slide out from under. */
      var eff = [];
      eff[pn - 1] = natTop[pn - 1];
      for(i = pn - 2; i >= 0; i--){
        var target = Math.min(pRung[i], eff[i + 1] - pStep);
        eff[i] = natTop[i] + (target - natTop[i]) * covered[i];
      }
      for(i = 0; i < pn; i++){
        pcards[i].style.transform =
          "translateY(" + (eff[i] - natTop[i]).toFixed(2) + "px) scale(" + scale[i].toFixed(4) + ")";
      }

      for(i = 0; i < pn; i++){
        if(i === pn - 1){
          if(pcards[i].style.clipPath) pcards[i].style.clipPath = "";
          continue;
        }
        var s = scale[i] || 1;
        /* a hair of overlap so the seam with the card above cannot show a gap */
        var keep = (eff[i + 1] + 1 - eff[i]) / s;
        var cut = pcards[i].offsetHeight - keep;
        if(cut > 0.5){
          pcards[i].style.clipPath =
            "inset(0px 0px " + cut.toFixed(1) + "px 0px round " + pRadius + "px)";
        } else if(pcards[i].style.clipPath){
          pcards[i].style.clipPath = "";
        }
      }
    }

    function pstackOnScroll(){
      if(!pTicking){ pTicking = true; requestAnimationFrame(pstackUpdate); }
    }
    function pstackResize(){ pstackMeasure(); pstackOnScroll(); }
    window.addEventListener("scroll", pstackOnScroll, {passive:true});
    window.addEventListener("resize", pstackResize);
    /* The copy reflows after first paint - web fonts swap in, images settle - and a
       slot measured before that is too short, which would crush the demo bands. Three
       independent chances to catch it: the font swap, the load event, and an observer
       on the two rows whose height the stack never sets, so none of them can loop. */
    if(document.fonts && document.fonts.ready){ document.fonts.ready.then(pstackResize); }
    window.addEventListener("load", pstackResize);
    if(window.ResizeObserver){
      var pRo = new ResizeObserver(function(){
        if(pRoQueued) return;
        pRoQueued = true;
        requestAnimationFrame(function(){ pRoQueued = false; pstackResize(); });
      });
      pcards.forEach(function(c){
        var head = c.querySelector(".pcard__head"), facts = c.querySelector(".pcard__facts");
        if(head) pRo.observe(head);
        if(facts) pRo.observe(facts);
      });
    }
    pstackResize();
  }

  /* ---- Magnetic pull on the project buttons ----
     While the cursor is within PAD of the button, it leans toward the cursor
     by offset/STRENGTH; it eases back on the way out. ---- */
  if(!reduce && canHover){
    var magnets = Array.prototype.slice.call(document.querySelectorAll("[data-magnet]"));
    if(magnets.length){
      var MAG_PAD = 70, MAG_STRENGTH = 4;
      var magTicking = false, magX = 0, magY = 0;
      function magUpdate(){
        magTicking = false;
        magnets.forEach(function(el){
          var r = el.getBoundingClientRect();
          var inRange = magX > r.left - MAG_PAD && magX < r.right + MAG_PAD &&
                        magY > r.top - MAG_PAD && magY < r.bottom + MAG_PAD;
          if(inRange){
            var dx = (magX - (r.left + r.width / 2)) / MAG_STRENGTH;
            var dy = (magY - (r.top + r.height / 2)) / MAG_STRENGTH;
            el.style.transition = "transform .3s ease-out";
            el.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
          } else if(el.style.transform){
            el.style.transition = "transform .6s ease-in-out";
            el.style.transform = "";
          }
        });
      }
      magnets.forEach(function(el){ el.style.willChange = "transform"; });
      window.addEventListener("mousemove", function(e){
        magX = e.clientX; magY = e.clientY;
        if(!magTicking){ magTicking = true; requestAnimationFrame(magUpdate); }
      }, {passive:true});
    }
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav__toggle");
  if(toggle && nav){
    toggle.addEventListener("click", function(){
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true":"false");
      document.body.style.overflow = open ? "hidden":"";
    });
    nav.querySelectorAll(".nav__menu a").forEach(function(a){
      a.addEventListener("click", function(){
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded","false");
        document.body.style.overflow="";
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if(reduce || !("IntersectionObserver" in window)){
    revealEls.forEach(function(el){ el.classList.add("in"); });
  } else {
    var ro = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("in"); ro.unobserve(e.target); }
      });
    }, {rootMargin:"0px 0px -8% 0px", threshold:.12});
    revealEls.forEach(function(el){ ro.observe(el); });
  }

  /* ---- Metric count-up ---- */
  function animateNum(el){
    var target = parseFloat(el.dataset.count);
    var dec = (el.dataset.dec ? parseInt(el.dataset.dec,10) : 0);
    var dur = 1300, start = null;
    function frame(t){
      if(!start) start = t;
      var p = Math.min((t-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = (target*eased).toFixed(dec);
      if(p<1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if(reduce || !("IntersectionObserver" in window)){
    counters.forEach(function(el){
      var dec = (el.dataset.dec ? parseInt(el.dataset.dec,10):0);
      el.textContent = parseFloat(el.dataset.count).toFixed(dec);
    });
  } else {
    var co = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateNum(e.target); co.unobserve(e.target); }
      });
    }, {threshold:.6});
    counters.forEach(function(el){ co.observe(el); });
  }

  /* ---- Autoplay videos (previews) ----
     The markup carries autoplay/muted/loop/playsinline, so the browser starts these
     on its own; iOS in particular manages muted inline video from the viewport
     itself. The observer below is only an optimisation - it pauses a clip that has
     scrolled away and nudges one that should be running - and is deliberately no
     longer the thing that makes playback happen. A low threshold matters inside the
     sticky stack, where a demo sits at the bottom of a long card and may only ever
     be fractionally within the root. */
  var vids = Array.prototype.slice.call(document.querySelectorAll("video[data-autoplay]"));
  function playVideo(v){
    if(reduce) return;
    v.muted = true;                       /* property, not just the attribute */
    var p = v.play();
    if(p && p.catch) p.catch(function(){});
  }
  if(!reduce){ vids.forEach(playVideo); }
  if("IntersectionObserver" in window){
    var vo = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting){ if(v.paused) playVideo(v); }
        else if(!v.paused){ v.pause(); }
      });
    }, {threshold:.01});
    vids.forEach(function(v){ vo.observe(v); });
  }

  /* ---- Scrollspy for main nav + case nav ---- */
  function spy(linkSel, attr){
    var links = Array.prototype.slice.call(document.querySelectorAll(linkSel));
    if(!links.length) return;
    var map = {};
    var sections = links.map(function(l){
      var id = l.getAttribute("href");
      if(id && id.charAt(0)==="#"){
        var s = document.querySelector(id);
        if(s){ map[id.slice(1)] = l; return s; }
      }
      return null;
    }).filter(Boolean);
    if(!sections.length) return;
    var so = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          links.forEach(function(l){
            if(attr==="class") l.classList.remove("active");
            else l.removeAttribute("aria-current");
          });
          var l = map[e.target.id];
          if(l){ if(attr==="class") l.classList.add("active"); else l.setAttribute("aria-current","true"); }
        }
      });
    }, {rootMargin:"-45% 0px -50% 0px"});
    sections.forEach(function(s){ so.observe(s); });
  }
  spy(".nav__links a", "aria-current");
  spy(".case-nav a", "class");

  /* ---- Live embed: load the real deployed app in an iframe on demand,
     rather than on page load, so visitors who don't want it never pay for
     someone else's app bundle. ---- */
  document.querySelectorAll(".live-embed").forEach(function(box){
    var btn = box.querySelector(".live-embed__launch");
    if(!btn) return;
    btn.addEventListener("click", function(){
      var src = box.getAttribute("data-embed-src");
      var title = box.getAttribute("data-embed-title") || "Live demo";
      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = title;
      iframe.loading = "lazy";
      iframe.allow = "clipboard-write";
      box.innerHTML = "";
      if(box.classList.contains("live-embed--desktop")){
        /* Give the page a laptop viewport and scale it to fit, so the embed shows the
           desktop layout rather than the mobile one a column-width iframe would get. */
        var bar = document.createElement("div");
        bar.className = "live-embed__bar";
        bar.innerHTML = '<span class="live-embed__dots"><i></i><i></i><i></i></span>' +
                        '<span class="live-embed__url"></span>';
        bar.querySelector(".live-embed__url").textContent = src.replace(/^https?:\/\//, "");
        var vp = document.createElement("div");
        vp.className = "live-embed__viewport";
        vp.appendChild(iframe);
        box.appendChild(bar);
        box.appendChild(vp);
        var fit = function(){
          /* A narrower virtual viewport on phones: still the desktop layout, but scaled
             down less brutally than a 1280px page would be. */
          var vw = window.innerWidth <= 700 ? 1024 : 1280;
          var vh = Math.round(vw * 0.625);
          var s = vp.clientWidth / vw;
          iframe.style.width = vw + "px";
          iframe.style.height = vh + "px";
          iframe.style.transform = "scale(" + s + ")";
          vp.style.height = Math.round(vh * s) + "px";
        };
        fit();
        window.addEventListener("resize", fit);
      } else {
        box.appendChild(iframe);
      }
    });
  });

  /* ---- Current year ---- */
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* =======================================================================
     AI Assistant chat - frontend + interaction only. Answers are generated
     locally by mockReply() below, sourced from the same facts already on
     this page (About/Skills/Work/Experience/Education). This does NOT talk
     to any backend yet.

     To wire up the real n8n webhook later: set ASSISTANT_ENDPOINT to the
     webhook URL, and getAssistantReply() will POST {message} there and use
     the JSON {reply} it gets back instead of mockReply(). That's the only
     integration point - nothing else needs to change.
     ======================================================================= */
  var ASSISTANT_ENDPOINT = "https://aliyahalabdali.app.n8n.cloud/webhook/aliyah-assistant";

  function getAssistantReply(message){
    if(ASSISTANT_ENDPOINT){
      return fetch(ASSISTANT_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({message: message})
      }).then(function(r){ return r.json(); }).then(function(data){
        return data && data.reply ? data.reply : mockReply(message);
      }).catch(function(){ return mockReply(message); });
    }
    return Promise.resolve(mockReply(message));
  }

  /* Minimal offline fallback. The portfolio knowledge lives in
     assets/data/portfolio-knowledge.md, which the assistant backend reads on
     every request; this is only what the widget can say when that request
     fails, so it stays deliberately small and carries no project detail. */
  function mockReply(message){
    var q = message.toLowerCase();
    if(/who (is|are)|about (you|aliyah)|introduce/.test(q)){
      return "Aliyah Alabdali is an AI/ML engineer and Artificial Intelligence graduate specialising in Computer Vision, NLP, and Generative AI. I can't reach the full assistant right now, so have a look around the portfolio for the details.";
    }
    if(/project|built|shipped|portfolio|intermind|yaqidh|scam|spam|sms|tumor|tumour|brain|mri/.test(q)){
      return "Her public projects are InterMind, Yaqidh, SMS Scam & Spam Detection, and the Brain Tumor MRI Classifier. I can't reach the full assistant right now, so open any of them in the Projects section for the full case study.";
    }
    if(/contact|reach|email|hire|linkedin|github/.test(q)){
      return "The fastest way to reach her is by email at AliyahAlabdali24@gmail.com, or through the LinkedIn and GitHub links in the Contact section below.";
    }
    return "I can't reach the full portfolio assistant right now. You can explore the portfolio, or contact Aliyah directly at AliyahAlabdali24@gmail.com.";
  }

  /* ---- Robot launcher + chat panel wiring ---- */
  var launcher = document.getElementById("ai-launcher");
  var chat = document.getElementById("ai-chat");
  if(launcher && chat){
    var messages = chat.querySelector("#ai-chat-messages");
    var chatForm = chat.querySelector("#ai-chat-form");
    var chatInput = chat.querySelector("#ai-chat-input");
    var closeBtn = chat.querySelector(".ai-chat__close");
    var suggestions = chat.querySelector(".ai-chat__suggestions");
    var greeted = false;

    /* Turns bare http(s) URLs in assistant text into real <a> nodes. Builds a
       DocumentFragment from createTextNode/createElement only - the reply is
       never passed through innerHTML, so any HTML or script in it stays inert
       literal text. href is always a literal http:// or https:// match, so no
       javascript: or data: scheme can get through. */
    var URL_RE = /https?:\/\/[^\s<>"']+/g;
    var TRAILING = ".,;:!?'’\"";
    var CLOSERS = { ")": "(", "]": "[", "}": "{" };

    function splitTrailingPunctuation(url){
      var tail = "";
      while(url.length){
        var last = url.charAt(url.length - 1);
        if(TRAILING.indexOf(last) !== -1){
          tail = last + tail; url = url.slice(0, -1); continue;
        }
        if(CLOSERS[last]){
          var open = CLOSERS[last];
          var opens = url.split(open).length - 1;
          var closes = url.split(last).length - 1;
          if(closes > opens){ tail = last + tail; url = url.slice(0, -1); continue; }
        }
        break;
      }
      return [url, tail];
    }

    function linkify(text){
      var frag = document.createDocumentFragment();
      var last = 0, m;
      URL_RE.lastIndex = 0;
      while((m = URL_RE.exec(text)) !== null){
        var parts = splitTrailingPunctuation(m[0]);
        var url = parts[0], tail = parts[1];
        if(m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        if(url.length > "https://".length){
          var a = document.createElement("a");
          a.href = url;
          a.textContent = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          frag.appendChild(a);
        } else {
          frag.appendChild(document.createTextNode(url));
        }
        if(tail) frag.appendChild(document.createTextNode(tail));
        last = m.index + m[0].length;
      }
      if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      return frag;
    }

    /* Paired Markdown bold only: **text** -> text. The model is told to return
       plain text but occasionally emits these. Nothing is rendered as markup
       and lone asterisks are left alone. Runs before linkify so URLs are
       matched against already-normalised text. */
    var BOLD_RE = /\*\*(\S(?:[\s\S]*?\S)?)\*\*/g;
    function stripBoldMarkers(text){
      return text.replace(BOLD_RE, "$1");
    }

    /* Per-message direction, decided from the reply itself. URLs are removed
       before counting because a long Latin URL would otherwise outweigh the
       Arabic prose around it. Latin project names inside Arabic text stay a
       minority, so the bubble still reads as RTL. */
    var ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    var LATIN_RE = /[A-Za-z]/g;
    function isPredominantlyArabic(text){
      var prose = text.replace(URL_RE, " ");
      URL_RE.lastIndex = 0;
      var arabic = (prose.match(ARABIC_RE) || []).length;
      var latin = (prose.match(LATIN_RE) || []).length;
      return arabic > 0 && arabic >= latin;
    }

    function addMessage(text, who){
      var el = document.createElement("div");
      el.className = "ai-msg ai-msg--" + who;
      if(who === "bot"){
        /* Only assistant replies are normalised and linkified. */
        var clean = stripBoldMarkers(text);
        el.dir = isPredominantlyArabic(clean) ? "rtl" : "ltr";
        el.appendChild(linkify(clean));
      } else {
        el.textContent = text;
      }
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }
    function addTyping(){
      var el = document.createElement("div");
      el.className = "ai-msg ai-msg--bot ai-msg--typing";
      el.innerHTML = "<span></span><span></span><span></span>";
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }
    function ask(text){
      if(!text.trim()) return;
      /* Suggestions are the empty state only: once the conversation has a user
         message they stay hidden for the rest of it, freeing the space for
         answers. Nothing re-shows them, so close/reopen keeps them hidden. */
      if(suggestions) suggestions.hidden = true;
      addMessage(text, "user");
      var typing = addTyping();
      getAssistantReply(text).then(function(reply){
        typing.remove();
        addMessage(reply, "bot");
      });
    }

    function openChat(){
      chat.hidden = false;
      requestAnimationFrame(function(){ chat.classList.add("is-open"); });
      launcher.setAttribute("aria-expanded","true");
      if(!greeted){
        greeted = true;
        addMessage("Hi! I'm an AI assistant trained on Aliyah's background, projects, and skills. Ask me anything — try one of the suggestions below, or type your own question.", "bot");
      }
      setTimeout(function(){ chatInput && chatInput.focus(); }, 300);
    }
    function closeChat(){
      chat.classList.remove("is-open");
      launcher.setAttribute("aria-expanded","false");
      setTimeout(function(){ chat.hidden = true; }, reduce ? 0 : 350);
      launcher.focus();
    }

    launcher.addEventListener("click", openChat);
    closeBtn && closeBtn.addEventListener("click", closeChat);
    chat.querySelectorAll("[data-close]").forEach(function(el){
      el.addEventListener("click", closeChat);
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && chat.classList.contains("is-open")) closeChat();
    });
    chatForm && chatForm.addEventListener("submit", function(e){
      e.preventDefault();
      var text = chatInput.value;
      chatInput.value = "";
      ask(text);
    });
    chat.querySelectorAll(".ai-chip").forEach(function(chip){
      chip.addEventListener("click", function(){ ask(chip.textContent); });
    });
  }
})();
