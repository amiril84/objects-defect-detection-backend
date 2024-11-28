# Wood Defect Detection - Backend

This is the backend server for the Wood Defect Detection system, built with Node.js and Express.

## Features

- AI-powered wood defect detection using OpenAI's vision model
- Image upload and processing
- Automatic thumbnail generation
- RESTful API endpoints
- CORS enabled for frontend communication

## Tech Stack

- Node.js
- Express.js
- OpenAI API
- Multer for file uploads
- Sharp for image processing

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd wood-defect-detection-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
PORT=3001
```

4. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3001

## API Endpoints

### POST /api/analyze
Analyzes uploaded images for wood defects.

Request:
- Method: POST
- Content-Type: multipart/form-data
- Body: files[] (multiple image files)

Response:
```json
{
  "success": true,
  "results": [
    {
      "imageName": "string",
      "imagePath": "string",
      "thumbnailPath": "string",
      "defect": "yes/no",
      "explanation": "string"
    }
  ]
}
```

## Project Structure

```
├── server.js         # Main application file
├── uploads/          # Directory for uploaded images
├── .env             # Environment variables
└── package.json     # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
