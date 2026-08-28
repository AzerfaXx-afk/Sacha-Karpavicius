export interface ProjectExif {
  camera: string;
  lens: string;
  iso: string;
  aperture: string;
  shutterSpeed: string;
  location: string;
  date: string;
}

export interface ProjectCredit {
  role: string;
  name: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  coverImage: string;
  heroImage: string;
  objectPosition?: string;
  videoUrl?: string;
  previewVideoUrl?: string;
  isVideo?: boolean;
  gallery: string[];
  descriptionFr: string;
  descriptionEn: string;
  client: string;
  exif: ProjectExif;
  credits: ProjectCredit[];
}

export const videoProjectsData: Project[] = [
  {
    id: "maladaptive",
    slug: "maladaptive",
    title: "MALADAPTIVE",
    subtitle: "",
    category: "Vidéo",
    year: "2026",
    coverImage: "/Videos/maladaptive-cover.jpg",
    heroImage: "/Videos/maladaptive-cover.jpg",
    objectPosition: "object-center",
    videoUrl: "https://github.com/AzerfaXx-afk/Sacha-Karpavicius/releases/download/v1.0.0/MALADAPTIVE.mp4",
    previewVideoUrl: "/Videos/maladaptive-preview.mp4",
    isVideo: true,
    gallery: [],
    descriptionFr: "Projet visuel expérimental",
    descriptionEn: "Experimental visual project",
    client: "Sacha Karpavicius",
    exif: {
      camera: "RED V-Raptor 8K",
      lens: "Cooke Anamorphic /i Full Frame Plus",
      iso: "ISO 800",
      aperture: "T2.3",
      shutterSpeed: "1/48s",
      location: "Paris, France",
      date: "2026"
    },
    credits: [
      { role: "Réalisation & Direction Artistique", name: "Sacha Karpavicius" }
    ]
  },
  {
    id: "festival-in-and-out",
    slug: "festival-in-and-out",
    title: "BANDE ANNONCE",
    subtitle: "",
    category: "Vidéo",
    year: "2026",
    coverImage: "/Videos/in-and-out-cover.jpg",
    heroImage: "/Videos/in-and-out-cover.jpg",
    objectPosition: "object-center",
    videoUrl: "https://github.com/AzerfaXx-afk/Sacha-Karpavicius/releases/download/v1.0.0/Bande.annonce.de.lExposition.NICE.QUEER.UNE.HISTOIRE.A.ECRIRE.mp4",
    previewVideoUrl: "/Videos/festival-in-and-out-preview.mp4",
    isVideo: true,
    gallery: [],
    descriptionFr: "Bande annonce pour le festival In&Out 2026 à Nice.",
    descriptionEn: "Trailer for the In&Out 2026 festival in Nice.",
    client: "Festival In&Out",
    exif: {
      camera: "Sony FX6",
      lens: "35mm T1.5",
      iso: "ISO 800",
      aperture: "T1.8",
      shutterSpeed: "1/50s",
      location: "Nice, France",
      date: "2026"
    },
    credits: [
      { role: "Réalisation", name: "Sacha Karpavicius" }
    ]
  },
  {
    id: "au-grand-jour",
    slug: "au-grand-jour",
    title: "AU GRAND JOUR",
    subtitle: "",
    category: "Vidéo",
    year: "2026",
    coverImage: "/Videos/AFFICHE.png",
    heroImage: "/Videos/AFFICHE.png",
    objectPosition: "object-center",
    videoUrl: "https://github.com/AzerfaXx-afk/Sacha-Karpavicius/releases/download/v1.0.0/AU.GRAND.JOUR.mp4",
    previewVideoUrl: "/Videos/au-grand-jour-preview.mp4",
    isVideo: true,
    gallery: [],
    descriptionFr: "Court métrage de fin de première année.",
    descriptionEn: "Short film from the end of first year.",
    client: "Sacha Karpavicius",
    exif: {
      camera: "Canon EOS R5",
      lens: "RF 50mm f/1.2 L USM",
      iso: "ISO 100",
      aperture: "f/2.8",
      shutterSpeed: "1/200s",
      location: "Nice, France",
      date: "2026"
    },
    credits: [
      { role: "Réalisation & Direction Artistique", name: "Sacha Karpavicius" }
    ]
  }
];

export const projectsData: Project[] = [
  {
    id: "editorial-1",
    slug: "aemona-and-fada",
    title: "AEMONA & FADA",
    subtitle: "",
    category: "Portrait",
    year: "2026",
    coverImage: "/Photos/projet1/extend back.png",
    heroImage: "/Photos/projet1/extend back.png",
    objectPosition: "object-[center_28%]",
    gallery: [
      "/Photos/projet1/DSC02390-2-Edit.jpg",
      "/Photos/projet1/PHOTO FINAL 1.png",
      "/Photos/projet1/Doule crash.1-Edit.jpg",
      "/Photos/projet1/crasd 4X4X4.1.jpg",
      "/Photos/projet1/DSC02512.jpg",
      "/Photos/projet1/DSC02606.jpg",
      "/Photos/projet1/fadaaa en masse.jpg",
      "/Photos/projet1/AemonaHorloge.png",
      "/Photos/projet1/DSC02316.jpg",
      "/Photos/projet1/DSC02345.jpg",
      "/Photos/projet1/Sans titre-1.png",
      "/Photos/projet1/Sans legsssssss-1.png"
    ],
    descriptionFr: "",
    descriptionEn: "",
    client: "Vogue Italia / Paris Editorial",
    exif: {
      camera: "Hasselblad H6D-100c",
      lens: "HC 100mm f/2.2",
      iso: "ISO 100",
      aperture: "f/4.0",
      shutterSpeed: "1/250s",
      location: "Studio Harcourt, Paris",
      date: "Février 2026"
    },
    credits: [
      { role: "Direction Artistique", name: "Sacha Karpavicius" },
      { role: "Stylisme", name: "Elena Rostova" },
      { role: "Mannequin", name: "Camille Dupont (Viva Model)" },
      { role: "Maquillage", name: "Antoine Moreau" }
    ]
  },
  {
    id: "editorial-2",
    slug: "fada",
    title: "FADA",
    subtitle: "",
    category: "Portrait",
    year: "2026",
    coverImage: "/Photos/projet2/DSC02768.jpg",
    heroImage: "/Photos/projet2/DSC02768.jpg",
    objectPosition: "object-[center_20%]",
    gallery: [
      "/Photos/projet2/DSC02793.jpg",
      "/Photos/projet2/DSC02790.jpg",
      "/Photos/projet2/DSC02768.jpg",
      "/Photos/projet2/DSC02854.jpg",
      "/Photos/projet2/test vintage.png",
      "/Photos/projet2/DSC02698.jpg"
    ],
    descriptionFr: "",
    descriptionEn: "",
    client: "Numéro Homme / Portrait Series",
    exif: {
      camera: "Leica SL2",
      lens: "APO-Summicron-SL 90mm f/2 ASPH",
      iso: "ISO 200",
      aperture: "f/2.0",
      shutterSpeed: "1/160s",
      location: "Milan, Italie",
      date: "Janvier 2026"
    },
    credits: [
      { role: "Photographie & Retouche", name: "Sacha Karpavicius" },
      { role: "Lumière", name: "Marco Rossi" },
      { role: "Modèle", name: "Julien V." }
    ]
  },
  {
    id: "ambiance",
    slug: "crossover-festival-aymce",
    title: "CROSSOVER FESTIVAL AYMCE",
    subtitle: "",
    category: "Festival",
    year: "2026",
    coverImage: "/Photos/projet3/DSC07375-3.jpg",
    heroImage: "/Photos/projet3/DSC07375-3.jpg",
    objectPosition: "object-[center_52%]",
    gallery: [
      "/Photos/projet3/DSC07419.jpg",
      "/Photos/projet3/DSC07338.jpg",
      "/Photos/projet3/DSC07675-2.jpg",
      "/Photos/projet3/DSC07410-2.jpg",
      "/Photos/projet3/DSC07574.jpg",
      "/Photos/projet3/DSC07331.jpg",
      "/Photos/projet3/DSC07674.jpg"
    ],
    descriptionFr: "",
    descriptionEn: "",
    client: "Saint Laurent / Capsule Campaign",
    exif: {
      camera: "Canon EOS R5",
      lens: "RF 50mm f/1.2 L USM",
      iso: "ISO 400",
      aperture: "f/1.8",
      shutterSpeed: "1/500s",
      location: "Fondation Pinault, Paris",
      date: "Novembre 2025"
    },
    credits: [
      { role: "Photographie", name: "Sacha Karpavicius" },
      { role: "Direction de Création", name: "Lucas Vance" },
      { role: "Production", name: "Studio 18 Paris" }
    ]
  },
  {
    id: "lumiere",
    slug: "autoportrait",
    title: "AUTOPORTRAIT",
    subtitle: "",
    category: "Portrait",
    year: "2026",
    coverImage: "/Photos/projet4/1.jpg",
    heroImage: "/Photos/projet4/1.jpg",
    objectPosition: "object-[center_10%]",
    gallery: [
      "/Photos/projet4/2.jpg",
      "/Photos/projet4/3.jpg",
      "/Photos/projet4/4.jpg",
      "/Photos/projet4/5.jpg"
    ],
    descriptionFr: "",
    descriptionEn: "",
    client: "L'Officiel Paris / Special Issue",
    exif: {
      camera: "Hasselblad H6D-100c",
      lens: "HC 50mm f/3.5",
      iso: "ISO 64",
      aperture: "f/5.6",
      shutterSpeed: "1/125s",
      location: "Villa Savoye, Poissy",
      date: "Octobre 2025"
    },
    credits: [
      { role: "Directeur de la Photographie", name: "Sacha Karpavicius" },
      { role: "Set Design", name: "Clara Deschamp" },
      { role: "Éclairage Spécial", name: "Luc B." }
    ]
  },
  {
    id: "nocturne",
    slug: "margiela-la-fabric",
    title: "Margiela - LA FABRIC",
    subtitle: "",
    category: "Fashion",
    year: "2026",
    coverImage: "/Photos/projet5/FAB09470 copie-2.jpg",
    heroImage: "/Photos/projet5/FAB09470 copie-2.jpg",
    objectPosition: "object-[center_8%]",
    gallery: [
      "/Photos/projet5/FAB09501.jpg",
      "/Photos/projet5/FAB09511.jpg",
      "/Photos/projet5/FAB09485.jpg",
      "/Photos/projet5/FAB09782.jpg",
      "/Photos/projet5/FAB09547.jpg",
      "/Photos/projet5/FAB09554.jpg"
    ],
    descriptionFr: "Série photo réalisée dans le cadre d'un stage avec l'enseigne LA FABRIC - cette série de photo met en avant les vêtements Maison Margiela proposées par le magasin.",
    descriptionEn: "Photo series created during an internship with LA FABRIC - highlighting Maison Margiela clothing offered by the store.",
    client: "LA FABRIC / Maison Margiela",
    exif: {
      camera: "Leica M11-P",
      lens: "Summilux-M 35mm f/1.4 ASPH",
      iso: "ISO 1600",
      aperture: "f/1.4",
      shutterSpeed: "1/60s",
      location: "Navigli, Milan",
      date: "Septembre 2025"
    },
    credits: [
      { role: "Photographe", name: "Sacha Karpavicius" },
      { role: "Casting Director", name: "Sophie Laurent" }
    ]
  },
  {
    id: "projet-6",
    slug: "la-fabric",
    title: "LA FABRIC",
    subtitle: "",
    category: "Editorial",
    year: "2026",
    coverImage: "/Photos/projet6/Sans titre - 11 mars 2026 15.07.jpg",
    heroImage: "/Photos/projet6/Sans titre - 11 mars 2026 15.07.jpg",
    objectPosition: "object-[center_8%]",
    gallery: [
      "/Photos/projet6/111111.jpg",
      "/Photos/projet6/FAB05043.jpg",
      "/Photos/projet6/FAB05061.jpg",
      "/Photos/projet6/FAB05634.jpg",
      "/Photos/projet6/IMG_2771.jpg",
      "/Photos/projet6/IMG_2783.jpg",
      "/Photos/projet6/IMG_3025.jpg",
      "/Photos/projet6/Sans titre - 11 mars 2026 14.45.jpg",
      "/Photos/projet6/Sans titre - 11 mars 2026 15.17.jpg",
      "/Photos/projet6/Sans titre-1.jpg",
      "/Photos/projet6/Sans titre-2.jpg",
      "/Photos/projet6/V2.jpg",
      "/Photos/projet6/vv.jpg"
    ],
    descriptionFr: "Groupement de photos réalisé dans le cadre d'un stage avec photos mettent en avant les marques proposées par le magasin et comment nous les avons mises en avant sous la forme la plus créative.",
    descriptionEn: "Selection of photos created during an internship showcasing the brands offered by the store and how we creatively highlighted them.",
    client: "Editorial Series",
    exif: {
      camera: "Canon EOS R5",
      lens: "RF 50mm f/1.2 L USM",
      iso: "ISO 100",
      aperture: "f/2.8",
      shutterSpeed: "1/200s",
      location: "Paris, France",
      date: "Mars 2026"
    },
    credits: [
      { role: "Photographie", name: "Sacha Karpavicius" }
    ]
  },
  {
    id: "projet-7",
    slug: "rick-owens-la-fabric",
    title: "RICK OWENS - LA FABRIC",
    subtitle: "",
    category: "Fashion",
    year: "2026",
    coverImage: "/Photos/projet7/IMG_3069-2.jpg",
    heroImage: "/Photos/projet7/IMG_3069-2.jpg",
    objectPosition: "object-[center_42%]",
    gallery: [
      "/Photos/projet7/IMG_3061.jpg",
      "/Photos/projet7/IMG_3064.jpg",
      "/Photos/projet7/IMG_3074.jpg"
    ],
    descriptionFr: "Série photo réalisée dans le cadre d'un stage avec l'enseigne LA FABRIC - cette série de photo met en avant les vêtements Rick OWENS proposés par le magasin.",
    descriptionEn: "Photo series created during an internship with LA FABRIC - highlighting Rick OWENS clothing offered by the store.",
    client: "LA FABRIC / Rick Owens",
    exif: {
      camera: "Leica SL2",
      lens: "90mm f/2 ASPH",
      iso: "ISO 200",
      aperture: "f/2.0",
      shutterSpeed: "1/160s",
      location: "Studio Paris",
      date: "Février 2026"
    },
    credits: [
      { role: "Photographie", name: "Sacha Karpavicius" }
    ]
  },
  {
    id: "projet-8",
    slug: "londres-avril-2026",
    title: "Londres, Avril 2026",
    subtitle: "",
    category: "Travel",
    year: "2026",
    coverImage: "/Photos/projet8/IMG_0729.jpg",
    heroImage: "/Photos/projet8/IMG_0729.jpg",
    objectPosition: "object-center",
    gallery: [
      "/Photos/projet8/IMG_0714.jpg",
      "/Photos/projet8/IMG_0828.jpg",
      "/Photos/projet8/IMG_0857.jpg",
      "/Photos/projet8/IMG_0923.jpg",
      "/Photos/projet8/IMG_0927.jpg",
      "/Photos/projet8/IMG_0941.JPG",
      "/Photos/projet8/IMG_0993.JPG",
      "/Photos/projet8/IMG_1002.jpg",
      "/Photos/projet8/IMG_1025.JPG",
      "/Photos/projet8/IMG_1176.JPG",
      "/Photos/projet8/IMG_1226.jpg",
      "/Photos/projet8/IMG_1282.jpg",
      "/Photos/projet8/IMG_1341.JPG",
      "/Photos/projet8/IMG_1353.JPG"
    ],
    descriptionFr: "Série photo réalisé pendant un voyage à Londres",
    descriptionEn: "Photo series created during a trip to London",
    client: "Travel / London Series",
    exif: {
      camera: "Leica M11-P",
      lens: "Summilux-M 35mm f/1.4 ASPH",
      iso: "ISO 100",
      aperture: "f/1.4",
      shutterSpeed: "1/250s",
      location: "London, UK",
      date: "Avril 2026"
    },
    credits: [
      { role: "Photographie", name: "Sacha Karpavicius" }
    ]
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  const allProjects = [...projectsData, ...videoProjectsData];
  return allProjects.find((p) => p.slug === slug || p.id === slug);
}
