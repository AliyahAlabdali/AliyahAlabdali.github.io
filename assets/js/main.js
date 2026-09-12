/* =========================================================================
   Portfolio interactions: vanilla JS, no dependencies.
   Nav state · mobile menu · scroll reveal · scrollspy · metric count-up ·
   lazy video autoplay · hero load · word-stagger headlines · scroll
   progress · magnetic tilt · nav pill · cursor spotlight.
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
    document.querySelectorAll(".skill-card, .prow__media, .role-card").forEach(function(el){
      var max = el.classList.contains("prow__media") ? 4 : 6;
      el.addEventListener("mousemove", function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX-r.left)/r.width - .5;
        var py = (e.clientY-r.top)/r.height - .5;
        el.style.transform = "perspective(800px) rotateX("+(-py*max)+"deg) rotateY("+(px*max)+"deg) translateY(-2px)";
      });
      el.addEventListener("mouseleave", function(){ el.style.transform = ""; });
    });
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

  /* ---- Lazy autoplay videos (previews) ---- */
  var vids = document.querySelectorAll("video[data-autoplay]");
  if("IntersectionObserver" in window){
    var vo = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting){ if(!reduce){ v.play().catch(function(){}); } }
        else { v.pause(); }
      });
    }, {threshold:.35});
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
      box.appendChild(iframe);
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
  var ASSISTANT_ENDPOINT = "https://aliyah-alabdali.app.n8n.cloud/webhook/aliyah-assistant";

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

  function mockReply(message){
    var q = message.toLowerCase();
    if(/yaqidh/.test(q)){
      return "Yaqidh is Aliyah's graduation project: a real-time computer-vision system that detects child falls and violence from live CCTV using custom YOLOv8 models (0.81 mAP@50 for falls, 0.66 for violence, a 2–3× gain over baselines). It pushes role-based alerts through a FastAPI + PostgreSQL + React stack, and ONNX optimisation cut inference latency by about 20%.";
    }
    if(/scam|spam|sms/.test(q)){
      return "Her SMS Scam & Spam Detection project is a Transformer encoder built entirely from scratch in PyTorch — tokenisation, embeddings, self-attention, classifier head — reaching 98% accuracy and 0.95 macro-F1 on a heavily imbalanced dataset.";
    }
    if(/tumor|tumour|brain|mri/.test(q)){
      return "The Brain Tumor MRI Classifier runs fully in the browser via ONNX Runtime Web — no patient scan ever leaves the device. It's a lightweight ~1.5MB model delivering ~79% accuracy at ~9ms inference.";
    }
    if(/who (is|are)|about (you|aliyah)|introduce/.test(q)){
      return "Aliyah Alabdali is an AI/ML engineer and First Class Honors AI graduate (GPA 4.0/4.0) from Umm Al-Qura University, based in Saudi Arabia. She specialises in Computer Vision, NLP, and Generative AI, building end-to-end systems from model development through production deployment.";
    }
    if(/project|built|shipped|portfolio/.test(q)){
      return "She's built three main projects: Yaqidh (real-time CCTV child-safety monitoring), an SMS Scam & Spam Detection Transformer built from scratch, and a privacy-first Brain Tumor MRI Classifier that runs entirely in-browser. Ask me about any of them by name!";
    }
    if(/skill|stack|technolog|tool/.test(q)){
      return "Her strongest AI/ML skills are PyTorch, YOLOv8, Transformers, OpenCV, and ONNX for optimisation/deployment, plus a full-stack layer of FastAPI, React, and cloud (AWS, Azure AI). She also works with Roboflow, Power BI, and n8n — see the Skills pipeline below for the full picture.";
    }
    if(/experience|work(ed)?|inpro|intern|co-?op|job/.test(q)){
      return "She was an AI Trainee (Co-op) at InPro Studio, an AI venture studio, where she contributed to two AI-powered SaaS platforms (***REMOVED*** and ***REMOVED***), benchmarked LLMs, and built a prompt-based classification system — all deployed on Azure AI Foundry.";
    }
    if(/educat|degree|university|gpa|step\b/.test(q)){
      return "BSc in Artificial Intelligence from Umm Al-Qura University — First Class Honors, GPA 4.0/4.0, STEP English score 88/100, and on the Dean's Honor List.";
    }
    if(/certif/.test(q)){
      return "AWS AI Practitioner Challenge (Udacity), Microsoft Azure AI Fundamentals, Designing & Implementing an Azure AI Solution, and Generative AI with Azure OpenAI Service (the last three via Microsoft & SDAIA).";
    }
    if(/contact|reach|email|hire|linkedin|github/.test(q)){
      return "The fastest way to reach her is by email at AliyahAlabdali24@gmail.com, or through the LinkedIn and GitHub links in the Contact section below.";
    }
    return "I'm a placeholder assistant for now — real answers will be live here soon. In the meantime, try asking who Aliyah is, about her projects (Yaqidh, the SMS detector, the brain-tumor classifier), her skills, or her experience.";
  }

  /* ---- Robot launcher + chat panel wiring ---- */
  var launcher = document.getElementById("ai-launcher");
  var chat = document.getElementById("ai-chat");
  if(launcher && chat){
    var messages = chat.querySelector("#ai-chat-messages");
    var chatForm = chat.querySelector("#ai-chat-form");
    var chatInput = chat.querySelector("#ai-chat-input");
    var closeBtn = chat.querySelector(".ai-chat__close");
    var greeted = false;

    function addMessage(text, who){
      var el = document.createElement("div");
      el.className = "ai-msg ai-msg--" + who;
      el.textContent = text;
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
