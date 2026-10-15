# Simulador de autómatas: AFND → AFD → Expresión Regular

Parcial del segundo corte de Teoría de la Computación. Equipo: David Ossa, Danna Campo y Deymer Chicangana. 

## Descripción
Aplicación gráfica local que:
1. Convierte un AFND en un AFD (método de subconjuntos), con tabla, grafos y paso a paso.
2. Obtiene la expresión regular de un autómata finito (método de ecuaciones), mostrando cada regla aplicada.
3. Verifica que AFND, AFD y ER aceptan las mismas cadenas hasta una longitud n.
4. Bonus: soporta transiciones ε.

## Cómo ejecutarla
Abrir `index.html` con doble clic en cualquier navegador (los archivos `app.js` y `logica.js` deben estar en la misma carpeta). Funciona sin internet y sin servidor.

## Pruebas
Abrir `pruebas.html` con doble clic: ejecuta 18 pruebas (casos del Anexo A, casos límite y errores depurados) y muestra cuántas pasan. Debe decir **18 de 18** en el navegador.

## Cómo usarla
1. Escribir el AFND en el editor, o pulsar uno de los botones de ejemplo.
2. **Módulo 1:** pulsar *Convertir*. Usar *Siguiente ▶* para ir paso a paso.
3. **Módulo 2:** elegir el origen (AFD del Módulo 1 o el autómata del editor) y pulsar *Obtener ER*.
4. **Verificador:** elegir n (mínimo 6) y pulsar *Verificar*.

Formato de transiciones: `origen,símbolo,destino`, una por línea. ε se escribe `ε` o `eps`. Los símbolos son de un carácter y no pueden ser `+ * ( ) | λ ε` (la app lo valida).

## Estructura
```
index.html     Pantalla de la aplicación (abrir con doble clic)
app.js         Interfaz: editor, grafos, paso a paso
logica.js      Lógica pura: subconjuntos, ecuaciones/reglas, verificador
pruebas.html   Pruebas automáticas (abrir con doble clic)
pruebas.js     Casos de prueba (Anexo A, casos límite y errores depurados)
SPEC.md        Especificación (Fase 0)
README.md      Este archivo
BITACORA.pdf   Bitácora de prompts
```

## Correcciones de la revisión final
Se corrigieron 4 errores de la versión inicial (detalle en la bitácora, sección 5):
1. La app no funcionaba en el navegador: `logica.js` declaraba `const top`, nombre que ya existe en el navegador (`window.top`). Se renombró a `hayUnionExterna`.
2. Se cortaban las etiquetas de los bucles en los grafos: margen en el dibujo y bucle del inicial hacia arriba.
3. El verificador fallaba con ER muy largas ("Too many captures"): se usan grupos `(?: )`.
4. El verificador cambiaba el origen elegido en el Módulo 2: ahora lo respeta.

Además se valida el alfabeto y el código se reescribió con formato legible y comentarios, sin cambiar el comportamiento.

## Limitaciones
Consultar la sección 9 de `SPEC.md`.

## Uso de IA
Ver la bitácora de prompts. IA utilizadas: Claude (claude.ai) en la revisión y corrección final; [COMPLETAR: otras IA utilizadas].
