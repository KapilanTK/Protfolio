window.__portfolioReady = true;

(function () {
    "use strict";

    // ================= HELPERS =================
    const qs = (s, el) => (el || document).querySelector(s);
    const qsa = (s, el) => Array.from((el || document).querySelectorAll(s));
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const root = document.documentElement;
    const body = document.body;

    // ================= PRELOADER =================
    (function preloader() {
        const loader = qs("#loader");
        if (!loader) return;
        const fill = qs("#loader-fill");
        const pct = qs("#loader-pct");
        const start = performance.now();
        const MIN = 1300;
        let loaded = document.readyState === "complete";
        let finished = false;

        window.addEventListener("load", () => { loaded = true; });
        setTimeout(() => { loaded = true; }, 3200); // never block longer than this

        body.classList.add("no-scroll");

        function tick(now) {
            let p = clamp((now - start) / MIN, 0, 1);
            if (!loaded) p = Math.min(p, 0.92);
            const v = Math.round(p * 100);
            fill.style.width = v + "%";
            pct.textContent = v;
            if (p >= 1 && loaded && !finished) {
                finished = true;
                loader.classList.add("done");
                setTimeout(() => {
                    loader.style.display = "none";
                    unlockIfIdle();
                }, 1100);
                return;
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    })();

    // ================= SCROLL LOCK =================
    function unlockIfIdle() {
        const busy = qs(".panel.open") || qs(".viewer.open") || (qs("#loader") && !qs("#loader").classList.contains("done") && qs("#loader").style.display !== "none");
        body.classList.toggle("no-scroll", !!busy);
    }

    // ================= HERO TITLE (letter wave) =================
    (function splitTitle() {
        const h1 = qs("#hero-title");
        if (!h1) return;
        h1.setAttribute("aria-label", h1.textContent);
        const nodes = Array.from(h1.childNodes);
        h1.innerHTML = "";
        nodes.forEach(n => {
            if (n.nodeType === 3) {
                n.textContent.split("").forEach(ch => {
                    const s = document.createElement("span");
                    s.className = "l";
                    s.setAttribute("aria-hidden", "true");
                    s.textContent = ch;
                    h1.appendChild(s);
                });
            } else {
                h1.appendChild(n.cloneNode(true));
            }
        });
    })();

    // ================= TYPING EFFECT =================
    if (window.Typed && qs(".text")) {
        new Typed(".text", {
            strings: ["responsive websites", "React interfaces", "clean, fast UIs"],
            typeSpeed: 70,
            backSpeed: 45,
            backDelay: 1200,
            loop: true
        });
    }

    // ================= MOBILE MENU =================
    const menuIcon = qs("#menu-icon");
    const navbar = qs("#navbar");

    menuIcon.addEventListener("click", () => {
        navbar.classList.toggle("open");
        menuIcon.classList.toggle("bx-x");
    });

    navbar.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navbar.classList.remove("open");
            menuIcon.classList.remove("bx-x");
        });
    });

    // ================= SCROLL: progress, sticky header, active link, timeline =================
    const header = qs("#header");
    const progress = qs("#progress");
    const sections = qsa("section[id]");
    const navLinks = qsa(".navbar a:not(.pill)");
    const timeline = qs("#timeline");
    const tlFill = qs("#tl-fill");
    let scrollTicking = false;

    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
        header.classList.toggle("sticky", y > 60);

        let current = "home";
        sections.forEach(sec => {
            if (y + 160 >= sec.offsetTop) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + current);
        });

        if (timeline && tlFill) {
            const r = timeline.getBoundingClientRect();
            const p = clamp((window.innerHeight * 0.6 - r.top) / r.height, 0, 1);
            tlFill.style.setProperty("--fill", (p * 100) + "%");
        }
        scrollTicking = false;
    }

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    // ================= HERO PARTICLE NETWORK =================
    (function particles() {
        const c = qs("#hero-canvas");
        if (!c || !c.getContext) return;
        const ctx = c.getContext("2d");
        const hero = qs("#home");
        let w = 0, h = 0, pts = [], raf = 0, running = false;
        const mouse = { x: -9999, y: -9999 };

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = c.clientWidth;
            h = c.clientHeight;
            c.width = w * dpr;
            c.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.round(clamp((w * h) / 15000, 24, 95));
            pts = Array.from({ length: n }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.7 + 0.6
            }));
        }

        function frame() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                const dxm = mouse.x - p.x, dym = mouse.y - p.y;
                const dm = Math.hypot(dxm, dym);
                if (dm < 170) {
                    p.x += dxm * 0.012;
                    p.y += dym * 0.012;
                    ctx.strokeStyle = "rgba(255,74,61," + (0.5 * (1 - dm / 170)) + ")";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                ctx.fillStyle = "rgba(255,90,80,.85)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < pts.length; j++) {
                    const q = pts[j];
                    const d = Math.hypot(p.x - q.x, p.y - q.y);
                    if (d < 120) {
                        ctx.strokeStyle = "rgba(229,25,45," + (0.32 * (1 - d / 120)) + ")";
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(frame);
        }

        function start() { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(frame); } }
        function stop() { running = false; cancelAnimationFrame(raf); }

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", e => {
            const r = c.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        });
        hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(es => es[0].isIntersecting ? start() : stop(), { threshold: 0.01 }).observe(hero);
        } else {
            start();
        }
        document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
        if (reduceMotion) frame();
    })();

    // ================= HERO PHOTO PARALLAX =================
    (function parallax() {
        const photo = qs("#hero-photo");
        if (!photo || !finePointer || reduceMotion) return;
        window.addEventListener("mousemove", e => {
            if (window.innerWidth <= 900 || window.scrollY > window.innerHeight) return;
            const px = (e.clientX / window.innerWidth - 0.5) * -28;
            const py = (e.clientY / window.innerHeight - 0.5) * -16;
            photo.style.setProperty("--px", px.toFixed(1) + "px");
            photo.style.setProperty("--py", py.toFixed(1) + "px");
        });
    })();

    // ================= CUSTOM CURSOR =================
    (function cursor() {
        if (!finePointer) return;
        const dot = qs("#cursor-dot");
        const ring = qs("#cursor-ring");
        let mx = 0, my = 0, rx = 0, ry = 0;

        window.addEventListener("mousemove", e => {
            mx = e.clientX;
            my = e.clientY;
            root.classList.add("cursor-on");
        });
        document.addEventListener("mouseleave", () => root.classList.remove("cursor-on"));
        document.addEventListener("mousedown", () => ring.classList.add("down"));
        document.addEventListener("mouseup", () => ring.classList.remove("down"));

        document.addEventListener("mouseover", e => {
            const t = e.target.closest("a, button, input, textarea, [data-doc], [data-project], .filter, .project-card, .cert-card");
            ring.classList.toggle("hover", !!t);
        });

        (function loop() {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
            ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
            requestAnimationFrame(loop);
        })();
    })();

    // ================= TILT + SPOTLIGHT =================
    qsa(".tilt, .spot").forEach(el => {
        const isTilt = el.classList.contains("tilt") && finePointer && !reduceMotion;
        const max = el.classList.contains("photo-frame") ? 7 : 8;

        el.addEventListener("mousemove", e => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            el.style.setProperty("--mx", x + "px");
            el.style.setProperty("--my", y + "px");
            if (isTilt) {
                el.style.setProperty("--ry", ((x / r.width - 0.5) * max * 2).toFixed(2) + "deg");
                el.style.setProperty("--rx", ((0.5 - y / r.height) * max * 2).toFixed(2) + "deg");
            }
        });

        el.addEventListener("mouseleave", () => {
            el.style.setProperty("--rx", "0deg");
            el.style.setProperty("--ry", "0deg");
        });
    });

    // ================= MAGNETIC BUTTONS =================
    if (finePointer && !reduceMotion) {
        qsa(".magnetic").forEach(el => {
            el.addEventListener("mousemove", e => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                el.style.setProperty("--tx", (x * 0.28).toFixed(1) + "px");
                el.style.setProperty("--ty", (y * 0.35).toFixed(1) + "px");
            });
            el.addEventListener("mouseleave", () => {
                el.style.setProperty("--tx", "0px");
                el.style.setProperty("--ty", "0px");
            });
        });
    }

    // ================= TEXT SCRAMBLE =================
    const GLYPHS = "!<>-_\\/[]{}=+*^?#01";
    function scramble(el) {
        const original = el.textContent;
        const dur = 900;
        const t0 = performance.now();
        (function step(now) {
            const p = clamp((now - t0) / dur, 0, 1);
            let out = "";
            for (let i = 0; i < original.length; i++) {
                const ch = original[i];
                if (ch === " " || i < original.length * p) out += ch;
                else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            el.textContent = out;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = original;
        })(t0);
    }

    // ================= COUNTERS =================
    function runCounters(scope) {
        qsa("[data-count]", scope).forEach(el => {
            if (el.dataset.done) return;
            el.dataset.done = "1";
            const target = parseInt(el.dataset.count, 10);
            if (reduceMotion) { el.textContent = target; return; }
            const t0 = performance.now();
            const dur = 1700;
            (function step(now) {
                const p = clamp((now - t0) / dur, 0, 1);
                const eased = 1 - Math.pow(1 - p, 4);
                el.textContent = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(step);
            })(t0);
        });
    }

    // ================= SCROLL REVEAL (staggered) =================
    const revealEls = qsa(".reveal");

    revealEls.forEach(el => {
        const sibs = qsa(":scope > .reveal", el.parentElement);
        const i = sibs.indexOf(el);
        el.style.setProperty("--d", (Math.min(Math.max(i, 0), 7) * 0.09).toFixed(2) + "s");
    });

    function onShow(el) {
        el.classList.add("show");
        if (el.hasAttribute("data-scramble") && !reduceMotion) scramble(el);
        if (el.querySelector("[data-count]")) runCounters(el);
    }

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    onShow(en.target);
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(onShow);
    }

    // ================= CERTIFICATE FILTERS =================
    const filterBtns = qsa(".filter");
    const certCards = qsa(".cert-card");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.toggle("active", b === btn));
            const f = btn.dataset.filter;
            let n = 0;
            certCards.forEach(card => {
                const match = f === "all" || card.dataset.cat === f;
                card.classList.remove("pop");
                if (match) {
                    card.classList.remove("hide");
                    card.classList.add("show"); // make sure it is visible even if not yet revealed
                    void card.offsetWidth;
                    card.style.setProperty("--pd", (n++ * 0.08) + "s");
                    card.classList.add("pop");
                } else {
                    card.classList.add("hide");
                }
            });
        });
    });

    // ================= DOCUMENT VIEWER =================
    const DOCS = {
        exlife: {
            title: "Internship Certificate - EXLife Solutions",
            sub: "React JS · 17 Jun - 12 Jul 2024",
            imgs: ["C:\Protfolio\React js.jpeg"],
            pdf: "C:\Protfolio\Exlife solution Internship certificate.pdf"
        },
        iccida: {
            title: "ICCIDA'24 - Certificate of Participation",
            sub: "Conference · 21 - 23 Mar 2024",
            imgs: ["certs/ai-ds-certificate.jpg"],
            pdf: "docs/ai-ds-certificate.pdf"
        },
        ncc2022: {
            title: "NCC Annual Training Camp - 2022",
            sub: "11 (TN) BN NCC, Nagercoil",
            imgs: ["certs/ncc-camp-2022.jpg"],
            pdf: "docs/ncc-camp-2022.pdf"
        },
        ncc2023: {
            title: "NCC Annual Training Camp - 2023",
            sub: "11 (TN) BN NCC, Nagercoil",
            imgs: ["certs/ncc-camp-2023.jpg"],
            pdf: "docs/ncc-camp-2023.pdf"
        },
        nccalumni: {
            title: "NCC Alumni Association - Life Member",
            sub: "Front and back of the card",
            imgs: ["certs/ncc-alumni-front.jpg", "certs/ncc-alumni-back.jpg"],
            pdf: "docs/ncc-alumni-card.pdf"
        },
        fypreport: {
            title: "Final Year Project Report - Smart Trolley",
            sub: "Project report · 79 pages",
            pages: { dir: "docs/pages/fyp", count: 79, w: 827, h: 1170 },
            pdf: "docs/final-year-project-report.pdf"
        },
        iotreport: {
            title: "IoT Mini Project - Temperature & Humidity Monitoring",
            sub: "Project document · 6 pages",
            pages: { dir: "docs/pages/iot", count: 6, w: 774, h: 1100 },
            pdf: "docs/iot-mini-project.pdf"
        }
    };

    const viewer = qs("#viewer");
    const vBody = qs("#viewer-body");
    const vTitle = qs("#viewer-title");
    const vCount = qs("#viewer-count");
    const vOpen = qs("#viewer-open");
    const vDl = qs("#viewer-dl");
    const vPrev = qs("#viewer-prev");
    const vNext = qs("#viewer-next");
    let vList = [];
    let vIndex = 0;
    let vLastFocus = null;

    function renderViewer() {
        const id = vList[vIndex];
        const d = DOCS[id];
        if (!d) return;

        vTitle.textContent = d.title;
        vCount.textContent = vList.length > 1 ? (vIndex + 1) + " / " + vList.length + "  ·  " + d.sub : d.sub;
        vOpen.href = d.pdf;
        vDl.href = d.pdf;
        vPrev.hidden = vNext.hidden = vList.length <= 1;

        vBody.innerHTML = "";
        vBody.classList.remove("zoomed");
        vBody.scrollTo(0, 0);

        if (d.imgs || d.pages) {
            vBody.className = "viewer-body";
            const hint = document.createElement("p");
            hint.className = "viewer-hint";
            hint.textContent = d.pages
                ? "Scroll to read all " + d.pages.count + " pages · click a page to zoom in and out"
                : "Click the image to zoom in and out";
            vBody.appendChild(hint);

            if (d.pages) {
                for (let i = 1; i <= d.pages.count; i++) {
                    const fig = document.createElement("figure");
                    fig.className = "page-fig";
                    const img = document.createElement("img");
                    img.src = d.pages.dir + "/p-" + String(i).padStart(2, "0") + ".webp";
                    img.alt = d.title + " - page " + i;
                    img.loading = "lazy";
                    img.width = d.pages.w;
                    img.height = d.pages.h;
                    const cap = document.createElement("figcaption");
                    cap.textContent = "Page " + i + " of " + d.pages.count;
                    fig.appendChild(img);
                    fig.appendChild(cap);
                    vBody.appendChild(fig);
                }
            } else {
                d.imgs.forEach(src => {
                    const img = document.createElement("img");
                    img.src = src;
                    img.alt = d.title;
                    vBody.appendChild(img);
                });
            }
        } else {
            vBody.className = "viewer-body is-pdf";
            const frame = document.createElement("iframe");
            frame.title = d.title;
            frame.src = d.pdf + "#view=FitH";
            vBody.appendChild(frame);
            const note = document.createElement("div");
            note.className = "viewer-note";
            note.innerHTML = 'Document not showing? <a href="' + d.pdf + '" target="_blank" rel="noopener">Open it in a new tab</a> or use the download button.';
            vBody.appendChild(note);
        }
        // restart the body animation
        vBody.style.animation = "none";
        void vBody.offsetWidth;
        vBody.style.animation = "";
    }

    function openViewer(id, list) {
        if (!DOCS[id]) return;
        vList = list && list.length ? list : [id];
        vIndex = Math.max(0, vList.indexOf(id));
        vLastFocus = document.activeElement;
        renderViewer();
        viewer.classList.add("open");
        viewer.setAttribute("aria-hidden", "false");
        body.classList.add("no-scroll");
        qs(".viewer-actions button", viewer).focus();
    }

    function closeViewer() {
        if (!viewer.classList.contains("open")) return;
        viewer.classList.remove("open");
        viewer.setAttribute("aria-hidden", "true");
        vBody.innerHTML = "";
        unlockIfIdle();
        if (vLastFocus && vLastFocus.focus) vLastFocus.focus({ preventScroll: true });
    }

    function stepViewer(dir) {
        if (vList.length <= 1) return;
        vIndex = (vIndex + dir + vList.length) % vList.length;
        renderViewer();
    }

    vPrev.addEventListener("click", () => stepViewer(-1));
    vNext.addEventListener("click", () => stepViewer(1));
    qsa("[data-close-viewer]", viewer).forEach(b => b.addEventListener("click", closeViewer));
    vBody.addEventListener("click", e => {
        if (e.target.tagName === "IMG") vBody.classList.toggle("zoomed");
    });

    // any element with data-doc opens the viewer
    document.addEventListener("click", e => {
        const t = e.target.closest("[data-doc]");
        if (!t) return;
        const id = t.dataset.doc;
        let list = [id];
        if (t.classList.contains("cert-card")) {
            list = qsa(".cert-card:not(.hide)").map(c => c.dataset.doc);
        }
        openViewer(id, list);
    });

    document.addEventListener("keydown", e => {
        const t = e.target;
        // keyboard activation of card "buttons"
        if ((e.key === "Enter" || e.key === " ") && t.matches && t.matches(".cert-card, .project-card")) {
            e.preventDefault();
            t.click();
            return;
        }
        if (viewer.classList.contains("open")) {
            if (e.key === "Escape") closeViewer();
            else if (e.key === "ArrowLeft") stepViewer(-1);
            else if (e.key === "ArrowRight") stepViewer(1);
            return;
        }
        if (e.key === "Escape") closePanels();
    });

    // ================= PROJECT PANELS =================
    const panels = qsa(".panel");
    let panelOrigin = null;

    function openPanel(name, x, y) {
        const p = qs("#panel-" + name);
        if (!p) return;
        p.style.setProperty("--cx", x + "px");
        p.style.setProperty("--cy", y + "px");
        panelOrigin = document.activeElement;
        p.scrollTop = 0;
        qs(".panel-scroll", p).scrollTop = 0;
        p.classList.add("open");
        p.setAttribute("aria-hidden", "false");
        body.classList.add("no-scroll");
        setTimeout(() => qs(".panel-close", p).focus({ preventScroll: true }), 500);
    }

    function closePanels() {
        let any = false;
        panels.forEach(p => {
            if (p.classList.contains("open")) {
                p.classList.remove("open");
                p.setAttribute("aria-hidden", "true");
                any = true;
            }
        });
        if (any) {
            unlockIfIdle();
            if (panelOrigin && panelOrigin.focus) panelOrigin.focus({ preventScroll: true });
        }
    }

    qsa("[data-project]").forEach(card => {
        card.addEventListener("click", e => {
            const r = card.getBoundingClientRect();
            const x = e.clientX || r.left + r.width / 2;
            const y = e.clientY || r.top + r.height / 2;
            openPanel(card.dataset.project, x, y);
        });
    });

    qsa("[data-close-panel]").forEach(b => b.addEventListener("click", closePanels));

    // ================= CONTACT FORM =================
    const toast = qs("#toast");
    let toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
    }

    function burst(x, y) {
        if (reduceMotion || !document.body.animate) return;
        const colors = ["#e5192d", "#ff4a3d", "#ff9a62", "#ffffff"];
        for (let i = 0; i < 26; i++) {
            const s = document.createElement("span");
            const size = 5 + Math.random() * 7;
            s.style.cssText = "position:fixed;z-index:999;pointer-events:none;left:" + x + "px;top:" + y + "px;width:" + size + "px;height:" + size + "px;border-radius:" + (Math.random() > .5 ? "50%" : "2px") + ";background:" + colors[i % colors.length];
            document.body.appendChild(s);
            const ang = Math.random() * Math.PI * 2;
            const dist = 70 + Math.random() * 130;
            s.animate([
                { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
                { transform: "translate(" + Math.cos(ang) * dist + "px," + (Math.sin(ang) * dist + 60) + "px) rotate(" + (Math.random() * 540) + "deg)", opacity: 0 }
            ], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => s.remove();
        }
    }

    const form = qs("#contact-form");
    form.addEventListener("submit", e => {
        e.preventDefault();
        const name = qs("#cf-name").value.trim();
        const email = qs("#cf-email").value.trim();
        const msg = qs("#cf-msg").value.trim();

        const subject = encodeURIComponent("Portfolio Contact from " + name);
        const bodyTxt = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + msg);

        const btn = qs(".pill", form).getBoundingClientRect();
        burst(btn.left + btn.width / 2, btn.top + btn.height / 2);
        showToast("Thanks " + name.split(" ")[0] + "! Opening your mail app...");

        setTimeout(() => {
            window.location.href = "mailto:kapilanthennarasu@gmail.com?subject=" + subject + "&body=" + bodyTxt;
            form.reset();
        }, 700);
    });

    // ================= FOOTER YEAR =================
    qs("#year").textContent = new Date().getFullYear();
})();