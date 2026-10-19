/**
 * Funnel-Abnahme — im Browser auf der LIVE-Seite ausführen.
 *
 *   await funnelAbnahme({
 *     kunde:   'fischer-chemnitz',            // Ordner in funnels-assets (Pflicht)
 *     logo:    true,                          // Logo muss oben stehen
 *     ctaMin:  3,                             // Mindestzahl Handlungsaufforderungen
 *     impressum: 'energie-fischer.de',        // Domain der echten Rechtsseiten
 *     bilderMin: 5,                           // Mindestzahl echter Kundenbilder
 *     eigeneBilder: ['6ad4b491…'],            // Mediathek-IDs mit belegter Herkunft (optional)
 *     knopfText: 'Jetzt unverbindlich anfragen' // der EINE Knopftext (Badsanierungs-Standard)
 *   })
 *
 * Gibt eine Liste mit 🔴/🟢 je Prüfpunkt zurück. 🔴 = NICHT ausliefern.
 * Der Test ist die Wahrheit, nicht die Absicht.
 */
window.funnelAbnahme = async function (opt = {}) {
  const o = Object.assign(
    { kunde: null, logo: true, ctaMin: 2, impressum: null, bilderMin: 3, fremdeKunden: [],
      // Badsanierungs-Standard (18.10.2026): standard:false nur für eigene HWM-Funnels.
      // knopfText: der EINE Knopftext ('Jetzt unverbindlich anfragen'; Recruiting z. B. 'Jetzt bewerben'; false = nur Einheitlichkeit).
      // startseite: true/false, sonst automatisch (letzter Pfadteil ist kein page_…/danke/mieter).
      standard: true, knopfText: 'Jetzt unverbindlich anfragen', startseite: null, handyHoehe: 844, alleSeiten: true },
    opt
  );
  // Erst messen, wenn die Seite wirklich steht — sonst fehlt z.B. das Kopf-Logo.
  await Promise.race([
    new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true }))),
    new Promise((r) => setTimeout(r, 8000)),
  ]);
  // 🔴 Jedes Warten braucht einen Deckel: ein Bild mit loading="lazy" unterhalb der Falz
  // löst NIE 'load' aus — ohne Timeout hängt die Prüfung für immer (passiert am 20.09.2026).
  const mitDeckel = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  await mitDeckel(
    Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); })))),
    5000
  );
  // Einmal durch die Seite scrollen, sonst haben Bilder mit loading="lazy" unterhalb der
  // Falz die Hoehe 0 und die Textwand-Pruefung meldet sie faelschlich als fehlend (20.09.2026).
  const standVorher = window.scrollY;
  const schritt = Math.max(200, Math.round(window.innerHeight * 0.8));
  const runden = Math.min(40, Math.ceil(document.body.scrollHeight / schritt)); // 🔴 Deckel: die Seite waechst beim Scrollen mit
  for (let n = 0; n <= runden; n++) {
    window.scrollTo(0, n * schritt);
    await new Promise((r) => setTimeout(r, 80));
  }
  window.scrollTo(0, standVorher);
  await new Promise((r) => setTimeout(r, 800));

  const befunde = [];
  const ok = (name, text) => befunde.push({ stand: '🟢', punkt: name, text });
  const rot = (name, text) => befunde.push({ stand: '🔴', punkt: name, text });
  const gelb = (name, text) => befunde.push({ stand: '🟡', punkt: name, text });

  const text = document.body.innerText;
  const html = document.body.innerHTML;

  const quellen = [];
  document.querySelectorAll('img').forEach((i) => {
    const u = i.currentSrc || i.src || '';
    if (u) quellen.push({ url: u, alt: i.alt || '', el: i });
  });
  document.querySelectorAll('*').forEach((e) => {
    const b = getComputedStyle(e).backgroundImage;
    if (b && b.startsWith('url')) quellen.push({ url: b.slice(4, -1).replace(/['"]/g, ''), alt: '', el: e });
  });
  const datei = (u) => u.split('/').pop().split('?')[0];
  const host = (u) => (u.split('/')[2] || '');
  const emoji = (u) => /^[0-9a-f]{4,6}(-[0-9a-f]{2,6})*\.png$/i.test(datei(u)); // Twemoji, auch mit -fe0f (Irlbacher ✉️ 18.10.2026)
  // Piktogramme aus Perspectives eigener Icon-Auswahl (Quiz-Antwortkarten) laufen über img.icons8.com.
  // Das sind Symbole wie Emojis, keine Stockfotos (Stimpfle 16.10.2026: einziger Rest-Rotpunkt war das Wannen-Icon der Startfrage).
  const piktogramm = (u) => emoji(u) || /(^|\.)icons8\.com$/i.test(host(u));

  // 1 — Logo ganz oben
  if (o.logo) {
    const logos = quellen
      .filter((q) => /logo/i.test(q.alt) || /logo/i.test(datei(q.url)))
      .map((q) => {
        const r = q.el.getBoundingClientRect();
        return { d: datei(q.url), y: Math.round(r.top + window.scrollY), b: Math.round(r.width) };
      })
      .filter((x) => x.b > 0);
    if (!logos.length) rot('Logo', 'Kein Logo auf der Seite gefunden.');
    else if (Math.min(...logos.map((l) => l.y)) > 400)
      rot('Logo', 'Logo steht erst bei y=' + Math.min(...logos.map((l) => l.y)) + 'px, nicht oben.');
    else ok('Logo', logos.map((l) => l.d + ' bei y=' + l.y).join(' · '));
  }

  // 2 — Perspective-Platzhalter und -Branding
  if (text.indexOf('We use Perspective') > -1) rot('Branding', '„We use Perspective" steht im Fuß. Fußzeile → Branding aus.');
  else ok('Branding', 'Kein Perspective-Abzeichen.');
  if (html.indexOf('5b1fb61590ac7500142cf383') > -1)
    rot('Platzhalter-Logo', 'Perspectives Standard-Logo (5b1fb615…) steckt noch drin.');

  // 3 — Impressum + Datenschutz auf die ECHTEN Seiten
  const links = [...document.querySelectorAll('a')].map((a) => ({
    t: a.textContent.trim(),
    h: a.getAttribute('href') || ''
  }));
  for (const pflicht of ['Impressum', 'Datenschutz']) {
    const l = links.find((x) => new RegExp(pflicht, 'i').test(x.t));
    if (!l) rot(pflicht, 'Fehlt im Fuß.');
    else if (/vorlage\.perspective\.co|platzhaltzer/i.test(l.h))
      rot(pflicht, 'Zeigt auf Perspectives Platzhalter: ' + l.h);
    else if (o.impressum && l.h.indexOf(o.impressum) < 0)
      rot(pflicht, 'Zeigt nicht auf ' + o.impressum + ', sondern auf ' + l.h);
    else ok(pflicht, l.h);
  }

  // 4 — Echte Kundenbilder, kein Stock, kein fremder Kunde
  // eigeneBilder: Perspective-Mediathek-IDs (imgix) mit belegter Herkunft (stand.md des Kunden), z. B. Startfrage-Fotos.
  const eigen = (u) => (o.eigeneBilder || []).some((id) => u.indexOf(id) > -1);
  const echte = quellen.filter((q) => (o.kunde && q.url.indexOf('/' + o.kunde + '/') > -1) || eigen(q.url));
  const fremd = quellen.filter(
    (q) => o.kunde && /funnels-assets/.test(q.url) && q.url.indexOf('/' + o.kunde + '/') < 0
  );
  const unbekannt = quellen.filter(
    (q) =>
      !piktogramm(q.url) &&
      !eigen(q.url) &&
      !/funnels-assets/.test(q.url) &&
      !/favicon|32x32/.test(datei(q.url)) &&
      !/logo/i.test(q.alt)
  );
  if (echte.length < o.bilderMin)
    rot('Kundenbilder', 'Nur ' + echte.length + ' echte Bilder von ' + o.kunde + ', mindestens ' + o.bilderMin + ' erwartet.');
  else ok('Kundenbilder', echte.length + ' echte Bilder: ' + [...new Set(echte.map((q) => datei(q.url)))].join(', '));
  if (fremd.length) rot('Fremdes Material', 'Bilder eines ANDEREN Kunden: ' + fremd.map((q) => q.url).join(', '));
  if (unbekannt.length)
    rot('Unbekannte Bilder', 'Herkunft ungeklärt (Stock?): ' + [...new Set(unbekannt.map((q) => host(q.url) + '/' + datei(q.url)))].join(', '));

  // 5 — Handlungsaufforderungen
  const ctas = [...new Set(
    [...document.querySelectorAll('button,[role=button],a')]
      .map((b) => b.textContent.trim())
      .filter((s) => s.length > 5 && s.length < 70 && !/Impressum|Datenschutz/i.test(s))
  )];
  if (ctas.length < o.ctaMin) rot('CTAs', 'Nur ' + ctas.length + ' Handlungsaufforderungen, mindestens ' + o.ctaMin + ' erwartet.');
  else ok('CTAs', ctas.join(' · '));

  // 6 — Nichts Erfundenes
  const verdacht = [
    [/\b\d{1,3}\s*(Bewertungen|Rezensionen)\b/i, 'Bewertungszahl'],
    [/\b[1-5],\d\s*(von\s*5|Sterne)/i, 'Sterne-Schnitt'],
    [/\b(über|mehr als)\s*\d{2,}\s*(Bäder|Projekte|Kunden)/i, 'Projektzahl'],
    [/\b\d{3,}\s*(€|EUR)\b/, 'Preisangabe'],
    [/\b(bis zu|bis)\s*\d{3,}\s*(€|EUR)\s*(Zuschuss|Förderung)/i, 'Zuschusshöhe']
  ];
  const treffer = verdacht.filter(([re]) => re.test(text)).map(([, n]) => n);
  if (treffer.length) rot('Unbelegte Angaben', 'Im Text gefunden: ' + treffer.join(', ') + ' — gegen das Briefing prüfen.');
  else ok('Unbelegte Angaben', 'Keine Bewertungen, Projektzahlen, Preise oder Zuschusshöhen im Text.');

  // 7 — Leere Sektionen / kaputte Bilder
  const kaputt = [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0);
  if (kaputt.length) rot('Bilder laden nicht', kaputt.map((i) => i.src).join(', '));
  else ok('Bilder laden', 'Alle Bilder geladen.');

  // 8 — Seitentitel
  if (!document.title || document.title.length < 10) rot('Seitentitel', 'Titel fehlt oder ist zu kurz: „' + document.title + '"');
  else ok('Seitentitel', document.title);

  // 9 — Logo steht zentriert (Noah, 20.09.2026: „soll immer zentriert sein")
  if (o.logo) {
    const l = quellen
      .filter((q) => /logo/i.test(q.alt) || /logo/i.test(datei(q.url)))
      .map((q) => q.el.getBoundingClientRect())
      .filter((r) => r.width > 0)
      .sort((a, b) => a.top - b.top)[0];
    if (l) {
      const mitte = l.left + l.width / 2;
      const soll = window.innerWidth / 2;
      if (Math.abs(mitte - soll) > 24)
        rot('Logo zentriert', 'Logo-Mitte bei ' + Math.round(mitte) + 'px, Seitenmitte bei ' + Math.round(soll) + 'px.');
      else ok('Logo zentriert', 'Abweichung ' + Math.round(Math.abs(mitte - soll)) + 'px.');
    }
  }

  // 10 — Kein dritter Ausgang: nie anrufen lassen
  const telLinks = [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href'));
  const anrufText = /ruf\s+(uns|mich)\s+an|jetzt\s+anrufen|telefonisch\s+melden|einfach\s+anrufen/i.exec(text);
  if (telLinks.length) rot('Anruf-Ausgang', 'Telefon-Link auf der Seite: ' + telLinks.join(', ') + ' — ein Funnel lässt weiter oder disqualifiziert.');
  else if (anrufText) rot('Anruf-Ausgang', 'Aufforderung zum Anruf im Text: „' + anrufText[0] + '"');
  else ok('Anruf-Ausgang', 'Kein Telefon-Ausgang.');

  // 11 — Keine Textwand (Noah, 20.09.2026: „ein Bildschirm, komplett nur Text")
  const absaetze = [...document.querySelectorAll('p,li')]
    .map((e) => ({ el: e, w: (e.innerText || '').trim().split(/\s+/).filter(Boolean).length }))
    .filter((x) => x.w > 25);
  if (absaetze.length)
    rot('Zu lange Absätze', absaetze.length + ' Absatz/Absätze über 25 Wörter: ' +
      absaetze.slice(0, 3).map((x) => '„' + x.el.innerText.trim().slice(0, 60) + '…" (' + x.w + ')').join(' · '));
  else ok('Absatzlänge', 'Kein Absatz über 25 Wörter.');

  // Bänder von je einer Bildschirmhöhe: jedes braucht einen sichtbaren Anker
  const hoehe = window.innerHeight || 800;
  const seite = document.body.scrollHeight;
  // Anker = Foto, Tabelle, Video ODER eine grosse Zahl (Zahlenkachel) — genau das,
  // was die Regel als Veranschaulichung zulaesst.
  // 🔴 Die Regel nennt vier Anker: Foto, Zahl, Tabelle, Zeitleiste. Der Pruefer muss alle
  // vier erkennen — sonst meldet er eine Zeitleiste mit CSS-Hintergrundfotos als "leer"
  // (passiert am 21.09.2026 an der Fischer-Zeitleiste und der Vergleichstabelle).
  const grossGenug = (e) => { const r = e.getBoundingClientRect(); return r.width > 60 && r.height > 60; };
  const grosseZahl = [...document.querySelectorAll('div,span,strong,p,h1,h2,h3')].filter((e) => {
    const t = (e.textContent || '').trim();
    if (!/^[~><]?\s*[0-9][0-9.,\s\u2013-]{0,12}(km|%|\u20ac|Jahre)?$/.test(t)) return false;
    return parseFloat(getComputedStyle(e).fontSize) >= 22;
  });
  const hintergrundbild = [...document.querySelectorAll('div,section,a,span')].filter((e) => {
    const b = getComputedStyle(e).backgroundImage;
    return b && b.startsWith('url') && !/data:image\/svg/.test(b) && grossGenug(e);
  });
  const raster = [...document.querySelectorAll('div,section')].filter((e) => {
    const c = getComputedStyle(e);
    if (c.display !== 'grid' && c.display !== 'table') return false;
    return e.children.length >= 4 && grossGenug(e);
  });
  // [data-anker]: Karten mit Piktogramm je Zeile zählen als Veranschaulichung (Noah 18.10.2026: „du kannst es ja
  // auch ohne fotos veranschaulichen!!“ — Stimpfle-Vergleich mit Icon-Kacheln war sonst Textwand-Fehlalarm).
  const anker = [
    ...[...document.querySelectorAll('img,svg,table,video,picture,[data-anker]')].filter(grossGenug),
    // Ein Formular (PLZ, Kontakt) ist selbst das Element des Bildschirms — keine Textwand (Stimpfle PLZ-Seite 18.10.2026).
    ...[...document.querySelectorAll('form')].filter((f) => f.querySelector('input:not([type=hidden]),textarea,select') && grossGenug(f)),
    ...grosseZahl,
    ...hintergrundbild,
    ...raster,
  ]
    .map((e) => e.getBoundingClientRect())
    .map((r) => [r.top + window.scrollY, r.bottom + window.scrollY]);
  const nurText = [];
  for (let y = 0; y + hoehe <= seite; y += hoehe) {
    const bis = y + hoehe;
    // Ein Anker zaehlt, wenn er mit mindestens 120 px in dieses Band ragt. Die fruehere
    // 70-%-Mitte-Regel schlug an Sektionsgrenzen falsch an (Fischer, 21.09.2026).
    // Ein kleinerer Anker (z. B. 112-px-Foto in einer Zeitleiste) zählt, wenn er ganz im Band liegt (Irlbacher 18.10.2026).
    const hat = anker.some(([a, b]) => Math.min(b, bis) - Math.max(a, y) >= Math.min(120, (b - a) * 0.9));
    const txt = document.elementsFromPoint ? '' : '';
    if (!hat) nurText.push(Math.round(y) + '–' + Math.round(bis) + 'px');
  }
  if (nurText.length)
    rot('Textwand', nurText.length + ' Bildschirmhöhe(n) ohne Bild, Tabelle oder Grafik: ' + nurText.join(', '));
  else ok('Veranschaulichung', 'Jede Bildschirmhöhe trägt einen sichtbaren Anker.');


  // Schatten-Fläche (box-shadow 0 0 0 100vmax, Stimpfle-/Fischer-Bauweise): das Element ist schmal, seine Farbe
  // läuft aber über die volle Fensterbreite. Ohne diese Erkennung meldete die Prüfung bei 1440 px Fehlalarme (Fischer 19.10.2026).
  const breitFlaeche = (e) => { const bs = getComputedStyle(e).boxShadow || ''; const m = bs.match(/0px 0px 0px (\d+(?:\.\d+)?)px/); return !!m && parseFloat(m[1]) >= window.innerWidth / 2; };
  // 12 — Button-Regel: der Block eines CTA trägt die Farbe der Sektion DARÜBER
  // (Hausregel seit Senftleben; am 21.09.2026 an allen drei Fischer-CTAs verletzt).
  const farbeVon = (e) => { let x = e; for (let i = 0; i < 12 && x; i++) { const c = getComputedStyle(x).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') return c; x = x.parentElement; } return 'transparent'; };
  const merkGeschr = window.scrollY;
  const schiefe = [];
  for (const b of [...document.querySelectorAll('button')].filter((b) => b.textContent.trim().length > 8)) {
    const y0 = b.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, y0 - 400));
    await new Promise((r) => setTimeout(r, 250));
    const r = b.getBoundingClientRect();
    const x = Math.round(r.left + r.width / 2);
    // Gemessen wird direkt über der Oberkante des CTA-BLOCKS (nicht 60 px über dem Knopf):
    // dort liegt der Rand der Sektion darüber. 60 px über dem Knopf traf bei Stimpfle (16.10.2026)
    // die unterste Karte der Sektion (#f7f8fd) statt der Sektionsfläche (#eef1fb) — Fehlalarm.
    let blockEl = b.parentElement;
    for (let i = 0; i < 12 && blockEl; i++) { const c = getComputedStyle(blockEl).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') break; blockEl = blockEl.parentElement; }
    const blockTop = blockEl ? blockEl.getBoundingClientRect().top : r.top;
    // Gemessen am linken Rand des CTA-Blocks (+4 px), nicht in der Mitte: in der Mitte liegt oft die unterste Karte
    // der Sektion (Irlbacher 18.10.2026: weiße Karte auf grauer Sektion → Fehlalarm), am Rand die Sektionsfläche.
    const xRand = Math.round((blockEl ? blockEl.getBoundingClientRect().left : r.left) + 4);
    const oben = document.elementFromPoint(xRand, Math.round(blockTop - 4));
    let soll = oben ? farbeVon(oben) : null;
    const bleedOben = document.elementsFromPoint(x, Math.round(blockTop - 4)).find((e) => breitFlaeche(e));
    if (bleedOben && (!oben || !bleedOben.contains(oben) && !oben.contains(bleedOben) || farbeVon(oben) === farbeVon(document.body))) soll = getComputedStyle(bleedOben).backgroundColor;
    // Kein farbiger Vorfahr = Seitenhintergrund (Formular-Knopf auf weißer Seite, Irlbacher Kontakt 18.10.2026).
    const istRoh = farbeVon(b.parentElement);
    const ist = istRoh === 'transparent' ? (getComputedStyle(document.body).backgroundColor === 'rgba(0, 0, 0, 0)' ? 'rgb(255, 255, 255)' : getComputedStyle(document.body).backgroundColor) : istRoh;
    if (soll && soll !== 'transparent' && soll !== ist)
      schiefe.push('„' + b.textContent.trim().slice(0, 28) + '" steht auf ' + ist + ', darüber ist ' + soll);
  }
  window.scrollTo(0, merkGeschr);
  if (schiefe.length) rot('Button-Regel', schiefe.join(' · '));
  else ok('Button-Regel', 'Jeder CTA-Block trägt die Farbe der Sektion darüber.');


  // 13 — Kein Spalt: ein dünner Streifen Seitenhintergrund zwischen einer farbigen
  // Sektion und dem farbigen Block darunter. Entsteht in Perspective durch den
  // Hintergrund-Abstand UNTEN am HTML-Block — die Farbe stimmt, trotzdem läuft eine helle
  // Naht durchs Bild. Noah, 21.09.2026: „bei der ersten Sektion ist noch ein kleiner Spalt
  // zwischen dem Blauen drin — beim Hintergrund muss man den Abstand unten auf 0 setzen."
  // Die Messung steht als window.funnelSpalt bereit, damit der Selbsttest sie an einem
  // gebauten Fall prüfen kann (test/spalt_selbsttest.js).
  const spalte = await window.funnelSpalt(document.body);
  window.scrollTo(0, merkGeschr);
  if (spalte.length) rot('Spalt vor dem CTA', spalte.join(' · ') + ' — Hintergrund-Abstand UNTEN am Block darüber auf 0 setzen.');
  else ok('Spalt vor dem CTA', 'Keine Naht zwischen Sektion und CTA-Block.');


  // 14 — Knopfabstände: oben 24–32 px, unten mindestens 64 px (Noah 18.10.2026, vorher 40–56), unten nie kleiner als oben, in 390 UND 1440 px.
  // Noah, 18.10.2026 (Fischer): „abstände unter den buttons sind oft noch zu gering und über den buttons
  // manchmal noch zu groß". Gemessen wird vom sichtbaren Inhalt (Text, Bild, Karte mit Fläche/Rahmen)
  // bis zur Knopfkante, nicht von Block zu Block. Knöpfe mit < 36 px Abstand zählen als eine Gruppe.
  const knopf = window.funnelKnopfAbstand(document);
  const knopfRot = knopf.filter((k) => k.fehler);
  if (knopfRot.length) rot('Knopfabstände', knopfRot.map((k) => '„' + k.knopf + '" oben ' + k.oben + ' / unten ' + k.unten + ' (' + k.fehler + ')').join(' · ') + ' — Soll oben 24–32, unten mindestens 64.');
  else ok('Knopfabstände', knopf.length + ' Knopfgruppe(n), oben 24–32 und unten mindestens 64 px.');
  const knopfSicht = knopf.filter((k) => k.sicht);
  if (knopfSicht.length) gelb('Knopfabstände', 'Neben fremdem iframe nicht messbar, Sichtprüfung: ' + knopfSicht.map((k) => '„' + k.knopf + '" (' + k.sicht + ')').join(' · '));


  // 15–20 — Badsanierungs-Standard (Noah 18.10.2026, Skill funnel-bauen Abschnitt „Badsanierungs-Standard“):
  // „Ich will mit diesen Dingern keine Arbeit mehr … speichere dir das wirklich als rote Regel, als Skill ab.“
  const std = await window.funnelStandard(document, o);
  for (const b of std) befunde.push(b);

  // 26–31 — Zusatzmessungen aus der Korrektur-Auswertung vom 19.10.2026 (Noah: „immer noch … alles mit den Abständen, mit den
  // Buttons, mit dem Zentrieren von Gesichtern“). Eine Regel ohne Messung kommt wieder.
  let bilder = [];
  if (o.zusatz !== false) {
    const sy0 = window.scrollY;
    const nahte = window.funnelNaht(document);
    if (nahte.length) rot('Naht zwischen Sektionen', nahte.map((n) => n.hoehe + ' px Seitenhintergrund bei y=' + n.y).join(' · ') + ' — Hintergrund-Abstand unten am Block darüber auf 0.');
    else ok('Naht zwischen Sektionen', 'Keine Naht zwischen farbigen Sektionen.');

    const ber = window.funnelBeruehrung(document);
    if (ber.length) rot('Bild/Karte ohne Luft', ber.slice(0, 5).map((b) => b.was + ' bei y=' + b.y + ' nur ' + b.luecke + ' px' + (b.text ? ' vor „' + b.text + '“' : '')).join(' · ') + ' — darunter Abstand wie im Raster.');
    else ok('Bild/Karte ohne Luft', 'Unter jedem Bild und jeder Karte steht Abstand.');

    const ras = window.funnelAbstandsraster(document);
    const grosse = ras.luecken.filter((l) => l.hoehe > 220), mittlere = ras.luecken.filter((l) => l.hoehe <= 220);
    // Überschrift→Inhalt-Spannweite bleibt GELB: Karten-Text (54 px) und Unterzeile (15 px) sind beide „Text“ — Probe an Fischer v6, 19.10.2026.
    const spG = ras.spann;
    if (grosse.length)
      rot('Abstandsraster', grosse.map((l) => 'Leerraum ' + l.hoehe + ' px bei y=' + l.y).join(' · ') + ' — leerer Abstandhalter oder doppeltes Padding, ein Raster je Seite.');
    else ok('Abstandsraster', 'Kein Leerraum über 220 px.');
    if (mittlere.length || spG.length) gelb('Abstandsraster', [...mittlere.map((l) => 'Leerraum ' + l.hoehe + ' px bei y=' + l.y), ...spG.map((x) => 'Überschrift→' + x.art + ' Spannweite ' + x.spannweite + ' px')].join(' · ') + ' — ansehen.');

    const kf = (document.documentElement.clientWidth <= 430) ? window.funnelKnopfform(document) : { fehler: [], gelb: [], anzahl: 0 };  // Regel gilt bei 390 (Fischer 19.10.: Desktop-Breiten nach Text = Fehlalarm)
    if (kf.fehler.length) rot('Knopfform', kf.fehler.join(' · ') + ' — alle CTA-Knöpfe gleich breit, mit Rand.');
    else ok('Knopfform', kf.anzahl + ' CTA-Knöpfe gleich groß, mit Rand links/rechts.');
    if (kf.gelb.length) gelb('Knopfform', kf.gelb.join(' · '));

    const alleMittig = [...document.querySelectorAll('h1,h2')].filter((h) => (h.innerText || '').trim() && !h.closest('[role=button],button,form')).every((h) => /center/.test(getComputedStyle(h).textAlign));
    const mi = window.funnelBildMittig(document, alleMittig);
    if (mi.length) rot('Bild mittig', mi.map((m) => '„' + m.was + '“ bei y=' + m.y + ' ' + m.abweichung + ' px neben der Mitte').join(' · ') + ' — Einzelbild in mittiger Spalte sitzt in der Fenstermitte.');
    else ok('Bild mittig', 'Einzelbilder in mittigen Spalten sitzen in der Fenstermitte.');

    window.scrollTo(0, sy0);
    bilder = await window.funnelBilder(document);
    const mitBild = bilder.filter((b) => !b.logo);
    if (mitBild.length) gelb('Gesichter', mitBild.length + ' Bilder erfasst (' + window.innerWidth + ' px) — Gesichtsprüfung läuft in funnel_abnahme_quittung.py (macOS Vision). Ohne sie gibt es keine Quittung und der Link bleibt gesperrt.');
  }

  const rote = befunde.filter((b) => b.stand === '🔴');
  console.table(befunde);
  console.log(rote.length ? '🔴 ' + rote.length + ' Punkt(e) offen — NICHT ausliefern.' : '🟢 Abnahme bestanden.');
  return { rot: rote.length, befunde, bilder, url: location.href, breite: window.innerWidth, hoehe: window.innerHeight };
};

/**
 * Misst die Naht über jedem CTA-Block: ein Streifen Seitenhintergrund zwischen einer
 * farbigen Sektion und dem farbigen Block darunter.
 *
 * 🔴 Gemessen wird in der MITTE des Buttons, nie über die volle Blockbreite: der CTA-Block
 * läuft randlos über das Fenster, die HTML-Sektion darüber steht in der Inhaltsspalte —
 * am Viertelpunkt misst man neben der Sektion und meldet jeden CTA falsch.
 * 🔴 Die Bedingung ist „Streifen = Seitenhintergrund", nicht „oben und unten gleich":
 * 40 px über der Kante sitzt oft eine Karte in einem anderen Ton — mit dem Gleichheits-
 * vergleich blieb der eingebaute Fehler am 21.09.2026 unentdeckt.
 * 🔴 Geprüft wird bis 12 px hinauf, nicht nur bis 6: Perspective vergibt 8 px, und der
 * nächste Schritt des Reglers sind 16 px.
 */
window.funnelSpalt = async function (wurzel) {
  const farbeVon = (e) => { let x = e; for (let i = 0; i < 12 && x; i++) { const c = getComputedStyle(x).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') return c; x = x.parentElement; } return 'transparent'; };
  const blockVon = (e) => { let x = e; for (let i = 0; i < 12 && x; i++) { const c = getComputedStyle(x).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') return x; x = x.parentElement; } return null; };
  const seitenBg = getComputedStyle(document.body).backgroundColor;
  const norm = (c) => (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)' ? seitenBg : c);
  const treffer = [];
  for (const b of [...(wurzel || document.body).querySelectorAll('button')].filter((b) => b.textContent.trim().length > 8)) {
    const y0 = b.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, y0 - 400));
    await new Promise((r) => setTimeout(r, 250));
    const br0 = b.getBoundingClientRect();
    const x = Math.round(br0.left + br0.width / 2);
    const blk = blockVon(b.parentElement) || b.parentElement;
    const br = blk.getBoundingClientRect();
    if (br.top < 60) continue; // Oberkante nicht im Bild — nicht messbar, nicht raten
    const meine = norm(getComputedStyle(blk).backgroundColor);
    if (meine === seitenBg) continue; // weißer CTA-Block — dort gibt es keine sichtbare Naht
    const farbeBei = (dy) => { const e = document.elementFromPoint(x, Math.round(br.top - dy)); return e ? norm(farbeVon(e)) : null; };
    const streifen = [2, 4, 6, 9, 12].map(farbeBei).some((c) => c === seitenBg);
    const darueber = farbeBei(40);
    if (streifen && darueber && darueber !== seitenBg)
      treffer.push('„' + b.textContent.trim().slice(0, 28) + '“ — Naht in ' + seitenBg + ' über dem Block in ' + meine);
  }
  return treffer;
};

/**
 * Misst je CTA-Knopf (bzw. Knopfgruppe) den Abstand zum sichtbaren Inhalt darüber und darunter.
 * Inhalt = Textzeilen, Bilder/Videos/Eingabefelder und Kästen mit eigener Fläche oder eigenem Rahmen
 * (Karten), NICHT die farbigen Sektionsflächen (.fx) und nicht Perspectives Rahmen-Divs (fun-*).
 * Der Fuß (Impressum/Datenschutz) zählt nicht als Inhalt unter dem letzten Knopf.
 * Grenzen: oben 24–32, unten 40–56, unten >= oben (je ±1 px Rundung).
 */
window.funnelKnopfAbstand = function (doc) {
  doc = doc || document;
  const win = doc.defaultView;
  const sy = win.scrollY;
  const vis = (el) => { const s = win.getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  // Fuß = Perspectives Rechtszeile („Impressum · Datenschutz"); sie hat kein <footer>, deshalb über den Text der Vorfahren.
  const istFuss = (el) => { let x = el; for (let i = 0; i < 5 && x; i++) { const t = (x.textContent || '').trim(); if (t.length < 60 && /impressum/i.test(t) && /datenschutz/i.test(t)) return true; x = x.parentElement; } return false; };
  const knoepfe = [...doc.querySelectorAll('button')].filter((b) => b.textContent.trim().length > 8 && b.offsetHeight > 30 && vis(b) && !b.closest('form'))
    .concat([...doc.querySelectorAll('.fx a')].filter((a) => { const s = win.getComputedStyle(a); return s.display === 'block' && parseFloat(s.borderTopWidth) > 0 && a.offsetHeight > 30; }));
  const rects = knoepfe.map((b) => { const r = b.getBoundingClientRect(); return { el: b, t: r.top + sy, u: r.bottom + sy, text: b.textContent.trim().slice(0, 30) }; })
    .sort((a, b) => a.t - b.t);
  const gruppen = [];
  for (const k of rects) { const g = gruppen[gruppen.length - 1]; if (g && k.t - g.u < 36) { g.u = Math.max(g.u, k.u); g.els.push(k.el); } else gruppen.push({ t: k.t, u: k.u, els: [k.el], text: k.text }); }
  const items = [];
  const tw = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    if (!n.textContent.trim()) continue;
    const p = n.parentElement;
    if (!p || !vis(p) || p.closest('button') || knoepfe.some((k) => k.contains(p))) continue;
    const r = doc.createRange(); r.selectNodeContents(n);
    for (const rc of r.getClientRects()) if (rc.height > 0 && rc.width > 0) items.push({ t: rc.top + sy, u: rc.bottom + sy, fuss: istFuss(p) });
  }
  doc.querySelectorAll('img,video,iframe,svg,input,textarea,select,div,span,section,a').forEach((e) => {
    if (!vis(e) || e.closest('button') || knoepfe.some((k) => k === e || k.contains(e))) return;
    const rc = e.getBoundingClientRect();
    if (rc.height < 8 || rc.width < 8) return;
    const tag = e.tagName;
    let bg = null;
    if (!/^(IMG|VIDEO|IFRAME|SVG|INPUT|TEXTAREA|SELECT)$/.test(tag)) {
      if ([...e.classList].some((c) => c.startsWith('fun-'))) return;
      // .fx-Hüllen (Fischer-Blöcke) zählen nur als randlose Sektion mit eigener Farbe, sonst nie (Fischer 18.10.2026:
      // dunkle Sektion 64 px unter dem Knopf wurde übersehen, gemessen wurde bis zur Überschrift = 126).
      if (e.classList.contains('fx') && !(rc.width > win.innerWidth * 0.98 && !['rgba(0, 0, 0, 0)', 'transparent'].includes(win.getComputedStyle(e).backgroundColor))) return;
      const bsK = win.getComputedStyle(e).boxShadow || ''; const mK = bsK.match(/0px 0px 0px (\d+(?:\.\d+)?)px/);
      const gross = rc.height > win.innerHeight * 1.5 || rc.width > win.innerWidth * 0.98 || (!!mK && parseFloat(mK[1]) >= win.innerWidth / 2);
      const s = win.getComputedStyle(e);
      // Fläche zählt nur, wenn sie sich vom Grund dahinter abhebt (Stimpfle 18.10.2026: weiße
      // Hülle auf weißer Seite endete genau am Knopf, gemessen 0, sichtbar 32).
      const leer = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
      let grund = 'rgb(255, 255, 255)';
      for (let a = e.parentElement; a; a = a.parentElement) { const c = win.getComputedStyle(a).backgroundColor; if (!leer(c)) { grund = c; break; } }
      const flaeche = !leer(s.backgroundColor) && s.backgroundColor !== grund;
      const rahmen = parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderBottomWidth) > 0;
      // „Gemessen am Bild“ (Noah 18.10.2026): eine randlose Sektion in ANDERER Farbe als das Knopf-Band ist
      // sichtbar der nächste Inhalt — ihre Kante zählt. Gleiche Farbe wie das Band = unsichtbar, zählt nicht (bg-Vergleich unten).
      // Randlose Sektion: zählt mit ihrer EIGENEN Farbe (auch Weiß auf weißer Seite — nach einem hellblauen Band ist das eine Kante).
      const eigen = !leer(s.backgroundColor);
      if (gross && !eigen) return;
      if (!gross && !flaeche && !rahmen) return;
      if (gross ? eigen : flaeche) bg = s.backgroundColor;
    }
    // Fremdes iframe (Perspective-Embed auf eigener Subdomain): sein Innenabstand ist von hier
    // nicht sichtbar, der Abstand zum Rahmen sagt nichts (Irlbacher 18.10.2026: gemessen 0, sichtbar ~26).
    let fremd = false;
    if (tag === 'IFRAME') { try { fremd = !e.contentDocument; } catch (x) { fremd = true; } }
    items.push({ t: rc.top + sy, u: rc.bottom + sy, fuss: istFuss(e), fremd, bg });
  });
  const bandVon = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const c = win.getComputedStyle(a).backgroundColor; if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c; } return 'rgb(255, 255, 255)'; };
  return gruppen.map((g, i) => {
    let oben = -1e9, unten = 1e9, oFremd = false, uFremd = false, fussT = 1e9;
    const band = bandVon(g.els[0]);
    for (const it of items) {
      if (it.bg && it.bg === band) continue; // Fläche in Bandfarbe ist keine sichtbare Kante
      if (it.u <= g.t + 1 && it.u > oben) { oben = it.u; oFremd = it.fremd; }
      if (!it.fuss && it.t >= g.u - 1 && it.t < unten) { unten = it.t; uFremd = it.fremd; }
      if (it.fuss && it.t >= g.u - 1 && it.t < fussT) fussT = it.t;
    }
    // Neben fremdem iframe ist der Wert nur eine Untergrenze (Innenabstand kommt dazu):
    // rot nur, wenn schon die Untergrenze zu groß ist, sonst Sichtprüfung.
    const o = oben < -1e8 ? null : Math.round(g.t - oben);
    // Letzter Knopf: Abstand zum Fuß gilt mit (Noah 18.10.2026: „auch der letzte vor dem Fuß“).
    const u = unten < 1e8 ? Math.round(unten - g.u) : fussT < 1e8 ? Math.round(fussT - g.u) : null;
    const f = [];
    if (o !== null && (o > 33 || (!oFremd && o < 23))) f.push('oben');
    if (u !== null && (u > 88 || (!uFremd && u < 64))) f.push('unten');
    if (o !== null && u !== null && !oFremd && !uFremd && u < o) f.push('unten < oben');
    oFremd = oFremd && !f.includes('oben'); uFremd = uFremd && !f.includes('unten');
    return { knopf: g.text, oben: o, unten: u, fehler: f.join(', '), sicht: [oFremd && 'oben', uFremd && 'unten'].filter(Boolean).join(', ') };
  });
};

/**
 * Badsanierungs-Standard (Noah 18.10.2026) — die messbaren roten Punkte aus dem Skill funnel-bauen.
 *   15 Startfrage:      Startseite zeigt als erste Frage genau ZWEI Bildkarten, ganz im ersten Bildschirm (390×844).
 *   16 Kartenlabels:    alle Antwortkarten einer Frage haben gleich viele Zeilen und sind gleich hoch.
 *   17 Eigentümer-Frage: keine Quizfrage mit „gehört …“/„Wem gehört“/„Eigentümer“ (Seite + alle Quiz-Seiten des Funnels).
 *   18 Vertrauensleiste: jeder Eintrag steht in EINER Zeile, die Leiste bricht nicht in zwei Reihen um.
 *   19 Knopftext:       höchstens 4 seriöse Varianten, keine aus der Sperrliste, jede einzeilig bei 390 (Noah 18.10.2026).
 * Rückgabe: Liste {stand, punkt, text} wie funnelAbnahme. Selbsttest: system/apps/funnel-check/test/standard_selbsttest.py
 */
window.funnelStandard = async function (doc, o) {
  doc = doc || document;
  o = Object.assign({ standard: true, knopfText: 'Jetzt unverbindlich anfragen', startseite: null, handyHoehe: 844, alleSeiten: true }, o || {});
  const out = [];
  const ok = (p, t) => out.push({ stand: '🟢', punkt: p, text: t });
  const rot = (p, t) => out.push({ stand: '🔴', punkt: p, text: t });
  const gelb = (p, t) => out.push({ stand: '🟡', punkt: p, text: t });
  if (o.standard === false) return out;
  const win = doc.defaultView;
  const sy = () => win.scrollY;
  const vis = (el) => { const s = win.getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 0 && r.height > 0; };
  const nurSymbol = (t) => !/[\p{L}\p{N}]/u.test(t);
  // Zeilen eines Elements = verschiedene Oberkanten seiner Textzeilen (Emoji-/Symbolknoten zählen nicht).
  const zeilen = (el) => {
    const tops = [];
    const tw = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      if (!n.textContent.trim() || nurSymbol(n.textContent)) continue;
      if (n.parentElement && !vis(n.parentElement)) continue;
      const r = doc.createRange(); r.selectNodeContents(n);
      for (const rc of r.getClientRects()) if (rc.width > 1 && rc.height > 1 && !tops.some((t) => Math.abs(t - rc.top) < rc.height * 0.5)) tops.push(rc.top);
    }
    return tops.length;
  };
  const piktogramm = (u) => /^[0-9a-f]{4,6}(-[0-9a-f]{2,6})*\.png$/i.test((u.split('/').pop() || '').split('?')[0]) || /icons8\.com|twemoji|emoji/i.test(u);
  const hatFoto = (el) => [...el.querySelectorAll('img')].some((i) => { const r = i.getBoundingClientRect(); return r.width >= 80 && r.height >= 60 && !piktogramm(i.currentSrc || i.src || ''); })
    || [...el.querySelectorAll('*')].some((e) => { const b = win.getComputedStyle(e).backgroundImage; const r = e.getBoundingClientRect(); return b && b.startsWith('url') && r.width >= 80 && r.height >= 60 && !piktogramm(b); });

  // ── Antwortkarten-Gruppen (Perspective: div[role=button] je Antwort) ──
  const karten = [...doc.querySelectorAll('div[role=button]')].filter((c) => vis(c) && c.offsetHeight > 30 && !c.parentElement.closest('[role=button]'));
  const gruppen = new Map();
  for (const c of karten) {
    let a = c.parentElement;
    for (let i = 0; i < 8 && a && karten.filter((k) => a.contains(k)).length < 2; i++) a = a.parentElement;
    if (!a) a = c.parentElement;
    if (!gruppen.has(a)) gruppen.set(a, []);
    gruppen.get(a).push(c);
  }
  const liste = [...gruppen.entries()].map(([wurzel, ks]) => ({ wurzel, ks, top: Math.min(...ks.map((k) => k.getBoundingClientRect().top + sy())) }))
    .sort((a, b) => a.top - b.top);
  const label = (k) => k.innerText.split('\n').map((s) => s.trim()).filter((s) => s && !nurSymbol(s)).join(' ').slice(0, 40);

  // 15 — Startfrage
  let start = o.startseite;
  if (start === null || start === undefined) {
    const teile = win.location.pathname.split('/').filter(Boolean);
    const letzter = teile[teile.length - 1] || '';
    start = teile.length <= 1 || /^startseite$/i.test(letzter); // Variante B direkt geladen: startseite:true mitgeben
  }
  if (start) {
    const g = liste[0];
    const handy = win.innerWidth <= 430;
    if (!g) rot('Startfrage', 'Keine Startfrage mit Antwortkarten auf der Startseite.');
    else {
      const f = [];
      if (g.ks.length !== 2) f.push(g.ks.length + ' Antworten statt 2');
      const ohne = g.ks.filter((k) => !hatFoto(k));
      if (ohne.length) f.push('ohne Foto: ' + ohne.map(label).join(', '));
      const unten = Math.round(Math.max(...g.ks.map((k) => k.getBoundingClientRect().bottom + sy())));
      if (handy && unten > o.handyHoehe) f.push('Karten enden bei ' + unten + ' px, erster Bildschirm endet bei ' + o.handyHoehe);
      if (f.length) rot('Startfrage', f.join(' · ') + ' — Soll: genau 2 Bildkarten mit Action-Fotos, ohne Scrollen sichtbar.');
      else ok('Startfrage', '2 Bildkarten (' + g.ks.map(label).join(' / ') + ')' + (handy ? ', Unterkante ' + unten + ' px ≤ ' + o.handyHoehe : '') + '. Fotoart (Action, keine Porträts/Bäder) per Auge prüfen.');
      if (!handy) gelb('Startfrage', 'Erster Bildschirm nur bei 390×844 messbar (jetzt ' + win.innerWidth + '×' + win.innerHeight + ').');
    }
  }

  // 16 — Kartenlabels gleich lang (Zeilen) und Karten gleich hoch, je Frage
  const schief = [];
  for (const g of liste) {
    if (g.ks.length < 2) continue;
    const z = g.ks.map((k) => zeilen(k));
    const h = g.ks.map((k) => Math.round(k.getBoundingClientRect().height));
    if (Math.max(...z) !== Math.min(...z)) schief.push(g.ks.map((k, i) => '„' + label(k) + '" ' + z[i] + ' Z.').join(' / '));
    else if (Math.max(...h) - Math.min(...h) > 2) schief.push('Höhen ' + h.join('/') + ' px: ' + g.ks.map(label).join(' / '));
  }
  if (!liste.length) ok('Kartenlabels', 'Keine Antwortkarten auf dieser Seite.');
  else if (schief.length) rot('Kartenlabels', schief.join(' · ') + ' — Labels gleich lang (gleiche Zeilenzahl bei 390), Karten gleich hoch.');
  else ok('Kartenlabels', liste.length + ' Frage(n), Labels je Frage gleiche Zeilenzahl, Karten gleich hoch.');

  // 17 — Keine Eigentümer-Frage (Noah 18.10.2026: „wie bei Sussmann“)
  const eigRe = /wem\s+geh(ö|\\u00f6)rt|geh(ö|\\u00f6)rt\s+(dir|euch|ihnen|die\s+immobilie|das\s+haus)|eigent(ü|\\u00fc)mer|bist\s+du\s+(der\s+)?eigent/i;
  const eigFunde = [];
  // 21 — Leistungsfrage („Was möchtest du machen lassen?“ / „Was soll in/an deinem Bad passieren?“) hat IMMER „Sonstiges“,
  // und das Raster bleibt voll (letzte Reihe so voll wie die erste). Noah 19.10.2026 (Fischer):
  // „Was möchtest du machen lassen? Sonstiges kannst du da noch hinzufügen“.
  const lsRe = /was\s+(m(ö|oe)chtest|willst)\s+du\s+machen\s+lassen|was\s+soll\s+(in|an)\s+deinem\s+bad\s+passieren|was\s+(m(ö|oe)chtest|planst)\s+du\s+(an|in|bei)\s+deinem|welche\s+leistung/i;
  const sonstRe = /sonstig|etwas\s+anderes|was\s+anderes|anderes\s+anliegen/i;
  const lsDaten = [];
  // Fragentitel = Text der NÄCHSTEN Vorfahren-Ebene, die außer den Karten noch Text trägt (nie die ganze Seite).
  // Reihenfolge je Ebene: eigener Text neben den Karten, dann die vorigen Geschwister (Titel steht über den Karten).
  const frageText = (g) => {
    let w = g.wurzel;
    for (let i = 0; i < 5 && w && w !== doc.body; i++, w = w.parentElement) {
      let t = w.innerText || '';
      for (const k of g.ks) t = t.replace(k.innerText || '', ' ');
      if (/[\p{L}]{3}/u.test(t)) return t.replace(/\s+/g, ' ').trim();
      let s = w.previousElementSibling;
      for (let j = 0; j < 3 && s; j++, s = s.previousElementSibling) if (vis(s) && /[\p{L}]{3}/u.test(s.innerText || '')) return s.innerText.replace(/\s+/g, ' ').trim();
    }
    return '';
  };
  for (const g of liste) {
    let w = g.wurzel; for (let i = 0; i < 3 && w.parentElement; i++) w = w.parentElement;
    const t = (w.innerText || '');
    const m = eigRe.exec(t);
    if (m) eigFunde.push('diese Seite: „' + t.slice(Math.max(0, m.index - 20), m.index + 40).replace(/\s+/g, ' ').trim() + '“');
  }
  if (o.alleSeiten && /perspectivefunnel|perspective\.co/.test(win.location.host + (win.location.href || ''))) {
    try {
      const e = win.performance.getEntriesByType('resource').map((x) => x.name).find((n) => /\/data\/layoutData\.json/.test(n));
      if (e) {
        const basis = e.split('/data/')[0];
        const v = (e.split('v=')[1] || '').split('&')[0];
        const ld = await fetch(e).then((r) => r.json());
        // Nur Seiten, die ein Besucher erreichen kann (Start + Varianten, dann jede Verlinkung bzw. „nächste Seite“).
        // Eine verwaiste Seite mit Eigentümer-Frage ist gelb (löschen), nicht rot — sie sieht kein Besucher.
        const seiten = {};
        for (const p of ld.pages || []) {
          if (p.isResultPage) continue;
          const r = await fetch(basis + '/data/pages/' + p.slug + '.json' + (v ? '?v=' + v : ''));
          if (r.ok) { const j = await r.json(); seiten[j.pageId || p.slug] = { slug: p.slug, j, start: !!p.isHomePage }; }
        }
        const erreicht = new Set(Object.keys(seiten).filter((id) => seiten[id].start));
        const schlange = [...erreicht];
        while (schlange.length) {
          const { j } = seiten[schlange.shift()];
          const s = JSON.stringify(j.components || []);
          for (const m of s.matchAll(/"linking":\{([^}]*)\}/g)) {
            const pid = (/"pageId":"([0-9a-f]{24})"/.exec(m[1]) || [])[1] || (/"isInternal":true/.test(m[1]) ? j.nextPage : null);
            if (pid && seiten[pid] && !erreicht.has(pid)) { erreicht.add(pid); schlange.push(pid); }
          }
        }
        // 21 (Daten) — Leistungsfrage auf jeder erreichbaren Seite: Antwort „Sonstiges“ vorhanden (Noah 19.10.2026).
        const lsWalk = (cs, slug) => {
          for (const c of cs || []) {
            const titel = (c.content && c.content.plainText) || '';
            if (/^question/i.test(c.name || '') && !/answer/i.test(c.name || '') && lsRe.test(titel)) {
              const antw = (c.components || []).filter((x) => /answer/i.test(x.name || '')).map((x) => (x.content && x.content.plainText) || '');
              if (antw.length >= 2 && !antw.some((a) => sonstRe.test(a))) lsDaten.push(slug + ': „' + titel + '“ (' + antw.join(' · ') + ')');
            }
            lsWalk(c.components, slug);
          }
        };
        for (const [id, { slug, j }] of Object.entries(seiten)) if (erreicht.has(id)) lsWalk(j.components, slug);
        for (const [id, { slug, j }] of Object.entries(seiten)) {
          const s = JSON.stringify(j.components || []);
          const m = eigRe.exec(s);
          if (!m) continue;
          const stelle = slug + ': „' + s.slice(m.index, m.index + 40).replace(/<[^>]*>|\\[nrt"]/g, ' ').replace(/\s+/g, ' ').trim() + '“';
          if (erreicht.has(id)) eigFunde.push(stelle);
          else gelb('Eigentümer-Frage', 'Verwaiste Seite (kein Weg dorthin) trägt noch die Frage — ' + stelle + ' — im Editor löschen.');
        }
      } else gelb('Eigentümer-Frage', 'layoutData.json nicht gefunden — nur diese Seite geprüft.');
    } catch (x) { gelb('Eigentümer-Frage', 'Andere Seiten nicht lesbar (' + x.message + ') — nur diese Seite geprüft.'); }
  }
  // 20 — Erste Inhaltsfrage nach Muster, nie „Worum geht es bei dir?“ (Noah 18.10.2026)
  if (/worum geht es bei dir/i.test(doc.body.innerText)) rot('Erste Inhaltsfrage', '„Worum geht es bei dir?“ — Muster: „Was soll in/an deinem Bad passieren?“');
  if (eigFunde.length) rot('Eigentümer-Frage', [...new Set(eigFunde)].join(' · ') + ' — keine Eigentümer-Frage im Quiz (wie Sussmann).');
  else ok('Eigentümer-Frage', 'Keine Frage nach Eigentum/„gehört dir“.');

  // 18 — Vertrauensleiste: jeder Eintrag eine Zeile, keine zweite Reihe (oberer Bereich, 1,5 Bildschirme)
  const grenze = win.innerHeight * 1.5;
  const leisten = [];
  doc.querySelectorAll('[data-leiste], div, ul, p').forEach((e) => {
    if (!vis(e) || e.closest('[role=button],button')) return;
    const top = e.getBoundingClientRect().top + sy();
    if (top > grenze) return;
    if (e.hasAttribute('data-leiste')) { leisten.push({ e, eintraege: [...e.children].filter(vis) }); return; }
    const s = win.getComputedStyle(e);
    const kids = [...e.children].filter(vis);
    if ((s.display === 'flex' || s.display === 'grid') && kids.length >= 3 && kids.every((k) => { const t = (k.innerText || '').trim(); return t.length >= 3 && t.length <= 45 && !k.querySelector('img[width], h1, h2, h3') && k.getBoundingClientRect().height < 70 && !/\n/.test(t); })
      && kids.every((k) => k.children.length <= 3) && !e.closest('[data-leiste]')) leisten.push({ e, eintraege: kids });
  });
  const lFehler = [];
  for (const { e, eintraege } of leisten) {
    const mehr = eintraege.filter((k) => zeilen(k) > 1).map((k) => '„' + k.innerText.trim().slice(0, 30) + '" ' + zeilen(k) + ' Z.');
    const s = win.getComputedStyle(e);
    const reihe = s.display === 'grid' ? false : !/column/.test(s.flexDirection);
    const tops = [...new Set(eintraege.map((k) => Math.round(k.getBoundingClientRect().top / 4)))];
    if (mehr.length) lFehler.push('Eintrag umgebrochen: ' + mehr.join(', '));
    // Noah 18.10.2026: Kurzzeilen ohne Vorwissen verständlich, mit Nutzen — keine Abgrenzung („Kein Callcenter“), keine Kürzel.
    for (const k of eintraege) {
      const t = (k.innerText || '').trim();
      if (/(^|\s)kein(e|en)?\s/i.test(t)) lFehler.push('Abgrenzung statt Nutzen: „' + t + '“');
      else if (/(ca\.|~|≈|\bSHK\b)/.test(t)) gelb('Vertrauensleiste', 'Kürzel prüfen (ohne Vorwissen verständlich?): „' + t + '“');
    }
    if (reihe && tops.length > 1) lFehler.push('Leiste „' + eintraege.map((k) => k.innerText.trim().slice(0, 18)).join(' · ') + '" bricht in ' + tops.length + ' Reihen um');
  }
  if (lFehler.length) rot('Vertrauensleiste', lFehler.join(' · ') + ' — kürzer oder kleiner, eine Zeile bei 390.');
  else if (start && !leisten.length) gelb('Vertrauensleiste', 'Keine Leiste erkannt (Tipp: data-leiste an den Container) — Sichtprüfung.');
  else ok('Vertrauensleiste', leisten.length ? leisten.length + ' Leiste(n), jeder Eintrag einzeilig, keine zweite Reihe.' : 'Keine Leiste auf dieser Seite.');

  // 19 — Knopftexte (Noah 18.10.2026, ersetzt „nur ein Knopftext“): höchstens 4 seriöse, zum Abschnitt passende Varianten
  // („Jetzt unverbindlich anfragen“, „Kostenlose Beratung anfragen“, „Termin vor Ort anfragen“ …), jede EINZEILIG bei 390,
  // keine aus der Sperrliste (Spielereien wie „Passt für mich“), keine Chips wie „Schnellster Weg“.
  const norm = (t) => t.replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const knoepfe19 = [...doc.querySelectorAll('button')].filter((b) => vis(b) && b.offsetHeight > 30 && !b.closest('form') && !/^(open chat|dismiss|schließen)$/i.test(b.textContent.trim()));
  // Hauptzeile = kleinstes Element, das genau die erste Textzeile trägt (Unterzeile „Dauert keine 60 Sekunden“ zählt nicht mit).
  const haupt = (b) => { const erste = ((b.innerText || '').split('\n').map((x) => x.trim()).find((x) => x && !nurSymbol(x)) || ''); const k = [...b.querySelectorAll('*')].filter((e) => { const t = (e.innerText || '').trim(); return t.includes(erste) && t.length <= erste.length + 4; }); return k.length ? k.reduce((m, e) => (e.contains(m) ? m : m.contains(e) ? e : m)) : b; };
  const ctas = knoepfe19.map((b) => ({ b, t: ((b.innerText || b.textContent).split('\n').map((s) => s.trim()).find((s) => s && !nurSymbol(s)) || '') })).filter((x) => x.t.length > 3);
  const texte = [...new Set(ctas.map((x) => norm(x.t)))];
  const sperre = /passt f(ü|u)r mich|klingt nach mir|genau mein problem|schritt 1 starten|endlich anfragen|ich will so eine|los geht|schnellster weg/i;
  const kFehler = [];
  const maxV = o.knopfVarianten || 4;
  if (texte.length > maxV) kFehler.push(texte.length + ' Varianten (max. ' + maxV + '): ' + [...new Set(ctas.map((x) => x.t))].join(' · '));
  const gesperrt = ctas.filter((x) => sperre.test(x.t)).map((x) => '„' + x.t + '“');
  if (gesperrt.length) kFehler.push('Sperrliste: ' + [...new Set(gesperrt)].join(', '));
  const chip = /schnellster weg|passt f(ü|u)r mich|klingt nach mir|genau mein problem/i.exec(doc.body.innerText);
  if (chip && !gesperrt.length) kFehler.push('verspielte Variante/Chip im Text: „' + chip[0] + '“');
  if (win.innerWidth <= 430) {
    const zwei = ctas.filter((x) => zeilen(haupt(x.b)) > 1).map((x) => '„' + x.t + '“');
    if (zwei.length) kFehler.push('nicht einzeilig bei 390: ' + [...new Set(zwei)].join(', '));
  }
  if (o.knopfText && texte.length && !texte.includes(norm(o.knopfText))) gelb('Knopftext', 'Grundtext „' + o.knopfText + '“ kommt nicht vor — gewollt?');
  if (kFehler.length) rot('Knopftext', kFehler.join(' · '));
  else ok('Knopftext', ctas.length ? ctas.length + ' Knöpfe, ' + texte.length + ' Variante(n): ' + [...new Set(ctas.map((x) => x.t))].join(' · ') : 'Keine CTA-Knöpfe auf dieser Seite.');

  // 21 — Leistungsfrage hat „Sonstiges“, Raster bleibt voll (Noah 19.10.2026). Diese Seite (DOM) + erreichbare Seiten (Daten, oben).
  const lsFehler = [...lsDaten];
  let lsGefunden = lsDaten.length;
  for (const g of liste) {
    if (g.ks.length < 2 || !lsRe.test(frageText(g))) continue;
    lsGefunden++;
    const labels = g.ks.map(label);
    if (!labels.some((l) => sonstRe.test(l))) lsFehler.push('„' + frageText(g).slice(0, 50) + '“ ohne „Sonstiges“ (' + labels.join(' · ') + ')');
    const reihen = [];
    for (const k of g.ks) { const t = Math.round(k.getBoundingClientRect().top); const r = reihen.find((x) => Math.abs(x.t - t) < 8); if (r) r.n++; else reihen.push({ t, n: 1 }); }
    reihen.sort((a, b) => a.t - b.t);
    if (win.innerWidth <= 430 && reihen.length > 1 && reihen[reihen.length - 1].n < reihen[0].n) lsFehler.push('Raster nicht voll: ' + reihen.map((r) => r.n).join('/') + ' Karten je Reihe bei ' + win.innerWidth + ' px');
  }
  if (lsFehler.length) rot('Leistungsfrage', lsFehler.join(' · ') + ' — Soll: Antwort „Sonstiges“ immer dabei, letzte Reihe voll (3+1 oder 5+1 statt 4+1).');
  else ok('Leistungsfrage', lsGefunden ? lsGefunden + ' Leistungsfrage(n) mit „Sonstiges“, Raster voll.' : 'Keine Leistungsfrage auf dieser Seite.');

  // 22 — Gleiche Bildart je Frage: alle Karten mit Foto oder keine (Noah 15.10.2026: „nicht solche diskrepanzen … links ein teamfoto“).
  const gemischt = liste.filter((g) => g.ks.length >= 2).filter((g) => { const f = g.ks.map(hatFoto); return f.some(Boolean) && !f.every(Boolean); })
    .map((g) => g.ks.map((k) => label(k) + (hatFoto(k) ? ' [Foto]' : ' [ohne]')).join(' / '));
  if (gemischt.length) rot('Bildart je Frage', gemischt.join(' · ') + ' — eine Frage: alle Karten Foto ODER alle Icon/Emoji.');
  else ok('Bildart je Frage', liste.length ? 'Je Frage einheitliche Bildart.' : 'Keine Antwortkarten auf dieser Seite.');

  // 23 — Wörter vor der Startfrage ≤ 40 (Regel eine-funnel-seite-verkauft-mit, Noah 20.09.2026), gemessen bis Oberkante der Startfrage-Karten.
  if (start && liste[0]) {
    const oben = liste[0].top;
    let worte = 0;
    const tw = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const t = n.textContent.trim();
      if (!t || nurSymbol(t) || !n.parentElement || !vis(n.parentElement) || n.parentElement.closest('script,style,[role=button]')) continue;
      const r = doc.createRange(); r.selectNodeContents(n); const rc = r.getBoundingClientRect();
      if (rc.height && rc.bottom + sy() <= oben + 2) worte += t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    }
    if (worte > 45) rot('Wörter vor Startfrage', worte + ' Wörter über den Startfrage-Karten — höchstens rund 40.');
    else if (worte > 40) gelb('Wörter vor Startfrage', worte + ' Wörter — Grenze rund 40, kürzen prüfen.');
    else ok('Wörter vor Startfrage', worte + ' Wörter über den Startfrage-Karten (≤ 40).');
  }

  // 24 — Ausrichtung einheitlich: alle Überschriften (h1/h2) mittig ODER alle linksbündig (Noah 18.10.2026 Fischer:
  // „‚Seit 1988 in Chemnitz‘ … linksbündig, obwohl das oben mittig ist“).
  const ausr = {};
  doc.querySelectorAll('h1, h2').forEach((h) => {
    if (!vis(h) || h.closest('[role=button],button,form') || !(h.innerText || '').trim()) return;
    // Kartentitel zählen nicht: Überschrift in einer gerundeten Karte (Hintergrund oder Bild), schmaler als die Seite —
    // sie steht bündig über ihrem Kartentext (Fischer 19.10.: „Eigene Monteure aus Chemnitz“ in Bildkarte = Fehlalarm).
    let k = h.parentElement, karte = false;
    for (let i = 0; i < 5 && k && k !== doc.body; i++, k = k.parentElement) {
      const ks = win.getComputedStyle(k);
      if (parseFloat(ks.borderTopLeftRadius) >= 8 && k.getBoundingClientRect().width < doc.documentElement.clientWidth * 0.97
          && (!/rgba\(0, 0, 0, 0\)|transparent/.test(ks.backgroundColor) || k.querySelector('img'))) { karte = true; break; }
    }
    if (karte) return;
    let a = win.getComputedStyle(h).textAlign;
    a = /center/.test(a) ? 'mittig' : /right|end/.test(a) && win.getComputedStyle(h).direction !== 'rtl' ? 'rechts' : 'links';
    (ausr[a] = ausr[a] || []).push((h.innerText || '').trim().slice(0, 30));
  });
  const arten = Object.keys(ausr);
  if (arten.length > 1) rot('Ausrichtung', arten.map((a) => a + ': ' + ausr[a].map((t) => '„' + t + '“').join(', ')).join(' · ') + ' — Überschriften auf der ganzen Seite gleich ausrichten.');
  else ok('Ausrichtung', arten.length ? 'Alle Überschriften ' + arten[0] + '.' : 'Keine Überschriften auf dieser Seite.');

  // 25 — Jeder CTA-Knopf sitzt mittig (Noah 21.09.2026: „oben bei dem Button hast du ihn immer noch nicht zentriert“).
  // Funnel-Knöpfe stehen in randlosen Blöcken: Knopfmitte = Fenstermitte (± 4 px). Formular-Knöpfe zählen nicht.
  const fm = doc.documentElement.clientWidth / 2;
  const schiefK = ctas.filter((x) => { const r = x.b.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - fm) > 4; })
    .map((x) => { const r = x.b.getBoundingClientRect(); return '„' + x.t + '“ ' + Math.round(r.left + r.width / 2 - fm) + ' px'; });
  if (schiefK.length) rot('Knopf mittig', [...new Set(schiefK)].join(', ') + ' neben der Mitte — jeder Knopf gemessen mittig.');
  else ok('Knopf mittig', ctas.length ? ctas.length + ' Knöpfe mittig (± 4 px).' : 'Keine CTA-Knöpfe auf dieser Seite.');

  return out;
};

/**
 * Bildgeometrie für die Gesichtsprüfung (Noah 18./19.10.2026: „das Bild von Bettina ist nicht zentriert“, „zwei Bilder,
 * wo niemand in die Kamera schaut“, „da sind die Bilder abgeschnitten“). Der Browser kann keine Gesichter finden —
 * er liefert je Bild (<img> UND CSS-background, auch in HTML-Blöcken) die GEZEICHNETE Lage (object-fit/-position bzw.
 * background-size/-position umgerechnet) und den SICHTBAREN Ausschnitt (Rahmen ∩ overflow:hidden-Vorfahren, Kreis/Ellipse
 * bei border-radius ≥ 45 %). Die Gesichter findet system/scripts/funnel_gesichter_pruefen.py (macOS Vision) und rechnet
 * beides gegeneinander. Alle Maße in Seiten-Pixeln des gemessenen Fensters (390 UND 1440 getrennt messen).
 */
window.funnelBilder = async function (doc) {
  doc = doc || document;
  const win = doc.defaultView;
  const sx = win.scrollX, sy = win.scrollY;
  const px = (v) => parseFloat(v) || 0;
  const splitTop = (s) => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
  const urlVon = (s) => { const m = /^url\((['"]?)(.*)\1\)$/.exec(s || ''); return m ? m[2] : null; };
  const laden = (u) => new Promise((res) => { const i = new win.Image(); const t = setTimeout(() => res(null), 4000); i.onload = () => { clearTimeout(t); res(i); }; i.onerror = () => { clearTimeout(t); res(null); }; i.src = u; });
  const datei = (u) => u.split('/').pop().split('?')[0];
  const piktogramm = (u) => /^[0-9a-f]{4,6}(-[0-9a-f]{2,6})*\.png$/i.test(datei(u)) || /icons8\.com|twemoji/i.test(u) || /^data:image\/svg/.test(u) || /\.svg(\?|$)/i.test(u);
  const tokenWert = (t, frei) => { t = (t || '50%').trim(); const k = { left: '0%', top: '0%', center: '50%', right: '100%', bottom: '100%' }[t]; if (k) t = k; return t.endsWith('%') ? frei * parseFloat(t) / 100 : px(t); };
  const posVon = (str, frei) => { const t = (str || '50% 50%').trim().split(/\s+/); return [tokenWert(t[0], frei[0]), tokenWert(t[1] || '50%', frei[1])]; };
  const sichtbar = (e) => { const s = win.getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.05; };
  const rundVon = (e, r) => { const cs = win.getComputedStyle(e); if (/^(circle|ellipse)/.test(cs.clipPath || '')) return true; const t = cs.borderTopLeftRadius || '0px'; const v = px(t); const klein = Math.min(r.width, r.height); const rad = /%/.test(t) ? v / 100 * r.width : v; return klein > 0 && rad >= 0.45 * klein; };
  const schnitt = (a, b) => { const x0 = Math.max(a[0], b[0]), y0 = Math.max(a[1], b[1]), x1 = Math.min(a[0] + a[2], b[0] + b[2]), y1 = Math.min(a[1] + a[3], b[1] + b[3]); return x1 > x0 && y1 > y0 ? [x0, y0, x1 - x0, y1 - y0] : [x0, y0, 0, 0]; };
  const abs = (r) => [r.left + sx, r.top + sy, r.width, r.height];
  const r1 = (a) => a.map((v) => Math.round(v * 10) / 10);

  // Karten-Gruppen (Perspective-Antwortkarten) wie in funnelStandard — Gruppe 0 = erste Frage der Seite
  const karten = [...doc.querySelectorAll('div[role=button]')].filter((c) => sichtbar(c) && c.offsetHeight > 30 && !c.parentElement.closest('[role=button]'));
  const gruppen = new Map();
  for (const c of karten) { let a = c.parentElement; for (let i = 0; i < 8 && a && karten.filter((k) => a.contains(k)).length < 2; i++) a = a.parentElement; if (!a) a = c.parentElement; if (!gruppen.has(a)) gruppen.set(a, []); gruppen.get(a).push(c); }
  const gListe = [...gruppen.entries()].map(([w, ks]) => ({ ks, top: Math.min(...ks.map((k) => k.getBoundingClientRect().top + sy)) })).sort((a, b) => a.top - b.top);
  const karteIdx = (el) => { const k = el.closest('div[role=button]'); if (!k) return null; const i = gListe.findIndex((g) => g.ks.some((x) => x === k || x.contains(k))); return i < 0 ? null : i; };

  const aus = [];
  const cache = {};
  const beschreibe = (el) => (el.getAttribute && (el.getAttribute('alt') || '')) || ((el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/)[0] : '') || el.tagName.toLowerCase());

  const clipVon = (el, start) => {
    let s = start, ellipse = null;
    const eigene = el.getBoundingClientRect();
    if (rundVon(el, eigene)) ellipse = abs(eigene);
    for (let a = el.parentElement; a && a !== doc.documentElement && a !== doc.body; a = a.parentElement) {
      const cs = win.getComputedStyle(a);
      if (/(hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) {
        const r = a.getBoundingClientRect();
        const pb = [r.left + px(cs.borderLeftWidth) + sx, r.top + px(cs.borderTopWidth) + sy, r.width - px(cs.borderLeftWidth) - px(cs.borderRightWidth), r.height - px(cs.borderTopWidth) - px(cs.borderBottomWidth)];
        s = schnitt(s, pb);
        if (!ellipse && rundVon(a, r)) ellipse = pb;
      }
    }
    return { s, ellipse };
  };

  // 1) <img>
  for (const im of [...doc.querySelectorAll('img')]) {
    const u = im.currentSrc || im.src || '';
    if (!u || piktogramm(u) || !sichtbar(im)) continue;
    const r = im.getBoundingClientRect();
    if (r.width < 24 || r.height < 24 || !im.naturalWidth) continue;
    const cs = win.getComputedStyle(im);
    const cb = [r.left + px(cs.borderLeftWidth) + px(cs.paddingLeft) + sx, r.top + px(cs.borderTopWidth) + px(cs.paddingTop) + sy,
      r.width - px(cs.borderLeftWidth) - px(cs.borderRightWidth) - px(cs.paddingLeft) - px(cs.paddingRight),
      r.height - px(cs.borderTopWidth) - px(cs.borderBottomWidth) - px(cs.paddingTop) - px(cs.paddingBottom)];
    const nw = im.naturalWidth, nh = im.naturalHeight;
    const fit = cs.objectFit || 'fill';
    let dw = cb[2], dh = cb[3];
    const cov = Math.max(cb[2] / nw, cb[3] / nh), con = Math.min(cb[2] / nw, cb[3] / nh);
    if (fit === 'cover') { dw = nw * cov; dh = nh * cov; }
    else if (fit === 'contain') { dw = nw * con; dh = nh * con; }
    else if (fit === 'none') { dw = nw; dh = nh; }
    else if (fit === 'scale-down') { const s = Math.min(1, con); dw = nw * s; dh = nh * s; }
    const [ox, oy] = posVon(cs.objectPosition, [cb[2] - dw, cb[3] - dh]);
    const g = [cb[0] + ox, cb[1] + oy, dw, dh];
    const { s, ellipse } = clipVon(im, cb);
    aus.push({ u, art: 'img', was: beschreibe(im), y: Math.round(r.top + sy), g: r1(g), s: r1(s), e: ellipse ? r1(ellipse) : null, nat: [nw, nh], karte: karteIdx(im), logo: /logo/i.test((im.alt || '') + datei(u)), fit: 'object-position', kachel: false });
  }

  // 2) CSS-Hintergründe (auch in HTML-Blöcken ohne iframe)
  for (const el of [...doc.querySelectorAll('*')]) {
    const cs = win.getComputedStyle(el);
    const bi = cs.backgroundImage;
    if (!bi || bi === 'none' || bi.indexOf('url(') < 0 || !sichtbar(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;
    const liste = splitTop(bi), sizes = splitTop(cs.backgroundSize || 'auto'), poss = splitTop(cs.backgroundPosition || '50% 50%'), reps = splitTop(cs.backgroundRepeat || 'repeat');
    for (let i = 0; i < liste.length; i++) {
      const u = urlVon(liste[i]);
      if (!u || piktogramm(u)) continue;
      if (!cache[u]) cache[u] = await laden(u);
      const img = cache[u];
      if (!img || !img.naturalWidth) continue;
      const area = [r.left + px(cs.borderLeftWidth) + sx, r.top + px(cs.borderTopWidth) + sy, r.width - px(cs.borderLeftWidth) - px(cs.borderRightWidth), r.height - px(cs.borderTopWidth) - px(cs.borderBottomWidth)];
      const nw = img.naturalWidth, nh = img.naturalHeight;
      const sz = (sizes[i % sizes.length] || 'auto').trim();
      let dw, dh;
      if (sz === 'cover') { const k = Math.max(area[2] / nw, area[3] / nh); dw = nw * k; dh = nh * k; }
      else if (sz === 'contain') { const k = Math.min(area[2] / nw, area[3] / nh); dw = nw * k; dh = nh * k; }
      else {
        const t = sz.split(/\s+/); const wT = t[0], hT = t[1] || 'auto';
        const wv = wT === 'auto' ? null : (wT.endsWith('%') ? area[2] * parseFloat(wT) / 100 : px(wT));
        const hv = hT === 'auto' ? null : (hT.endsWith('%') ? area[3] * parseFloat(hT) / 100 : px(hT));
        if (wv !== null && hv !== null) { dw = wv; dh = hv; } else if (wv !== null) { dw = wv; dh = wv * nh / nw; } else if (hv !== null) { dh = hv; dw = hv * nw / nh; } else { dw = nw; dh = nh; }
      }
      const [ox, oy] = posVon(poss[i % poss.length], [area[2] - dw, area[3] - dh]);
      const rep = (reps[i % reps.length] || 'repeat');
      const kachel = (/(^|\s)repeat($|\s)|repeat-x/.test(rep) && dw < area[2] - 1) || (/(^|\s)repeat($|\s)|repeat-y/.test(rep) && dh < area[3] - 1);
      const g = [area[0] + ox, area[1] + oy, dw, dh];
      const { s, ellipse } = clipVon(el, area);
      aus.push({ u, art: 'bg', was: beschreibe(el), y: Math.round(r.top + sy), g: r1(g), s: r1(s), e: ellipse ? r1(ellipse) : null, nat: [nw, nh], karte: karteIdx(el), logo: /logo/i.test(datei(u)), fit: 'background-position', kachel: !!kachel });
    }
  }
  return aus;
};

/** Naht: Streifen Seitenhintergrund (≤ 24 px) zwischen zwei farbigen, randlosen Sektionen — nicht nur über CTA-Blöcken.
 *  Noah 21.09.2026: „kleiner Spalt zwischen dem Blauen“. Gemessen an den Flächen selbst (Hintergrundfarbe ≠ Seite, volle Breite). */
window.funnelNaht = function (doc) {
  doc = doc || document;
  const win = doc.defaultView;
  const sy = win.scrollY;
  const leer = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
  const bodyBg = win.getComputedStyle(doc.body).backgroundColor;
  const htmlBg = win.getComputedStyle(doc.documentElement).backgroundColor;
  const seite = !leer(bodyBg) ? bodyBg : !leer(htmlBg) ? htmlBg : 'rgb(255, 255, 255)';
  const iv = [];
  doc.querySelectorAll('body *').forEach((e) => {
    const s = win.getComputedStyle(e);
    if (leer(s.backgroundColor) || s.backgroundColor === seite || /fixed|sticky/.test(s.position) || s.display === 'none' || s.visibility === 'hidden') return;
    if (e.closest('button,[role=button],form')) return;
    const r = e.getBoundingClientRect();
    if (r.height < 20) return;
    const bs = s.boxShadow || ''; const m = bs.match(/0px 0px 0px (\d+(?:\.\d+)?)px/);
    const breit = r.width >= win.innerWidth * 0.98 || (!!m && parseFloat(m[1]) >= win.innerWidth / 2);
    if (!breit) return;
    iv.push([r.top + sy, r.bottom + sy, s.backgroundColor]);
  });
  iv.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const i of iv) { const l = merged[merged.length - 1]; if (l && i[0] <= l[1] + 0.5) { l[1] = Math.max(l[1], i[1]); } else merged.push([i[0], i[1], i[2]]); }
  const nahte = [];
  for (let k = 1; k < merged.length; k++) {
    const luecke = merged[k][0] - merged[k - 1][1];
    if (luecke > 0.5 && luecke <= 24) nahte.push({ y: Math.round(merged[k - 1][1]), hoehe: Math.round(luecke), davor: merged[k - 1][2], danach: merged[k][2] });
  }
  return nahte;
};

/** Berührung: Bild/Karte direkt über dem nächsten Inhalt ohne Luft (Noah 21.09.2026: „bei dem Zertifikat ist kein Abstand
 *  darunter“). Bild→Bild/Karte→Karte unter 4 px, alles andere unter 8 px; Fuß und Eltern/Kind zählen nicht. */
window.funnelBeruehrung = function (doc) {
  doc = doc || document;
  const win = doc.defaultView;
  const sy = win.scrollY, sx = win.scrollX;
  const vis = (el) => { const s = win.getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const leer = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
  const istFuss = (el) => { let x = el; for (let i = 0; i < 5 && x; i++) { const t = (x.textContent || '').trim(); if (t.length < 60 && /impressum/i.test(t) && /datenschutz/i.test(t)) return true; x = x.parentElement; } return false; };
  const flaechen = [], folgen = [];
  doc.querySelectorAll('img,video,div,a,li').forEach((e) => {
    if (!vis(e) || e.closest('button') || [...e.classList].some((c) => c.startsWith('fun-'))) return;
    const r = e.getBoundingClientRect();
    if (r.width < 40 || r.height < 40 || r.width >= win.innerWidth * 0.98) return;
    const s = win.getComputedStyle(e);
    const bild = /^(IMG|VIDEO)$/.test(e.tagName);
    const karte = !bild && ((!leer(s.backgroundColor) && s.backgroundColor !== 'rgb(255, 255, 255)') || parseFloat(s.borderBottomWidth) > 0) && r.height < win.innerHeight * 0.9;
    if (!bild && !karte) return;
    flaechen.push({ e, art: bild ? 'bild' : 'karte', l: r.left + sx, rr: r.right + sx, t: r.top + sy, u: r.bottom + sy });
  });
  const tw = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    if (!n.textContent.trim()) continue;
    const p = n.parentElement;
    if (!p || !vis(p) || p.closest('button,script,style') || istFuss(p)) continue;
    const rg = doc.createRange(); rg.selectNodeContents(n);
    for (const rc of rg.getClientRects()) if (rc.height > 0 && rc.width > 0) folgen.push({ art: 'text', e: p, l: rc.left + sx, rr: rc.right + sx, t: rc.top + sy, u: rc.bottom + sy });
  }
  for (const f of flaechen) folgen.push(f);
  const funde = [];
  for (const f of flaechen) {
    let best = null;
    for (const g of folgen) {
      if (g === f || g.e === f.e || f.e.contains(g.e) || g.e.contains(f.e)) continue;
      if (g.t < f.u - 1) continue;
      const ueber = Math.min(f.rr, g.rr) - Math.max(f.l, g.l);
      if (ueber < Math.min(30, (f.rr - f.l) * 0.3)) continue;
      if (!best || g.t < best.t) best = g;
    }
    if (!best) continue;
    const luecke = best.t - f.u;
    const grenze = (f.art === best.art && f.art !== 'text') ? 4 : 8;
    if (luecke >= 0 && luecke < grenze) funde.push({ y: Math.round(f.u), luecke: Math.round(luecke), was: f.art + ' → ' + best.art, text: (best.e.innerText || best.e.alt || '').trim().slice(0, 30) });
  }
  return funde;
};

/** Abstandsraster: gleiche Abstände in Familien (Noah 15.10.2026: „abstände passen trotzdem oft nicht“).
 *  (a) Überschrift(h2) → nächster Inhalt: je Gruppe (Text / Bild-Karte) darf die Spannweite höchstens 12 px (gelb) bzw. 24 px (rot) sein.
 *  (b) Leerer Raum zwischen zwei Inhalten > 160 px (gelb) bzw. > 220 px (rot) — leere Abstandhalter, doppelte Paddings. */
window.funnelAbstandsraster = function (doc) {
  doc = doc || document;
  const win = doc.defaultView;
  const sy = win.scrollY, sx = win.scrollX;
  const vis = (el) => { const s = win.getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const istFuss = (el) => { let x = el; for (let i = 0; i < 5 && x; i++) { const t = (x.textContent || '').trim(); if (t.length < 60 && /impressum/i.test(t) && /datenschutz/i.test(t)) return true; x = x.parentElement; } return false; };
  const leer = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
  const inhalt = [];
  const tw = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    if (!n.textContent.trim()) continue;
    const p = n.parentElement;
    if (!p || !vis(p) || p.closest('script,style') || istFuss(p)) continue;
    const rg = doc.createRange(); rg.selectNodeContents(n);
    for (const rc of rg.getClientRects()) if (rc.height > 0 && rc.width > 0) inhalt.push({ t: rc.top + sy, u: rc.bottom + sy, l: rc.left + sx, r: rc.right + sx, art: 'text', e: p });
  }
  doc.querySelectorAll('img,video,iframe,input,textarea,select,button').forEach((e) => {
    if (!vis(e)) return; const rc = e.getBoundingClientRect(); if (rc.width < 24 || rc.height < 12) return;
    inhalt.push({ t: rc.top + sy, u: rc.bottom + sy, l: rc.left + sx, r: rc.right + sx, art: 'bild', e });
  });
  inhalt.sort((a, b) => a.t - b.t);
  // (b) Lücken über die Vereinigung aller Inhalte
  const m = [];
  for (const i of inhalt) { const l = m[m.length - 1]; if (l && i.t <= l[1] + 0.5) l[1] = Math.max(l[1], i.u); else m.push([i.t, i.u]); }
  const luecken = [];
  for (let k = 1; k < m.length; k++) { const g = m[k][0] - m[k - 1][1]; if (g > 160) luecken.push({ y: Math.round(m[k - 1][1]), hoehe: Math.round(g) }); }
  // (a) h2 → nächster Inhalt
  const familien = { text: [], bild: [] };
  doc.querySelectorAll('h2').forEach((h) => {
    if (!vis(h) || h.closest('[role=button],button,form') || !(h.innerText || '').trim()) return;
    // letzte Zeile der Überschrift
    const rg = doc.createRange(); rg.selectNodeContents(h); const rects = [...rg.getClientRects()].filter((x) => x.height > 0);
    if (!rects.length) return;
    const unten = Math.max(...rects.map((x) => x.bottom)) + sy;
    let best = null;
    for (const i of inhalt) { if (h.contains(i.e)) continue; if (i.t >= unten - 1 && (!best || i.t < best.t)) best = i; }
    if (!best) return;
    const gap = best.t - unten;
    if (gap > 80) return; // anderer Abschnitt, keine Unterzeile
    familien[best.art].push({ gap: Math.round(gap), h: (h.innerText || '').trim().slice(0, 24) });
  });
  const spann = [];
  for (const [art, liste] of Object.entries(familien)) {
    if (liste.length < 2) continue;
    const gs = liste.map((x) => x.gap);
    const w = Math.max(...gs) - Math.min(...gs);
    if (w > 12) spann.push({ art, spannweite: w, werte: liste.map((x) => '„' + x.h + '“ ' + x.gap) });
  }
  return { luecken, spann };
};

/** Knopfform: gleiche Breite/Höhe aller CTA-Knöpfe, Rand links/rechts ≥ 16 px bei 390, Emoji + Leerzeichen am Textanfang. */
window.funnelKnopfform = function (doc) {
  doc = doc || document;
  const win = doc.defaultView;
  const vis = (el) => { const s = win.getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 0 && r.height > 0; };
  const nurSymbol = (t) => !/[\p{L}\p{N}]/u.test(t);
  const bs = [...doc.querySelectorAll('button')].filter((b) => vis(b) && b.offsetHeight > 30 && !b.closest('form') && !/^(open chat|dismiss|schließen)$/i.test(b.textContent.trim()) && (b.innerText || '').trim().length > 8);
  const fehler = [], gelb = [];
  if (bs.length >= 2) {
    const w = bs.map((b) => Math.round(b.getBoundingClientRect().width)), h = bs.map((b) => Math.round(b.getBoundingClientRect().height));
    if (Math.max(...w) - Math.min(...w) > 8) fehler.push('Breiten ' + [...new Set(w)].join('/') + ' px');
    if (Math.max(...h) - Math.min(...h) > 16) fehler.push('Höhen ' + [...new Set(h)].join('/') + ' px');
    else if (Math.max(...h) - Math.min(...h) > 4) gelb.push('Höhen ' + [...new Set(h)].join('/') + ' px (Unterzeile?)');
  }
  const rand = win.innerWidth <= 430 ? bs.filter((b) => { const r = b.getBoundingClientRect(); return r.left < 16 || win.innerWidth - r.right < 16; }).map((b) => '„' + (b.innerText || '').trim().split('\n')[0].slice(0, 24) + '“') : [];
  if (rand.length) fehler.push('Rand < 16 px: ' + [...new Set(rand)].join(', '));
  const ohneEmoji = [...new Set(bs.map((b) => (b.innerText || '').trim().split('\n').map((s) => s.trim()).find((s) => s && !nurSymbol(s)) || '').filter(Boolean))]
    .filter((t) => !/^\p{Extended_Pictographic}/u.test(t) && !/^[←-⯿\u{1F000}-\u{1FFFF}]/u.test(t));
  if (ohneEmoji.length) gelb.push('ohne Emoji am Anfang: ' + ohneEmoji.map((t) => '„' + t.slice(0, 26) + '“').join(', '));
  return { fehler, gelb, anzahl: bs.length };
};

/** Bild mittig: ein einzelnes, schmales Bild/Porträt in einer Spalte mit mittiger Seitenausrichtung sitzt in der Fenstermitte (± 6 px).
 *  Noah 18.10.2026: „das Bild von Bettina … ist nicht zentriert. Sowas darf ich dir nicht sagen.“ */
window.funnelBildMittig = function (doc, mittigeSeite) {
  doc = doc || document;
  const win = doc.defaultView;
  if (!mittigeSeite) return [];
  const sx = win.scrollX, sy = win.scrollY;
  const fm = doc.documentElement.clientWidth / 2;
  const vis = (el) => { const s = win.getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 0 && r.height > 0; };
  const alle = [...doc.querySelectorAll('img,video')].filter((i) => vis(i) && !i.closest('button,[role=button]'));
  const rects = alle.map((i) => ({ e: i, r: i.getBoundingClientRect() }));
  const textRects = [];
  const tw = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) { if (!n.textContent.trim() || !n.parentElement || !vis(n.parentElement) || n.parentElement.closest('script,style,button')) continue; const rg = doc.createRange(); rg.selectNodeContents(n); for (const rc of rg.getClientRects()) if (rc.width > 0 && rc.height > 0) textRects.push(rc); }
  const funde = [];
  for (const { e, r } of rects) {
    if (r.width < 60 || r.width > win.innerWidth * 0.9 || /logo/i.test((e.alt || '') + (e.src || ''))) continue;
    const mitte = r.left + r.width / 2;
    const daneben = rects.some((o) => o.e !== e && o.r.bottom > r.top + r.height * 0.3 && o.r.top < r.bottom - r.height * 0.3 && (o.r.right <= r.left + 2 || o.r.left >= r.right - 2))
      || textRects.some((t) => t.bottom > r.top - 40 && t.top < r.bottom && (t.right <= r.left + 2 || t.left >= r.right - 2));  // auch Zeitleisten-Nummer oben links (Fischer 19.10. Fehlalarm)
    if (daneben) continue;
    if (Math.abs(mitte - fm) > 6) funde.push({ was: (e.alt || e.src || '').split('/').pop().slice(0, 30), y: Math.round(r.top + sy), abweichung: Math.round(mitte - fm) });
  }
  return funde;
};

/**
 * Komplettlauf: JEDE erreichbare Seite des Funnels bei 390 UND 1440 px, je Seite die volle Abnahme (funnelAbnahme) im
 * unsichtbaren iframe derselben Domain. Liefert eine kompakte, serialisierbare Zusammenfassung für
 * system/scripts/funnel_abnahme_quittung.py (dort kommt die Gesichtsprüfung dazu und die Quittung für das Abgabe-Tor).
 *
 *   const r = await funnelAbnahmeAlle({kunde, ctaMin:3, bilderMin:5, impressum, eigeneBilder:[…]});  // auf der Funnel-Startseite
 *   JSON.stringify(r)  → Datei → .venv/bin/python system/scripts/funnel_abnahme_quittung.py <Datei>
 * Optionen wie funnelAbnahme, dazu: urls (explizite Seitenliste statt layoutData), breiten ([390,1440]), nurStart (false).
 */
window.funnelAbnahmeAlle = async function (opt = {}) {
  const breiten = opt.breiten || [390, 1440];
  const quelle = ['funnelAbnahme', 'funnelSpalt', 'funnelKnopfAbstand', 'funnelStandard', 'funnelBilder', 'funnelNaht', 'funnelBeruehrung', 'funnelAbstandsraster', 'funnelKnopfform', 'funnelBildMittig']
    .map((n) => 'window.' + n + '=' + window[n].toString() + ';').join('\n');
  let seiten = opt.urls;
  if (!seiten) {
    seiten = [{ url: location.href, start: true }];
    try {
      const e = performance.getEntriesByType('resource').map((x) => x.name).find((n) => /\/data\/layoutData\.json/.test(n));
      if (e) {
        const basis = e.split('/data/')[0];
        const v = (e.split('v=')[1] || '').split('&')[0];
        const ld = await fetch(e).then((r) => r.json());
        const sd = {};
        for (const p of ld.pages || []) {
          if (p.isResultPage) continue;
          const r = await fetch(basis + '/data/pages/' + p.slug + '.json' + (v ? '?v=' + v : ''));
          if (r.ok) { const j = await r.json(); sd[j.pageId || p.slug] = { slug: p.slug, j, start: !!p.isHomePage }; }
        }
        const erreicht = new Set(Object.keys(sd).filter((id) => sd[id].start));
        const schlange = [...erreicht];
        while (schlange.length) {
          const { j } = sd[schlange.shift()];
          const s = JSON.stringify(j.components || []);
          for (const m of s.matchAll(/"linking":\{([^}]*)\}/g)) {
            const pid = (/"pageId":"([0-9a-f]{24})"/.exec(m[1]) || [])[1] || (/"isInternal":true/.test(m[1]) ? j.nextPage : null);
            if (pid && sd[pid] && !erreicht.has(pid)) { erreicht.add(pid); schlange.push(pid); }
          }
        }
        const wurzel = location.origin + basis.replace(location.origin, '');
        const liste = Object.entries(sd).filter(([id]) => erreicht.has(id)).map(([id, x]) => ({ url: x.start ? location.origin + location.pathname.replace(/\/page_[a-z0-9]+\/?$/, '/') : wurzel + '/' + x.slug + '/', start: x.start, slug: x.slug }));
        if (liste.length) seiten = liste;
      }
    } catch (x) { /* nur diese Seite */ }
  }
  if (opt.nurStart) seiten = seiten.filter((s) => s.start);
  const ergebnis = { url: location.origin + location.pathname, zeit: new Date().toISOString(), breiten, seiten: [] };
  for (const sei of seiten) {
    for (const b of breiten) {
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-20000px;top:0;border:0;width:' + b + 'px;height:' + (b <= 430 ? 844 : 900) + 'px';
      f.src = sei.url;
      document.body.appendChild(f);
      try {
        await new Promise((res) => { f.addEventListener('load', res, { once: true }); setTimeout(res, 20000); });
        await new Promise((r) => setTimeout(r, 2500)); // Perspective baut die Seite nach dem Laden auf
        const w = f.contentWindow;
        w.eval(quelle);
        const o = Object.assign({}, opt, { startseite: !!sei.start, alleSeiten: !!sei.start && !!opt.alleSeiten });
        if (!sei.start) { o.ctaMin = 0; o.bilderMin = 0; }  // Quiz-/Unterseiten haben keine Mindestzahl (Fischer 19.10.: 6 Fehlalarme)
        delete o.urls; delete o.breiten;
        const r = await w.funnelAbnahme(o);
        ergebnis.seiten.push({ url: sei.url, slug: sei.slug || '', start: !!sei.start, breite: b, rot: r.rot, befunde: r.befunde.filter((x) => x.stand !== '🟢'), bilder: r.bilder || [] });
      } catch (x) {
        ergebnis.seiten.push({ url: sei.url, slug: sei.slug || '', start: !!sei.start, breite: b, rot: 1, befunde: [{ stand: '🔴', punkt: 'Abnahme', text: 'Seite nicht messbar: ' + x.message }], bilder: [] });
      } finally { f.remove(); }
    }
  }
  return ergebnis;
};

/* Ladehinweis: der Rückgabewert der Datei ist diese Zeichenkette (nicht die letzte Funktion). */
window.__funnelAbnahmeGeladen = 'abnahme.js geladen: funnelAbnahme, funnelAbnahmeAlle, funnelBilder';
