# OCR Aadhaar Card Parser

A full-stack application for parsing Aadhaar card information using OCR (Optical Character Recognition) technology. This application allows users to upload front and back images of Aadhaar cards and automatically extracts personal information like name, DOB, gender, UID, address, pincode, and mobile number.

## 🏗️ Project Structure

```
OCR_Aadhaar/
├── client/          # React + TypeScript frontend application
└── server/          # Node.js + Express + TypeScript backend application
```

## 🚀 Features

- ✅ Upload front and back Aadhaar card images
- ✅ Automatic text extraction using Tesseract.js OCR
- ✅ Aadhaar card validation before processing
- ✅ Extract personal information:
  - Name
  - Date of Birth (DOB)
  - Gender
  - Aadhaar Number (UID)
  - Address
  - Pincode
  - Mobile Number
  - Age Band calculation
- ✅ Clean, modern UI with responsive design
- ✅ Real-time OCR processing

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- A modern web browser

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OCR_Aadhaar
```

### 2. Backend Setup

Navigate to the server directory and follow the setup instructions in [server/README.md](./server/README.md)

### 3. Frontend Setup

Navigate to the client directory and follow the setup instructions in [client/README.md](./client/README.md)

## 🧪 Testing

See individual README files for testing procedures:
- [Server Testing](./server/README.md#testing)
- [Client Testing](./client/README.md#testing)

## 📦 Deployment

See individual README files for deployment instructions:
- [Server Deployment](./server/README.md#deployment)
- [Client Deployment](./client/README.md#deployment)

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- Tesseract.js (OCR)
- Multer (File upload)
- CORS

## 📝 API Endpoints

### POST `/api/common/ocr/parse`

Upload Aadhaar card images for OCR parsing.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `front_image`: Front side image of Aadhaar card
  - `back_image`: Back side image of Aadhaar card

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "Name": "Extracted Name",
      "DOB": "DD/MM/YYYY",
      "Gender": "MALE/FEMALE/TRANSGENDER",
      "UID": "12-digit Aadhaar number",
      "address": "Extracted Address",
      "pincode": "6-digit pincode",
      "age_band": "Age range",
      "mobileNumber": "10-digit mobile number",
      "IsUidSame": "UID Matched/Back UID Not Found"
    }
  ],
  "message": "Parsing Successfull"
}
```

## 🐛 Troubleshooting

1. **CORS Errors**: Ensure the backend server is running and CORS is properly configured
2. **OCR Not Working**: Check that images are clear and readable
3. **Port Conflicts**: Change the port in environment variables if needed

## 📄 License

ISC

## 👥 Contributing

This is a private project. For contributions, please contact the project maintainer.
