const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { OpenAI } = require('openai');
const sharp = require('sharp');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create thumbnail
async function createThumbnail(filepath) {
  const thumbnailPath = filepath.replace(/(\.[^.]+)$/, '-thumb$1');
  await sharp(filepath)
    .resize(150, 150, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFile(thumbnailPath);
  return path.basename(thumbnailPath);
}

// Helper function to extract JSON from markdown
function extractJSONFromMarkdown(text) {
  // Remove markdown code block syntax if present
  const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error parsing JSON:', cleanText);
    throw error;
  }
}

// Analyze image using OpenAI
async function analyzeImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze these wood images to determine which ones are in good condition and which have defects, such as holes, scratches, discoloration, liquid stains, or any combination of these issues and provide the analysis in the following JSON format only: {\"defect\": \"yes/no\", \"explanation\": \"detail description of image including the defects if any\"}"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const result = extractJSONFromMarkdown(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      defect: 'error',
      explanation: `Analysis failed: ${error.message}`
    };
  }
}

// Upload and analyze endpoint
app.post('/api/analyze', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];
    for (const file of req.files) {
      const thumbnailName = await createThumbnail(file.path);
      const analysis = await analyzeImage(file.path);
      
      results.push({
        imageName: file.originalname,
        imagePath: file.filename,
        thumbnailPath: thumbnailName,
        defect: analysis.defect,
        explanation: analysis.explanation
      });
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ error: 'Error processing files' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
