/**
 * Selbsttest für window.funnelSpalt — im Browser auf einer beliebigen Seite ausführen,
 * nachdem abnahme.js geladen ist:
 *
 *   await funnelSpaltSelbsttest()
 *
 * Baut zwei Fälle in die Seite und misst sie: einen sauberen (Sektion sitzt bündig auf dem
 * CTA-Block) und einen mit eingebautem Fehler (8 px Seitenhintergrund dazwischen — genau
 * das, was Noah am 21.09.2026 an der ersten Fischer-Sektion gesehen hat).
 *
 * 🔴 Der Test taugt nur etwas, wenn der eingebaute Fehler auch gefunden wird. Die erste
 * Fassung der Messung fand ihn NICHT (sie verlangte gleiche Farbe oben und unten) — der
 * Fehlerfall steht deshalb fest im Test und darf nie entfernt werden.
 */
window.funnelSpaltSelbsttest = async function () {
  const buehne = document.createElement('div');
  buehne.id = 'spalt-selbsttest';
  buehne.style.cssText = 'position:relative;z-index:0;background:' + getComputedStyle(document.body).backgroundColor + ';';
  const fall = (name, luecke) =>
    '<section style="background:#1A1A1A;color:#fff;padding:80px 20px;">' +
    '<div style="max-width:600px;margin:0 auto;">Sektion ' + name + '</div></section>' +
    (luecke ? '<div style="height:8px;"></div>' : '') +
    '<div style="background:#1A1A1A;padding:32px 20px;text-align:center;">' +
    '<button type="button" style="background:#0076BE;color:#fff;border:0;padding:16px 24px;border-radius:8px;">' +
    'Selbsttest ' + name + ' anfragen</button></div>';
  buehne.innerHTML = '<div style="height:600px;"></div>' + fall('sauber', false) + '<div style="height:600px;"></div>' + fall('mitFehler', true) + '<div style="height:600px;"></div>';
  document.body.appendChild(buehne);

  const merk = window.scrollY;
  let befunde;
  try {
    befunde = await window.funnelSpalt(buehne);
  } finally {
    buehne.remove();
    window.scrollTo(0, merk);
  }

  const traf = (n) => befunde.some((t) => t.includes(n));
  const proben = [
    { name: 'sauberer Fall wird nicht gemeldet', ok: !traf('sauber') },
    { name: 'eingebauter Fehler wird gefunden', ok: traf('mitFehler') },
    { name: 'genau ein Befund', ok: befunde.length === 1 },
  ];
  console.table(proben);
  const schief = proben.filter((p) => !p.ok);
  console.log(schief.length ? '🔴 Selbsttest gescheitert: ' + schief.map((p) => p.name).join(', ') : '🟢 Selbsttest bestanden — der eingebaute Fehler wird gefunden.');
  return { ok: schief.length === 0, befunde, proben };
};
