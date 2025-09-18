# CV Generator

A professional CV generator application that creates beautiful PDF resumes with customizable themes and layouts.

## Features

- 📝 **Create Professional CVs**: Generate clean, professional CVs with structured layouts
- 🎨 **Customizable Themes**: Choose from multiple themes (Professional, Modern, Elegant, Vibrant, Night)
- 🌓 **Dark/Light Mode**: Support for both light and dark themes
- 📱 **Responsive Design**: Modern React frontend with clean UI
- 📄 **PDF Export**: Download your CV as a high-quality PDF
- 👁️ **Preview Mode**: View your CV before exporting
- 🔧 **Data Validation**: Automatic data sanitization and validation
- 📸 **Photo Upload**: Add profile photos to your CV

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **PDFKit** for PDF generation
- **Multer** for file uploads

### Frontend
- **React** with Vite
- **Modern CSS** with responsive design

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cv-generator
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frentend
   npm install
   ```

4. **Environment Configuration**
   - Create a `.env` file in the backend directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb://localhost:27017/cv-generator
     PORT=3000
     ```

5. **Start the Application**
   
   **Backend:**
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend:**
   ```bash
   cd frentend
   npm run dev
   ```

## Usage

1. **Create a CV**: Fill in your personal information, skills, experience, and education
2. **Upload Photo**: Add a profile photo (optional)
3. **Choose Theme**: Select from available themes and customize colors
4. **Preview**: Click "Voir CV" to preview your CV in the browser
5. **Export**: Click "Exporter PDF" to download your CV

## API Endpoints

- `GET /api/cvs` - List all CVs
- `POST /api/cvs` - Create a new CV
- `GET /api/cvs/:id` - Get a specific CV
- `PUT /api/cvs/:id` - Update a CV
- `DELETE /api/cvs/:id` - Delete a CV
- `GET /api/cvs/:id/preview` - Preview CV in browser
- `GET /api/cvs/:id/export` - Download CV as PDF
- `POST /api/upload` - Upload photo

## CV Structure

The generated CV includes:
- **Personal Information**: Name, contact details, photo
- **Professional Summary**: Brief description of your profile
- **Work Experience**: Job positions with dates and descriptions
- **Education**: Degrees and certifications
- **Skills**: Technical and soft skills
- **Languages**: Language proficiency levels
- **Projects**: Personal or professional projects
- **Certifications**: Professional certifications
- **Interests**: Hobbies and interests

## Customization

### Themes
- **Professional**: Clean blue theme for corporate environments
- **Modern**: Purple and teal for creative professionals
- **Elegant**: Green theme for academic profiles
- **Vibrant**: Orange and red for dynamic personalities
- **Night**: Dark theme for modern appeal

### Colors
- Customize primary and accent colors
- Support for hex colors and preset color names
- Automatic text color adaptation for readability

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
