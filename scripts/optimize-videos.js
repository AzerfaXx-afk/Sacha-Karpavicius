const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

// Set static FFmpeg binary path automatically (Zero setup required)
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  console.error("❌ Binary ffmpeg-static non trouvé.");
  process.exit(1);
}

const RAW_DIR = path.join(process.cwd(), "raw-videos");
const OUTPUT_DIR = path.join(process.cwd(), "public", "Videos");

// Ensure required directories exist
if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SUPPORTED_EXTS = [".mov", ".mp4", ".m4v", ".avi", ".mkv", ".webm"];

function encodeVideoMP4(inputFile, outputFile, baseName) {
  return new Promise((resolve) => {
    console.log(`\n🎬 [1/2] Encodage MP4 H.264 Faststart : ${baseName}.mp4 ...`);
    
    ffmpeg(inputFile)
      .output(outputFile)
      .videoCodec("libx264")
      .outputOptions([
        "-crf 18",
        "-preset medium",
        "-pix_fmt yuv420p",
        "-movflags +faststart",
        "-vf scale=1920:-2"
      ])
      .audioCodec("aac")
      .audioBitrate("160k")
      .on("progress", (progress) => {
        const percent = Math.round(progress.percent || 0);
        process.stdout.write(`   ⏳ Progrès MP4 : ${percent}% \r`);
      })
      .on("end", () => {
        console.log(`\n   ✅ MP4 terminé avec succès -> public/Videos/${baseName}.mp4`);
        resolve(true);
      })
      .on("error", (err) => {
        console.error(`\n   ❌ Erreur d'encodage MP4 pour ${baseName}:`, err.message);
        resolve(false);
      })
      .run();
  });
}

function encodeVideoWebM(inputFile, outputFile, baseName) {
  return new Promise((resolve) => {
    console.log(`\n🎬 [2/2] Encodage WebM VP9 Ultra-Léger : ${baseName}.webm ...`);

    ffmpeg(inputFile)
      .output(outputFile)
      .videoCodec("libvpx-vp9")
      .outputOptions([
        "-crf 28",
        "-b:v 0",
        "-pix_fmt yuv420p",
        "-vf scale=1920:-2"
      ])
      .audioCodec("libopus")
      .audioBitrate("128k")
      .on("progress", (progress) => {
        const percent = Math.round(progress.percent || 0);
        process.stdout.write(`   ⏳ Progrès WebM : ${percent}% \r`);
      })
      .on("end", () => {
        console.log(`\n   ✅ WebM terminé avec succès -> public/Videos/${baseName}.webm`);
        resolve(true);
      })
      .on("error", (err) => {
        // Fallback to Vorbis if Opus is not supported on system build
        console.warn(`\n   ⚠️ Retraitement WebM avec audio Vorbis...`);
        ffmpeg(inputFile)
          .output(outputFile)
          .videoCodec("libvpx-vp9")
          .outputOptions(["-crf 28", "-b:v 0", "-pix_fmt yuv420p", "-vf scale=1920:-2"])
          .audioCodec("libvorbis")
          .audioBitrate("128k")
          .on("progress", (progress) => {
            const percent = Math.round(progress.percent || 0);
            process.stdout.write(`   ⏳ Progrès WebM (Vorbis) : ${percent}% \r`);
          })
          .on("end", () => {
            console.log(`\n   ✅ WebM terminé avec succès -> public/Videos/${baseName}.webm`);
            resolve(true);
          })
          .on("error", (fallbackErr) => {
            console.error(`\n   ❌ Erreur d'encodage WebM pour ${baseName}:`, fallbackErr.message);
            resolve(false);
          })
          .run();
      })
      .run();
  });
}

async function startBatchEncoding() {
  console.log("=================================================");
  console.log("🚀 Sacha Karpavicius - Automation Encodage Vidéo");
  console.log("=================================================\n");

  const files = fs.readdirSync(RAW_DIR).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_EXTS.includes(ext);
  });

  if (files.length === 0) {
    console.log(`⚠️ Aucune vidéo brute trouvée dans le dossier "${RAW_DIR}".`);
    console.log(`👉 Dépose tes fichiers vidéos originaux (.mov, .mp4) dans le dossier "raw-videos" à la racine de ton projet.`);
    console.log(`👉 Puis relance : npm run optimize:videos\n`);
    return;
  }

  console.log(`📹 ${files.length} vidéo(s) brute(s) trouvée(s) dans raw-videos :\n - ${files.join("\n - ")}\n`);

  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const baseName = path.parse(file).name.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
    const inputPath = path.join(RAW_DIR, file);
    const mp4OutputPath = path.join(OUTPUT_DIR, `${baseName}.mp4`);
    const webmOutputPath = path.join(OUTPUT_DIR, `${baseName}.webm`);

    console.log(`-------------------------------------------------`);
    console.log(`🎥 Traitement [${i + 1}/${files.length}] : ${file}`);
    console.log(`-------------------------------------------------`);

    const mp4Ok = await encodeVideoMP4(inputPath, mp4OutputPath, baseName);
    const webmOk = await encodeVideoWebM(inputPath, webmOutputPath, baseName);

    // Sync stream alias if baseName matches au_grand_jour
    if (baseName.includes("au_grand_jour") || baseName.includes("au-grand-jour")) {
      const streamMp4 = path.join(OUTPUT_DIR, "au_grand_jour_stream.mp4");
      const streamWebm = path.join(OUTPUT_DIR, "au_grand_jour_stream.webm");
      const altMp4 = path.join(OUTPUT_DIR, "au-grand-jour.mp4");
      try {
        if (fs.existsSync(mp4OutputPath)) {
          fs.copyFileSync(mp4OutputPath, streamMp4);
          fs.copyFileSync(mp4OutputPath, altMp4);
          console.log(`   🔗 Copie synchronisée : public/Videos/au_grand_jour_stream.mp4`);
        }
        if (fs.existsSync(webmOutputPath)) {
          fs.copyFileSync(webmOutputPath, streamWebm);
          console.log(`   🔗 Copie synchronisée : public/Videos/au_grand_jour_stream.webm`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Erreur lors de la synchronisation des alias stream:`, err.message);
      }
    }

    if (mp4Ok || webmOk) {
      successCount++;
    }
  }

  console.log("\n=================================================");
  console.log(`✨ Encodage terminé ! ${successCount}/${files.length} vidéo(s) traitée(s) avec succès.`);
  console.log(`📁 Fichiers exportés dans : public/Videos/`);
  console.log("=================================================\n");
}

startBatchEncoding();
