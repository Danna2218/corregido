# Bitacora de prompts

Equipo: Edwin Ossa, Danna Campo, Deymer Chicangana · IA utilizadas: Claude, Gemini, DeepSeek, Mistral, Qwen

## Fase 0: Especificacion
**N.º 1 · IA:** Gemini 2.5 Flash

**Prompt:**
```
Rol: actua como analista de requisitos de software.
Contexto: debo construir una app local (HTML+CSS+JS, sin servidor, sin internet) para Teoria de la Computacion que convierte AFND a AFD (subconjuntos), obtiene la ER de un automata (metodo de ecuaciones con reglas: transicion simple, varias transiciones, bucle, bucle mas salida, estado final) y verifica equivalencia entre AFND, AFD y ER.
Tarea: redacta un SPEC.md con requisitos, entradas y salidas, y casos limite.
Restricciones: incluir estado pozo, estados inalcanzables, alfabeto de un simbolo, lenguaje vacio y transiciones ε como bonus.
Formato: Markdown con secciones numeradas.
Verificacion: indica como comprobar cada requisito con los casos del Anexo A.
```
**Respuesta (resumen):** Gemini genero un SPEC.md con 5 secciones: vision general; un formato JSON para el automata (claves en ingles: states, alphabet, initial_state, final_states, transitions, con "E" para ε y el pozo como "q_pozo"); tres requisitos funcionales (AFND→AFD por subconjuntos, AF→ER por ecuaciones con el lema de Arden y las 5 reglas, y verificacion de equivalencia por minimizacion o diferencia simetrica); requisitos de interfaz (editor JSON, tablas y simulador de cadenas) y 5 casos limite (pozo, inalcanzables, alfabeto de un simbolo, lenguaje vacio y ε). Al final propuso 4 casos de prueba propios con su resultado esperado.
**Decision del equipo:** Aceptamos: los 5 casos limite, que coinciden con los de nuestro SPEC.md, y sus 4 casos de prueba como pruebas adicionales.
**Verificacion:** Comparamos punto por punto la respuesta con el PDF del parcial y con nuestro SPEC.md. Ademas, ejecutamos en nuestra app los 4 casos de prueba de Gemini: los 4 dieron el resultado esperado. Lenguaje vacio: ER = ∅. Alfabeto de un simbolo con estado inalcanzable: ER = a y q2 no aparece en el AFD. Bucle: el AFD coincide con el de Gemini ({q0}, {q0,q1}) y la cadena "bba" es aceptada; la app da (b+aa*b)*aa*, que el verificador confirma equivalente a la (a+b)*a de Gemini. ε: cierre-ε(q0) = {q0,q1,q2} y la app da λ+aa*, equivalente a a*. El verificador no encontro diferencias en ninguno (n = 6).

---

## Fase 1: Arquitectura
**N.º 2 · IA:** Claude Sonnet 5.5

**Prompt:**
```
Rol: arquitecto de software senior.
Contexto: SPEC.md adjunto. App de un solo archivo index.html, sin librerias externas.
Tarea: propon estructura de codigo, modelo de datos del automata (JSON) y lista de funciones, ANTES de escribir codigo.
Restricciones: sin servidor, sin CDN, funciones cortas con nombres claros.
Formato: lista de modulos con firma de cada funcion.
Verificacion: explica como se conectan el Modulo 1 y el Modulo 2.
```
**Respuesta (resumen):** La IA indico que el archivo SPEC.md no le llego (la carpeta de adjuntos estaba vacia). No propuso ningun diseño para no inventar la arquitectura y pidio que volvieramos a adjuntar el archivo o que pegaramos su contenido, o al menos el tipo de automata, que hace cada modulo y los requisitos de interfaz.
**Decision del equipo:** Aceptamos su pedido: el adjunto no se habia cargado. Valoramos que no inventara un diseño sin la especificacion. Reenviamos el prompt pegando el contenido completo de SPEC.md dentro del mensaje.
**Verificacion:** Comprobamos en la conversacion que el archivo no aparecia como adjunto. La siguiente respuesta se verifico contra SPEC.md.

---

## Fase 2: Logica pura
**N.º 3 · IA:** ChatGPT

**Prompt:**
```
Rol: desarrollador senior de JavaScript que escribe codigo claro y probado.
Contexto: automata modelado como {est, alf, ini, fin, tr:[{d,s,a}]}, con s vacio para ε.
Tarea: escribe afndAafd(afnd) con el metodo de subconjuntos, devolviendo tabla y AFD, y afAer(af) con el metodo de ecuaciones, guardando el nombre de la regla en cada paso.
Restricciones: sin interfaz, sin librerias, incluir estado pozo, omitir estados inalcanzables en la ER.
Formato: codigo en un solo archivo con comentarios breves.
Verificacion: pruebas con el Caso 1 y el Caso 2 del Anexo A y que resultado debe dar cada una.
```
**Respuesta (resumen):** Entrego un archivo automatas.js en JavaScript puro con dos funciones: afndAafd(afnd), que convierte por subconjuntos con cierre-ε, agrega el estado pozo ∅ y arma la tabla del AFD; y afAer(af), que quita los estados inalcanzables y los que no llegan a un final y obtiene la ER eliminando estados uno por uno, con un inicio y un final auxiliares. Incluyo dos pruebas con ejemplos inventados ("solo a" y "a*b"), porque no tenia los casos del Anexo A y no quiso inventar los resultados esperados. Pidio que le enviaramos el Anexo A para adaptar las pruebas.
**Decision del equipo:** No reemplazamos nuestro logica.js con este codigo; lo usamos para comparar. Aceptamos la idea general, que coincide con la nuestra: subconjuntos con cierre-ε, un estado pozo ∅ y quitar los estados inutiles antes de buscar la ER. 
**Verificacion:** Con ayuda de Node.js ejecutamos su codigo con los casos del Anexo A y comparamos con nuestra app. Caso 1: su AFD coincide con el del Anexo A ({q0}, {q0,q1}, {q2} final y ∅) y su ER (a)*ab es equivalente a la nuestra aa*b. Caso 2: da (x|xx((y|yx))*y); nuestro verificador (n = 6) no encontro diferencias, pero la forma no es la de clase. Con el ejemplo de ε tambien fue equivalente. Con el AFND de las cadenas que terminan en 01 aparecio el pozo ∅ inalcanzable. Revisamos sus pasos del Modulo 2: no nombran las reglas de clase. Nuestra version pasa las 18 pruebas de pruebas.html, incluidos los dos casos del Anexo A.

---

## Fase 3: Interfaz grafica
**N.º 4 · IA:** Qwen 3.7 PLUS

**Prompt:**
```
Rol: desarrollador front-end.
Contexto: la logica ya funciona (adjunto el codigo).
Tarea: crea el editor del automata y el dibujo del grafo en SVG con la notacion de clase.
Restricciones: sin recursos en linea; ovalos, flecha de entrada al inicial, doble circulo en finales, bucles y flechas con etiqueta.
Formato: HTML+CSS+JS en un solo archivo.
Verificacion: como ver que el Caso 1 se dibuja con los 4 estados del AFD.
```
**Respuesta (resumen):** Entrego un index.html completo con tema oscuro: un editor donde se agregan estados con un boton y se marcan como inicial o final, transiciones elegidas con listas desplegables, pestañas para ver el AFND o el AFD, y un dibujo SVG con circulos, doble circulo en los finales, flecha azul "inicio" al estado inicial, bucles encima de cada estado y flechas con etiqueta. Copio el codigo de logica.js dentro del mismo archivo. Agrego dos botones de ejemplo, "Caso 1" y "Caso 2", con automatas inventados ("al menos tres a", que da un AFD de 4 estados, y uno con ε), y explico como comprobar que el Caso 1 se dibuja con 4 estados.
**Decision del equipo:** No reemplazamos nuestra interfaz (index.html + app.js); usamos la respuesta para comparar. Consideramos como posible mejora su editor con botones para marcar inicial y final, pero no lo aplicamos. 
**Verificacion:** Revisamos el codigo de Qwen, probamos su copia de la logica contra la nuestra. Con los dos casos del Anexo A dio resultados correctos (Caso 2: x(xy*y)*), pero en 33 de 1.500 automatas al azar dio una ER distinta al lenguaje; el ejemplo mas simple (q0 final, q0–a→q1, q1–a→q0) da aa y nuestro verificador marca diferencias en λ, aaaa y aaaaaa. En nuestra app cargamos el Caso 1 del Anexo A, pulsamos Convertir y comprobamos que el AFD se dibuja con sus 4 estados ({q0}, {q0,q1}, {q2} final con doble circulo y el pozo ∅), con flecha de entrada al inicial y etiqueta en los bucles.

---

## Fase 4: Paso a paso
**N.º 5 · IA:** Mistral Le Chat

**Prompt:**
```
Rol: desarrollador front-end.
Contexto: la app convierte AFND→AFD y obtiene la ER.
Tarea: agrega un modo paso a paso con botones Anterior, Siguiente y Todo, que indique el conjunto procesado, el simbolo y el destino, y el nombre de la regla en el Modulo 2.
Restricciones: sin librerias; resaltar la fila de la tabla que se procesa.
Formato: codigo modificado, indicando que funciones cambian.
Verificacion: recorrer el Caso 1 completo y comparar cada paso con el ejemplo de clase.
```
**Respuesta (resumen):** Propuso cambios solo para el Modulo 2: en logica.js, que la funcion add de afAer guarde tambien conjunto, simbolo y destino de cada paso; en app.js, una nueva version de stepper que muestra esos datos debajo de cada paso, y de m2 que arma una tabla de ecuaciones (tabla2) y resalta la fila del estado procesado. Incluyo una tabla con las funciones que cambian y la lista de los 9 pasos que, segun Mistral, debia mostrar el Caso 1, terminando en la ER a*ab.
**Decision del equipo:** No aplicamos los cambios. Nuestra app ya tenia el modo paso a paso pedido: en el Modulo 1, stepper() muestra los botones ◀ Anterior, Siguiente ▶ y Todo, y cada paso indica el conjunto procesado, el simbolo y el destino, resaltando la fila de la tabla; en el Modulo 2 cada paso muestra el nombre de la regla. Rechazamos la propuesta por estas razones:
**Verificacion:** En nuestra app cargamos el Caso 1 del Anexo A, pulsamos Convertir y recorrimos los 10 pasos con Siguiente ▶: cada paso indica el conjunto, el simbolo y el destino, y se resalta la fila de la tabla que se procesa; comparamos la tabla con la del Anexo A y coincide. En el Modulo 2, con origen "Automata del editor", recorrimos los 9 pasos: coinciden con los que listo Mistral salvo el paso 8, que nuestra app nombra "bucle mas salida (p = ap + bq → a*·bq)", y la ER final es a*ab. Revisando su codigo vimos que $('#tabla2') devuelve null con nuestra funcion $, y que no existe un elemento tabla2, por lo que su version de m2 fallaria.

---

## Fase 5: Depuracion (minimo 2 errores REALES)
Documenten errores que encontraron de verdad al probar. No inventen ninguno. Ideas de donde mirar: el ejemplo con ε, alfabetos de un simbolo, automatas con estados inalcanzables, entradas mal escritas.

Estos cuatro errores existian en la version inicial y se detectaron en la revision con Claude (N.º 7); se corrigieron en N.º 8. Cada integrante debe reproducirlos con la version inicial y completar la verificacion.

### Error 1: la app no funcionaba en el navegador
- **Sintoma:** al abrir `index.html` con doble clic, "Convertir" no hacia nada; `pruebas.html` mostraba 0 de 17. Consola (F12): `Identifier 'top' has already been declared`.
- **Prompt usado:** N.º 7 (revision) y N.º 8 (correccion).
- **Causa:** `logica.js` declaraba `const top`; en el navegador `top` ya existe (`window.top`) y se rechazaba el archivo completo. Las pruebas solo se habian corrido en Node.js.
- **Correccion:** se renombro a `hayUnionExterna`.
- **Verificacion del equipo:** [COMPLETAR]

### Error 2: etiquetas de bucles cortadas
- **Sintoma:** el bucle de {q0,q1} no mostraba "a" y el de ∅ no mostraba "a,b"; el bucle del inicial tapaba la flecha de entrada.
- **Prompt usado:** N.º 7 y N.º 8.
- **Causa:** el SVG no tenia margen y el bucle del inicial apuntaba hacia la izquierda.
- **Correccion:** margen en el `viewBox` y bucle del inicial hacia arriba (`dibujar` en `app.js`).
- **Verificacion del equipo:** [COMPLETAR]

### Error 3: el verificador fallaba con ER muy largas
- **Sintoma:** con automatas grandes no aparecia resultado; consola: `Too many captures`.
- **Prompt usado:** N.º 7 y N.º 8.
- **Causa:** cada parentesis de la ER se convertia en un grupo de captura de `RegExp`, y JavaScript tiene un limite.
- **Correccion:** grupos `(?: )` en `verificar`; prueba 18 en `pruebas.js`.
- **Verificacion del equipo:** [COMPLETAR]

### Error 4: el verificador cambiaba el origen del Modulo 2
- **Sintoma:** con el Caso 2 y origen "Automata del editor", al verificar la ER pasaba de `x(xy*y)*` a `x(λ+x(yy*x)*yy*)`.
- **Prompt usado:** N.º 7 y N.º 8.
- **Causa:** `verif()` forzaba el origen "AFD del Modulo 1".
- **Correccion:** `verif()` respeta el origen elegido.
- **Verificacion del equipo:** [COMPLETAR]

---

## Fase 6: Revision
**N.º 6 · IA:** deepsek

**Prompt:**
```
Rol: revisor de codigo senior.
Contexto: codigo completo de index.html.
Tarea: haz una revision de codigo y propon un refactor sin cambiar el comportamiento.
Restricciones: mantener un solo stack y sin dependencias.
Formato: lista de hallazgos por prioridad, luego el codigo refactorizado.
Verificacion: como confirmar que los Casos 1 y 2 y el verificador siguen funcionando.
```
**Respuesta (resumen):** DeepSeek entrego 14 hallazgos clasificados por prioridad y un refactor. Los principales: que limpiar() e ir() estaban en un script dentro de index.html y no en app.js; que limpiar() no reiniciaba el origen del Modulo 2 ni el valor de n; que verif() convertia el AFND dos veces (m1() y luego m2(), que vuelve a llamar a m1()); y que acepta() aplica cierre-ε aunque el AFD no tiene ε. Propuso mover esas funciones a app.js, guardar una "firma" del editor para no recalcular el AFD, una funcion aceptaAFD mas rapida, validar alfabeto y estados vacios, y dio pasos y aserciones para verificar los Casos 1, 2 y ε.
**Decision del equipo:** Aceptamos y aplicamos el cambio mas simple: movimos limpiar() e ir() de index.html a app.js, y ahora limpiar() tambien deja el origen del Modulo 2 en "AFD del Modulo 1" y n en 6. Asi toda la interfaz queda en app.js.
Rechazamos el resto del refactor: la "firma" del editor (asegurarAFD) y aceptaAFD agregan codigo que debemos poder explicar en la sustentacion y casi no ganan nada; la doble conversion de verif() existe, pero no cambia el resultado ni se nota en tiempo con automatas de clase.
Corregimos dos hallazgos que no eran ciertos: limpiar() si borraba la ER, y no causaba un error sino el aviso "El estado inicial no esta en los estados"; y par('(ab)') no agrega parentesis de sobra, devuelve (ab).

**Verificacion:** Despues del cambio abrimos pruebas.html: 18 de 18. En index.html cambiamos el origen a "Automata del editor" y n a 9, pulsamos "Limpiar todo" y ambos volvieron a sus valores iniciales; el boton "Verificador" de la barra superior sigue llevando a su seccion. Repetimos los pasos de DeepSeek: Caso 1 con 4 estados y verificador ✔ (127 cadenas); Caso 2 con ER x(xy*y)* y verificador ✔; ejemplo ε con cierre-ε(p) = {p,q}. Revisamos en el codigo los hallazgos 2 y 5 y comprobamos que esas partes no eran ciertas.
---

## Fases 5 y 6: Revision y correcciones con Claude
**N.º 7 · IA:** Claude (claude.ai, modelo Opus 5.5)

**Prompt:** 
ROL
Actua como un desarrollador senior que revisa entregas academicas de programacion y explica con lenguaje sencillo.

CONTEXTO
Te envio un PDF con las instrucciones de mi parcial y un ZIP con mi proyecto (codigo, bitacora y README). Solo me interesan dos fases del PDF:
- Fase 5 (Depuracion): minimo 2 errores reales documentados, cada uno con sintoma, prompt usado, causa y correccion.
- Fase 6 (Revision): pedir a la IA una revision de codigo y un refactor, redactar el README y hacer el commit final.
Ignora cualquier otra fase.

TAREA
1. Compara cada requisito de la Fase 5 y la Fase 6 con el contenido del ZIP.
2. Indica si cada requisito esta cumplido, parcial, incumplido o pendiente de verificar.
3. Dime que debo corregir o completar yo, y que capturas debo tomar para evidenciar estas dos fases.
4. Dame un plan de trabajo numerado y una checklist final.

RESTRICCIONES
- No inventes errores, resultados, capturas ni commits que no esten en el ZIP.
- No afirmes que algo funciona si no lo comprobaste; marcalo como "pendiente de verificar".
- No agregues secciones que el PDF no pida para estas fases.
- No reescribas mi bitacora; solo dame modelos de redaccion que yo adaptare.

FORMATO DE SALIDA
Una tabla (requisito | evidencia en el ZIP | estado | que falta), secciones separadas para Fase 5 y Fase 6, y listas numeradas para el plan y la checklist.

VERIFICACION
La respuesta es correcta si:
- Marca como "cumplido" solo lo que tiene evidencia en un archivo concreto del ZIP.
- Cada error de la Fase 5 aparece con sus cuatro campos (sintoma, prompt, causa, correccion) o indica cuales faltan.
- Indica si existe evidencia de la revision, el refactor, el README y el commit final.-


**Respuesta (resumen):** La IA leyo el PDF y los archivos del ZIP, comparo cada requisito con el contenido y ejecuto las pruebas de logica.js en Node.js y en el navegador Chromium. En Node daban 17 de 17, pero en el navegador la app no funcionaba: pruebas.html mostraba 0 de 17 porque const top en logica.js choca con window.top, y index.html fallaba por lo mismo. Tambien señalo que verif() en app.js fuerza el origen del Modulo 2 al AFD ($('org').value='1'). [Ademas reporto que se cortaban las etiquetas de los bucles y que el verificador fallaba con ER muy largas. Entrego un documento de revision con la comparacion requisito por requisito y las correcciones propuestas.
**Decision del equipo:** Se acepta la revision: la app no funcionaba en el navegador y no lo habiamos notado, porque las pruebas solo se habian corrido en Node.js. Se acepto corregir los cuatro errores encontrados (seccion 5 del documento de revision). Se reconoce que este prompt no siguio la estructura pedida (rol, contexto, tarea, restricciones, formato y verificacion), a diferencia de los prompts de las demas fases.
**Verificacion:** Abrimos pruebas.html e index.html de la version original en Chrome. pruebas.html mostraba 0 de 17 y la consola (F12) mostraba “Identifier ‘top’ has already been declared”, tal como indico la revision. 

## Fases 8:
**N.º 8 · IA:** Claude (claude.ai, modelo Opus 5.5)

**Prompt:**
```
ROL
Actua como un desarrollador senior que revisa proyectos academicos y explica con lenguaje sencillo.

CONTEXTO
Te envio el PDF de mi parcial y el ZIP con mi proyecto (codigo, bitacora y README). Solo quiero apoyo con la Fase 5 (Depuracion: minimo 2 errores reales con sintoma, prompt usado, causa y correccion) y la Fase 6 (Revision: revision de codigo, refactor, README y commit final). Ignora las demas fases.

TAREA
1. Revisa el codigo, corrige los errores que encuentres y haz un refactor (nombres claros, funciones cortas, sin repetir codigo), explicando que cambio.
2. Redacta un borrador del README con lo que realmente hace el proyecto.
3. Dime que le falta a la seccion de depuracion de mi bitacora.
4. Al final, lista brevemente lo que debo hacer yo (capturas, documentar mis errores reales, commit final), indicando que mostrar en cada captura y donde insertarla.

RESTRICCIONES
- No inventes errores, capturas ni commits que no esten en el ZIP.
- Si algo no lo pudiste comprobar, marcalo como "pendiente de verificar".
- No agregues secciones que el PDF no pida.

FORMATO DE SALIDA
Codigo corregido por archivo, borrador del README y una lista final titulada "Lo que debo hacer yo".

VERIFICACION
Cada correccion indica archivo y cambio concreto, el refactor mantiene el mismo comportamiento y el README describe solo lo que existe en el proyecto.


```
**Respuesta (resumen):** Claude aplico las 5 correcciones (errores 1 a 4 de la seccion 5 y la validacion del alfabeto), reescribio logica.js, app.js y pruebas.js con formato legible y comentarios sin cambiar el comportamiento (comparo los resultados con la version anterior en 1.500 automatas aleatorios), agrego la prueba 18 y actualizo README, SPEC, esta bitacora y los materiales de estudio. Comprobo en Chromium: 18 de 18 pruebas; Casos 1 y 2, ejemplo ε y verificador correctos; sin peticiones de red. Despues corrigio tambien el nombre de la regla del Modulo 2: cuando el bucle tiene una salida distinta de λ, ahora se llama "bucle mas salida".
**Decision del equipo:** Aceptamos las correcciones despues de revisarlas: comparamos en VS Code ("Compare Selected") cada archivo original con el corregido y cada integrante explico en voz alta los cambios principales (el cambio de top a hayUnionExterna, el uso de (?: en el verificador y la diferencia entre "bucle" y "bucle mas salida"). Mantuvimos el formato legible del codigo porque facilita explicarlo en la sustentacion.
**Verificacion:** En nuestro computador, con la version corregida: pruebas.html mostro 18 de 18; el Caso 1 dio el AFD del Anexo A con el pozo ∅; el Caso 2 dio la ER x(xy*y)*; el verificador mostro ✔ en ambos casos y en el ejemplo con ε; y la app funciono con el wifi apagado.

---

## Reparto del equipo 

### David Ossa

**Partes que domina**
- Modulo 1: conversion AFND → AFD por subconjuntos, clausura-ε y estado pozo.
- Tabla de conversion y paso a paso del Modulo 1.
- Dibujo de los grafos en SVG con la notacion de clase.

**Commits**
- Conversion AFND → AFD
- Tabla y paso a paso
- Grafos SVG
- Correccion error 2

---

### Danna Campo

**Partes que domina**
- Modulo 2: metodo de ecuaciones con las cinco reglas de clase, sustitucion y simplificacion.
- Conexion del Modulo 1 con el Modulo 2.
- SPEC.md (especificacion).

**Commits**
- SPEC.md
- AF → ER por ecuaciones
- Conexion Modulo 1 → 2
- Correccion error 4

---

### Deymer Chicangana 

**Partes que domina**
- Verificador de equivalencia con todas las cadenas hasta n ≥ 6.
- Pruebas automaticas (pruebas.html, 18 pruebas).
- Depuracion, revision, README y commit final.

**Commits**
- Verificador
- Pruebas automaticas
- Correcciones errores 1 y 3
- README y commit final

