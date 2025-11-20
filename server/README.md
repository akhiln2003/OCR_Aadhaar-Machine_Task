# OCR Aadhaar - Server

Backend server for Aadhaar card OCR parsing application built with Node.js, Express, and TypeScript.

## 📋 Prerequisites

- Node.js v18 or higher
- npm v9 or higher

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=4002

# MongoDB Configuration (if needed in future)
# MONGODB_URI=mongodb://localhost:27017/ocr_aadhaar

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server

#### Development Mode (with hot reload)

```bash
npm start
```

The server will start on `http://localhost:4002` (or the port specified in `.env`).

#### Production Mode

```bash
npm run build  # Compile TypeScript (if build script exists)
node dist/server.js
```

## 📁 Project Structure

```
server/
├── src/
│   ├── app.ts                      # Main application setup
│   ├── server.ts                   # Server entry point
│   ├── application/                # Application layer
│   │   ├── interface/
│   │   │   └── ICreateOcrUsecase.ts
│   │   └── usecase/
│   │       └── createOcr.usecase.ts
│   ├── domain/                     # Domain layer
│   │   ├── entities/
│   │   │   └── Ocr.ts
│   │   └── interfaces/
│   │       ├── IOcrRepository.ts
│   │       └── IServer.ts
│   ├── infrastructure/             # Infrastructure layer
│   │   ├── @types/
│   │   │   └── IOcrService.ts
│   │   ├── di/
│   │   │   └── DIContainer.ts
│   │   ├── server/
│   │   │   └── express.ts
│   │   ├── services/
│   │   │   └── OcrService.ts      # OCR processing service
│   │   └── utils/
│   │       ├── ageBand.ts
│   │       └── maskData.ts
│   └── presentation/               # Presentation layer
│       ├── controllers/
│       │   └── ocr.controller.ts
│       ├── errors/
│       │   └── ApiError.ts
│       ├── middlewares/
│       │   └── middlewares.ts
│       └── routes/
│           └── common.routes.ts
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### POST `/api/common/ocr/parse`

Parse Aadhaar card images using OCR.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `front_image`: Image file (front side of Aadhaar card)
  - `back_image`: Image file (back side of Aadhaar card)

**Response:**

Success (200):
```json
{
  "status": true,
  "data": [
    {
      "Name": "Extracted Name",
      "DOB": "05/11/1997",
      "Gender": "MALE",
      "UID": "123456789012",
      "address": "Extracted Address",
      "pincode": "400706",
      "age_band": "20-30",
      "mobileNumber": "9876543295",
      "maskedMobileNumber": "********295",
      "IsUidSame": "UID Matched"
    }
  ],
  "message": "Parsing Successfull"
}
```

Error (400/500):
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## 🧪 Testing

### Manual Testing

1. **Test OCR Parsing:**
   ```bash
   # Start the server
   npm start
   
   # Use a tool like Postman or curl to test
   curl -X POST http://localhost:4002/api/common/ocr/parse \
     -F "front_image=@/path/to/front.jpg" \
     -F "back_image=@/path/to/back.jpg"
   ```

2. **Test CORS:**
   - Ensure frontend can make requests to the backend
   - Check browser console for CORS errors

### Testing Checklist

- ✅ Server starts successfully
- ✅ CORS is configured correctly
- ✅ Image upload works
- ✅ OCR extraction works
- ✅ Error handling works
- ✅ Aadhaar validation works

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```
   Error: Port 4002 is already in use
   ```
   **Solution:** Change the PORT in `.env` file or kill the process using that port.

2. **OCR Not Extracting Text**
   ```
   Error: Could not extract UID from Aadhaar card
   ```
   **Solution:**
   - Ensure images are clear and high quality
   - Check server logs for extracted text
   - Verify images are actual Aadhaar cards

3. **CORS Errors**
   ```
   Access-Control-Allow-Origin header is missing
   ```
   **Solution:** 
   - Verify `FRONTEND_URL` in `.env` matches your frontend URL
   - Check `server/src/infrastructure/server/express.ts` for CORS configuration

4. **Module Not Found**
   ```
   Error: Cannot find module 'tesseract.js'
   ```
   **Solution:** Run `npm install` to install all dependencies

## 📦 Dependencies

### Production Dependencies
- `express`: Web framework
- `tesseract.js`: OCR library
- `multer`: File upload handling
- `cors`: Cross-Origin Resource Sharing
- `dotenv`: Environment variable management

### Development Dependencies
- `typescript`: TypeScript compiler
- `tsx`: TypeScript execution
- `@types/*`: TypeScript type definitions

## 🚀 Deployment

### Using PM2 (Recommended)

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Build the project:**
   ```bash
   npm run build  # If build script exists
   ```

3. **Start with PM2:**
   ```bash
   pm2 start dist/server.js --name ocr-server
   ```

4. **Save PM2 configuration:**
   ```bash
   pm2 save
   pm2 startup
   ```

### Using Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4002
CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t ocr-server .
docker run -p 4002:4002 ocr-server
```

### Environment Variables for Production

```env
PORT=4002
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## 📝 Development Notes

- The server uses clean architecture with separation of concerns
- OCR processing happens asynchronously for both images
- Error handling is centralized in the error handler middleware
- All extracted data is returned to the frontend without storing in database

## 🔒 Security Considerations

- File upload size limits should be configured in production
- Rate limiting should be added for production use
- Input validation should be enhanced for production
- Consider adding authentication/authorization for production deployment

