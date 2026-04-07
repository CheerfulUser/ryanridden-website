// Collaborator world map — requires D3 v7 and TopoJSON client
(function() {
    const COLORS = {
        home:           '#9b6dff',
        supernovae:     '#f97b4f',
        'solar-system': '#4fecf9',
        grb:            '#c084fc',
        general:        '#4fca8b',
    };

    // labelText: shown on map. omit to show dot only (tooltip still works).
    // labelDx/labelDy: pixel offset from dot centre.
    // labelAnchor: 'start' (label right of dot) or 'end' (label left of dot).
    const collaborators = [
        {
            name: "University of Canterbury", loc: "Christchurch, NZ",
            lon: 172.6, lat: -43.5, home: true,
            labelText: "Canterbury", labelDx: -9, labelDy: -8, labelAnchor: 'end',
        },
        // ── Supernovae ────────────────────────────────────────
        {
            name: "STScI", loc: "Baltimore, USA",
            lon: -76.6, lat: 39.3, topic: 'supernovae',
            labelText: "STScI", labelDx: 8, labelDy: -7, labelAnchor: 'start',
        },
        {
            name: "Harvard / CfA", loc: "Cambridge, USA",
            lon: -71.1, lat: 42.4, topic: 'supernovae',
            labelText: "Harvard / CfA", labelDx: 8, labelDy: 4, labelAnchor: 'start',
        },
        {
            // omit label — projected nearly on top of Harvard/CfA
            name: "MIT", loc: "Cambridge, USA",
            lon: -71.0, lat: 42.35, topic: 'grb',
        },
        {
            // omit label — too close to STScI
            name: "NASA Goddard", loc: "Greenbelt, USA",
            lon: -76.9, lat: 38.9, topic: 'grb',
        },
        {
            name: "Columbia / CCA", loc: "New York, USA",
            lon: -73.9, lat: 40.8, topic: 'supernovae',
            labelText: "Columbia", labelDx: 8, labelDy: -7, labelAnchor: 'start',
        },
        {
            name: "Northwestern", loc: "Evanston, USA",
            lon: -87.7, lat: 42.0, topic: 'supernovae',
            labelText: "Northwestern", labelDx: 8, labelDy: -7, labelAnchor: 'start',
        },
        {
            name: "Texas A&M", loc: "College Station, USA",
            lon: -96.3, lat: 30.6, topic: 'supernovae',
            labelText: "Texas A&M", labelDx: 8, labelDy: 12, labelAnchor: 'start',
        },
        {
            name: "UC Berkeley", loc: "Berkeley, USA",
            lon: -122.3, lat: 37.9, topic: 'supernovae',
            labelText: "UC Berkeley", labelDx: -9, labelDy: -8, labelAnchor: 'end',
        },
        {
            name: "UC Santa Cruz", loc: "Santa Cruz, USA",
            lon: -122.1, lat: 36.6, topic: 'supernovae',
            labelText: "UC Santa Cruz", labelDx: -9, labelDy: 12, labelAnchor: 'end',
        },
        {
            name: "Carnegie Observatories", loc: "Pasadena, USA",
            lon: -118.1, lat: 34.1, topic: 'supernovae',
            labelText: "Carnegie", labelDx: 8, labelDy: 4, labelAnchor: 'start',
        },
        {
            name: "Queen's Belfast", loc: "Belfast, UK",
            lon: -5.9, lat: 54.6, topic: 'supernovae',
            labelText: "Queen's Belfast", labelDx: 8, labelDy: -7, labelAnchor: 'start',
        },
        {
            name: "Swinburne Univ.", loc: "Melbourne, Australia",
            lon: 145.0, lat: -37.8, topic: 'supernovae',
            labelText: "Swinburne", labelDx: -9, labelDy: 12, labelAnchor: 'end',
        },
        {
            name: "ANU", loc: "Canberra, Australia",
            lon: 149.1, lat: -35.3, topic: 'supernovae',
            labelText: "ANU", labelDx: 8, labelDy: -8, labelAnchor: 'start',
        },
        // ── Solar System / Interstellar ───────────────────────
        {
            name: "Univ. of Edinburgh", loc: "Edinburgh, UK",
            lon: -3.2, lat: 55.9, topic: 'solar-system',
            labelText: "Edinburgh", labelDx: 8, labelDy: 12, labelAnchor: 'start',
        },
        {
            name: "Hawaii / IfA", loc: "Honolulu, USA",
            lon: -157.8, lat: 21.3, topic: 'solar-system',
            labelText: "Hawaii / IfA", labelDx: 8, labelDy: 12, labelAnchor: 'start',
        },
        {
            name: "Univ. of Arizona", loc: "Tucson, USA",
            lon: -110.9, lat: 32.2, topic: 'solar-system',
            labelText: "Arizona", labelDx: 8, labelDy: 4, labelAnchor: 'start',
        },
        // ── General / Surveys ─────────────────────────────────
        {
            name: "Curtin Univ.", loc: "Perth, Australia",
            lon: 115.9, lat: -31.9, topic: 'general',
            labelText: "Curtin", labelDx: -9, labelDy: 4, labelAnchor: 'end',
        },
        {
            name: "Univ. of Queensland", loc: "Brisbane, Australia",
            lon: 153.0, lat: -27.5, topic: 'general',
            labelText: "Queensland", labelDx: -9, labelDy: -8, labelAnchor: 'end',
        },
    ];

    function topicColor(c) {
        if (c.home) return COLORS.home;
        return COLORS[c.topic] || COLORS.general;
    }

    function draw(world) {
        const svgEl = document.getElementById('collabMap');
        if (!svgEl) return;

        const W = svgEl.parentElement.offsetWidth || 900;
        const H = Math.round(W * 0.52);
        svgEl.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svgEl.setAttribute('height', H);

        const svg = d3.select('#collabMap');
        svg.selectAll('*').remove();

        const proj = d3.geoNaturalEarth1()
            .scale(W / 6.5)
            .translate([W / 2, H / 2]);
        const path = d3.geoPath().projection(proj);

        // Background
        svg.append('rect')
            .attr('width', W).attr('height', H)
            .attr('fill', '#0a0d14').attr('rx', 10);

        // Sphere outline
        svg.append('path').datum({ type: 'Sphere' })
            .attr('d', path)
            .attr('fill', '#080b14')
            .attr('stroke', 'rgba(79,156,249,0.2)')
            .attr('stroke-width', 0.6);

        // Graticule
        svg.append('path').datum(d3.geoGraticule().step([30, 30])())
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(79,156,249,0.07)')
            .attr('stroke-width', 0.4);

        // Land + borders
        if (world) {
            svg.append('path').datum(topojson.feature(world, world.objects.land))
                .attr('d', path)
                .attr('fill', 'rgba(79,156,249,0.28)')
                .attr('stroke', 'rgba(79,156,249,0.5)')
                .attr('stroke-width', 0.5);

            svg.append('path')
                .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(79,156,249,0.08)')
                .attr('stroke-width', 0.3);
        }

        // Great-circle arcs, coloured by topic
        const home = collaborators.find(function(c) { return c.home; });
        collaborators.forEach(function(c) {
            if (c.home) return;
            svg.append('path')
                .datum({ type: 'LineString', coordinates: [[home.lon, home.lat], [c.lon, c.lat]] })
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', topicColor(c))
                .attr('stroke-opacity', 0.55)
                .attr('stroke-width', 1.4)
                .attr('stroke-dasharray', '3,4');
        });

        // Dots and labels
        const g = svg.append('g');
        const scale = W / 900;   // scale label offsets with map width

        collaborators.forEach(function(c) {
            const xy = proj([c.lon, c.lat]);
            if (!xy) return;
            const isHome = !!c.home;
            const col = topicColor(c);

            // Pulse ring for home
            if (isHome) {
                g.append('circle')
                    .attr('cx', xy[0]).attr('cy', xy[1]).attr('r', 13)
                    .attr('fill', 'none')
                    .attr('stroke', COLORS.home)
                    .attr('stroke-width', 1)
                    .attr('opacity', 0.25);
            }

            // Dot + hover label
            const dotR = isHome ? 6 : 4;
            const dot = g.append('circle')
                .attr('cx', xy[0]).attr('cy', xy[1])
                .attr('r', dotR)
                .attr('fill', col)
                .attr('stroke', 'rgba(255,255,255,0.2)')
                .attr('stroke-width', 1)
                .attr('opacity', 0.9)
                .style('cursor', 'pointer');

            const label = g.append('text')
                .attr('x', xy[0])
                .attr('y', xy[1] - dotR - 5)
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('font-family', 'Inter, sans-serif')
                .attr('fill', col)
                .attr('pointer-events', 'none')
                .style('opacity', 0)
                .style('transition', 'opacity 0.15s')
                .text(c.name);

            dot.on('mouseenter', function() {
                d3.select(this).attr('r', dotR + 2).attr('opacity', 1);
                label.style('opacity', 1);
            }).on('mouseleave', function() {
                d3.select(this).attr('r', dotR).attr('opacity', 0.9);
                label.style('opacity', 0);
            });

        });
    }

    function init() {
        if (window.WORLD_TOPO) {
            draw(window.WORLD_TOPO);
        } else {
            draw(null);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
