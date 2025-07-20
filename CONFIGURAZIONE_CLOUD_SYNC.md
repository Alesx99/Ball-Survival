# 🔧 Configurazione Cloud Sync - Ball Survival

## 📋 Istruzioni per Abilitare il Cloud Sync

### 1️⃣ **Ottenere un Token GitHub**
1. Vai su [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Clicca "Generate new token (classic)"
3. Dai un nome al token (es. "Ball Survival Analytics")
4. Seleziona i permessi:
   - ✅ `gist` (per creare/modificare gist)
5. Clicca "Generate token"
6. **COPIA IL TOKEN** (non lo vedrai più!)

### 2️⃣ **Inserire il Token nel Gioco**
1. Apri il file `game.js`
2. Cerca la sezione `AnalyticsManager` (circa linea 1073)
3. Trova questa configurazione:
```javascript
this.config = {
    githubToken: 'ghp_your_token_here', // 🔧 SOSTITUISCI CON IL TUO TOKEN
    gistId: '1dc2b7cdfc87ca61cfaf7e2dc7e13cfd', // ✅ Gist ID configurato
    enableCloudSync: false, // 🔧 IMPOSTA A true DOPO AVER INSERITO IL TOKEN
    syncInterval: 10 // Sync ogni 10 sessioni
};
```

4. **Sostituisci** `'ghp_your_token_here'` con il tuo token
5. **Cambia** `enableCloudSync: false` in `enableCloudSync: true`

### 3️⃣ **Verificare il Funzionamento**
1. Avvia il server: `python -m http.server 8000`
2. Apri il browser su `http://localhost:8000`
3. Gioca una partita
4. Apri la console (F12) e cerca:
   ```
   🔄 Inizio upload analytics...
   📊 Analytics aggiornati per [archetipo]: X partite, Ys totale
   ```

### 4️⃣ **Visualizzare i Dati**
- I dati vengono salvati nel Gist: https://gist.github.com/Alesx99/1dc2b7cdfc87ca61cfaf7e2dc7e13cfd
- Ogni 10 sessioni di gioco i dati vengono sincronizzati automaticamente

## ⚠️ **IMPORTANTE**
- **NON condividere mai il token** - è come una password
- **NON committare il token** su GitHub
- Se il token viene compromesso, revocalo immediatamente su GitHub

## 🔍 **Troubleshooting**
- Se vedi `⚠️ Cloud sync disabilitato o non configurato` → Controlla che il token sia inserito correttamente
- Se vedi errori 401/403 → Il token potrebbe essere scaduto o non avere i permessi giusti
- Se non vedi messaggi di sync → Controlla che `enableCloudSync` sia `true`

## 📊 **Funzionalità Cloud Sync**
- ✅ Sincronizzazione automatica dei dati analytics
- ✅ Merge intelligente dei dati tra dispositivi
- ✅ Backup sicuro dei progressi
- ✅ Analisi delle performance degli archetipi
- ✅ Raccomandazioni di bilanciamento automatico 