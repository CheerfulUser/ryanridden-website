(function () {
    var canvas = document.createElement('canvas');
    canvas.id = 'stars-canvas';
    canvas.style.cssText = 'position:absolute;left:0;width:100%;pointer-events:none;z-index:0;';
    document.body.insertBefore(canvas, document.body.firstChild);

    var stars = [];
    var transients = [];
    var rafId = null;
    var lastTime = null;

    function buildStars(w, h) {
        stars = [];
        var count = Math.round((w * h) / 4000);
        for (var i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() < 0.15 ? 1.2 : 0.7,
                alpha: 0.3 + Math.random() * 0.65
            });
        }
    }

    function render() {
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.width / dpr;
        var h = canvas.height / dpr;
        var ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var boost = 0, rBoost = 0;
            for (var j = 0; j < transients.length; j++) {
                if (transients[j].index === i) {
                    boost = transients[j].alphaBoost;
                    rBoost = transients[j].rBoost;
                    break;
                }
            }
            var alpha = Math.min(1, s.alpha + boost);
            var r = s.r + rBoost;
            // Glow halo for active transients
            if (boost > 0.2) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, r * 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,240,200,' + (boost * 0.18) + ')';
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.fill();
        }
    }

    function tick(now) {
        if (!lastTime) lastTime = now;
        var dt = now - lastTime;
        lastTime = now;

        for (var i = transients.length - 1; i >= 0; i--) {
            var t = transients[i];
            t.elapsed += dt;
            var progress = t.elapsed / t.duration;
            if (progress >= 1) { transients.splice(i, 1); continue; }
            // Fast rise (~15% of duration), slow exponential-ish decay
            var brightness = progress < 0.15
                ? progress / 0.15
                : Math.pow(1 - (progress - 0.15) / 0.85, 1.8);
            t.alphaBoost = brightness * 0.9;
            t.rBoost = brightness * 1.8;
        }

        render();

        if (transients.length > 0) {
            rafId = requestAnimationFrame(tick);
        } else {
            rafId = null;
            lastTime = null;
        }
    }

    function triggerTransient() {
        if (!stars.length) return;
        var heroBottom = parseFloat(canvas.style.top) || 0;
        var scrollY = window.scrollY || window.pageYOffset;
        var vTop = scrollY - heroBottom;
        var vBottom = vTop + window.innerHeight;
        var vRight = window.innerWidth;
        var visible = [];
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            if (s.x >= 0 && s.x <= vRight && s.y >= vTop && s.y <= vBottom) {
                visible.push(i);
            }
        }
        if (!visible.length) { setTimeout(triggerTransient, 500 + Math.random() * 500); return; }
        transients.push({
            index: visible[Math.floor(Math.random() * visible.length)],
            elapsed: 0,
            duration: 2500 + Math.random() * 500 + Math.random() * 2000,
            alphaBoost: 0,
            rBoost: 0
        });
        if (!rafId) rafId = requestAnimationFrame(tick);
        // Schedule next transient
        setTimeout(triggerTransient, 500 + Math.random() * 500);
    }

    function draw() {
        var hero = document.querySelector('#hero, .page-hero');
        var heroBottom = hero
            ? Math.round(hero.getBoundingClientRect().bottom + (window.scrollY || window.pageYOffset))
            : 0;
        var dpr = window.devicePixelRatio || 1;
        var w = document.documentElement.scrollWidth;
        var h = document.documentElement.scrollHeight - heroBottom;
        canvas.style.top = heroBottom + 'px';
        canvas.style.height = h + 'px';
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        buildStars(w, h);
        render();
    }

    function init() {
        document.body.style.position = 'relative';
        draw();
        setTimeout(triggerTransient, 1000 + Math.random() * 1500 + Math.random() * 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('resize', function () {
        transients = [];
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; lastTime = null; }
        draw();
    });
})();
