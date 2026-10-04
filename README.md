# MotorsRun

Carrera de motos **retro en tercera persona** por la Costa Verde de Lima, con pixel art y estética vintage de arcade de los 80.
Sales del garaje con tu moto naked "NK 250", arrancas con semáforo y rodeas el malecón al atardecer:
el mar y la playa a la izquierda, los acantilados verdes a la derecha y el sol hundiéndose en el horizonte.
Al rato cae la noche: se prenden los postes, las luces de la ciudad y los stops de los carros.

> *Disciplina hoy, libertad mañana. Sueña · Planifica · Trabaja · Logra. Ride safe.*

## Jugar online

**https://juliolfh.github.io/MotorsRun/**, en PC o celular (en horizontal).

También puedes abrir `index.html` directo en cualquier navegador moderno. No necesita instalación.

## Perfiles de piloto

- Cada piloto se crea con **nombre y PIN de 4 números** y entra desde cualquier celular o PC con sus mismas monedas.
- Cada piloto tiene su **billetera**: las monedas (S/) que recoges **se acumulan partida tras partida**.
- También guarda su récord, distancia máxima, kilómetros totales, partidas jugadas y el color de su moto.
- En el garaje, la pizarra muestra al piloto activo. Tócala o presiona `U` para cambiar de piloto, crear uno o entrar con otro.
- Si se corta el internet, la partida queda guardada en el dispositivo y se envía sola después.

## Panel de administrador (Google Sheets)

Los pilotos se guardan en una hoja de Google Sheets del administrador, en la pestaña **Pilotos**:
nombre, monedas, récord, mejor km, km totales, partidas, monedas ganadas, color, fecha de creación y última partida.
El PIN se guarda cifrado en una columna oculta.

- El servidor es `server/Code.gs` (Google Apps Script), publicado como aplicación web con acceso "Cualquier usuario".
- La URL de esa aplicación web va en `js/config.js`. Si se deja vacía, el juego guarda los perfiles solo en el navegador.
- Al cambiar `Code.gs`, hay que volver a publicarlo en Apps Script: **Implementar → Administrar implementaciones → editar → Nueva versión**.

## Cómo jugar

| Acción | Teclado | Celular / tablet |
|---|---|---|
| Manejar | `←` `→` o `A` `D` | Mantener la mitad izquierda / derecha de la pantalla |
| Frenar | `↓` o `S` | Botón **FRENO** |
| Turbo (gasta nitro) | `Espacio`, `Shift` o `↑` | Botón **TURBO** |
| Cambiar color (garaje) | `←` / `→` | Flechas junto a la moto |
| Pausa | `P` o `Esc` | Botón ❚❚ arriba a la derecha |
| Filtro retro CRT on/off | `C` | — |
| Sonido / pantalla completa | `M` / `F` | Automática al empezar |

La moto acelera sola: tú solo manejas, frenas en las curvas cerradas y usas el turbo.

## Reglas

- **3 cascos (vidas).** Pierdes uno al chocar con un carro, una palmera, un poste, un letrero, al irte contra el cerro o al **caer al mar**.
- **La arena frena.** Salirte de la pista a la playa o al jardín te quita velocidad.
- **Curvas:** a toda velocidad la fuerza centrífuga te saca; frena o abre la curva.
- **Tráfico limeño:** taxis, escarabajos, combis "Chorrillos" y camionetas que cambian de carril.
- **¡Rozón!** Pasar muy cerca de un carro a alta velocidad da +50.
- **Gasolina:** se acaba con el tiempo (más rápido con turbo). Recoge bidones rojos.
- **Nitro:** botellas azules (+40) y cada moneda (+3). El turbo duplica los puntos.
- Cada kilómetro pasas por un distrito (San Miguel, Magdalena, San Isidro, Miraflores, Barranco, Chorrillos, La Herradura).
- Ciclo de 10 km: atardecer, anochecer, noche y amanecer.
- Al terminar recibes una **postal de la Costa Verde** con tu puntaje. El récord se guarda en el navegador.

## Estructura

```
MotorsRun/
├── index.html
├── css/style.css      # marco tipo TV, filtro sepia, líneas CRT y viñeta
└── js/
    ├── font.js        # fuente bitmap 3x5
    ├── audio.js       # motor, efectos y música chiptune (Web Audio)
    ├── config.js      # URL del servidor de Google Sheets
    ├── profiles.js    # pilotos con PIN, billetera de monedas y sincronización
    ├── sprites.js     # moto de perfil (garaje), letreros e íconos
    ├── sprites3d.js   # moto de espaldas, tráfico, playa, acantilados e ítems
    ├── road.js        # motor pseudo-3D: pista con curvas y lomas, cielo, sol, mar y niebla
    ├── garage.js      # menú principal: el garaje
    └── game.js        # bucle, física, colisiones, tablero analógico, HUD y controles
```

Todo el arte se genera por código sobre un lienzo de 384×216 escalado con `image-rendering: pixelated`.

## Publicarlo

Es estático: puedes subir la carpeta tal cual a GitHub Pages, Netlify o Vercel.
Para servirlo localmente:

```bash
python -m http.server 8080
```
