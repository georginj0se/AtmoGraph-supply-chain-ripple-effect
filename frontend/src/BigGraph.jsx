import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const COLORS = { Port: '#3b82f6', Plant: '#22c55e', Customer: '#f59e0b', Product: '#94a3b8' };
const SIZE = { Port: 9, Plant: 7, Customer: 5, Product: 2 };
const HIGH = '#ef4444';
const RIPPLE = '#e879f9';

export default function BigGraph() {
  const canvasRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('Loading graph...');

  useEffect(() => {
    let cancelled = false;
    let sim = null;

    Promise.all([
      fetch('/graph.json').then((r) => r.json()),
      fetch('/risk.json').then((r) => r.json()).catch(() => ({})),
    ])
      .then(([data, risk]) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = (canvas.width = canvas.clientWidth);
        const height = (canvas.height = canvas.clientHeight);

        const nodes = data.nodes.map((d) => ({ ...d }));
        const links = data.links.map((d) => ({ ...d }));
        const riskOf = (id) => (risk[id] ? risk[id].risk : 0);
        let transform = d3.zoomIdentity;
        setStatus(nodes.length + ' nodes, ' + links.length + ' links, ' + Object.keys(risk).length + ' at risk');

        sim = d3
          .forceSimulation(nodes)
          .force('link', d3.forceLink(links).id((d) => d.id).distance(30).strength(0.3))
          .force('charge', d3.forceManyBody().strength(-25))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collide', d3.forceCollide(4));

        function drawNode(n) {
          const rk = riskOf(n.id);
          ctx.beginPath();
          ctx.fillStyle = rk >= 0.6 ? HIGH : rk > 0 ? RIPPLE : COLORS[n.type];
          ctx.arc(n.x, n.y, SIZE[n.type] + (rk > 0 ? 3 : 0), 0, 2 * Math.PI);
          ctx.fill();
        }

        function draw() {
          ctx.save();
          ctx.clearRect(0, 0, width, height);
          ctx.translate(transform.x, transform.y);
          ctx.scale(transform.k, transform.k);

          ctx.strokeStyle = 'rgba(148,163,184,0.25)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          links.forEach((l) => {
            ctx.moveTo(l.source.x, l.source.y);
            ctx.lineTo(l.target.x, l.target.y);
          });
          ctx.stroke();

          nodes.filter((n) => riskOf(n.id) === 0).forEach(drawNode);
          nodes.filter((n) => riskOf(n.id) > 0).forEach(drawNode);
          ctx.restore();
        }

        sim.on('tick', draw);

        const zoom = d3
          .zoom()
          .scaleExtent([0.2, 8])
          .on('zoom', (e) => {
            transform = e.transform;
            draw();
          });
        d3.select(canvas).call(zoom);

        canvas.addEventListener('click', (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left - transform.x) / transform.k;
          const y = (e.clientY - rect.top - transform.y) / transform.k;
          const hit = sim.find(x, y, 12);
          if (!hit) {
            setSelected(null);
            return;
          }
          const connected = links.filter(
            (l) => l.source.id === hit.id || l.target.id === hit.id
          ).length;
          setSelected({
            id: hit.id,
            type: hit.type,
            connections: connected,
            risk: riskOf(hit.id),
            event: risk[hit.id] ? risk[hit.id].event : null,
          });
        });
      })
      .catch(() => setStatus('Could not load graph.json'));

    return () => {
      cancelled = true;
      if (sim) sim.stop();
    };
  }, []);

  return (
    <div className="big">
      <div className="big-info">
        <b>{status}</b>
        <span>Scroll to zoom, drag to pan, click a node for details</span>
        {Object.keys(COLORS).map((t) => (
          <span key={t}>
            <i className="dot" style={{ background: COLORS[t] }} />
            {t}
          </span>
        ))}
        <span><i className="dot" style={{ background: HIGH }} />High risk</span>
        <span><i className="dot" style={{ background: RIPPLE }} />Ripple risk</span>
      </div>
      <canvas ref={canvasRef} className="big-canvas" />
      {selected && (
        <div className="big-detail" style={{ maxWidth: 300 }}>
          <div><b>{selected.id}</b></div>
          <div>Type: {selected.type}</div>
          <div>Connections: {selected.connections}</div>
          <div>Risk: {selected.risk}</div>
          {selected.event && <div>News: {selected.event}</div>}
        </div>
      )}
    </div>
  );
}