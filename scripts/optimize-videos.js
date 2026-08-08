const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  console.error("❌ Binary ffmpeg-static non trouvé.");
  process.exit(1);
}

const RAW_DIR = path.join(process.cwd(), "raw-videos");
const OUTPUT_DIR = path.join(process.cwd(), "public", "Videos");

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SUPPORTED_EXTS = [".mov", ".mp4", ".m4v", ".avi", ".mkv", ".webm"];

function encodeVideoMP4(inputFile, outputFile, baseName) {
  return new Promise((resolve) => {
    console.log(`\n🎬 Encodage Web-Optimized MP4 (<50MB H.264 Faststart) : ${baseName}.mp4 ...`);

    ffmpeg(inputFile)
      .output(outputFile)
      .videoCodec("libx264")
      .outputOptions([
        "-crf 24",
        "-preset medium",
        "-pix_fmt yuv420p",
        "-movflags +faststart",
        "-vf scale=-2:720",
        "-maxrate 1.8M",
        "-bufsize 3.6M"
      ])
      .audioCodec("aac")
      .audioBitrate("128k")
      .on("progress", (progress) => {
        const percent = Math.round(progress.percent || 0);
        process.stdout.write(`   ⏳ Progrès MP4 : ${percent}% \r`);
      })
      .on("end", () => {
        const sizeMb = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2);
        console.log(`\n   ✅ MP4 terminé -> public/Videos/${path.basename(outputFile)} (${sizeMb} MB)`);
        resolve(true);
      })
      .on("error", (err) => {
        console.error(`\n   ❌ Erreur MP4 pour ${baseName}:`, err.message);
        resolve(false);
      })
      .run();
  });
}

function encodeVideoWebM(inputFile, outputFile, baseName) {
  return new Promise((resolve) => {
    console.log(`\n🎬 Encodage Web-Optimized WebM (<30MB VP9) : ${baseName}.webm ...`);

    ffmpeg(inputFile)
      .output(outputFile)
      .videoCodec("libvpx-vp9")
      .outputOptions([
        "-crf 34",
        "-b:v 1.0M",
        "-pix_fmt yuv420p",
        "-vf scale=-2:720"
      ])
      .audioCodec("libopus")
      .audioBitrate("96k")
      .on("progress", (progress) => {
        const percent = Math.round(progress.percent || 0);
        process.stdout.write(`   ⏳ Progrès WebM : ${percent}% \r`);
      })
      .on("end", () => {
        const sizeMb = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2);
        console.log(`\n   ✅ WebM terminé -> public/Videos/${path.basename(outputFile)} (${sizeMb} MB)`);
        resolve(true);
      })
      .on("error", (err) => {
        ffmpeg(inputFile)
          .output(outputFile)
          .videoCodec("libvpx-vp9")
          .outputOptions(["-crf 34", "-b:v 1.0M", "-pix_fmt yuv420p", "-vf scale=-2:720"])
          .audioCodec("libvorbis")
          .audioBitrate("96k")
          .on("progress", (progress) => {
            const percent = Math.round(progress.percent || 0);
            process.stdout.write(`   ⏳ Progrès WebM (Vorbis) : ${percent}% \r`);
          })
          .on("end", () => {
            const sizeMb = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2);
            console.log(`\n   ✅ WebM terminé -> public/Videos/${path.basename(outputFile)} (${sizeMb} MB)`);
            resolve(true);
          })
          .on("error", (fallbackErr) => {
            console.error(`\n   ❌ Erreur WebM pour ${baseName}:`, fallbackErr.message);
            resolve(false);
          })
          .run();
      })
      .run();
  });
}

async function startBatchEncoding() {
  console.log("=================================================");
  console.log("🚀 Compression Ultra-Legère Web (Cible < 45 MB / Vidéo)");
  console.log("=================================================\n");

  const files = fs.readdirSync(RAW_DIR).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_EXTS.includes(ext);
  });

  if (files.length === 0) {
    console.log(`⚠️ Aucune vidéo brute trouvée dans le dossier "${RAW_DIR}".`);
    return;
  }

  console.log(`📹 ${files.length} vidéo(s) brute(s) trouvée(s) :\n - ${files.join("\n - ")}\n`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rawLower = file.toLowerCase();
    const inputPath = path.join(RAW_DIR, file);

    let streamName = "";
    if (rawLower.includes("au_grand_jour") || rawLower.includes("au grand jour")) {
      streamName = "au_grand_jour_stream";
    } else if (rawLower.includes("maladaptive")) {
      streamName = "maladaptive_stream";
    } else if (rawLower.includes("nice_queer") || rawLower.includes("nice queer")) {
      streamName = "nice_queer_stream";
    } else {
      streamName = path.parse(file).name.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
    }

    const mp4OutputPath = path.join(OUTPUT_DIR, `${streamName}.mp4`);
    const webmOutputPath = path.join(OUTPUT_DIR, `${streamName}.webm`);

    console.log(`-------------------------------------------------`);
    console.log(`🎥 Traitement [${i + 1}/${files.length}] : ${file} -> ${streamName}`);
    console.log(`-------------------------------------------------`);

    await encodeVideoMP4(inputPath, mp4OutputPath, streamName);
    await encodeVideoWebM(inputPath, webmOutputPath, streamName);
  }

  console.log("\n=================================================");
  console.log(`✨ Compression terminée ! Fichiers légers prêts pour Git push et streaming fluide.`);
  console.log("=================================================\n");
}

startBatchEncoding();
