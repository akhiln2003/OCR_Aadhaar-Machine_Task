# OCR Aadhaar - Client

Frontend application for Aadhaar card OCR parsing built with React, TypeScript, and Tailwind CSS.

## 📋 Prerequisites

- Node.js v18 or higher
- npm v9 or higher

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:4002/api/common
```

**Note:** The frontend expects the backend to be running on `http://localhost:4002` by default. Adjust this if your backend is on a different port or domain.

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (default Vite port).

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
client/
├── src/
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   ├── index.css                    # Global styles
│   ├── components/
│   │   └── ui/
│   │       ├── UploadCard.tsx       # Image upload component
│   │       ├── ParsedDataSection.tsx # Results display component
│   │       ├── Toast.tsx            # Toast notification component
│   │       └── alert.tsx            # Alert component
│   └── lib/
│       └── utils.ts                 # Utility functions
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Features

- **Image Upload**: Drag and drop or click to upload front and back Aadhaar card images
- **Image Preview**: See uploaded images before parsing
- **Real-time Processing**: Live status updates during OCR processing
- **Results Display**: Clean, organized display of extracted information
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop and mobile devices

## 🧪 Testing

### Manual Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test Image Upload:**
   - Upload front image
   - Upload back image
   - Verify previews appear correctly

3. **Test OCR Parsing:**
   - Click "PARSE AADHAAR" button
   - Wait for processing to complete
   - Verify extracted data displays correctly

4. **Test Error Handling:**
   - Try uploading without images
   - Try uploading invalid images
   - Verify error messages appear

### Testing Checklist

- ✅ Application starts successfully
- ✅ Images can be uploaded
- ✅ Image previews work
- ✅ OCR parsing works
- ✅ Results display correctly
- ✅ Error messages display properly
- ✅ Responsive design works on mobile

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```
   Error: Network Error or Failed to fetch
   ```
   **Solution:**
   - Verify backend server is running
   - Check `VITE_API_BASE_URL` in `.env` file
   - Check CORS configuration on backend

2. **Port Already in Use**
   ```
   Error: Port 5173 is already in use
   ```
   **Solution:** Vite will automatically try the next available port, or specify a different port:
   ```bash
   npm run dev -- --port 5174
   ```

3. **Build Errors**
   ```
   Error: Cannot find module or Type errors
   ```
   **Solution:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Check TypeScript configuration

4. **Images Not Uploading**
   ```
   Error: Failed to upload images
   ```
   **Solution:**
   - Check file size limits
   - Verify file format (should be image/*)
   - Check browser console for specific errors

## 🚀 Deployment

### Using Vite Build

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **The `dist` folder contains the production-ready files**

3. **Deploy the `dist` folder to any static hosting service:**
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront
   - Any web server (nginx, Apache, etc.)

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Update environment variables in Vercel dashboard:**
   - `VITE_API_BASE_URL`: Your backend API URL

### Deploy to Netlify

1. **Build command:**
   ```bash
   npm run build
   ```

2. **Publish directory:**
   ```
   dist
   ```

3. **Add environment variable:**
   - `VITE_API_BASE_URL`: Your backend API URL

### Using Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t ocr-client .
docker run -p 80:80 ocr-client
```

## 📦 Dependencies

### Production Dependencies
- `react`: UI library
- `react-dom`: React DOM bindings
- `axios`: HTTP client
- `tailwindcss`: CSS framework
- `lucide-react`: Icon library

### Development Dependencies
- `vite`: Build tool and dev server
- `typescript`: TypeScript compiler
- `@vitejs/plugin-react`: Vite plugin for React
- `eslint`: Code linting

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` file can be customized for:
- Proxy settings for API calls
- Build optimizations
- Environment variable handling

### Tailwind Configuration

Tailwind CSS is configured via `@tailwindcss/vite`. Customize styles in:
- `src/index.css`
- Component files using Tailwind classes

## 📝 Development Notes

- Uses React Hooks for state management
- Axios for API communication
- Tailwind CSS for styling
- TypeScript for type safety
- Responsive design with mobile-first approach

## 🔒 Security Considerations

- Environment variables starting with `VITE_` are exposed to the client
- Never put sensitive API keys in frontend code
- Validate all user inputs on the backend
- Use HTTPS in production

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

ISC

