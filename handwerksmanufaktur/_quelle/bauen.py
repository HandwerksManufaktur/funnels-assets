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
.hw.tinte .sek{padding-bottom:0}
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
.hw .chip.gross{padding:6px 18px 6px 6px;border-radius:40px;text-align:left}
.hw .chip.gross img{width:64px;height:64px;flex-shrink:0}
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
.hw .zk .ic{display:flex;align-items:center;justify-content:center;width:40px;height:40px;margin:0 auto 10px;border-radius:50%;background:#FAF7F1;font-size:20px;line-height:1}
.hw.tinte .zk .ic{background:rgba(250,247,241,.10)}
.hw .schluss{margin-top:26px;font-size:15px;color:#6B6459;text-align:center}
.hw.tinte .schluss{color:rgba(250,247,241,.6)}
/* Kunden-Logo in Bewertung */
.hw .st .kopf{display:flex;align-items:center;justify-content:space-between;gap:12px}
.hw .st .logo{background:#FFFFFF;border-radius:12px;padding:6px 10px;height:52px;display:flex;align-items:center}
.hw .st .logo img{max-height:40px;width:auto;max-width:120px}
/* Icon-Zeilen */
.hw .iz{display:grid;gap:10px;margin-top:22px}
.hw .izz{display:flex;gap:14px;align-items:center;padding:14px 16px;border-radius:16px;background:#FFFFFF;border:1px solid rgba(22,19,14,.08);font-size:15.5px;font-weight:600;line-height:1.35}
.hw.tinte .izz{background:rgba(250,247,241,.06);border-color:rgba(250,247,241,.12);color:#FAF7F1}
.hw .izz .ic{flex:0 0 40px;height:40px;border-radius:50%;background:#FAF7F1;display:flex;align-items:center;justify-content:center;font-size:20px}
.hw.tinte .izz .ic{background:rgba(250,247,241,.12)}
/* Seitenplan */
.hw .plan{display:grid;grid-template-columns:1fr 150px;gap:18px;align-items:center;margin-top:30px}
@media(max-width:520px){.hw .plan{grid-template-columns:1fr 118px;gap:12px}}
.hw .baum{display:grid;gap:8px;grid-template-columns:1fr}
.hw .knoten{border-radius:14px;padding:12px 14px;background:#FAF7F1;border:1px solid rgba(22,19,14,.08);font-size:14.5px;font-weight:700;line-height:1.3}
.hw .knoten small{display:block;font-weight:500;color:#6B6459;font-size:12.5px;margin-top:2px}
.hw .knoten.wurzel{background:#16130E;color:#FAF7F1;border-color:#16130E}
.hw .knoten.ast{margin-left:22px;position:relative}
.hw .knoten.ast:before{content:'';position:absolute;left:-14px;top:50%;width:10px;height:2px;background:rgba(22,19,14,.25)}
/* Monogramm */
.hw .mono{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#16130E;color:#FAF7F1;font-family:'Archivo',sans-serif;font-weight:800;font-size:72px;letter-spacing:-.04em}
@media(max-width:640px){.hw .mono{font-size:52px}}
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
.hw .zl .zli{position:relative;padding:0 0 26px 66px;list-style:none}
.hw .zl .zli:last-child{padding-bottom:0}
.hw .zl .zli:before{content:'';position:absolute;left:23px;top:48px;bottom:4px;width:2px;background:rgba(22,19,14,.12)}
.hw .zl .zli:last-child:before{display:none}
.hw .zl .nr{position:absolute;left:0;top:0;width:48px;height:48px;border-radius:50%;background:#16130E;color:#FAF7F1;display:flex;align-items:center;justify-content:center;font-family:'Archivo',sans-serif;font-weight:800;font-size:18px}
.hw.tinte .zl .zli:before{background:rgba(250,247,241,.16)}
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
    return '<div class="zl" role="list">' + ''.join(
        f'<div class="zli" role="listitem"><span class="nr">{i+1}</span><h4>{t}</h4>' + (f'<p>{p}</p>' if p else '') + '</div>'
        for i, (t, p) in enumerate(schritte)) + '</div>'

def karten(k):
    return '<div class="karten">' + ''.join(
        f'<div class="ka"><span class="em">{e}</span><h3>{t}</h3><p>{p}</p></div>' for e, t, p in k) + '</div>'

def zk(ic, zahl, text):
    return f'<div class="zk"><span class="ic">{ic}</span><span class="zf">{zahl}</span><span>{text}</span></div>'
ZAHLEN = ('<div class="zahlen">' + zk('⭐','5,0','bei 57 Google-Bewertungen') + zk('🎁','0 €','kostet dich das Konzept')
  + zk('💻','1 Videocall','dann entscheidest du') + zk('📱','Handy','zuerst gebaut') + '</div>')

def iz(zeilen):
    return '<div class="iz">' + ''.join(f'<div class="izz"><span class="ic">{e}</span><span>{t}</span></div>' for e, t in zeilen) + '</div>'

CHIP = '<div class="chip" style="padding:8px 16px"><span><b>HandwerksManufaktur</b> · seit 2019 nur Handwerk · über 130 Betriebe</span></div>'

def hero(eb, h1, sub):
    return blk('papier', f'''<div class="sek" style="padding:30px 20px 34px"><div class="w mitte">
{CHIP}
<div style="margin-top:22px"><span class="eb">{eb}</span></div>
<h1>{h1}</h1>
<p class="lead">{sub}</p>
{ZAHLEN}
</div></div>''')

# ---------- 1A ----------
A1 = hero('🎁 Kostenloses Website-Konzept',
  'Wir bauen dir kostenlos ein Website-Konzept für deine neue Homepage.',
  'Mit deinem Logo und deinen Leistungen. Im kurzen Videocall zeigen wir es dir, das kostet dich nichts.')

def noah_block(text, zeile, schritte, zitat=''):
    return blk('weiss', f'''<div class="sek"><div class="ww"><div class="zwei">
<div class="foto">{img("noah-laptop.jpg","Noah Seelau am Laptop")}</div>
<div><span class="eb">🤝 Wer wir sind</span>
<h2>So läuft's bei uns</h2>
<p class="lead">{text}</p>{zitat}</div>
</div>
<div class="w" style="margin-top:36px">{zl(schritte)}</div>
</div></div>''')

B1 = noah_block('Wir bauen seit 2019 Homepages für Handwerksbetriebe. Dein Konzept bauen wir, bevor du irgendetwas unterschreibst.',
  'So läuft\'s:', [
  ('📝 Du beantwortest zwei kurze Fragen.', ''),
  ('📅 Du suchst dir einen Termin für den Videocall aus.', ''),
  ('🛠️ Wir bauen das Konzept deiner neuen Homepage.', 'Du musst nichts vorbereiten.'),
  ('💻 Wir zeigen es dir im kurzen Videocall,', 'danach entscheidest du.')])

C1 = blk('tinte', f'''<div class="sek"><div class="w">
<span class="eb">👀 Erst sehen</span>
<h2>Du siehst deine neue Homepage, bevor du etwas unterschreibst.</h2>
<p class="lead">Im Konzept stehen schon dein Logo, deine Leistungen und dein Ort. So sieht zum Beispiel die Startseite aus, die wir für Vogel Holzbau gebaut haben:</p>
<div class="br" style="margin-top:26px"><i><b></b><b></b><b></b></i>{img("d-vogel.jpg","Startseite von Vogel Holzbau, gebaut von der HandwerksManufaktur")}</div>
''' + iz([('✍️','Vorher unterschreibst du nichts.'),('🏗️','Deine Arbeit steht vorne. Deine Leistungen und deine Baustellen sind schon im Konzept drin.'),('📱','Die Seite ist fürs Handy gebaut, weil deine Kunden dort nachschauen.')]) + '<p class="schluss">Das Konzept kostet dich nichts.</p></div></div>')

BAND = ['d-kreitner.jpg','d-vogel.jpg','d-kraus.jpg','d-knappich.jpg','d-dinkel.jpg','d-sdhirsch.jpg','d-hirschvogel.jpg','d-tankschutz.jpg']
def band():
    items = ''.join(br(f, 'Startseite einer Kundenseite der HandwerksManufaktur') for f in BAND)
    return f'<div class="band" style="margin-top:40px"><div class="bandin">{items}{items}</div></div>'

SEO = blk('weiss', f'''<div class="sek"><div class="w">
<div class="mitte"><span class="eb">🔎 Für Google gebaut</span>
<h2>Dein Konzept ist von Anfang an für Google gebaut.</h2>
<p class="lead">Wer in deinem Ort nach einer deiner Leistungen sucht, soll genau die passende Seite von dir finden. Deshalb planen wir die Homepage so:</p></div>
<div class="plan"><div class="baum">
<div class="knoten wurzel">🏠 Startseite<small style="color:rgba(250,247,241,.6)">dein Betrieb auf einen Blick</small></div>
<div class="knoten ast">🔧 Leistung 1<small>mit deinem Ort, eigene Seite</small></div>
<div class="knoten ast">🔧 Leistung 2<small>mit deinem Ort, eigene Seite</small></div>
<div class="knoten ast">🔧 Leistung 3<small>mit deinem Ort, eigene Seite</small></div>
<div class="knoten ast">👷 Karriere<small>für Bewerber aus der Gegend</small></div>
</div>{tel("m-kreitner-leistung.jpg","Leistungsseite Treppenbau der Schreinerei Kreitner am Handy")}</div>
<div class="zahlen" style="margin-top:22px">''' + zk('📄','1 Seite','je Leistung, mit deinem Ort') + zk('⚡','schnell','geladen, auch unterwegs') + zk('📱','Handy','zuerst gebaut') + zk('🔎','Titel','und Text je Seite für Google') + '''</div>
<p class="schluss">Links der Aufbau, rechts eine Leistungsseite der Schreinerei Kreitner am Handy.</p>
</div></div>''')

D = blk('papier', '''<div class="sek" style="padding-left:0;padding-right:0"><div class="w mitte" style="padding:0 20px">
<span class="eb">💻 So sehen unsere Seiten aus</span>
<h2>Was du im Termin zu sehen bekommst</h2>
</div>''' + band() + '<div class="w" style="padding:14px 20px 0">' + ''.join(
  f'<div class="reihe">{tel(f, alt)}<div><span class="em">{e}</span><h3 style="margin-top:8px;font-size:22px">{t}</h3><p>{p}</p></div></div>'
  for f, alt, e, t, p in [
   ('m-doerfler-home.jpg','Startseite von Dörfler Bau am Handy','📱','Deine Startseite.','So sieht dich jeder, der dich empfohlen bekommt und abends am Handy nachschaut.'),
   ('m-kreitner-leistung.jpg','Leistungsseite Treppenbau der Schreinerei Kreitner','🧰','Eine Seite je Leistung.','Mit deinem Ort darin, damit dich findet, wer genau diese Arbeit sucht.'),
   ('m-dinkel-karriere.jpg','Karriereseite von Dinkel Metallbau','👷','Dein Team und deine offene Stelle.','Bewerber sehen, wo sie arbeiten würden, und bewerben sich direkt vom Handy.')]) +
  '<p class="dunkel mitte" style="font-size:13px;margin-top:14px">Seiten, die wir für Kunden gebaut haben.</p></div></div>')

def bild_oder_mono(f, n, sty):
    return img(f, n, sty) if f else '<div class="mono" role="img" aria-label="' + n + '">' + n[0] + '</div>'

E = blk('weiss', '''<div class="sek"><div class="ww"><div class="w mitte">
<span class="eb">🤝 Dein Team</span>
<h2>Die Leute hinter deinem Auftritt</h2>
<p class="lead">Von Anfang bis Ende dieselben drei.</p></div>
<div class="team">''' + ''.join(
  f'<div class="tm"><div class="bild">{bild_oder_mono(f, n, sty)}</div><div class="txt"><h3>{n}</h3><div class="rolle">{r}</div><p>{p}</p></div></div>'
  for f, n, r, p, sty in [
   ('team-noah.jpg','Noah','Gründer','Dein Ansprechpartner vom ersten Gespräch bis die Seite online ist.','style="object-position:50% 20%"'),
   ('team-robert.jpg','Robert','Shooting & Schnitt','Kommt mit Kamera und Drohne zu dir in den Betrieb.','style="object-position:50% 15%"'),
   ('','Rudolf','Websites & Anzeigen','Baut die Seite und hält Google und Anzeigen am Laufen.','')]) +
  '</div></div></div>')

STIMMEN_LOGO = ['logo-k-senftleben.png','logo-k-damnig.png','logo-k-schmidt.png','logo-k-rauschmair.png','logo-k-jirka.png','logo-k-schneider.png']
STIMMEN_BETRIEB = ['Senftleben Haustechnik','Schreinerei Damnig','Hannes Schmidt GmbH','Zimmerei Rauschmair','Jirka Hotelsanierung','Zimmerei Schneider']
STIMMEN = [
 ('Noah hat unsere Homepage erstellt und betreut diese. Wir sind sehr zufrieden! Auch der Kontakt mit Noah ist immer freundlich.', 'Senftleben Sanitär Heizung, Ehingen'),
 ('Sehr gute Unterstützung, auch für ältere Handwerksmeister ohne große IT-Erfahrung.', 'Schreinerei, Wielenbach'),
 ('Nach einem kurzen Telefonat und Kennenlernen verlief die Umsetzung reibungslos und zu unserer vollen Zufriedenheit. Auch ohne große Computerkenntnisse, können wir nun die Seite auch selber bearbeiten Dank Noah´s Schritt für Schritt Anleitung.', 'Heizungsbauer, Krün'),
 ('Super Service. Alles ganz unkompliziert. Unsere Erwartungen wurden absolut erfüllt. Uneingeschränkte Empfehlung!', 'Zimmerei, Reichling'),
 ('Die HandwerksManufaktur Hat meine Website erstellt und ich bin voll zufrieden war ganz unkompliziert und eine tolle Zusammenarbeit. Wenn ich ein Problem habe regelt er es schnell.', 'Innenausbau, Ehingen'),
 ('Noah macht einen super Job, ist sehr verlässlich und meldet sich immer zeitnah beim Kunden zurück. Wir sind mega happy mit unserer neuen Homepage und können die HandwerksManufaktur wärmstens weiterempfehlen!', 'Zimmerei, Penzing')]
F = blk('tinte', '''<div class="sek"><div class="ww"><div class="w mitte">
<span class="eb">⭐ Google-Bewertungen</span>
<h2>Was Betriebe über uns schreiben</h2>
<div class="zahlen" style="max-width:560px;margin:26px auto 0">''' + zk('⭐','5,0','Schnitt auf Google') + zk('💬','57','Google-Bewertungen') + zk('✅','0','unter fünf Sternen') + zk('📅','2019','erste Seite gebaut') + '''</div></div>
<div class="stimmen">''' + ''.join(
  f'<div class="st"><div class="kopf"><div class="sterne">★★★★★</div><div class="logo">{img(STIMMEN_LOGO[k], "Logo " + STIMMEN_BETRIEB[k])}</div></div><div style="margin-top:12px;font-size:15.5px;line-height:1.5">„{t}“</div><div class="wer">{w}</div></div>' for k, (t, w) in enumerate(STIMMEN)) +
  '</div><p class="schluss">Alle Bewertungen stehen öffentlich auf Google.</p></div></div>')

G = blk('papier', f'''<div class="sek"><div class="w">
<div class="mitte"><span class="eb">🏅 Kurz und knapp</span>
<h2>Warum Betriebe mit uns arbeiten</h2></div>
<div class="zahlen">''' + zk('📅','2019','seit dem Jahr nur Handwerk') + zk('🏗️','130+','Betriebe betreut') + zk('📍','Dein Ort','auf jeder Leistungsseite') + zk('🤝','3 Leute','von Anfang bis Ende') + f'''</div>
<div class="foto" style="margin-top:26px">{img("noah-vor-ort.jpg","Noah Seelau mit einem Kundenteam vor dem Firmenwagen")}</div>
</div></div>''')

RUND = '<div class="foto" style="max-width:420px;margin:0 auto">' + img("noah-mit-kunde-hirschvogel.jpg","Noah Seelau mit einem Kunden am Küchentisch, Laptop aufgeklappt") + '</div>'
def abschluss(h2, sub):
    return blk('tinte', f'''<div class="sek"><div class="w mitte">
{RUND}
<h2 style="margin-top:26px">{h2}</h2>
<p class="lead">{sub}</p>
</div></div>''')

H1B = abschluss('Schau dir dein fertiges Website-Konzept an, bevor du irgendwas entscheidest.',
  'Zwei kurze Fragen, dann suchst du dir einen Termin aus. Bis dahin bauen wir das Konzept deiner neuen Homepage.')

# ---------- 1B ----------
A2 = hero('🛠️ Für Chefs, die auf der Baustelle stehen',
  'Keine Zeit für die Homepage? Wir bauen dir das Konzept, du schaust es nur an.',
  'Kostenlos und mit deinem Logo, deinen Leistungen und deinem Ort. Du beantwortest zwei kurze Fragen, den Rest holen wir uns selbst. Im kurzen Videocall siehst du das Ergebnis.')
B2 = noah_block('Am Telefon hören wir jeden Tag denselben Satz: „Ich komm nicht dazu.“ Deshalb brauchen wir von dir fast nichts.',
  'Das kostet dich:', [
  ('⏱️ Zwei kurze Fragen.', ''),
  ('📅 Einen Klick für den Termin.', ''),
  ('🛠️ Keine Arbeit, während wir bauen.', 'Wir nehmen, was es von deinem Betrieb schon gibt.'),
  ('💻 Einen kurzen Videocall,', 'in dem wir dir das Konzept zeigen.')])
C2 = blk('tinte', f'''<div class="sek"><div class="w">
<span class="eb">Du musst nichts lernen</span>
<h2>Du machst die Baustelle. Wir die Homepage.</h2>
<p class="lead">Alte Seite, Google-Eintrag und Logo holen wir uns selbst. Daraus entsteht eine Startseite wie diese, die wir für Vogel Holzbau gebaut haben:</p>
<div class="br" style="margin-top:26px"><i><b></b><b></b><b></b></i>{img("d-vogel.jpg","Startseite von Vogel Holzbau, gebaut von der HandwerksManufaktur")}</div>
''' + iz([('🔎','Wir sammeln selbst, was es von deinem Betrieb gibt.'),('🛠️','Wir bauen das Konzept mit deinen Leistungen und deinem Ort.'),('💻','Du schaust es dir im kurzen Videocall an, gern vom Handy aus.')]) + '<p class="schluss">Vorher unterschreibst du nichts.</p></div></div>')
H2B = abschluss('Zwei Fragen, ein kurzer Termin. Den Rest machen wir.',
  'Das Konzept bauen wir, bevor wir reden. Du siehst deine neue Homepage zum ersten Mal im Videocall.')


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
    return blk('weiss', f'''<div class="sek" style="padding:28px 20px 18px"><div class="w mitte">
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
<h2 style="font-size:clamp(28px,7vw,40px);margin:22px 0 10px">Fast fertig. Jetzt reservierst du die Vorstellung deines Konzepts.</h2>
<div class="chip gross" style="margin-top:8px">{img("team-noah.jpg","Noah Seelau")}<span>Wir melden uns persönlich bei dir. Deine Daten bleiben bei uns.</span></div>
</div></div>''')

KONTAKT_HINWEIS = blk('weiss', '<div style="max-width:420px;margin:0 auto;padding:6px 24px 2px;text-align:center;font-size:13px;line-height:1.45;color:#6B6459">Mit dem Absenden melden wir uns zu deiner Anfrage per Telefon und E-Mail. Abmelden geht jederzeit mit einem Klick.</div>')

# ---------- Danke ----------
DANKE_OBEN = blk('papier', f'''<div class="sek" style="padding:34px 20px 10px"><div class="w mitte">
<div style="position:relative;width:128px;height:128px;margin:0 auto">{img("team-noah.jpg","Noah Seelau","style='width:128px;height:128px;border-radius:50%;object-fit:cover;object-position:50% 18%;display:block'")}<svg width="44" height="44" viewBox="0 0 44 44" role="img" aria-label="Erledigt" style="position:absolute;right:-4px;bottom:-4px"><circle cx="22" cy="22" r="20" fill="#16130E" stroke="#FAF7F1" stroke-width="4"/><path d="M13 22.5l6 6L31 16" fill="none" stroke="#FAF7F1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<h1 style="font-size:clamp(34px,8.4vw,54px)">Danke! Jetzt fehlt nur noch dein Termin.</h1>
<p class="lead">Such dir unten eine Zeit aus. Bis dahin bauen wir das Konzept deiner neuen Homepage.</p>
<p style="margin-top:14px;font-size:14px;color:#6B6459">Wir zeigen dir dein Konzept im Videocall.</p>
</div></div>''')
DANKE_UNTEN = blk('weiss', '''<div class="sek" style="padding:56px 20px 64px"><div class="w">
<div class="mitte"><span class="eb">🧭 So geht es weiter</span></div>''' + zl([
  ('📅 Du wählst einen Termin.', 'Die Bestätigung kommt per Mail.'),
  ('🛠️ Wir bauen dein Konzept.', 'Du musst nichts vorbereiten.'),
  ('💻 Wir zeigen es dir im kurzen Videocall.', ''),
  ('✍️ Du entscheidest in Ruhe,', 'ob wir weitermachen.')]) + '''
<div class="zwei" style="margin-top:40px;grid-template-columns:1fr 1fr 1fr;gap:12px">''' + ''.join(tel(f, a) for f, a in [
  ('m-kreitner-home.jpg','Startseite der Schreinerei Kreitner am Handy'),('m-knappich-home.jpg','Startseite der Zimmerei Knappich am Handy'),('m-vogel-home.jpg','Startseite von Vogel Holzbau am Handy')]) +
  '</div><p class="dunkel mitte" style="font-size:13px;margin-top:14px">Seiten, die wir für Kunden gebaut haben.</p><p class="mitte" style="font-size:15px;margin-top:26px;color:#4A443B">Kein passender Termin dabei? Antworte einfach auf die Bestätigungsmail.</p></div></div>')

# ---------- P ----------
PREIS = blk('papier', f'''<div class="sek" style="padding-top:30px"><div class="w mitte">
<span class="eb">💬 Zum Preis</span>
<h2>Klar, erst die Zahl.</h2>
<p class="lead">Was deine Seite kostet, hängt davon ab, wie viele Leistungen und Seiten sie braucht. Ohne Konzept wäre jede Zahl geraten.</p>
<p class="lead" style="margin-top:14px">Deshalb bekommst du im Termin beides: dein fertiges Konzept und einen festen Preis. Vorher unterschreibst du nichts.</p>
<div class="zwei" style="margin-top:30px;grid-template-columns:1fr 1fr;gap:14px;max-width:440px;margin-left:auto;margin-right:auto">
{tel("m-dinkel-home.jpg","Startseite von Dinkel Metallbau am Handy")}{tel("m-dinkel-leistung.jpg","Leistungsseite Treppen von Dinkel Metallbau am Handy")}
</div><p class="schluss">Zwei Seiten, die wir für Dinkel Metallbau gebaut haben.</p></div></div>''')

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
   ('noah-laptop.jpg','Noah Seelau im Videocall','💻','Was du bekommst.','Einen kurzen Termin, in dem du deine neue Homepage fertig siehst.')]) + '</div></div></div>')

BLOECKE = {'a1':A1,'b1':B1,'c1':C1,'d':SEO+D,'e':E,'f':F,'g':G,'h1':H1B,'a2':A2,'b2':B2,'c2':C2,'h2':H2B,'a3':A3,'b3':B3,'c3':C3,'h3':H3B,
  'f2':fkopf(1,2,'In welchem Gewerk bist du unterwegs?'),
  'f3':fkopf(2,2,'Hast du schon ein Logo?'),
  'kontakt':KONTAKT,'kontakt_hinweis':KONTAKT_HINWEIS,'danke_oben':DANKE_OBEN,'danke_unten':DANKE_UNTEN,'preis':PREIS,'privat':PRIVAT,'m_intro':M_INTRO,'m_karten':M_KARTEN}
OUT.mkdir(exist_ok=True)
for k, v in BLOECKE.items():
    (OUT / f'{k}.html').write_text(v)
print(len(BLOECKE), 'Blöcke →', OUT, 'Bilder @', REF)
