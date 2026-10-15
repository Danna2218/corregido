// =====================================================================
// INTERFAZ: editor, grafos, paso a paso y botones 
// =====================================================================

// Atajo para buscar un elemento de la pagina por su id.
const $ = id => document.getElementById(id);

// Ejemplos que cargan los botones: 0 = Caso 1, 1 = Caso 2, 2 = ejemplo con ε.
const EJ = [
  { e: 'q0,q1,q2', a: 'a,b', i: 'q0', f: 'q2', t: 'q0,a,q0\nq0,a,q1\nq1,b,q2' },
  { e: 'q0,q1,q2', a: 'x,y', i: 'q0', f: 'q1', t: 'q0,x,q1\nq1,x,q2\nq2,y,q2\nq2,y,q1' },
  { e: 'p,q,r', a: 'a,b', i: 'p', f: 'r', t: 'p,ε,q\nq,a,q\nq,b,r\nr,a,p' },
];

// Copia el ejemplo k en los campos del editor.
function ej(k) {
  const e = EJ[k];
  $('est').value = e.e;
  $('alf').value = e.a;
  $('ini').value = e.i;
  $('fin').value = e.f;
  $('tr').value = e.t;
}

ej(0); // al abrir la app se carga el Caso 1

// Convierte 'q0, q1,q2' en ['q0','q1','q2'].
const L = s => s.split(/[,\s]+/).filter(x => x);

// Lee los campos del editor y arma el objeto automata {est, alf, ini, fin, tr}.
function leer() {
  const t = $('tr')
    .value.split('\n')
    .map(l => l.split(',').map(x => x.trim()))
    .filter(x => x.length == 3 && x[0])
    .map(([d, s, a]) => ({ d, s: s == 'ε' || s == 'eps' ? '' : s, a })); // ε o eps -> ''
  return { est: L($('est').value), alf: L($('alf').value), ini: $('ini').value.trim(), fin: L($('fin').value), tr: t };
}

// Revisa la entrada. Devuelve un mensaje de error, o '' si todo esta bien.
function valida(A) {
  // Los simbolos deben ser de un caracter y no pueden ser operadores de la ER.
  const malo = A.alf.find(c => c.length != 1 || '+*()λε|'.includes(c));
  if (malo) return `Símbolo no permitido en el alfabeto: "${malo}" (use un solo carácter, distinto de + * ( ) | λ ε).`;
  if (!A.est.includes(A.ini)) return 'El estado inicial no está en los estados.';
  if (A.fin.some(f => !A.est.includes(f))) return 'Hay finales que no son estados.';
  for (const t of A.tr) {
    if (!A.est.includes(t.d) || !A.est.includes(t.a)) return `Transición con estado desconocido: ${t.d},${t.s},${t.a}`;
    if (t.s !== '' && !A.alf.includes(t.s)) return `Símbolo fuera del alfabeto: ${t.s}`;
  }
  return '';
}

// Dibuja el automata A como SVG dentro del elemento con ese id.
// Convencion de clase: circulos, doble circulo en finales, flecha de entrada al inicial.
function dibujar(A, id) {
  const n = A.est.length;
  const W = 520, H = 380, cx = W / 2, cy = H / 2;
  const R = Math.min(150, 40 + n * 25); // radio del circulo donde se ubican los estados
  const r = 22; // radio de cada estado
  const P = {}; // posicion de cada estado y direccion hacia afuera (u)

  A.est.forEach((e, i) => {
    const a = (2 * Math.PI * i) / n + Math.PI; // el primer estado queda a la izquierda
    P[e] = n == 1
      ? { x: cx, y: cy, u: [0, -1] }
      : { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), u: [Math.cos(a), Math.sin(a)] };
  });

  // Agrupa las transiciones entre el mismo par de estados en una sola flecha 'a,b'.
  const E = {};
  A.tr.forEach(t => {
    const k = t.d + '|' + t.a;
    (E[k] = E[k] || []).push(t.s || 'ε');
  });

  const mk = `marker-end="url(#f${id})"`;
  // El viewBox tiene margen para que no se corten los bucles ni sus etiquetas.
  let s = `<svg viewBox="-50 -70 ${W + 100} ${H + 140}"><defs><marker id="f${id}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0L8,4L0,8z"/></marker></defs>`;

  for (const k in E) {
    const [d, a] = k.split('|');
    const p = P[d], q = P[a];
    const lab = E[k].join(',');
    if (d == a) {
      // Bucle. En el estado inicial va hacia arriba para no tapar la flecha de entrada.
      const [ux, uy] = d == A.ini ? [0, -1] : p.u;
      const f = (k2, an) => [
        p.x + k2 * (ux * Math.cos(an) - uy * Math.sin(an)),
        p.y + k2 * (ux * Math.sin(an) + uy * Math.cos(an)),
      ];
      const A1 = f(r, -0.5), B = f(r, 0.5), C1 = f(r + 50, -0.6), C2 = f(r + 50, 0.6), Lb = f(r + 42, 0);
      s += `<path d="M${A1}C${C1} ${C2} ${B}" fill="none" stroke="#000" ${mk}/><text x="${Lb[0]}" y="${Lb[1]}" text-anchor="middle">${lab}</text>`;
    } else {
      // Flecha curva entre dos estados distintos.
      const dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy);
      const c = [(p.x + q.x) / 2 - (dy / l) * 30, (p.y + q.y) / 2 + (dx / l) * 30]; // punto de control
      const cut = (o, t) => {
        // recorta la flecha en el borde del circulo
        const vx = t[0] - o.x, vy = t[1] - o.y, m = Math.hypot(vx, vy);
        return [o.x + (vx / m) * r, o.y + (vy / m) * r];
      };
      const s1 = cut(p, c), e1 = cut(q, c);
      s += `<path d="M${s1}Q${c} ${e1}" fill="none" stroke="#000" ${mk}/><text x="${0.25 * s1[0] + 0.5 * c[0] + 0.25 * e1[0]}" y="${0.25 * s1[1] + 0.5 * c[1] + 0.25 * e1[1] - 4}" text-anchor="middle">${lab}</text>`;
    }
  }

  // Estados: circulo, doble circulo si es final, nombre y flecha de entrada si es el inicial.
  A.est.forEach(e => {
    const p = P[e];
    s += `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="#fff" stroke="#000"/>`;
    if (A.fin.includes(e)) s += `<circle cx="${p.x}" cy="${p.y}" r="${r - 4}" fill="none" stroke="#000"/>`;
    s += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="${e.length > 6 ? 9 : 13}">${e}</text>`;
    if (e == A.ini) s += `<path d="M${p.x - r - 30},${p.y}L${p.x - r},${p.y}" stroke="#000" ${mk}/>`;
  });
  $(id).innerHTML = s + '</svg>';
}

// Paso a paso: botones ◀ / ▶ / Todo que muestran los pasos hasta el actual (k).
// fn (opcional) se llama con el paso actual, para resaltar la fila de la tabla.
function stepper(id, pasos, fn) {
  let k = 0;
  const el = $(id);
  const r = () => {
    el.innerHTML =
      `<button onclick="this.parentNode.s(-1)">◀ Anterior</button><button onclick="this.parentNode.s(1)">Siguiente ▶</button><button onclick="this.parentNode.s(99)">Todo</button> ${k}/${pasos.length}` +
      pasos.slice(0, k).map((p, i) => `<pre class="${i == k - 1 ? 'hl' : ''}">${i + 1}. ${p.txt}</pre>`).join('');
    if (fn) fn(k ? pasos[k - 1] : null);
  };
  el.s = d => {
    k = Math.max(0, Math.min(pasos.length, k + d));
    r();
  };
  r();
}

let AFND, AFD; // ultimo AFND leido y ultimo AFD calculado

// Modulo 1 (boton "Convertir"): AFND -> AFD, tabla, grafos y paso a paso.
function m1() {
  $('e1').textContent = '';
  AFND = leer();
  const e = valida(AFND);
  if (e) {
    $('e1').textContent = e;
    return false;
  }
  AFD = afndAafd(AFND);
  const T = {};
  AFD.tr.forEach(t => (T[t.d + '|' + t.s] = t.a));
  $('tabla').innerHTML =
    '<table><tr><th>Estado</th>' + AFD.alf.map(c => `<th>${c}</th>`).join('') + '</tr>' +
    AFD.est
      .map(k => `<tr data-f="${k}"><td>${k == AFD.ini ? '→ ' : ''}${AFD.fin.includes(k) ? '* ' : ''}${k}</td>${AFD.alf.map(c => `<td>${T[k + '|' + c]}</td>`).join('')}</tr>`)
      .join('') +
    '</table>';
  dibujar(AFND, 'g1');
  dibujar(AFD, 'g2');
  stepper('p1', AFD.pasos, p =>
    document.querySelectorAll('#tabla tr[data-f]').forEach(tr => tr.classList.toggle('hl', !!p && tr.dataset.f == p.fila)),
  );
  return true;
}

// Modulo 2 (boton "Obtener ER"): ER del AFD del Modulo 1 o del automata del editor.
// Devuelve la ER, o null si hubo un error.
function m2() {
  $('e2').textContent = '';
  let A;
  if ($('org').value == '1') {
    if (!m1()) return null; // recalcula el AFD con lo que hay en el editor
    A = AFD;
  } else {
    A = leer();
    const e = valida(A);
    if (e || A.tr.some(t => t.s === '')) {
      $('e2').textContent = e || 'El automata tiene ε: conviertalo con el Modulo 1.';
      return null;
    }
  }
  const R = afAer(A);
  $('er').textContent = R.er;
  stepper('p2', R.pasos);
  return R.er;
}

// Verificador (boton "Verificar"): usa el origen elegido en el Modulo 2.
function verif() {
  if (!m1()) return;
  const er = m2();
  if (er === null) return;
  const v = verificar(AFND, AFD, er, +$('n').value);
  $('rv').innerHTML = v.dif.length
    ? `<p class="bad">Difieren en ${v.dif.length} de ${v.tot} cadenas (longitud ≤ ${v.n}):</p><pre>${v.dif.slice(0, 50).join('\n')}</pre>`
    : `<p class="ok">✔ AFND, AFD y ER aceptan exactamente las mismas cadenas (${v.tot} cadenas, longitud ≤ ${v.n}).</p>`;
}


// Boton "Limpiar todo": vacia el editor y los resultados, y deja el Modulo 2 y n como al inicio.
function limpiar() {
  ['est', 'alf', 'ini', 'fin', 'tr'].forEach(i => ($(i).value = ''));
  ['g1', 'g2', 'tabla', 'p1', 'p2', 'rv', 'e1', 'e2'].forEach(i => ($(i).innerHTML = ''));
  $('er').textContent = '';
  $('org').value = '1';
  $('n').value = 6;
  AFND = null;
  AFD = null;
}

// Botones de navegacion: abre la seccion y baja hasta ella.
function ir(id) {
  const d = $(id);
  d.open = true;
  d.scrollIntoView({ behavior: 'smooth' });
}
