// =====================================================================
// PRUEBAS AUTOMÁTICAS de la lógica (usa logica.js).
// Se ejecutan abriendo pruebas.html en el navegador.
// Devuelve una lista [{n: nombre, ok: true/false, det: detalle si falla}].
// =====================================================================
function correrPruebas() {
  const R = [];

  // Ejecuta una prueba: f() debe devolver true; cualquier otro valor se muestra como detalle.
  const t = (n, f) => {
    try {
      const r = f();
      R.push({ n, ok: r === true, det: r === true ? '' : String(r) });
    } catch (e) {
      R.push({ n, ok: false, det: e.message });
    }
  };

  // Crea un autómata desde texto. Transiciones 'desde,símbolo,hacia' separadas por ';'
  // (símbolo vacío = ε).
  const A = (e, a, i, f, t) => ({
    est: e.split(','),
    alf: a.split(','),
    ini: i,
    fin: f.split(',').filter(x => x),
    tr: t.split(';').filter(x => x).map(x => {
      const [d, s, b] = x.split(',');
      return { d, s, a: b };
    }),
  });

  // Casos del Anexo A y ejemplo con ε.
  const C1 = A('q0,q1,q2', 'a,b', 'q0', 'q2', 'q0,a,q0;q0,a,q1;q1,b,q2');
  const C2 = A('q0,q1,q2', 'x,y', 'q0', 'q1', 'q0,x,q1;q1,x,q2;q2,y,q2;q2,y,q1');
  const EP = A('p,q,r', 'a,b', 'p', 'r', 'p,,q;q,a,q;q,b,r;r,a,p');

  // Transiciones de un AFD como texto ordenado, para compararlas.
  const tr = D => D.tr.map(x => x.d + ' -' + x.s + '-> ' + x.a).sort().join(' | ');

  // Flujo completo AFND -> AFD -> ER y verificador hasta longitud n.
  const eq = (af, n = 8) => {
    const d = afndAafd(af);
    const er = afAer(d).er;
    const v = verificar(af, d, er, n);
    return v.dif.length ? 'difieren: ' + v.dif[0] : true;
  };

  t('Caso 1: inicial del AFD es {q0}', () => afndAafd(C1).ini == '{q0}' || afndAafd(C1).ini);
  t('Caso 1: transiciones del AFD = Anexo A', () => {
    const e = ['{q0} -a-> {q0,q1}', '{q0} -b-> ∅', '{q0,q1} -a-> {q0,q1}', '{q0,q1} -b-> {q2}', '{q2} -a-> ∅', '{q2} -b-> ∅', '∅ -a-> ∅', '∅ -b-> ∅']
      .sort()
      .join(' | ');
    const g = tr(afndAafd(C1));
    return g == e || g;
  });
  t('Caso 1: único final {q2} y existe estado pozo ∅', () => {
    const d = afndAafd(C1);
    return (d.fin.join() == '{q2}' && d.est.includes('∅')) || JSON.stringify(d.fin);
  });
  t('Caso 1: flujo AFND → AFD → ER equivalente', () => eq(C1));
  t('Caso 2: ER equivalente a la del AFD y al AFND (n=8)', () => eq(C2));
  t('Caso 2: ER directa del autómata equivalente (n=8)', () => {
    const v = verificar(C2, afndAafd(C2), afAer(C2).er, 8);
    return v.dif.length ? v.dif[0] : true;
  });
  t('Caso 2: equivale a x(xy*y)* (ER de la profesora)', () => {
    const v = verificar(C2, afndAafd(C2), 'x(xy*y)*', 8);
    return v.dif.length ? v.dif[0] : true;
  });
  t('Caso 2: la ER sale igual a la de clase x(xy*y)*', () => afAer(C2).er == 'x(xy*y)*' || afAer(C2).er);
  t('Bonus ε: cierre-ε del inicial es {p,q}', () => afndAafd(EP).ini == '{p,q}' || afndAafd(EP).ini);
  t('Bonus ε: AFD sin ε y equivalente', () => afndAafd(EP).tr.every(x => x.s !== '') && eq(EP));
  t('Alfabeto de un símbolo', () => eq(A('q0,q1', 'a', 'q0', 'q0,q1', 'q0,a,q1;q1,a,q1')));
  t('Lenguaje vacío: ER = ∅', () => afAer(afndAafd(A('q0,q1', 'a', 'q0', 'q1', 'q1,a,q1'))).er == '∅' || 'no da ∅');
  t('Inicial que es final acepta la cadena vacía', () => acepta(A('q0', 'a', 'q0', 'q0', 'q0,a,q0'), '') === true);
  t('Estados inalcanzables no rompen la ER', () => eq(A('q0,q1,q9', 'a', 'q0', 'q1', 'q0,a,q1;q9,a,q1')));
  t('Módulo 2 nombra todas las reglas', () => {
    const x = afAer(C2)
      .pasos.concat(afAer(afndAafd(C1)).pasos, afAer(A('q0', 'a', 'q0', 'q0', 'q0,a,q0')).pasos)
      .map(p => p.txt)
      .join('\n');
    const f = ['transición simple', 'varias transiciones', 'bucle más salida', 'bucle (p = ap', 'estado final (p = λ)', 'sustitución', 'simplificación'].filter(
      r => !x.includes(r),
    );
    return f.length ? 'faltan: ' + f.join(', ') : true;
  });
  t('Verificador detecta diferencias (ER incorrecta)', () => verificar(C2, afndAafd(C2), 'x', 6).dif.length > 0);
  t('Verificador usa n mínimo 6', () => verificar(C1, afndAafd(C1), 'aa*b', 2).n == 6);
  // Error depurado: con ER muy largas, new RegExp fallaba con "Too many captures".
  // '(λ)' repetido 40.000 veces no cambia el lenguaje, pero supera el límite de grupos.
  t('Verificador soporta ER con muchos paréntesis', () => {
    const v = verificar(C1, afndAafd(C1), '(λ)'.repeat(40000) + 'aa*b', 6);
    return v.dif.length ? v.dif[0] : true;
  });
  return R;
}
