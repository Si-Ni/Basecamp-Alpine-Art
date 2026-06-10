// src/data/artworks.ts
// All artwork data is stored here and images are served from /public/images/

export type Orientation = "vertical" | "horizontal" | "square";
export type Category = "oil" | "watercolor" | "photography";

export interface Artwork {
  id: string;
  title: string;
  category: Category;
  year: number;
  width: number; // cm
  height: number; // cm
  price?: number; // in EUR, undefined = sold
  sold?: boolean;
  description?: string;
  image: string; // path relative to /public
  tags?: string[];
  // For photography
  location?: string;
}

function orientation(w: number, h: number): Orientation {
  if (Math.abs(w - h) < 5) return "square";
  return w > h ? "horizontal" : "vertical";
}

export const artworks: Artwork[] = [
  // ── Ölgemälde ──────────────────────────────────────────────
  {
    id: "oil-10",
    title: "Erlebtes in Farbe",
    category: "oil",
    year: 2026,
    width: 160,
    height: 100,
    sold: true,
    description:
      "Das Ölgemälde verbindet mehrere markante Alpengipfel zu einer künstlerisch komponierten Hochgebirgslandschaft. Steile, schneebedeckte Gipfel ragen majestätisch empor und stehen im starken Kontrast zu den weichen, fließenden Nebelwolken, die ruhig durch die Täler ziehen. Durch die bewusst gewählte warme Farbpalette des Sonnenaufgangs, der auch die Bergspitzen im ersten Licht erstrahlt, möchte ich Energie, Antriebskraft und Lebensfreude spürbar machen.",
    image: "/images/oil/erlebtes_in_farbe.jpg",
  },
  {
    id: "oil-09",
    title: "Monochrome Einsamkeit",
    category: "oil",
    year: 2026,
    width: 50,
    height: 70,
    price: 840,
    description:
      "In der stillen Winternacht ragen die Drei Zinnen in unzähligen grauen Nuancen wie Schattenriesen empor.\n Die Strukturmasse lässt jedes Relief, jede Rille und jede Kante spürbar werden. Schwarz-Weiß reduziert die Szene auf das Wesentliche: Licht, Schatten, Kontraste und die einsame Stimmung des Skifahrers vor den gigantischen Nordwänden der Drei Zinnen.\n Der angedeutete Rahmen hält die Szene zusammen. Im Einklang mit den bewusst mittig platzierten Mond und Skifahrer bringt er eine ruhige Ordnung in die dramatische Wildnis.",
    image: "/images/oil/monochrome_einsamkeit.jpg",
  },
  {
    id: "oil-08",
    title: "Über den Wolken – Wilder Kaiser",
    category: "oil",
    year: 2025,
    width: 80,
    height: 40,
    price: 840,
    description:
      "Dieses Ölgemälde zeigt den weiten Blick vom Zahmen Kaiser hinüber zu den schroffen Kalkzacken des Wilden Kaisers, die wie eine mächtige Mauer aus dem Wolkenmeer aufragen. Inspiriert wurde ich von der kurz zuvor gegangenen eindrucksvollen Sieben-Gipfel-Tour, die vom Grinnerkof über die Pyramidenspitze bis zum Rosskaiser führte. Ich wollte unbedingt die Stimmung eines traumhaften Tages über den Wolken einfangen und wie die Route mit Kletterschwierigkeiten bis UIAA II Kondition, absolute Schwindelfreiheit und Trittsicherheit im teils weglosen Gelände abverlangte.",
    image: "/images/oil/ueber_den_wolken_wilder_kaiser.jpg",
  },
  {
    id: "oil-07",
    title: "König der Lüfte",
    category: "oil",
    year: 2025,
    width: 80,
    height: 40,
    price: 840,
    description:
      "Vom Grat der zurückliegenden Gipfeltour, zwischen Geigelstein und Breitenstein öffnet sich der Blick auf den Wilden Kaiser. Vor Ihm liegen die noch schneebedeckten Hänge, eingebettet in kräftigen Farben.\n Der Himmel selbst ist kein stiller Hintergrund, sondern Hauptdarsteller. Kräftiges Blau mischt sich mit weißen und dunklen Wolken, in denen sich erster Niederschlag andeutet. Zwei Steinadler spiegeln die Dynamik der Wolken wider und verleihen der Szene noch mehr Lebendigkeit.\n Das Gemälde hält den Augenblick fest, in dem der Frühling allmählich Einzug hält.",
    image: "/images/oil/koenig_der_luefte.jpg",
  },
  {
    id: "oil-06",
    title: "Blick vom Triglav",
    category: "oil",
    year: 2025,
    width: 48,
    height: 48,
    price: 650,
    description:
      "Das Ölgemälde zeigt den Ausblick nach vielen Höhenmetern vom wunderschönen Dach Sloweniens. Vom felsigen Gipfel öffnet sich das Triglavtal mit seiner grünen Landschaft, durchzogen vom Lauf der Soča. Mithilfe von Spachteltechniken habe ich dem Gemälde zusätzliche Struktur verliehen.\n Steinböcke prägen inzwischen wieder die Hochgebirgsregionen rund um den Triglav und gehören selbstverständlich in das Gemälde.",
    image: "/images/oil/blick_vom_triglav.jpg",
  },
  {
    id: "oil-05",
    title: "Goldener Moment über dem Kaisergebirge",
    category: "oil",
    year: 2025,
    width: 107,
    height: 47,
    price: 970,
    description:
      "Dieses Ölgemälde zeigt den Wilden Kaiser, wie ich ihn im Sonnenuntergang über den Wolken erlebt habe. Glühende Orangetöne treffen auf kühles Blau, während die schroffen Felsformen langsam im Abendlicht zur Ruhe kommen. Das Ölgemälde fängt jenen flüchtigen Moment ein, in dem der Tag vergeht und gleichzeitig sich die Welt über den Wolken grenzenlos und frei anfühlt.",
    image: "/images/oil/goldener_moment_ueber_dem_kaisergebirge.jpg",
  },
  {
    id: "oil-04",
    title: "An Höhe gewinnen",
    category: "oil",
    year: 2025,
    width: 130,
    height: 62,
    price: 1250,
    description:
      "Von Eiger, Mönch, Jungfrau und Weisshorn in der Schweiz, über die Mont-Blanc-Gruppe zwischen Frankreich und Italien, bis zum Großglockner und dem Watzmann in meiner Heimat – diese Berge erzählen von Stille, Kraft und Weite.\n Die Ölfarben tragen das Spiel von Licht und Schatten sowie von Schnee und Felsen auf die Leinwand, sie machen die majestätische Ruhe der Höhen, die Schroffheit und die Erhabenheit der Alpenlandschaften spürbar. Gleichzeitig erzählt das Werk von dem Staunen über die Natur, die uns so viel Energie und Inspiration schenkt.",
    image: "/images/oil/an_hoehe_gewinnen.jpg",
  },
  {
    id: "oil-03",
    title: "Spannung",
    category: "oil",
    year: 2025,
    width: 103,
    height: 36,
    price: 870,
    description:
      "Das Ölgemälde zeigt eine kletternde Person kurz bevor ein Griff losgelassen und ein neuer sicherer Halt gesucht wird. Eine Interpretation für die Freude am Klettern, bei dem Körper und Geist, wie Fokus und Kraft zusammenfinden und dabei fast jede Muskelgruppe unter Spannung steht.\n Unsere Partner motivieren, helfen uns mit meist ziemlich verrückten Bewegungen am Boden und feiern mit uns Erfolge.\n Die beim Klettern und Bouldern erlernten Fähig- und Fertigkeiten wie Angstbewältigung, Grenzen überwinden, Körpergefühl und vieles mehr, fördern unsere mentale und körperliche Stärke im Alltag.",
    image: "/images/oil/spannung.jpg",
  },
  {
    id: "oil-02",
    title: "Höhenflug am Bergkamm",
    category: "oil",
    year: 2025,
    width: 66,
    height: 35,
    price: 670,
    description:
      "Ein kühler Morgenhimmel, in dem noch Sterne glimmen, trägt die ersten warmen Strahlen der Sonne auf den Wolken.\n Währenddessen ragen die schroffen Gipfel aus einem sanften Nebelmeer empor.\n Der markante exponierte Grat im Vordergrund verbindet die beiden Teile des Gemäldes. Er ist ein Symbol für einen Wegweiser, Balance und den Mut, sich auf schmalem Pfad hoch über den Tiefen zu bewegen.\n Zwei Vögel ziehen ihre Kreise darüber und verleihen dem Bild mehr Dynamik und Leichtigkeit.",
    image: "/images/oil/hoehenflug_am_bergkamm.jpg",
  },
  {
    id: "oil-01",
    title: "Topografische Eigenkomposition",
    category: "oil",
    year: 2024,
    width: 70,
    height: 50,
    price: 840,
    description:
      "Die frei komponierte Hochgebirgslandschaft entfaltet sich in gestaffelten Bergketten und die dazwischenliegenden Wasserflächen spiegeln die umliegenden Formen.\n Ich wählte eine reduzierte Farbpalette aus kühlen Blau-, Grau- und Erdtönen, um die Atmosphäre von Ruhe und Zeitlosigkeit zu verstärken.\n Beim Malen begann ich zu träumen, die Lofoten zu bereisen, die ich bisher jedoch nur aus Erzählungen und Bildern kenne – daher erinnert sie den einen oder anderen vielleicht eher an Mittelerde aus Herr der Ringe?",
    image: "/images/oil/topografische_eigenkomposition.jpg",
  },

  // ── Aquarelle ──────────────────────────────────────────────
  {
    id: "wc-09",
    title: "Zwischen Mensch und Fels",
    category: "watercolor",
    year: 2026,
    width: 100,
    height: 44,
    price: 720,
    description:
      "Mein dreiteiliges Aquarell zeigt die wichtigen Verbindungspunkte zwischen Mensch, Fels und Sicherung. Mastwurf, Halbmastwurf und Achterknoten stehen dabei für Verantwortung und Vertrauen – für ein stilles Versprechen: Ich passe auf dich auf. Aus diesem Vertrauen kann eine tiefe Verbundenheit entstehen, die im Alltag selten geworden ist. Besonders in Mehrseillängen lerne ich, mit Angst umzugehen, meine Gefühle bewusst zu beeinflussen und darin eine neue Form von Freiheit zu entdecken. Es geht darum, Unsicherheit auszuhalten und dennoch handlungsfähig bleiben zu können.\n Die zarten Aquarellfarben und der Blick vom Fels in die Berglandschaft unterstreichen diese Erfahrung: Nichts ist hart abgegrenzt, und man erkennt sich selbst als Teil dieser Natur.",
    image: "/images/watercolor/zwischen_mensch_und_fels.jpg",
  },
  {
    id: "wc-08",
    title: "Kampenwand – schwebend über der Bergwelt",
    category: "watercolor",
    year: 2026,
    width: 44,
    height: 32,
    price: 390,
    description:
      "Dieses Aquarell zeigt die Kampenwand, die ich oft bestiegen habe und sehr schätze, im strahlenden Sonnenlicht. Besonders empfehlenswert finde ich die spektakuläre Gratüberschreitung, die ihre markanten Gipfel und Türme miteinander verbindet. Über dem Grat schwebt ein Gleitschirmflieger, eingebettet in einen klaren blauen Himmel mit von der Sonne angestrahlten Wolken.",
    image: "/images/watercolor/kampenwand_schwebend_ueber_der_bergwelt.jpg",
  },
  {
    id: "wc-07",
    title: "Über der letzten Exe",
    category: "watercolor",
    year: 2025,
    width: 32,
    height: 42,
    price: 390,
    description:
      "Das Aquarellbild fängt das Gefühl des Kletterns in der Natur ein: den Fels unter den Händen, das Vertrauen in unscheinbare Tritte, das konzentrierte Suchen nach den nächsten Griffen und Tritten.\n Beim Vorstiegsklettern wächst bei mir die Spannung, besonders sobald ich über die letzte Exe hinaus klettere – frei, etwas ängstlich, lebendig.",
    image: "/images/watercolor/ueber_der_letzten_exe.jpg",
  },
  {
    id: "wc-06",
    title: "Umkehr",
    category: "watercolor",
    year: 2025,
    width: 32,
    height: 42,
    sold: true,
    description:
      "Verführt mit Höhe und Weite - doch Weisheit kennt den Moment des Innehaltens. Es braucht nicht immer einen Gipfel, um den Weg wertvoll zu machen.\n Rechtzeitig den Berg zu verlassen bedeutet Respekt vor den eigenen Grenzen. Mir helfen Stopp-Regeln, Entscheidungen klar zu treffen und sicher zurückzukehren.",
    image: "/images/watercolor/umkehr.jpg",
  },
  {
    id: "wc-05",
    title: "Zwischen Aufbruch und Rückkehr",
    category: "watercolor",
    year: 2025,
    width: 60,
    height: 40,
    price: 540,
    description:
      "Bergsteiger- und Kletterausrüstung hängen auf einer Wäscheleine und heben sich durch leuchtende Farben vom dunklen Hintergrund ab.\n Die Wäscheleine symbolisiert den Übergang des Abenteuers in den Alltag – man hängt gedanklich noch der letzten Tour nach, während die nächste bereits geplant wird.",
    image: "/images/watercolor/zwischen_aufbruch_und_rueckkehr.jpg",
  },
  {
    id: "wc-04",
    title: "Aus dem Schatten der Nacht dem Matterhorn entgegen",
    category: "watercolor",
    year: 2025,
    width: 32,
    height: 44,
    price: 390,
    description:
      "Wenn der Bergsteiger in der Dunkelheit startet, liegt die Welt noch still. Jeder Blick Richtung Gipfel ein Versprechen von Glück und Freiheit.\n Das Aquarell fängt diesen Moment des Aufbruchs ein: von Schatten zu Licht, von Stille zu Höhe.\n Ein Bild von Aufstieg, Entwicklung, von der inneren Reise und dem Streben nach Perspektive.",
    image:
      "/images/watercolor/aus_dem_schatten_der_nacht_dem_matterhorn_entgegen.jpg",
  },
  {
    id: "wc-03",
    title: "Versteinerte Königsfamilie",
    category: "watercolor",
    year: 2025,
    width: 42,
    height: 30,
    sold: true,
    description:
      "In kühlen Blau- und Grautönen erhebt sich die schneebedeckte markante  Watzmannsilhoette.\n Das Bergmassiv bildet sich der Saga nach aus dem grausamen König `Watzmann´, seiner Frau und ihrer Kinder, die zur Strafe in Fels verwandelt wurden.\n Besonders die Überschreitung und Aufstiege über die Ostwand ziehen erfahrene Bergsteiger und Kletterer stark an. Gerade aufgrund dieser einzigartigen Faszination des Bergsteigens wurde der Watzmann Teil meiner Kunstsammlung.",
    image: "/images/watercolor/versteinerte_koenigsfamilie.jpg",
  },
  {
    id: "wc-02",
    title: "Bergmeere",
    category: "watercolor",
    year: 2025,
    width: 107,
    height: 47,
    price: 790,
    description:
      "Das Aquarell zeigt Bergketten, die wie Wellen über das Gemälde ziehen. Helle Töne im Hintergrund und kräftigere Farben im Vordergrund erzeugen Tiefe.\n Die bewusste Schlichtheit der Farbwahl lenkt den Blick auf die Form und Struktur der Berge und verleiht der Landschaft eine ruhige, meditative Ausstrahlung.",
    image: "/images/watercolor/bergmeere.jpg",
  },
  {
    id: "wc-01",
    title: "Enrosadira",
    category: "watercolor",
    year: 2024,
    width: 43,
    height: 33,
    price: 390,
    description:
      "Das Dolomitgestein, geformt aus einem urzeitlichen tropischen Korallenmeer, lässt die Berge bei Sonnenauf- und -untergang in einem unverwechselbaren, warmen Licht erstrahlen (das berühmte „Enrosadira“).\n Dieses natürliche Schauspiel inspirierte mich zu diesem Aquarell. Besonders faszinierend ist Seceda mit ihren messerscharfen, grasbewachsenen Graten, die ich deswegen als Motiv wählte, um die einzigartige Schönheit der Dolomiten einzufangen.",
    image: "/images/watercolor/enrosadira.jpg",
  },

  // ── Fotografie ──────────────────────────────────────────────
  {
    id: "foto-13",
    title: "Hohenaschau",
    category: "photography",
    year: 2025,
    width: 4921,
    height: 2758,
    location: "Hohenaschau, Bayern",
    image: "/images/photography/hohenaschau_2025.jpg",
  },
  {
    id: "foto-12",
    title: "Gross Bigerhorn",
    category: "photography",
    year: 2025,
    width: 5472,
    height: 3648,
    location: "Gross Bigerhorn, Schweiz",
    image: "/images/photography/gross_bigerhorn_2025.jpg",
  },
  {
    id: "foto-11",
    title: "Dutjer Horn Piz Miezgi",
    category: "photography",
    year: 2025,
    width: 5472,
    height: 3078,
    location: "Dutjer Horn und Piz Miezgi, Schweiz",
    image: "/images/photography/dutjer_gorn_piz_miezgi_2025.jpg",
  },
  {
    id: "foto-10",
    title: "Lago d'Antorno",
    category: "photography",
    year: 2024,
    width: 5361,
    height: 3016,
    location: "Lago d'Antorno, Italien",
    image: "/images/photography/lago_d_antorno_2024.jpg",
  },
  {
    id: "foto-09",
    title: "Hochfelln",
    category: "photography",
    year: 2024,
    width: 5472,
    height: 3648,
    location: "Hochfelln, Bayern",
    image: "/images/photography/hochfelln_2024.jpg",
  },
  {
    id: "foto-08",
    title: "Dolomiten – Die 3 Zinnen",
    category: "photography",
    year: 2024,
    width: 5472,
    height: 3648,
    location: "Drei Zinnen, Italien",
    image: "/images/photography/dolomiten_die_3_zinnen_2024.jpg",
  },
  {
    id: "foto-07",
    title: "Überschreitung Hinteres Sonnwendjoch",
    category: "photography",
    year: 2023,
    width: 5472,
    height: 3648,
    location: "Hinteres Sonnenwendjoch, Österreich",
    image: "/images/photography/ueberschreitung_hinteres_sonnwendjoch_2023.jpg",
  },
  {
    id: "foto-06",
    title: "Wilder Kaiser, Hintere Goinger Halt",
    category: "photography",
    year: 2022,
    width: 3894,
    height: 1626,
    location: "Wilder Kaiser, Österreich",
    image: "/images/photography/wilder_kaiser_hintere_goinger_halt_2022_2.jpg",
  },
  {
    id: "foto-05",
    title: "Wilder Kaiser, Hintere Goinger Halt",
    category: "photography",
    year: 2022,
    width: 2319,
    height: 3479,
    location: "Wilder Kaiser, Österreich",
    image: "/images/photography/wilder_kaiser_hintere_goinger_halt_2022.jpg",
  },
  {
    id: "foto-04",
    title: "Wendelstein",
    category: "photography",
    year: 2022,
    width: 5472,
    height: 3648,
    location: "Wendelstein, Bayern",
    image: "/images/photography/wendelstein_2021.jpg",
  },
  {
    id: "foto-03",
    title: "Taubenstein",
    category: "photography",
    year: 2022,
    width: 5472,
    height: 3648,
    location: "Taubenstein, Bayern",
    image: "/images/photography/taubenstein_2021.jpg",
  },
  {
    id: "foto-02",
    title: "Blick vom Taubenstein",
    category: "photography",
    year: 2021,
    width: 5472,
    height: 3648,
    location: "Taubenstein, Bayern",
    image: "/images/photography/blick_vom_taubenstein_2021.jpg",
  },
  {
    id: "foto-01",
    title: "Am Soinsee unter den Ruchenköpfen",
    category: "photography",
    year: 2021,
    width: 5472,
    height: 3648,
    location: "Ruchenköpfe, Bayern",
    image: "/images/photography/am_soinsee_unter_den_ruchenkoepfen_2021.jpg",
  },
];

export function getOrientation(art: Artwork): Orientation {
  return orientation(art.width, art.height);
}

export function getByCategory(cat: Category): Artwork[] {
  return artworks.filter((a) => a.category === cat);
}
