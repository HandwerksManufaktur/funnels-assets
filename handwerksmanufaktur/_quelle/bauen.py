#!/usr/bin/env python3
"""Baut die HTML-Blöcke des Funnels „Website-Konzept geschenkt" (HWM).
Aufruf: python3 bauen.py <commit-oder-main>  → schreibt ../bloecke/*.html
Bilder kommen über jsDelivr aus diesem Repo, Pfad handwerksmanufaktur/.
"""
import sys, pathlib
REF = sys.argv[1] if len(sys.argv) > 1 else 'main'
B = f'https://cdn.jsdelivr.net/gh/HandwerksManufaktur/funnels-assets@{REF}/handwerksmanufaktur/'
OUT = pathlib.Path(__file__).resolve().parent.parent / 'bloecke'

CSS = """<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
.hw{font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#16130E;line-height:1.5;-webkit-font-smoothing:antialiased;text-align:left}
.hw *{box-sizing:border-box}
.hw img{display:block;max-width:100%;height:auto}
.hw h1,.hw h2,.hw h3,.hw h4,.hw .zf{font-family:'Archivo','Inter',system-ui,sans-serif;font-weight:800;letter-spacing:-.03em;margin:0;color:inherit}
.hw p{margin:0}
.hw.papier{background:#FAF7F1}.hw.weiss{background:#FFFFFF}.hw.tinte{background:#16130E;color:#FAF7F1}
.hw .sek{padding:72px 20px 0}
.hw.tinte .sek{padding-bottom:40px}
.hw .w{max-width:720px;margin:0 auto}
.hw .ww{max-width:1040px;margin:0 auto}
.hw .mitte{text-align:center}
.hw .eb{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:7px 14px;border-radius:999px;border:1px solid rgba(22,19,14,.14);background:#FFFFFF}
.hw.tinte .eb{border-color:rgba(250,247,241,.18);background:rgba(250,247,241,.06);color:#FAF7F1}
.hw h1{font-size:clamp(38px,9.6vw,68px);line-height:1.02;margin:18px 0 18px}
.hw h2{font-size:clamp(30px,7vw,48px);line-height:1.05;margin:16px 0 14px}
.hw h3{font-size:19px;line-height:1.2;letter-spacing:-.02em}
.hw .lead{font-size:17px;color:#4A443B;max-width:560px;line-height:1.55}
.hw.tinte .lead{color:rgba(250,247,241,.72)}
.hw .mitte .lead{margin-left:auto;margin-right:auto}
.hw .dunkel{color:rgba(22,19,14,.42)}
.hw.tinte .dunkel{color:rgba(250,247,241,.45)}
/* Kopf-Chip */
.hw .chip{display:inline-flex;align-items:center;gap:10px;padding:5px 14px 5px 5px;border-radius:999px;background:#FFFFFF;border:1px solid rgba(22,19,14,.10);font-size:13px;color:#4A443B;box-shadow:0 6px 20px rgba(22,19,14,.06)}
.hw .chip img{width:34px;height:34px;border-radius:50%;object-fit:cover;object-position:50% 18%}
.hw .chip b{color:#16130E}
/* Zahlen-Kacheln */
.hw .zahlen{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:26px}
.hw .zk{background:#FFFFFF;border:1px solid rgba(22,19,14,.08);border-radius:18px;padding:16px 10px;text-align:center}
.hw.tinte .zk{background:rgba(250,247,241,.05);border-color:rgba(250,247,241,.12)}
.hw .zk .zf{font-size:clamp(24px,5.6vw,34px);line-height:1;display:block}
.hw .zk span{display:block;font-size:12px;line-height:1.3;margin-top:6px;color:#6B6459}
.hw.tinte .zk span{color:rgba(250,247,241,.6)}
@media(max-width:520px){.hw .zahlen{grid-template-columns:repeat(2,1fr)}.hw .zk{padding:14px 8px}}
.hw .zk span.zf{color:#16130E;margin:0}
.hw.tinte .zk span.zf{color:#FAF7F1}
.hw .zk span.zf.em{font-size:28px}
/* Telefon-Rahmen */
.hw .tel{border-radius:34px;background:#16130E;padding:8px;box-shadow:0 30px 60px -20px rgba(22,19,14,.45),0 0 0 1px rgba(22,19,14,.08)}
.hw .tel img{border-radius:27px;width:100%;height:auto}
.hw .tel.hell{background:#2A251D}
/* Browser-Rahmen */
.hw .br{border-radius:14px;background:#FFFFFF;overflow:hidden;box-shadow:0 24px 50px -18px rgba(0,0,0,.5);border:1px solid rgba(22,19,14,.10)}
.hw .br i{display:flex;gap:6px;padding:9px 12px;background:#EFEAE0}
.hw .br i b{width:9px;height:9px;border-radius:50%;background:rgba(22,19,14,.22)}
.hw .br img{width:100%;height:auto}
/* Laufband */
.hw .band{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.hw .bandin{display:flex;gap:18px;width:max-content;animation:hwlauf 48s linear infinite}
.hw .bandin .br{width:340px;flex:0 0 auto}
@keyframes hwlauf{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media(prefers-reduced-motion:reduce){.hw .bandin{animation:none}}
@media(max-width:520px){.hw .bandin .br{width:260px}}
/* Zeitleiste */
.hw .zl{position:relative;margin-top:30px;padding-left:0;list-style:none;display:grid;grid-template-columns:1fr}
.hw .zl li{position:relative;padding:0 0 26px 66px;list-style:none}
.hw .zl li:last-child{padding-bottom:0}
.hw .zl li:before{content:'';position:absolute;left:23px;top:48px;bottom:4px;width:2px;background:rgba(22,19,14,.12)}
.hw .zl li:last-child:before{display:none}
.hw .zl .nr{position:absolute;left:0;top:0;width:48px;height:48px;border-radius:50%;background:#16130E;color:#FAF7F1;display:flex;align-items:center;justify-content:center;font-family:'Archivo',sans-serif;font-weight:800;font-size:18px}
.hw.tinte .zl li:before{background:rgba(250,247,241,.16)}
.hw.tinte .zl .nr{background:#FAF7F1;color:#16130E}
.hw .zl h4{font-size:18px;line-height:1.25;letter-spacing:-.02em;padding-top:4px}
.hw .zl p{font-size:15px;color:#6B6459;margin-top:4px}
.hw.tinte .zl p{color:rgba(250,247,241,.6)}
/* Karten */
.hw .karten{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:34px}
@media(max-width:620px){.hw .karten{grid-template-columns:1fr}}
.hw .ka{border-radius:22px;padding:26px 24px;background:#FFFFFF;border:1px solid rgba(22,19,14,.08)}
.hw.tinte .ka{background:rgba(250,247,241,.05);border-color:rgba(250,247,241,.12)}
.hw .ka .em{font-size:30px;line-height:1;display:block;margin-bottom:16px}
.hw .ka p{font-size:15px;color:#6B6459;margin-top:6px}
.hw.tinte .ka p{color:rgba(250,247,241,.66)}
/* Zweispalter */
.hw .zwei{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
@media(max-width:720px){.hw .zwei{grid-template-columns:1fr;gap:28px}}
.hw .foto{border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -24px rgba(22,19,14,.35)}
.hw .foto img{width:100%;height:auto}
/* Reihen mit Handy */
.hw .reihe{display:grid;grid-template-columns:200px 1fr;gap:30px;align-items:center;padding:26px;border-radius:26px;background:#FFFFFF;border:1px solid rgba(22,19,14,.08);margin-top:16px}
.hw .reihe .tel{max-width:200px}
@media(max-width:620px){.hw .reihe{grid-template-columns:112px 1fr;gap:18px;padding:16px;border-radius:22px}.hw .reihe .tel{max-width:112px;border-radius:22px;padding:5px}.hw .reihe .tel img{border-radius:18px}.hw .reihe h3{font-size:18px!important}.hw .reihe p{font-size:14.5px}.hw .reihe .em{font-size:22px}}
.hw .reihe p{font-size:15.5px;color:#6B6459;margin-top:8px}
.hw .reihe .em{font-size:28px}
/* Team */
.hw .team{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}
@media(max-width:640px){.hw .team{grid-template-columns:1fr;gap:12px}.hw .tm{display:grid;grid-template-columns:118px 1fr;align-items:center}.hw .tm .bild{aspect-ratio:1/1.15;height:100%}.hw .tm .txt{padding:14px 16px}}
.hw .tm{border-radius:24px;overflow:hidden;background:#FFFFFF;border:1px solid rgba(22,19,14,.08)}
.hw .tm .bild{aspect-ratio:4/5;overflow:hidden;background:#EFEAE0}
.hw .tm .bild img{width:100%;height:100%;object-fit:cover}
.hw .tm .txt{padding:18px 20px 22px}
.hw .tm .rolle{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(22,19,14,.45);margin-top:2px}
.hw .tm p{font-size:14.5px;color:#6B6459;margin-top:8px}
/* Mehr-erfahren-Karten */
.hw .mk{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:760px){.hw .mk{grid-template-columns:repeat(3,1fr)}}
.hw .mkk{border-radius:22px;overflow:hidden;background:#FFFFFF;border:1px solid rgba(22,19,14,.08)}
.hw .mkk .bild{aspect-ratio:16/10;overflow:hidden;background:#EFEAE0}
.hw .mkk .bild img{width:100%;height:100%;object-fit:cover}
.hw .mkk .txt{padding:18px 20px 22px}
.hw .mkk p{font-size:14.5px;color:#6B6459;margin-top:8px}
/* Stimmen */
.hw .stimmen{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:34px;align-items:start}
@media(max-width:640px){.hw .stimmen{grid-template-columns:1fr}}
.hw .st{margin:0;border-radius:22px;padding:24px;background:rgba(250,247,241,.05);border:1px solid rgba(250,247,241,.12)}
.hw .st .sterne{letter-spacing:3px;font-size:14px}
.hw .st p{font-size:15.5px;line-height:1.5;margin-top:10px;color:#FAF7F1}
.hw .st .wer{font-size:13px;color:rgba(250,247,241,.5);margin-top:12px}
/* Liste */
.hw .liste{display:grid;gap:12px;margin-top:30px}
.hw .li{display:flex;gap:16px;align-items:center;padding:18px 20px;border-radius:18px;background:#FFFFFF;border:1px solid rgba(22,19,14,.08);font-size:16px;font-weight:600}
.hw .li .em{font-size:24px;flex:0 0 auto}
/* Portrait rund */
.hw .rund{width:112px;height:112px;border-radius:50%;object-fit:cover;object-position:50% 20%;border:3px solid rgba(250,247,241,.9);margin:0 auto}
</style>"""

def blk(cls, inner):
    return CSS + f'\n<div class="hw {cls}">{inner}</div>\n'

from PIL import Image as _I
_ROOT = pathlib.Path(__file__).resolve().parent.parent
def _mass(f):
    try:
        w, h = _I.open(_ROOT / f).size; return f'width="{w}" height="{h}"'
    except Exception:
        return ''
img = lambda f, alt, extra='': f'<img src="{B}{f}" alt="{alt}" {_mass(f)} decoding="async" {extra}>'
tel = lambda f, alt, cls='tel': f'<div class="{cls}">{img(f, alt)}</div>'
br = lambda f, alt: f'<div class="br"><i><b></b><b></b><b></b></i>{img(f, alt)}</div>'

def zl(schritte):
    return '<ol class="zl">' + ''.join(
        f'<li><span class="nr">{i+1}</span><h4>{t}</h4>' + (f'<p>{p}</p>' if p else '') + '</li>'
        for i, (t, p) in enumerate(schritte)) + '</ol>'

def karten(k):
    return '<div class="karten">' + ''.join(
        f'<div class="ka"><span class="em">{e}</span><h3>{t}</h3><p>{p}</p></div>' for e, t, p in k) + '</div>'

ZAHLEN = ('<div class="zahlen">'
  '<div class="zk"><span class="zf">5,0</span><span>★★★★★ bei 57 Google-Bewertungen</span></div>'
  '<div class="zk"><span class="zf">130+</span><span>Betriebe betreut</span></div>'
  '<div class="zk"><span class="zf">2019</span><span>seit dem Jahr nur Handwerk</span></div>'
  '<div class="zk"><span class="zf">0 €</span><span>kostet dich das Konzept</span></div>'
  '</div>')

CHIP = f'<div class="chip">{img("team-noah.jpg","Noah Seelau")}<span><b>Noah Seelau</b> · Gründer HandwerksManufaktur</span></div>'

def hero(eb, h1, sub):
    return blk('papier', f'''<div class="sek" style="padding:30px 20px 34px"><div class="w mitte">
{CHIP}
<div style="margin-top:22px"><span class="eb">{eb}</span></div>
<h1>{h1}</h1>
<p class="lead">{sub}</p>
{ZAHLEN}
</div></div>''')

# ---------- 1A ----------
A1 = hero('🎁 Website-Konzept geschenkt',
  'Erst siehst du deine neue Homepage. <span class="dunkel">Dann entscheidest du.</span>',
  'Wir bauen vorab ein fertiges Konzept für deinen Betrieb. In einem kurzen Videocall zeige ich es dir. Kostenlos und unverbindlich.')

def noah_block(text, zeile, schritte, zitat=''):
    return blk('weiss', f'''<div class="sek"><div class="ww"><div class="zwei">
<div class="foto">{img("noah-laptop.jpg","Noah Seelau am Laptop")}</div>
<div><span class="eb">👋 Dein Ansprechpartner</span>
<h2>Servus, ich bin Noah.</h2>
<p class="lead">{text}</p>{zitat}</div>
</div>
<div class="w" style="margin-top:44px"><h3 style="font-size:22px">{zeile}</h3>{zl(schritte)}</div>
</div></div>''')

B1 = noah_block('Ich baue seit 2019 Websites für Handwerksbetriebe. Früher hast du deine Seite erst gesehen, als schon alles unterschrieben war. Heute baue ich zuerst.',
  'So läuft\'s:', [
  ('📝 Du beantwortest ein paar kurze Fragen.', ''),
  ('📅 Du suchst dir einen Termin für den Videocall aus.', ''),
  ('🛠️ Wir bauen das Konzept deiner neuen Seite.', 'Du musst nichts vorbereiten.'),
  ('💻 Ich zeige es dir im Videocall.', 'Danach entscheidest du.')])

C1 = blk('tinte', '<div class="sek"><div class="w">' + '''<span class="eb">Warum wir das verschenken</span>
<h2>Du sollst nicht die Katze im Sack kaufen.</h2>''' + karten([
  ('👀', 'Du siehst die Seite selbst.', 'Deine Leistungen, dein Ort und dein Logo stehen schon drin.'),
  ('✍️', 'Du unterschreibst vorher nichts.', 'Gefällt dir das Konzept nicht, war es das.'),
  ('💬', 'Du bekommst eine klare Zahl.', 'Im Termin sagt dir Noah, was die fertige Seite kostet.'),
  ('🤝', 'Du hast einen Ansprechpartner.', 'Vom ersten Gespräch bis die Seite online ist.')]) + '<p class="lead" style="margin-top:26px">Fast jeder fünfte Betrieb, mit dem wir reden, hat schon mal Geld für eine Homepage verbrannt. Das soll dir nicht passieren.</p></div></div>')

BAND = ['d-kreitner.jpg','d-vogel.jpg','d-kraus.jpg','d-knappich.jpg','d-dinkel.jpg','d-sdhirsch.jpg','d-hirschvogel.jpg','d-tankschutz.jpg']
def band():
    items = ''.join(br(f, 'Startseite einer Kundenseite der HandwerksManufaktur') for f in BAND)
    return f'<div class="band" style="margin-top:40px"><div class="bandin">{items}{items}</div></div>'

D = blk('papier', '''<div class="sek" style="padding-left:0;padding-right:0"><div class="w mitte" style="padding:0 20px">
<span class="eb">💻 So sehen unsere Seiten aus</span>
<h2>Was du im Termin zu sehen bekommst</h2>
</div>''' + band() + '<div class="w" style="padding:14px 20px 0">' + ''.join(
  f'<div class="reihe">{tel(f, alt)}<div><span class="em">{e}</span><h3 style="margin-top:8px;font-size:22px">{t}</h3><p>{p}</p></div></div>'
  for f, alt, e, t, p in [
   ('m-doerfler-home.jpg','Startseite von Dörfler Bau am Handy','📱','Deine Startseite.','So sieht dich jeder, der dich empfohlen bekommt und abends am Handy nachschaut.'),
   ('m-kreitner-leistung.jpg','Leistungsseite Treppenbau der Schreinerei Kreitner','🧰','Eine Seite je Leistung.','Mit deinem Ort darin, damit dich findet, wer genau diese Arbeit sucht.'),
   ('m-kraus-karriere.jpg','Karriereseite von Dachbau Kraus','👷','Dein Team und deine offene Stelle.','Bewerber sehen, wo sie arbeiten würden, und bewerben sich direkt vom Handy.')]) +
  '<p class="dunkel mitte" style="font-size:13px;margin-top:14px">Echte Seiten, die wir für Kunden gebaut haben.</p></div></div>')

E = blk('weiss', '''<div class="sek"><div class="ww"><div class="w mitte">
<span class="eb">🤝 Dein Team</span>
<h2>Die Leute hinter deinem Auftritt</h2>
<p class="lead">Von Anfang bis Ende dieselben drei.</p></div>
<div class="team">''' + ''.join(
  f'<div class="tm"><div class="bild">{img(f, n, sty)}</div><div class="txt"><h3>{n}</h3><div class="rolle">{r}</div><p>{p}</p></div></div>'
  for f, n, r, p, sty in [
   ('team-noah.jpg','Noah','Gründer','Dein Ansprechpartner vom ersten Gespräch bis die Seite online ist.','style="object-position:50% 20%"'),
   ('team-robert.jpg','Robert','Shooting & Schnitt','Kommt mit Kamera und Drohne zu dir in den Betrieb.','style="object-position:50% 15%"'),
   ('team-rudolf.jpg','Rudolf','Websites & Anzeigen','Baut die Seite und hält Google und Anzeigen am Laufen.','style="object-position:50% 30%"')]) +
  '</div></div></div>')

STIMMEN = [
 ('Noah hat unsere Homepage erstellt und betreut diese. Wir sind sehr zufrieden! Auch der Kontakt ist immer freundlich.', 'Senftleben Haustechnik, Ehingen'),
 ('Sehr gute Unterstützung, auch für ältere Handwerksmeister ohne große IT-Erfahrung.', 'Schreinerei, Wielenbach'),
 ('Nach einem kurzen Telefonat verlief die Umsetzung reibungslos und zu unserer vollen Zufriedenheit. Auch ohne große Computerkenntnisse können wir die Seite selber bearbeiten.', 'Heizungsbauer, Krün'),
 ('Super Service. Alles ganz unkompliziert. Unsere Erwartungen wurden absolut erfüllt. Uneingeschränkte Empfehlung!', 'Zimmerei, Reichling'),
 ('Die HandwerksManufaktur hat meine Website erstellt und ich bin voll zufrieden – war ganz unkompliziert und eine tolle Zusammenarbeit. Wenn ich ein Problem habe, regelt er es schnell.', 'Innenausbau, Ehingen'),
 ('Noah macht einen super Job, ist sehr verlässlich und meldet sich immer zeitnah zurück. Wir sind mega happy mit unserer neuen Homepage – wärmste Empfehlung!', 'Zimmerei, Penzing')]
F = blk('tinte', '''<div class="sek"><div class="ww"><div class="w mitte">
<span class="eb">⭐ Google-Bewertungen</span>
<h2>Was Betriebe über uns schreiben</h2>
<div class="zahlen" style="max-width:560px;margin:26px auto 0">
<div class="zk"><span class="zf">5,0</span><span>Schnitt auf Google</span></div>
<div class="zk"><span class="zf">57</span><span>Google-Bewertungen</span></div>
<div class="zk"><span class="zf">0</span><span>unter fünf Sternen</span></div>
<div class="zk"><span class="zf">2019</span><span>erste Seite gebaut</span></div>
</div></div>
<div class="stimmen">''' + ''.join(
  f'<div class="st"><div class="sterne">★★★★★</div><div style="margin-top:10px;font-size:15.5px;line-height:1.5">„{t}“</div><div class="wer">{w}</div></div>' for t, w in STIMMEN) +
  '</div></div></div>')

G = blk('papier', '''<div class="sek"><div class="w">
<div class="mitte"><span class="eb">🏅 Kurz und knapp</span>
<h2>Warum Betriebe mit uns arbeiten</h2></div>
<div class="zahlen">
<div class="zk"><span class="zf">2019</span><span>seit dem Jahr nur Handwerk</span></div>
<div class="zk"><span class="zf">130+</span><span>Betriebe, die meisten zwischen Allgäu und München</span></div>
<div class="zk"><span class="zf">70+</span><span>Konzepte gebaut</span></div>
<div class="zk"><span class="zf em">📍</span><span>Wir kennen die Orte, in denen deine Kunden suchen</span></div>
</div>
<div class="foto" style="margin-top:26px">NOAHVORORT</div>
</div></div>'''.replace('NOAHVORORT', img("noah-vor-ort.jpg","Noah Seelau mit einem Kundenteam vor dem Firmenwagen")))

RUND = img("team-noah.jpg","Noah Seelau","class='rund'")
def abschluss(h2, sub):
    return blk('tinte', f'''<div class="sek" style="padding-bottom:40px"><div class="w mitte">
{RUND}
<h2 style="margin-top:22px">{h2}</h2>
<p class="lead">{sub}</p>
<div style="max-width:560px;margin:30px auto 0" class="br"><i><b></b><b></b><b></b></i>{img("d-kreitner.jpg","Startseite der Schreinerei Kreitner, gebaut von der HandwerksManufaktur")}</div>
</div></div>''')

H1B = abschluss('Schau dir deine neue Homepage an, bevor du irgendwas entscheidest.',
  'Ein paar kurze Fragen, dann suchst du dir einen Termin aus. Das Konzept bauen wir bis dahin.')

# ---------- 1B ----------
A2 = hero('🛠️ Für Chefs, die auf der Baustelle stehen',
  'Keine Zeit für deine Homepage? <span class="dunkel">Brauchst du auch nicht.</span>',
  'Wir bauen das Konzept deiner neuen Seite, während du arbeitest. Du schaust es dir in einem kurzen Videocall an. Kostenlos.')
B2 = noah_block('Am Telefon höre ich jeden Tag denselben Satz: „Ich komm nicht dazu.“ Verstehe ich. Deshalb brauche ich von dir fast nichts.',
  'Das kostet dich:', [
  ('⏱️ Ein paar kurze Fragen.', ''),
  ('📅 Einen Klick für den Termin.', ''),
  ('🛠️ Null Aufwand, während wir bauen.', 'Wir nehmen, was es von deinem Betrieb schon gibt.'),
  ('💻 Ein kurzer Videocall,', 'in dem ich dir das Konzept zeige.')])
C2 = blk('tinte', '<div class="sek"><div class="w">' + '''<span class="eb">Du musst nichts lernen</span>
<h2>Du machst die Baustelle. Wir die Homepage.</h2>
<p class="lead">Vormittags klingelt das Telefon, nachmittags bist du draußen. Die Homepage bleibt liegen, bis es brennt.</p>''' + karten([
  ('🔎', 'Wir sammeln selbst.', 'Alte Seite, Google-Eintrag, Logo: Das holen wir uns.'),
  ('🛠️', 'Wir bauen das Konzept.', 'Mit deinen Leistungen und deinem Ort.'),
  ('💻', 'Du schaust nur zu.', 'Im kurzen Videocall, gern vom Handy aus.'),
  ('✍️', 'Du entscheidest in Ruhe.', 'Vorher unterschreibst du nichts.')]) + '</div></div>')
H2B = abschluss('Ein paar Fragen, ein kurzer Termin. Den Rest machen wir.',
  'Das Konzept bauen wir, bevor wir reden. Du siehst deine neue Seite zum ersten Mal im Termin.')


# ---------- 1C ----------
A3 = hero('🔎 Empfohlen. Und dann gegoogelt.',
  'Dein Kunde empfiehlt dich. Der Nächste googelt dich. <span class="dunkel">Was sieht er?</span>',
  'Wir bauen vorab ein Konzept deiner neuen Homepage. Im Videocall zeige ich es dir. Kostenlos und unverbindlich.')
B3 = noah_block('Die meisten Betriebe, mit denen ich rede, leben von Empfehlungen. Das hast du dir über Jahre erarbeitet.</p><p class="lead" style="margin-top:10px">Nur schaut heute fast jeder vorher im Internet nach.',
  'So läuft\'s:', [
  ('📝 Du beantwortest ein paar kurze Fragen.', ''),
  ('📅 Du suchst dir einen Termin für den Videocall aus.', ''),
  ('🛠️ Wir bauen das Konzept deiner neuen Seite.', 'Du musst nichts vorbereiten.'),
  ('💻 Ich zeige es dir im Termin.', 'Danach entscheidest du.')],
  '<p style="margin-top:18px;padding-left:14px;border-left:3px solid #16130E;font-size:15px;color:#6B6459">„Die kennen unsere Website besser als wir.“<br><span style="font-size:13px;color:rgba(22,19,14,.45)">Ein Fliesenleger im Gespräch mit uns</span></p>')
C3 = blk('tinte', '<div class="sek"><div class="w">' + '''<span class="eb">Bevor einer anruft</span>
<h2>Die Empfehlung bringt ihn zu dir. Die Seite sorgt dafür, dass er anruft.</h2>
<p class="lead">Kunden und Bewerber schauen abends am Handy nach. Was sie dort finden, entscheidet über den Anruf.</p>''' + karten([
  ('🏡', 'Der empfohlene Kunde.', 'Er will sehen, dass es dich gibt und was du machst. Mit deinem Ort und deinen Arbeiten.'),
  ('👷', 'Der Bewerber.', 'Er schaut, wo er arbeiten würde. Ohne Team und ohne offene Stelle ruft er nicht an.'),
  ('📐', 'Wer Angebote vergleicht.', 'Er schaut sich zwei, drei Betriebe an, bevor er fragt.'),
  ('🤝', 'Dein Stammkunde.', 'Er empfiehlt dich leichter, wenn er einen Link schicken kann.')]) + '</div></div>')
H3B = abschluss('Schau dir an, was der Nächste über dich finden soll.',
  'Ein paar kurze Fragen, dann suchst du dir einen Termin aus. Das Konzept bauen wir bis dahin.')

# ---------- Fragen-Kopf (klein, über jeder Frage) ----------
def fkopf(schritt, von, titel):
    pct = round(schritt / von * 100)
    return blk('papier', f'''<div class="sek" style="padding:24px 20px 20px"><div class="w mitte">
<div style="display:flex;align-items:center;gap:12px;max-width:420px;margin:0 auto">
<span style="font-size:12px;font-weight:700;letter-spacing:.1em;color:rgba(22,19,14,.5)">SCHRITT {schritt}/{von}</span>
<div style="flex:1;height:6px;border-radius:9px;background:rgba(22,19,14,.10);overflow:hidden"><div style="width:{pct}%;height:100%;background:#16130E;border-radius:9px"></div></div>
</div>
</div></div>''')

# ---------- Kontakt ----------
KONTAKT = blk('papier', f'''<div class="sek" style="padding:26px 20px 6px"><div class="w mitte">
<div style="display:flex;align-items:center;gap:12px;max-width:420px;margin:0 auto">
<span style="font-size:12px;font-weight:700;letter-spacing:.1em;color:rgba(22,19,14,.5)">LETZTER SCHRITT</span>
<div style="flex:1;height:6px;border-radius:9px;background:rgba(22,19,14,.10);overflow:hidden"><div style="width:96%;height:100%;background:#16130E;border-radius:9px"></div></div>
</div>
<h2 style="font-size:clamp(28px,7vw,40px);margin:22px 0 10px">Fast fertig. Wohin dürfen wir das Konzept schicken?</h2>
<div class="chip" style="margin-top:8px">{img("team-noah.jpg","Noah Seelau")}<span>Noah meldet sich persönlich. Deine Daten bleiben bei uns.</span></div>
</div></div>''')

# ---------- Danke ----------
DANKE_OBEN = blk('papier', f'''<div class="sek" style="padding:34px 20px 10px"><div class="w mitte">
<div style="width:72px;height:72px;border-radius:50%;background:#16130E;color:#FAF7F1;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:34px;font-weight:800">✓</div>
<h1 style="font-size:clamp(34px,8.4vw,54px)">Danke! Jetzt fehlt nur noch dein Termin.</h1>
<p class="lead">Such dir unten eine Zeit aus. Bis dahin bauen wir das Konzept deiner neuen Homepage.</p>
<div class="chip" style="margin-top:20px">{img("team-noah.jpg","Noah Seelau")}<span><b>Noah</b> zeigt dir dein Konzept</span></div>
</div></div>''')
DANKE_UNTEN = blk('weiss', '''<div class="sek" style="padding:56px 20px 64px"><div class="w">
<div class="mitte"><span class="eb">🧭 So geht es weiter</span></div>''' + zl([
  ('📅 Du wählst einen Termin.', 'Die Bestätigung kommt per Mail.'),
  ('🛠️ Wir bauen dein Konzept.', 'Du musst nichts vorbereiten.'),
  ('💻 Noah zeigt es dir in einem kurzen Videocall.', ''),
  ('✍️ Du entscheidest in Ruhe,', 'ob wir weitermachen.')]) + '''
<div class="zwei" style="margin-top:40px;grid-template-columns:1fr 1fr 1fr;gap:12px">''' + ''.join(tel(f, a) for f, a in [
  ('m-kreitner-home.jpg','Startseite der Schreinerei Kreitner am Handy'),('m-knappich-home.jpg','Startseite der Zimmerei Knappich am Handy'),('m-vogel-home.jpg','Startseite von Vogel Holzbau am Handy')]) +
  '</div><p class="dunkel mitte" style="font-size:13px;margin-top:14px">Seiten, die wir für Kunden gebaut haben.</p><p class="mitte" style="font-size:15px;margin-top:26px;color:#4A443B">Kein passender Termin dabei? Antworte einfach auf die Bestätigungsmail.</p></div></div>')

# ---------- P ----------
PREIS = blk('papier', f'''<div class="sek"><div class="w mitte">
<span class="eb">💬 Zum Preis</span>
<h2>Klar, erst die Zahl.</h2>
<p class="lead">Was deine Seite kostet, hängt davon ab, wie viele Leistungen und Seiten sie braucht. Ohne Konzept wäre jede Zahl geraten.</p>
<p class="lead" style="margin-top:14px">Deshalb bekommst du im Termin beides: dein fertiges Konzept und einen festen Preis. Vorher unterschreibst du nichts.</p>
<div class="zwei" style="margin-top:36px;grid-template-columns:1fr 1fr;gap:14px;max-width:440px;margin-left:auto;margin-right:auto">
{tel("m-dinkel-home.jpg","Startseite von Dinkel Metallbau am Handy")}{tel("m-dinkel-leistung.jpg","Leistungsseite Treppen von Dinkel Metallbau am Handy")}
</div></div></div>''')

# ---------- X ----------
PRIVAT = blk('papier', f'''<div class="sek" style="padding:40px 20px 64px"><div class="w mitte">
<div style="font-size:52px;line-height:1">👋</div>
<h2>Danke fürs Reinschauen!</h2>
<p class="lead">Wir bauen Websites für Handwerksbetriebe. Handwerker vermitteln wir leider nicht.</p>
<p class="lead" style="margin-top:14px">Frag am besten in deinem Ort nach, wen die Nachbarn empfehlen. So findet man meistens die Guten.</p>
<div class="foto" style="max-width:520px;margin:34px auto 0">{img("noah-vor-ort.jpg","Noah Seelau mit einem Kundenteam vor dem Firmenwagen")}</div>
</div></div>''')

# ---------- M ----------
M_INTRO = blk('tinte', f'''<div class="sek" style="padding-bottom:6px"><div class="w mitte">
<span class="eb">👉 Kurz erklärt</span>
<h1 style="font-size:clamp(36px,9vw,58px)">So entsteht dein Website-Konzept</h1>
<p class="lead">Wir schauen uns an, was es von deinem Betrieb schon gibt. Daraus bauen wir eine fertige Startseite mit deinen Leistungen.</p>
<div class="foto" style="margin-top:30px">{img("noah-schreibtisch.jpg","Noah Seelau am Schreibtisch mit Laptop")}</div>
</div></div>''')
OBEN = "style='object-position:50% 0'"
M_KARTEN = blk('weiss', '<div class="sek"><div class="ww"><div class="mk">' + ''.join(
  f'<div class="mkk"><div class="bild">{img(f, a, OBEN)}</div><div class="txt"><span style="font-size:26px">{e}</span><h3 style="margin-top:6px">{t}</h3><p>{p}</p></div></div>'
  for f, a, e, t, p in [
   ('d-vogel.jpg','Startseite von Vogel Holzbau','🔎','Was wir uns anschauen.','Deine alte Seite, deinen Google-Eintrag und dein Logo. Gibt es noch keine Seite, fragen wir dich kurz nach Fotos.'),
   ('d-kraus.jpg','Startseite von Dachbau Kraus','🛠️','Was wir bauen.','Eine Startseite und die Seiten zu deinen Leistungen, mit deinem Ort darin.'),
   ('noah-laptop.jpg','Noah Seelau im Videocall','💻','Was du bekommst.','Einen Termin mit Noah, in dem du die Seite siehst und einen festen Preis hörst.')]) + '</div></div></div>')

BLOECKE = {'a1':A1,'b1':B1,'c1':C1,'d':D,'e':E,'f':F,'g':G,'h1':H1B,'a2':A2,'b2':B2,'c2':C2,'h2':H2B,'a3':A3,'b3':B3,'c3':C3,'h3':H3B,
  'f2':fkopf(1,6,'In welchem Gewerk bist du unterwegs?'),
  'f3':fkopf(2,6,'Wo sitzt dein Betrieb?'),
  'f4':fkopf(3,6,'Hast du schon eine Homepage?'),
  'f5':fkopf(4,6,'Was soll deine neue Seite vor allem schaffen?'),
  'f6':fkopf(5,6,'Wie viele Leute seid ihr im Betrieb?'),
  'f7':fkopf(6,6,'Wann soll deine neue Seite online gehen?'),
  'kontakt':KONTAKT,'danke_oben':DANKE_OBEN,'danke_unten':DANKE_UNTEN,'preis':PREIS,'privat':PRIVAT,'m_intro':M_INTRO,'m_karten':M_KARTEN}
OUT.mkdir(exist_ok=True)
for k, v in BLOECKE.items():
    (OUT / f'{k}.html').write_text(v)
print(len(BLOECKE), 'Blöcke →', OUT, 'Bilder @', REF)
