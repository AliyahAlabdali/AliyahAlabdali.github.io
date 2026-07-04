/* =========================================================================
   Portfolio interactions: vanilla JS, no dependencies.
   Nav state · mobile menu · scroll reveal · scrollspy · metric count-up ·
   lazy video autoplay · hero load. Respects prefers-reduced-motion.
   ========================================================================= */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Hero load-in ---- */
  var hero = document.querySelector(".hero, .case-hero");
  if(hero){ requestAnimationFrame(function(){ hero.classList.add("loaded"); }); }

  /* ---- Sticky nav shadow ---- */
  var nav = document.querySelector(".nav");
  function onScroll(){
    if(nav) nav.classList.toggle("is-stuck", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

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

  /* ---- Current year ---- */
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* ---- Contact form (mailto compose, no backend needed) ---- */
  var form = document.querySelector("#contact-form");
  if(form){
    form.addEventListener("submit", function(ev){
      ev.preventDefault();
      var name = encodeURIComponent(form.name.value.trim());
      var email = encodeURIComponent(form.email.value.trim());
      var msg = encodeURIComponent(form.message.value.trim());
      var subject = "Portfolio enquiry from " + decodeURIComponent(name);
      var body = decodeURIComponent(msg) + "\n\n" + decodeURIComponent(name) + " (" + decodeURIComponent(email) + ")";
      window.location.href = "mailto:AliyahAlabdali24@gmail.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }
})();
