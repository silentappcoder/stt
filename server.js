const express = require('express');
const cors = require('cors');
const multer = require('multer');
const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();
app.use(cors());
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  },
});

function convertToMono(inputBuffer) {
  const inputFile = 'temp.wav';
  const outputFile = 'temp_mono.wav';

  fs.writeFileSync(inputFile, inputBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .audioChannels(1)
      .on('error', (err) => reject(err))
      .on('end', () => {
        const monoBuffer = fs.readFileSync(outputFile);
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
        resolve(monoBuffer);
      })
      .save(outputFile);
  });
}

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }
  try {
    const monoBuffer = await convertToMono(req.file.buffer);
    const client = new speech.SpeechClient();
    const audioBytes = monoBuffer.toString('base64');

    const audio = {
      content: audioBytes,
    };

    const config = {
      encoding: 'LINEAR16',
      languageCode: 'en-US',
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    // console.log('info google'+ JSON.stringify(response.results));
    // const transcription = response.results
    //   .map(result => result.alternatives[0].transcript)
    //   .join('\n');
    // res.send(transcription);
    res.send(JSON.stringify(response.results));
   
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).send(err);
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando 3000');
});
