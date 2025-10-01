##AI-Powered Interview Assistant - Backend

This is the **backend server** for the AI-Powered Interview Assistant.  
It handles **AI interactions, resume uploads, question generation, answer evaluation**, and **hiring summary creation** for the frontend application.

---

## Key Features

- **AI Integration**: Uses Groq SDK with `llama-3.1-8b-instant` for all generative tasks.  
- **Secure Resume Parsing**: Accepts `.pdf` and `.docx` files, extracting candidate details using `pdf-parse` and `mammoth`.  
- **Dynamic Content Generation**: Generates interview questions, evaluates answers, and creates AI-powered hiring summaries.  
- **RESTful API Endpoints**: Provides clear endpoints for all frontend functionalities.  

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v14+)  
- **Framework**: Express.js  
- **AI Platform**: Groq SDK  
- **File Handling**: Multer, pdf-parse, mammoth  
- **Environment Variables**: `.env` for API keys  

---

## API endpoints 
**POST** /api/upload-resume: Uploads a resume file and extracts contact details <br/>
**POST** /api/generate-question: Generates an interview question by difficulty <br/>
**POST** /api/evaluate-answer: Evaluates a candidate's answer and returns score. <br/>
**POST** /api/generate-summary: Creates a final AI-generated hiring summary. <br/>

## Setup Instructions

### Prerequisites

- Node.js v14+  
- npm (comes with Node.js)  
- A valid **Groq API Key**  

---


### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/your-backend-repo.git
cd your-backend-repo
npm install
npm start
