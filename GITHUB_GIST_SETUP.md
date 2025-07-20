# 🔧 **SETUP GITHUB GIST - ANALYTICS CLOUD SYNC**

## 📋 **PASSI PER CONFIGURAZIONE**

### **1. Creare un GitHub Token**
1. Vai su [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Clicca "Generate new token (classic)"
3. Dai un nome come "Ball Survival Analytics"
4. Seleziona solo i permessi:
   - ✅ `gist` (per creare/modificare gist)
5. Clicca "Generate token"
6. **COPIA IL TOKEN** (non lo vedrai più!)

### **2. Creare un Gist**
1. Vai su [GitHub Gist](https://gist.github.com/)
2. Crea un nuovo gist con:
   - **Nome file**: `analytics.json`
   - **Contenuto**: 
   ```json
   {
     "archetypeUsage": {
       "standard": { "games": 0, "totalTime": 0, "avgLevel": 0, "satisfaction": 0 },
       "steel": { "games": 0, "totalTime": 0, "avgLevel": 0, "satisfaction": 0 },
       "shadow": { "games": 0, "totalTime": 0, "avgLevel": 0, "satisfaction": 0 },
       "tech": { "games": 0, "totalTime": 0, "avgLevel": 0, "satisfaction": 0 },
       "magma": { "games": 0, "totalTime": 0, "avgLevel": 0, "satisfaction": 0 },
       "crystal": { "games": 0, "totalTime": 0, "avgLevel": 0, "satisfaction": 0 }
     },
     "sessionStats": {
       "totalSessions": 0,
       "avgSessionTime": 0,
       "retentionRate": 0,
       "playerSatisfaction": 0
     },
     "balanceMetrics": {
       "lastUpdate": 0,
       "archetypeScores": {},
       "recommendations": []
     }
   }
   ```
3. Clicca "Create secret gist"
4. **COPIA L'ID DEL GIST** dall'URL (es: `https://gist.github.com/username/1234567890abcdef` → ID: `1234567890abcdef`)

### **3. Configurare il Codice**
Nel file `game.js`, trova la sezione `AnalyticsManager` e modifica:

```javascript
this.config = {
    githubToken: 'ghp_IL_TUO_TOKEN_QUI', // Sostituisci con il tuo token
    gistId: 'IL_TUO_GIST_ID_QUI', // Sostituisci con l'ID del gist
    enableCloudSync: true, // Abilita cloud sync
    syncInterval: 10 // Sync ogni 10 sessioni
};
```

## 🔄 **COME FUNZIONA IL MERGE**

### **Merge Intelligente dei Dati:**
- **Partite Totali**: Somma semplice
- **Tempo Totale**: Somma semplice
- **Livello Medio**: Media ponderata per numero partite
- **Soddisfazione**: Media ponderata per numero partite
- **Sessioni**: Somma semplice
- **Tempo Medio Sessione**: Media ponderata per numero sessioni

### **Esempio di Merge:**
```
Giocatore A (10 partite):
- Steel: 5 partite, livello medio 15, soddisfazione 80%
- Shadow: 5 partite, livello medio 12, soddisfazione 70%

Giocatore B (5 partite):
- Steel: 3 partite, livello medio 18, soddisfazione 85%
- Shadow: 2 partite, livello medio 10, soddisfazione 65%

Risultato Merge:
- Steel: 8 partite, livello medio 16.1, soddisfazione 81.9%
- Shadow: 7 partite, livello medio 11.4, soddisfazione 68.6%
```

## 🔒 **SICUREZZA**

### **Token GitHub:**
- ✅ **Privato**: Solo tu puoi vedere il token
- ✅ **Limitato**: Solo permessi gist
- ✅ **Revocabile**: Puoi revocarlo in qualsiasi momento
- ⚠️ **Non condividere**: Non condividere il token pubblicamente

### **Gist:**
- ✅ **Privato**: Solo tu puoi vedere il gist
- ✅ **Solo Analytics**: Contiene solo dati statistici
- ✅ **Nessun Dato Personale**: Solo metriche aggregate

## 📊 **MONITORAGGIO**

### **Console Log:**
- ✅ `Analytics uploaded and merged to GitHub Gist`
- ❌ `Failed to upload analytics: [errore]`
- ⚠️ `Cloud sync disabilitato o non configurato`

### **Verifica Funzionamento:**
1. Apri la console del browser (F12)
2. Gioca alcune partite
3. Controlla i log per confermare upload
4. Verifica il gist su GitHub per vedere i dati

## 🚀 **TEST RAPIDO**

### **Per Testare Senza Configurazione:**
```javascript
// Nel browser console
analyticsManager.config.enableCloudSync = false;
console.log('Cloud sync disabilitato per test');
```

### **Per Abilitare Temporaneamente:**
```javascript
// Nel browser console
analyticsManager.config.enableCloudSync = true;
analyticsManager.config.githubToken = 'ghp_test_token';
analyticsManager.config.gistId = 'test_gist_id';
console.log('Cloud sync abilitato per test');
```

---

*Setup GitHub Gist per Analytics Cloud Sync* 🔧 