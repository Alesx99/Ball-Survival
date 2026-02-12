# Ottimizzazioni Performance Mobile

## Problema
Cali di framerate su dispositivi mobile quando si muove il personaggio (joystick).

## Modifiche implementate

### 1. Joystick – throttling DOM
- **Prima**: Ogni evento `pointermove` aggiornava `stick.style.transform` (60–120+ volte al secondo su touch)
- **Dopo**: Aggiornamenti DOM tramite `requestAnimationFrame`, massimo 1 update per frame
- Aggiunto `will-change: transform` al joystick stick per favorire la GPU

### 2. Background – culling visibile
- **Prima**: Griglia/pattern disegnati sull’intera mappa 8000×6000 ogni frame
- **Dopo**: Disegno solo dell’area visibile (camera + margine), molte meno operazioni di stroke

### 3. Pattern cosmic – niente `Math.random` in draw
- **Prima**: `Math.random()` usato migliaia di volte per frame → jank e frame inconsistenti
- **Dopo**: Posizioni stelle deterministiche (hash da coordinate cella)

### 4. Risoluzione canvas su mobile
- **Prima**: `devicePixelRatio` pieno (2–3 su Retina) → canvas molto grandi
- **Dopo**: `scale` limitato a 1.5 su mobile per ridurre i pixel renderizzati

### 5. Resize – debounce
- **Prima**: `resize` su ogni frame durante scroll/rotazione
- **Dopo**: Debounce 150 ms per ridurre resize ripetuti

### 6. Culling entità
- Fire trails, particelle, orbs ed effetti disegnati solo se nella viewport (+ margine 80px)

## Come verificare
- Testare su dispositivo mobile reale (o Chrome DevTools → Toggle device toolbar)
- Profilare con Chrome Performance per individuare ulteriori colli di bottiglia
