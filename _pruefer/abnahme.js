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

  const rote = befunde.filter((b) => b.stand === '🔴');
  console.table(befunde);
  console.log(rote.length ? '🔴 ' + rote.length + ' Punkt(e) offen — NICHT ausliefern.' : '🟢 Abnahme bestanden.');
  return { rot: rote.length, befunde };
};
