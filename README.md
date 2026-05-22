# Funnels Assets

Bilder & Videos für alle HandwerksManufaktur-Kunden-Funnels.

**Hosting via jsDelivr CDN:**
```
https://cdn.jsdelivr.net/gh/{user}/funnels-assets@main/{kunde-slug}/{filename}
```

## Struktur

Ein Subfolder pro Kunde. Naming: lowercase, kebab-case.

```
funnels-assets/
├── erwin-schmidt-sohn/
│   ├── portrait-florian-meike.jpg
│   ├── location-werkstatt-aussen.jpg
│   └── ...
└── README.md
```

## Workflow für neuen Funnel

1. Bilder als 1600px-JPGs in `{kunde-slug}/` ablegen
2. Naming sprechend wählen (z.B. `portrait-{name}.jpg`, `team-{kontext}.jpg`, `day-{tageszeit}-{aktion}.jpg`)
3. Commit + Push
4. URLs im HTML einsetzen
