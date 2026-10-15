// =====================================================================
// LOGICA PURA 
// =====================================================================

// ---------------------------------------------------------------------
// Modulo 1: de AFND a AFD (metodo de subconjuntos)
// ---------------------------------------------------------------------

// Clausura-ε: agrega a S todos los estados alcanzables solo con transiciones ε.
function cierre(A, S) {
  const r = new Set(S); // Resultado
  const p = [...S]; // Pendientes por revisar
  while (p.length) {
    const x = p.pop();
    A.tr.forEach(t => {
      if (t.d == x && t.s === '' && !r.has(t.a)) {
        r.add(t.a);
        p.push(t.a);
      }
    });
  }
  return r;
}

// Estados a los que se llega desde el conjunto S leyendo el simbolo c.
const mover = (A, S, c) => {
  const r = new Set();
  A.tr.forEach(t => {
    if (S.has(t.d) && t.s === c) r.add(t.a);
  });
  return r;
};

// Nombre de un conjunto: '{q0,q1}' (ordenado) o vacio
const nom = S => (S.size ? '{' + [...S].sort().join(',') + '}' : '∅');

// Metodo de subconjuntos. Devuelve el AFD y la lista de pasos explicados.
function afndAafd(A) {
  const ini = cierre(A, [A.ini]); // Estado inicial del AFD
  const m = {}; // Conjuntos ya vistos: nombre -> Set de estados
  const cola = [ini]; // Conjuntos que faltan por procesar
  const ord = [nom(ini)]; // Nombres de los estados del AFD, en orden de aparición
  const pasos = []; // Explicación de cada paso (para el paso a paso)
  const tr = {}; // Transiciones del AFD: 'conjunto|símbolo' -> conjunto destino
  const eps = A.tr.some(t => t.s === ''); // ¿el AFND tiene transiciones ε?

  m[nom(ini)] = ini;
  pasos.push({
    fila: nom(ini),
    txt: `Estado inicial del AFD: ${eps ? 'cierre-ε(' + A.ini + ') = ' : ''}${nom(ini)}`,
  });

  // Mientras haya conjuntos sin procesar...
  while (cola.length) {
    const S = cola.shift();
    const n = nom(S);
    // ...para cada simbolo calculamos a que conjunto se llega.
    for (const c of A.alf) {
      const mv = mover(A, S, c);
      const T = cierre(A, mv);
      const k = nom(T);
      const nuevo = !m[k];
      tr[n + '|' + c] = k;
      if (nuevo) {
        // Conjunto nuevo: se agrega al AFD y a la cola.
        m[k] = T;
        ord.push(k);
        cola.push(T);
      }
      pasos.push({
        fila: n,
        txt:
          `Procesando ${n} con '${c}': mover = ${nom(mv)}${eps ? ', cierre-ε = ' + k : ''} → ${k}` +
          (nuevo ? (k == '∅' ? ' (estado pozo, nuevo)' : ' (conjunto nuevo, se agrega)') : ' (ya existe)'),
      });
    }
  }

  // Finales del AFD: todo conjunto que contenga un final del AFND.
  const fin = ord.filter(k => [...m[k]].some(x => A.fin.includes(x)));
  pasos.push({
    txt: `Finales del AFD: ${fin.join(', ') || 'ninguno'} (conjuntos que contienen un final del AFND). Ya no hay conjuntos nuevos.`,
  });

  return {
    est: ord,
    alf: A.alf,
    ini: nom(ini),
    fin,
    tr: Object.entries(tr).map(([k, a]) => {
      const [d, s] = k.split('|');
      return { d, s, a };
    }),
    pasos,
  };
}

// ---------------------------------------------------------------------
// Modulo 2: de automata finito a expresión regular (método de ecuaciones)
// ---------------------------------------------------------------------

const hayUnionExterna = r => {
  let d = 0;
  for (const c of r) {
    if (c == '(') d++;
    if (c == ')') d--;
    if (c == '+' && !d) return true;
  }
  return false;
};

// Pone parentesis solo si hacen falta para concatenar.
const par = r => (hayUnionExterna(r) ? '(' + r + ')' : r);

// Concatenación (λ es el neutro: λ·b = b).
const cat = (a, b) => (a === null || b === null ? null : a == 'λ' ? b : b == 'λ' ? a : par(a) + par(b));

// Unión con '+' (sin repetir términos iguales).
const uni = (a, b) => (a === null ? b : b === null ? a : a == b ? a : a + '+' + b);

// ¿La ER es un solo símbolo o está completamente entre paréntesis?
function atom(r) {
  if (r.length == 1) return true;
  if (r[0] != '(') return false;
  let d = 0;
  for (let i = 0; i < r.length; i++) {
    if (r[i] == '(') d++;
    if (r[i] == ')' && --d == 0) return i == r.length - 1;
  }
  return false;
}

// Estrella de Kleene: a -> a*, ab -> (ab)*, (ab)* -> (ab)*, λ -> λ.
const est = r => (r == 'λ' ? 'λ' : r.endsWith('*') && atom(r.slice(0, -1)) ? r : (atom(r) ? r : '(' + r + ')') + '*');

// Método de ecuaciones. Devuelve la ER y la lista de pasos con el nombre de la regla.
function afAer(A) {
  const pasos = [];
  const add = (rule, txt) => pasos.push({ txt: `[${rule}] ${txt}` });

  // 1. Limpieza: estados alcanzables desde el inicial (alc) y que llegan a un final (viv).
  const alc = new Set([A.ini]);
  const viv = new Set(A.fin);
  let ch = 1;
  while (ch) {
    ch = 0;
    A.tr.forEach(t => {
      if (alc.has(t.d) && !alc.has(t.a)) {
        alc.add(t.a);
        ch = 1;
      }
    });
  }
  ch = 1;
  while (ch) {
    ch = 0;
    A.tr.forEach(t => {
      if (viv.has(t.a) && !viv.has(t.d)) {
        viv.add(t.d);
        ch = 1;
      }
    });
  }
  const S = A.est.filter(e => alc.has(e) && viv.has(e)); // estados útiles
  if (!S.includes(A.ini)) return { er: '∅', pasos: [{ txt: 'Lenguaje vacío: el inicial no llega a ningún final.' }] };
  const dead = A.est.filter(e => !S.includes(e));
  if (dead.length) add('preparación', 'se omiten estados inalcanzables o pozo (no aportan cadenas): ' + dead.join(', '));

  // 2. Una ecuación por estado: Q[p].t = { destino: ER }, Q[p].c = 'λ' si p es final.
  const Q = {};
  S.forEach(p => (Q[p] = { t: {}, c: A.fin.includes(p) ? 'λ' : null }));
  A.tr.forEach(t => {
    if (Q[t.d] && Q[t.a]) Q[t.d].t[t.a] = uni(Q[t.d].t[t.a] ?? null, t.s);
  });

  // Texto de la ecuación de p, ej. 'q1 = xq2 + λ'.
  const show = p => {
    const q = Q[p];
    const ts = Object.entries(q.t).map(([x, r]) => (r == 'λ' ? '' : par(r)) + x);
    if (q.c) ts.push(q.c);
    return p + ' = ' + (ts.join(' + ') || '∅');
  };

  S.forEach(p => {
    const q = Q[p];
    const n = Object.keys(q.t).length;
    add(
      n == 0
        ? 'estado final (p = λ)'
        : n == 1 && !q.c
          ? 'transición simple (p = aq)'
          : q.c
            ? 'varias transiciones (p = aq + br) y estado final (p = λ)'
            : 'varias transiciones (p = aq + br)',
      'ecuación inicial: ' + show(p),
    );
  });

  // 3. Eliminar estados de atrás hacia adelante; el inicial va de último.
  let er = '∅';
  for (const p of S.filter(x => x != A.ini).reverse().concat(A.ini)) {
    const q = Q[p];
    const b = q.t[p]; // ¿p tiene bucle (p = b·p + ...)?
    if (b !== undefined) {
      // Regla de bucle (lema de Arden): p = b·p + resto  ->  p = b*·resto
      delete q.t[p];
      const salida = Object.keys(q.t).length > 0;
      const s = est(b);
      for (const x in q.t) q.t[x] = cat(s, q.t[x]);
      if (q.c) q.c = cat(s, q.c);
      add(salida ? 'bucle más salida (p = ap + bq → a*·bq)' : 'bucle (p = ap → a*)', 'aplicado en ' + p + ' con a = ' + b + ': ' + show(p));
    }
    if (p == A.ini) {
      // Al llegar al inicial, su constante es la ER.
      er = q.c ?? '∅';
      add('estado final', 'la ecuación de ' + p + ' queda ' + show(p) + '; ER = ' + er);
      break;
    }
    // Sustituir p en las ecuaciones de los demás estados que lo usan.
    for (const r in Q) {
      if (r == p || Q[r].t[p] === undefined) continue;
      const a = Q[r].t[p];
      delete Q[r].t[p];
      for (const x in q.t) Q[r].t[x] = uni(Q[r].t[x] ?? null, cat(a, q.t[x]));
      if (q.c) Q[r].c = uni(Q[r].c ?? null, cat(a, q.c));
      add('sustitución', 'se reemplaza ' + p + ' en la ecuación de ' + r + ': ' + show(r));
      add('simplificación', 'se agrupan términos con el mismo estado en ' + r + ': ' + show(r));
    }
    delete Q[p];
  }
  return { er, pasos };
}

// ---------------------------------------------------------------------
// Verificador de equivalencia
// ---------------------------------------------------------------------

// ¿El autómata A (AFND o AFD) acepta la cadena w?
function acepta(A, w) {
  let S = cierre(A, [A.ini]);
  for (const c of w) {
    S = cierre(A, mover(A, S, c));
    if (!S.size) return false;
  }
  return [...S].some(x => A.fin.includes(x));
}

// Compara AFND, AFD y ER con todas las cadenas hasta longitud n (mínimo 6).
function verificar(afnd, afd, er, n) {
  n = Math.max(6, n || 6);
  while (Math.pow(afnd.alf.length, n) > 3e5 && n > 6) n--; // límite de 300.000 cadenas

  // La ER se traduce a RegExp de JavaScript: '+' -> '|', 'λ' -> vacío.
  // Se usa '(?:' para que los paréntesis no cuenten como "grupos de captura"
  // (JavaScript tiene un límite y las ER largas lo superaban: "Too many captures").
  const re = er == '∅' ? null : new RegExp('^(?:' + er.replace(/\(/g, '(?:').replace(/\+/g, '|').replace(/λ/g, '') + ')$');

  let tot = 0;
  const dif = [];
  let cad = ['']; // cadenas de la longitud actual (empieza con λ)
  for (let l = 0; l <= n; l++) {
    for (const w of cad) {
      tot++;
      const x = acepta(afnd, w);
      const y = acepta(afd, w);
      const z = re ? re.test(w) : false;
      if (x != y || y != z) dif.push(`"${w || 'λ'}": AFND=${x}, AFD=${y}, ER=${z}`);
    }
    if (l < n) cad = cad.flatMap(w => afnd.alf.map(c => w + c));
  }
  return { tot, dif, n };
}
