import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";

const app = express();

const PORT = 3000;

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

    (req, res) => {

        if (!req.file) {

            return res
                .status(400)
                .json({

                    error:
                        "No DOCX file uploaded"

                });

        }
        if (isConverting) {

    fs.unlink(
        req.file.path,
        () => {}
    );

    return res
        .status(429)
        .json({

            error:
                "Another conversion is already running. Please wait."

        });

}

isConverting = true;


        const inputPath =
            req.file.path;


        const outputDir =
            uploadDir;


        execFile(
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe",

            [

                "--headless",

                "--convert-to",
                "pdf",

                "--outdir",
                outputDir,

                inputPath

            ],
            {
    timeout: 120000
},

            (error) => {

               if (error) {

    isConverting = false;

    fs.unlink(
        inputPath,
        () => {}
    );

    return res
        .status(500)
        .json({

            error:
                "DOCX conversion failed"

        });

}


                const outputPath =
                    inputPath + ".pdf";


                if (
                    !fs.existsSync(
                        outputPath
                    )
                ) {

                    return res
                        .status(500)
                        .json({

                            error:
                                "PDF was not created"

                        });

                }


                res.download(

    outputPath,

    "converted.pdf",

    () => {

        fs.unlink(
            inputPath,
            () => {}
        );

        fs.unlink(
            outputPath,
            () => {}
        );


        isConverting = false;

    }

);

            }

        );

    }

);


app.listen(

    PORT,

    () => {

        console.log(

            `MergeMate backend running on port ${PORT}`

        );

    }

);