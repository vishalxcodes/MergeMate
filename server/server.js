import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const app = express();

const PORT = process.env.PORT || 3000;

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


app.use(cors());


const uploadDir =
    path.join(
        __dirname,
        "uploads"
    );


if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );

}

let isConverting = false;

const upload =
    multer({

        dest: uploadDir,

        limits: {

            fileSize:
                25 * 1024 * 1024

        },

        fileFilter: (req, file, cb) => {

            const isDocx =
                file.originalname
                    .toLowerCase()
                    .endsWith(".docx");

            if (!isDocx) {

                return cb(
                    new Error(
                        "Only DOCX files are allowed"
                    )
                );

            }

            cb(null, true);

        }

    });


app.post(
    "/api/convert/docx-to-pdf",

    upload.single("file"),

    app.post(
  "/api/convert/docx-to-pdf",
  upload.single("file"),
  async (req, res) => {

    if (!req.file) {
      return res.status(400).json({ error: "No DOCX file uploaded" });
    }

    if (isConverting) {
      fs.unlink(req.file.path, () => {});
      return res.status(429).json({
        error: "Another conversion is already running. Please wait.",
      });
    }

    isConverting = true;
    const inputPath = req.file.path;

    try {
      const form = new FormData();
      form.append("files", fs.createReadStream(inputPath), {
        filename: req.file.originalname,
      });

      const response = await fetch(
        "https://mergemate-gotenberg.onrender.com/forms/libreoffice/convert",
        {
          method: "POST",
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error(`Gotenberg error: ${response.status}`);
      }

      const pdfBuffer = await response.buffer();

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=converted.pdf",
      });
      res.send(pdfBuffer);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "DOCX conversion failed" });
    } finally {
      fs.unlink(inputPath, () => {});
      isConverting = false;
    }
  }
));


app.listen(

    PORT,

    () => {

        console.log(

            `MergeMate backend running on port ${PORT}`

        );

    }

);