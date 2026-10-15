# SPEC: Simulador gráfico de autómatas (AFND → AFD → ER)

Teoría de la Computación · Parcial 2.º corte · Entrega: jueves 15 de octubre de 2026

## 1. Propósito
Aplicación local y sin conexión que (1) convierte un AFND en un AFD con el método de subconjuntos, (2) obtiene la expresión regular de un autómata finito con el método de ecuaciones y (3) verifica que AFND, AFD y ER aceptan el mismo lenguaje.

## 2. Restricciones
- Un solo stack: HTML + CSS + JavaScript. Sin servidor, sin CDN, sin APIs, sin internet.
- Se abre con doble clic en `index.html`.

## 3. Modelo de datos
```json
{
  "est": ["q0", "q1", "q2"],
  "alf": ["a", "b"],
  "ini": "q0",
  "fin": ["q2"],
  "tr": [ {"d": "q0", "s": "a", "a": "q0"}, {"d": "q1", "s": "", "a": "q2"} ]
}
```
`s` vacío (`""`) representa una transición ε. Los símbolos del alfabeto son de **un solo carácter**.

## 4. Entradas
Estados, alfabeto, inicial y finales (separados por coma) y transiciones, una por línea: `origen,símbolo,destino`. ε se escribe `ε` o `eps`. Longitud máxima `n` del verificador (mínimo 6).

## 5. Salidas
- **Módulo 1:** tabla de conversión, grafo del AFND, grafo del AFD y paso a paso.
- **Módulo 2:** sistema de ecuaciones, cada paso con el nombre de la regla y la ER final.
- **Verificador:** mensaje de equivalencia o lista de cadenas donde difieren.

## 6. Requisitos funcionales
| N.º | Requisito |
|---|---|
| RF1 | Editar un AFND completo (estados, alfabeto, inicial, finales, transiciones). |
| RF2 | Aplicar subconjuntos: inicial, transiciones por símbolo, iterar hasta no haber conjuntos nuevos. |
| RF3 | Marcar como final todo conjunto que contenga un final del AFND. |
| RF4 | Mostrar la tabla de conversión y el estado pozo ∅. |
| RF5 | Dibujar AFND y AFD con la convención de clase (óvalos, flecha de entrada, doble círculo). |
| RF6 | Paso a paso: conjunto procesado, símbolo y conjunto de llegada. |
| RF7 | Reglas AF→ER: transición simple, varias transiciones, bucle, bucle más salida, estado final. |
| RF8 | Mostrar sustituciones y simplificaciones con el nombre de la regla. |
| RF9 | El Módulo 2 recibe el AFD del Módulo 1. |
| RF10 | Verificador hasta longitud n ≥ 6 que muestra las cadenas que difieren. |
| RF11 (bonus) | Transiciones ε con cláusura-ε en el inicial y en cada conjunto. |

## 7. Casos límite
- **Estado pozo ∅:** aparece como estado del AFD con transiciones a sí mismo. Al obtener la ER se omite porque no llega a un final.
- **Estados inalcanzables:** el AFD solo crea conjuntos alcanzables; en la ER se omiten los inalcanzables.
- **Alfabeto de un símbolo:** debe funcionar (tabla de una columna).
- **Lenguaje vacío (ningún final alcanzable):** la ER es ∅.
- **Inicial que también es final:** la cadena vacía (λ) debe aceptarse.
- **Varias transiciones entre el mismo par de estados:** se dibujan como una sola flecha con etiqueta `a,b`.
- **Entrada inválida:** estado o símbolo desconocido muestra un mensaje de error, sin romper la app.
- **Símbolo inválido en el alfabeto:** un símbolo de más de un carácter o que sea `+ * ( ) | λ ε` muestra un mensaje de error.
- **Explosión de cadenas en el verificador:** se reduce n si el alfabeto es grande (límite 300 000 cadenas).

## 8. Criterios de aceptación (Anexo A)
1. **Caso 1:** AFD con inicial {q0}; {q0}–a→{q0,q1}; {q0}–b→∅; {q0,q1}–a→{q0,q1}; {q0,q1}–b→{q2}; {q2} final con ∅ en a y b; ∅→∅.
2. **Caso 2:** ER equivalente a `x(xy*y)*`, confirmada por el verificador.
3. El verificador reporta equivalencia en ambos casos.

## 9. Limitaciones conocidas
- La ER no se minimiza del todo (puede tener paréntesis o términos redundantes), pero es equivalente.
- Los símbolos deben ser de un carácter y no pueden ser `+`, `*`, `(`, `)` ni `λ`.
- El dibujo coloca los estados en círculo; con muchos estados las flechas pueden cruzarse.
- Con autómatas grandes la ER puede crecer mucho (con 5 estados y 3 símbolos puede llegar a cientos de miles de caracteres) y el verificador tarda unos segundos.
- Las pruebas deben ejecutarse en el navegador (`pruebas.html`), que es donde se usa la app.
