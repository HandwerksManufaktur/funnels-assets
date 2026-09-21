/**
 * Funnel-Abnahme — im Browser auf der LIVE-Seite ausführen.
 *
 *   await funnelAbnahme({
 *     kunde:   'fischer-chemnitz',            // Ordner in funnels-assets (Pflicht)
 *     logo:    true,                          // Logo muss oben stehen
 *     ctaMin:  3,                             // Mindestzahl Handlungsaufforderungen
 *     impressum: 'energie-fischer.de',        // Domain der echten Rechtsseiten
 *     bilderMin: 5                            // Mindestzahl echter Kundenbilder
 *   })
 *
 * Gibt eine Liste mit 🔴/🟢 je Prüfpunkt zurück. 🔴 = NICHT ausliefern.
 * Der Test ist die Wahrheit, nicht die Absicht.
 */
window.funnelAbnahme = async function (opt = {}) {
  const o = Object.assign(
    { kunde: null, logo: true, ctaMin: 2, impressum: null, bilderMin: 3, fremdeKunden: [] },
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
  const echte = quellen.filter((q) => o.kunde && q.url.indexOf('/' + o.kunde + '/') > -1);
  const fremd = quellen.filter(
    (q) => o.kunde && /funnels-assets/.test(q.url) && q.url.indexOf('/' + o.kunde + '/') < 0
  );
  const unbekannt = quellen.filter(
    (q) =>
      !emoji(q.url) &&
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
  const anker = [
    ...[...document.querySelectorAll('img,svg,table,video,picture')].filter(grossGenug),
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
    const oben = document.elementFromPoint(x, Math.round(r.top - 60));
    const soll = oben ? farbeVon(oben) : null;
    const ist = farbeVon(b.parentElement);
    if (soll && soll !== 'transparent' && soll !== ist)
      schiefe.push('„' + b.textContent.trim().slice(0, 28) + '" steht auf ' + ist + ', darüber ist ' + soll);
  }
  window.scrollTo(0, merkGeschr);
  if (schiefe.length) rot('Button-Regel', schiefe.join(' · '));
  else ok('Button-Regel', 'Jeder CTA-Block trägt die Farbe der Sektion darüber.');


  // 13 — Kein Spalt: ein dünner Streifen Seitenhintergrund zwischen einer farbigen
  // Sektion und dem Block darunter. Entsteht in Perspective durch den Hintergrund-Abstand
  // UNTEN am HTML-Block — die Farbe stimmt, trotzdem läuft eine helle Naht durchs Bild.
  // Noah, 21.09.2026: „bei der ersten Sektion ist noch ein kleiner Spalt zwischen dem Blauen
  // drin — beim Hintergrund muss man den Abstand unten einfach auf 0 setzen."
  const seitenBg = getComputedStyle(document.body).backgroundColor;
  const norm = (c) => (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)' ? seitenBg : c);
  const blockVon = (e) => { let x = e; for (let i = 0; i < 12 && x; i++) { const c = getComputedStyle(x).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') return x; x = x.parentElement; } return null; };
  const spalte = [];
  for (const b of [...document.querySelectorAll('button')].filter((b) => b.textContent.trim().length > 8)) {
    const y0 = b.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, y0 - 400));
    await new Promise((r) => setTimeout(r, 250));
    const blk = blockVon(b.parentElement) || b.parentElement;
    const br = blk.getBoundingClientRect();
    if (br.top < 60) continue; // Oberkante nicht im Bild — nicht messbar, nicht raten
    const farbeBei = (dy) => {
      const treffer = [0.25, 0.5, 0.75]
        .map((f) => document.elementFromPoint(Math.round(br.left + br.width * f), Math.round(br.top - dy)))
        .filter(Boolean)
        .map((e) => norm(farbeVon(e)));
      return treffer.length ? treffer[0] : null;
    };
    const streifen = farbeBei(3) || farbeBei(6);
    const darueber = farbeBei(40);
    const meine = norm(getComputedStyle(blk).backgroundColor);
    if (streifen && darueber && darueber === meine && streifen !== meine)
      spalte.push('„' + b.textContent.trim().slice(0, 28) + '“ — ' + streifen + ' zwischen zwei Flächen in ' + meine);
  }
  window.scrollTo(0, merkGeschr);
  if (spalte.length) rot('Spalt vor dem CTA', spalte.join(' · ') + ' — Hintergrund-Abstand UNTEN am Block darüber auf 0.');
  else ok('Spalt vor dem CTA', 'Keine Naht zwischen Sektion und CTA-Block.');


  const rote = befunde.filter((b) => b.stand === '🔴');
  console.table(befunde);
  console.log(rote.length ? '🔴 ' + rote.length + ' Punkt(e) offen — NICHT ausliefern.' : '🟢 Abnahme bestanden.');
  return { rot: rote.length, befunde };
};
