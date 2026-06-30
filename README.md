# Running Lab 🏃

Bežecký tréningový denník na 5k. Coachuje ťa Claude v chate — appka len pekne zobrazí plán.

## Ako to funguje

1. V chate napíšeš coachovi **„ďalší týždeň"**
2. Coach ti pošle plán ako blok textu (JSON)
3. V appke klikneš **„Načítať nový týždeň"**, vložíš text, klikneš **Načítať plán**
4. Appka sa automaticky rozloží na: týždenný pás, štatistiky, graf objemu a karty dní
5. Plán sa uloží v prehliadači — ostane tam aj po zatvorení

## Spustenie lokálne

```bash
npm install
npm run dev
```

Otvor http://localhost:3000

## Nasadenie na Vercel

**Možnosť A — cez web (najjednoduchšie):**
1. Nahraj túto zložku do GitHub repo (`DarkMaster9452/running-lab`)
2. Choď na vercel.com → New Project → importuj repo
3. Vercel automaticky rozpozná Next.js → Deploy
4. Dostaneš URL typu `running-lab.vercel.app`

**Možnosť B — cez CLI:**
```bash
npm i -g vercel
vercel
```

Po nasadení si appku na mobile otvoríš v prehliadači a cez **„Pridať na plochu"** ju máš ako ikonu (PWA).

## Formát plánu (pre coacha)

```json
{
  "weekNumber": 2,
  "focus": "Názov fázy",
  "intro": "Krátka motivácia + čo trénujeme tento týždeň.",
  "days": [
    {
      "type": "intervals",
      "title": "Názov tréningu",
      "detail": "Konkrétne úseky, pauzy, tempo.",
      "km": 7,
      "pace": "4:05",
      "tip": "Coaching tip."
    }
    // ... presne 7 dní (Po-Ne)
  ]
}
```

**Typy dní:** `intervals` · `tempo` · `easy` · `long` · `rest` · `cross`
Pre `rest`/`cross` daj `km: 0` a `pace: null`.

Týždenný pás zhora ukazuje len zjednodušene: **Beh** (intervaly/tempo/voľný/dlhý), **Regen** (rest), **Sila** (cross).
