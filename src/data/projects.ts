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
  gallery: string[];
  descriptionFr: string;
  descriptionEn: string;
  client: string;
  exif: ProjectExif;
  credits: ProjectCredit[];
}

export const projectsData: Project[] = [
  {
    id: "editorial-1",
    slug: "editorial-1",
    title: "EDITORIAL I",
    subtitle: "Fashion & Haute Couture Story",
    category: "Fashion",
    year: "2026",
    coverImage: "/2.jpg",
    heroImage: "/2.jpg",
    gallery: ["/2.jpg", "/3.jpg", "/5.jpg", "/4.jpg"],
    descriptionFr: "Une étude poétique sur la silhouette et les matières textiles sous une lumière de studio sculpting. Chaque cliché capture la tension entre l'élégance intemporelle de la haute couture et une modernité radicale.",
    descriptionEn: "A poetic study on silhouette and textile materials under sculpting studio light. Each shot captures the tension between timeless haute couture elegance and radical modernity.",
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
    slug: "editorial-2",
    title: "EDITORIAL II",
    subtitle: "Chiaroscuro Portraiture Series",
    category: "Portrait",
    year: "2026",
    coverImage: "/3.jpg",
    heroImage: "/3.jpg",
    gallery: ["/3.jpg", "/1.jpg", "/6.jpg", "/2.jpg"],
    descriptionFr: "Exploration des émotions brutes à travers un clair-obscur dramatique. Inspiré des maîtres de la peinture classique, ce projet cherche à révéler la vulnérabilité derrière l'expression du regard.",
    descriptionEn: "Exploration of raw emotions through dramatic chiaroscuro. Inspired by classical painting masters, this project seeks to reveal vulnerability behind the gaze.",
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
    slug: "ambiance",
    title: "AMBIANCE",
    subtitle: "Atmospheric & Texture Exploration",
    category: "Mode",
    year: "2025",
    coverImage: "/4.jpg",
    heroImage: "/4.jpg",
    gallery: ["/4.jpg", "/5.jpg", "/2.jpg", "/3.jpg"],
    descriptionFr: "Une immersion dans les textures architecturales et les contrastes urbains. Un dialogue silencieux entre l'espace, la lumière naturelle du soir et les lignes de vêtements minimalistes.",
    descriptionEn: "An immersion into architectural textures and urban contrasts. A silent dialogue between space, evening natural light, and minimalist clothing lines.",
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
    slug: "lumiere",
    title: "LUMIÈRE",
    subtitle: "Cinematic Volumetric Storytelling",
    category: "Story",
    year: "2025",
    coverImage: "/5.jpg",
    heroImage: "/5.jpg",
    gallery: ["/5.jpg", "/1.jpg", "/4.jpg", "/6.jpg"],
    descriptionFr: "Un voyage visuel centré sur la réfraction de la lumière à travers la fumée et le verre. Chaque image est conçue comme un arrêt sur image d'un film atmosphérique mystérieux.",
    descriptionEn: "A visual journey centered on light refraction through smoke and glass. Each image is designed as a freeze-frame from a mysterious atmospheric film.",
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
    slug: "nocturne",
    title: "NOCTURNE",
    subtitle: "Night Film & Midnight Aesthetics",
    category: "Film",
    year: "2025",
    coverImage: "/6.jpg",
    heroImage: "/6.jpg",
    gallery: ["/6.jpg", "/2.jpg", "/3.jpg", "/5.jpg"],
    descriptionFr: "Les lueurs artificielles des métropoles la nuit. Une série nocturne brute capturant la mélancolie des rues vides sous les néons et les ombres étirées.",
    descriptionEn: "Artificial glows of metropolises at night. A raw nocturnal series capturing the melancholy of empty streets under neon lights and elongated shadows.",
    client: "Dior / Night Editorial Project",
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
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projectsData.find((p) => p.slug === slug);
}
