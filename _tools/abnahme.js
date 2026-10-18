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
  const emoji = (u) => /^[0-9a-f]{4,6}\.png$/i.test(datei(u)); // Twemoji
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
    const hat = anker.some(([a, b]) => Math.min(b, bis) - Math.max(a, y) >= 120);
    const txt = document.elementsFromPoint ? '' : '';
    if (!hat) nurText.push(Math.round(y) + '–' + Math.round(bis) + 'px');
  }
  if (nurText.length)
    rot('Textwand', nurText.length + ' Bildschirmhöhe(n) ohne Bild, Tabelle oder Grafik: ' + nurText.join(', '));
  else ok('Veranschaulichung', 'Jede Bildschirmhöhe trägt einen sichtbaren Anker.');


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
    const oben = document.elementFromPoint(x, Math.round(blockTop - 4));
    const soll = oben ? farbeVon(oben) : null;
    const ist = farbeVon(b.parentElement);
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




  const rote = befunde.filter((b) => b.stand === '🔴');
  console.table(befunde);
  console.log(rote.length ? '🔴 ' + rote.length + ' Punkt(e) offen — NICHT ausliefern.' : '🟢 Abnahme bestanden.');
  return { rot: rote.length, befunde };
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
      if (e.classList.contains('fx') || [...e.classList].some((c) => c.startsWith('fun-'))) return;
      const gross = rc.height > win.innerHeight * 1.5 || rc.width > win.innerWidth * 0.98;
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
      if (gross && !flaeche) return;
      if (!flaeche && !rahmen) return;
      if (flaeche) bg = s.backgroundColor;
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
 *   19 Knopftext:       alle CTA-Knöpfe tragen denselben Text (o.knopfText), keine Varianten, keine Chips.
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
  const piktogramm = (u) => /^[0-9a-f]{4,6}\.png$/i.test((u.split('/').pop() || '').split('?')[0]) || /icons8\.com|twemoji|emoji/i.test(u);
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
        for (const p of ld.pages || []) {
          if (p.isResultPage) continue;
          const r = await fetch(basis + '/data/pages/' + p.slug + '.json' + (v ? '?v=' + v : ''));
          if (!r.ok) continue;
          const j = await r.json();
          const s = JSON.stringify(j.components || []);
          const m = eigRe.exec(s);
          if (m) eigFunde.push(p.slug + ': „' + s.slice(m.index, m.index + 40).replace(/<[^>]*>|\\[nrt"]/g, ' ').replace(/\s+/g, ' ').trim() + '“');
        }
      } else gelb('Eigentümer-Frage', 'layoutData.json nicht gefunden — nur diese Seite geprüft.');
    } catch (x) { gelb('Eigentümer-Frage', 'Andere Seiten nicht lesbar (' + x.message + ') — nur diese Seite geprüft.'); }
  }
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
    if (reihe && tops.length > 1) lFehler.push('Leiste „' + eintraege.map((k) => k.innerText.trim().slice(0, 18)).join(' · ') + '" bricht in ' + tops.length + ' Reihen um');
  }
  if (lFehler.length) rot('Vertrauensleiste', lFehler.join(' · ') + ' — kürzer oder kleiner, eine Zeile bei 390.');
  else if (start && !leisten.length) gelb('Vertrauensleiste', 'Keine Leiste erkannt (Tipp: data-leiste an den Container) — Sichtprüfung.');
  else ok('Vertrauensleiste', leisten.length ? leisten.length + ' Leiste(n), jeder Eintrag einzeilig, keine zweite Reihe.' : 'Keine Leiste auf dieser Seite.');

  // 19 — Ein Knopftext, keine verspielten Varianten, keine Chips
  const norm = (t) => t.replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const ctas = [...doc.querySelectorAll('button')].filter((b) => vis(b) && b.offsetHeight > 30 && !b.closest('form') && !/^(open chat|dismiss|schließen)$/i.test(b.textContent.trim()))
    .map((b) => (b.innerText || b.textContent).split('\n').map((s) => s.trim()).find((s) => s && !nurSymbol(s)) || '')
    .filter((t) => t.length > 3);
  const texte = [...new Set(ctas.map(norm))];
  const kFehler = [];
  if (texte.length > 1) kFehler.push(texte.length + ' verschiedene Knopftexte: ' + [...new Set(ctas)].join(' · '));
  if (o.knopfText && texte.length && texte.some((t) => t !== norm(o.knopfText))) kFehler.push('Soll „' + o.knopfText + '“, ist ' + [...new Set(ctas)].map((t) => '„' + t + '“').join(', '));
  const chip = /schnellster weg|passt f(ü|u)r mich|klingt nach mir|genau mein problem|schritt 1 starten/i.exec(doc.body.innerText);
  if (chip) kFehler.push('verspielte Variante/Chip im Text: „' + chip[0] + '“');
  if (kFehler.length) rot('Knopftext', kFehler.join(' · '));
  else ok('Knopftext', ctas.length ? ctas.length + ' Knöpfe, ein Text: „' + ctas[0] + '“' : 'Keine CTA-Knöpfe auf dieser Seite.');

  return out;
};
