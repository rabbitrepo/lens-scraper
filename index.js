const fs = require('fs');
const path = require('path');
const ExifParser = require('exif-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// set the path to the images folder
const folderPath = './images';

// create a CSV writer
const csvWriter = createCsvWriter({
    path: './metadata.csv',
    header: [
        { id: 'filename', title: 'Filename' },
        { id: 'make', title: 'Maker' },
        { id: 'model', title: 'Model' },
        { id: 'focalLength', title: 'Focal Length' },
        { id: 'aperture', title: 'Aperture' },
        { id: 'fStop', title: 'F-stop' },
        { id: 'exposure', title: 'Shutter Speed' },
        { id: 'iso', title: 'ISO' },
        { id: 'flash', title: 'Flash' },
    ],
});

// loop through all JPEG files in the images folder
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    // filter only JPEG files
    const jpegFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');

    // create an array to store the metadata for all JPEG files
    const metadata = [];

    // loop through all JPEG files and extract their metadata
    for (const file of jpegFiles) {
        const filePath = path.join(folderPath, file);

        // read the JPEG image into a buffer
        const buffer = fs.readFileSync(filePath);

        // create a new ExifParser instance and parse the buffer
        const parser = ExifParser.create(buffer);
        const result = parser.parse();

        // get the camera metadata
        const make = result.tags.Make;
        const model = result.tags.Model;
        const focalLength = result.tags.FocalLength;
        const aperture = result.tags.ApertureValue;
        const fStop = result.tags.FNumber;

        const exposureDecimal = result.tags.ExposureTime;
        const exposureFraction = Math.round(1 / exposureDecimal);
        const exposure = `1/${exposureFraction}`;

        const iso = result.tags.ISO;
        const flash = result.tags.Flash;

        // parse the file path to get the filename without the extension
        const parsedPath = path.parse(file);
        const filenameWithoutExt = parsedPath.name;

        // add the metadata to the array
        metadata.push({
            filename: filenameWithoutExt,
            make,
            model,
            focalLength,
            aperture,
            fStop,
            exposure,
            iso,
            flash,
        });
    }

    // write the metadata to the CSV file
    csvWriter.writeRecords(metadata)
        .then(() => console.log('Metadata written to CSV file'))
        .catch(error => console.error(error));
});
