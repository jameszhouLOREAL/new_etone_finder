const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Fix SSL certificate issues on macOS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 4200;

// Initialize Google Cloud Storage
const storage = new Storage();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/studylist.html'));
});

// Serve the Help Documentation
app.get('/URL_GENERATOR_HELP.md', (req, res) => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.sendFile(path.join(__dirname, 'URL_GENERATOR_HELP.md'));
});

// Serve the Help Documentation as HTML
app.get('/help', (req, res) => {
  try {
    const markdownContent = fs.readFileSync(path.join(__dirname, 'URL_GENERATOR_HELP.md'), 'utf-8');
    
    // Simple markdown to HTML converter (basic implementation)
    let html = markdownContent
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    html = '<p>' + html + '</p>';
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>URL Generator Help - Visual Capture Assistant</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        h1 {
            color: #10b981;
            font-size: 28px;
            margin: 30px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #10b981;
        }
        
        h2 {
            color: #059669;
            font-size: 24px;
            margin: 25px 0 12px 0;
            padding-left: 15px;
            border-left: 4px solid #10b981;
        }
        
        h3 {
            color: #047857;
            font-size: 20px;
            margin: 20px 0 10px 0;
        }
        
        h4 {
            color: #065f46;
            font-size: 18px;
            margin: 15px 0 8px 0;
        }
        
        p {
            margin: 12px 0;
            line-height: 1.8;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
            line-height: 1.6;
        }
        
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #e11d48;
        }
        
        pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
        }
        
        pre code {
            background: none;
            color: #f9fafb;
            padding: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        th {
            background: #10b981;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        tr:hover {
            background: #f9fafb;
        }
        
        .note {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .tip {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        a {
            color: #10b981;
            text-decoration: none;
            font-weight: 500;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        .back-link {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background: #10b981;
            color: white;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.2s;
        }
        
        .back-link:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            text-decoration: none;
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
        
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
            .back-link {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-book"></i> URL Generator Help Guide</h1>
            <p>Visual Capture Assistant Documentation</p>
        </div>
        <div class="content">
            <a href="/urlgenerator" class="back-link"><i class="fas fa-arrow-left"></i> Back to URL Generator</a>
            ${html}
        </div>
        <div class="footer">
            <p><strong>Visual Capture Assistant</strong> | Version 2.5.2 | Last Updated: November 2025</p>
            <p style="margin-top: 10px;">
                <a href="/urlgenerator"><i class="fas fa-link"></i> URL Generator</a> | 
                <a href="/photosubmission"><i class="fas fa-camera"></i> Photo Submissions</a>
            </p>
        </div>
    </div>
</body>
</html>`;
    
    res.send(fullHtml);
  } catch (error) {
    res.status(500).send('Error loading help documentation');
  }
});

// Serve the Photo Submission page
app.get('/photosubmission', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/photosubmission.html'));
});

// Serve the URL Generator page
app.get('/urlgenerator', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/urlgenerator.html'));
});

// Serve component files
app.get('/components/:component', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/components', req.params.component));
});

// Redirect old studymanagement route to studylist
app.get('/studymanagement', (req, res) => {
  res.redirect(301, '/studylist');
});

// Serve the Study List page
app.get('/studylist', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/studylist.html'));
});

// Serve the Study Details page
app.get('/studydetails', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/studydetails.html'));
});

// Legacy route redirect for backward compatibility
app.get('/studydesign', (req, res) => {
  res.redirect(301, '/studydetails');
});

// Serve the Analytics page
app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/analytics.html'));
});

// Serve the Access Control page
app.get('/accesscontrol', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/accesscontrol.html'));
});

// Serve the Consent Management page
app.get('/consentmanagement', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/consentmanagement.html'));
});

// Serve the Mobile Preview page
app.get('/mobilepreview', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/mobilepreview.html'));
});

// Serve the Submission Results page
app.get('/submissionresults', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/submissionresults.html'));
});

// API Routes - Study Management

// GET /api/studies - List all studies
app.get('/api/studies', (req, res) => {
  try {
    const studiesDir = path.join(__dirname, 'studies');
    
    // Check if studies directory exists
    if (!fs.existsSync(studiesDir)) {
      fs.mkdirSync(studiesDir, { recursive: true });
      return res.json([]);
    }
    
    // Read all JSON files from studies directory
    const files = fs.readdirSync(studiesDir).filter(file => file.endsWith('.json'));
    
    const studies = files.map(file => {
      const filePath = path.join(studiesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    });
    
    res.json(studies);
  } catch (error) {
    console.error('Error loading studies:', error);
    res.status(500).json({ error: 'Failed to load studies' });
  }
});

// GET /api/studies/:studyId - Get a single study by ID
app.get('/api/studies/:studyId', (req, res) => {
  try {
    const { studyId } = req.params;
    const studiesDir = path.join(__dirname, 'studies');
    const fileName = `${studyId}.json`;
    const filePath = path.join(studiesDir, fileName);
    
    // Check if study exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Study not found' });
    }
    
    // Read and return study
    const content = fs.readFileSync(filePath, 'utf-8');
    const study = JSON.parse(content);
    
    res.json(study);
  } catch (error) {
    console.error('Error loading study:', error);
    res.status(500).json({ error: 'Failed to load study' });
  }
});

// POST /api/studies - Save a new study
app.post('/api/studies', (req, res) => {
  try {
    const study = req.body;
    
    console.log('POST /api/studies - Received status:', study.status);
    
    // Validate required fields
    if (!study.studyId || !study.label) {
      return res.status(400).json({ error: 'Missing required fields: studyId and label' });
    }
    
    const studiesDir = path.join(__dirname, 'studies');
    
    // Ensure studies directory exists
    if (!fs.existsSync(studiesDir)) {
      fs.mkdirSync(studiesDir, { recursive: true });
    }
    
    // Add timestamp and metadata
    study.createdAt = new Date().toISOString();
    study.updatedAt = new Date().toISOString();
    
    // Save to file
    const fileName = `${study.studyId}.json`;
    const filePath = path.join(studiesDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(study, null, 2), 'utf-8');
    
    console.log('Study saved:', fileName, '- Status saved as:', study.status);
    res.json({ success: true, study });
  } catch (error) {
    console.error('Error saving study:', error);
    res.status(500).json({ error: 'Failed to save study' });
  }
});

// PUT /api/studies/:studyId - Update an existing study
app.put('/api/studies/:studyId', (req, res) => {
  try {
    const { studyId } = req.params;
    const updatedData = req.body;
    
    console.log('PUT /api/studies/:studyId - Received status:', updatedData.status);
    
    const studiesDir = path.join(__dirname, 'studies');
    const fileName = `${studyId}.json`;
    const filePath = path.join(studiesDir, fileName);
    
    // Check if study exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Study not found' });
    }
    
    // Read existing study to preserve fields like createdAt
    const existingStudy = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log('Existing study status:', existingStudy.status);
    
    // Merge existing data with updates, preserving createdAt and studyId
    const study = {
      ...existingStudy,
      ...updatedData,
      studyId: existingStudy.studyId, // Keep original studyId
      createdAt: existingStudy.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    console.log('Merged study status:', study.status);
    
    // Save updated study
    fs.writeFileSync(filePath, JSON.stringify(study, null, 2), 'utf-8');
    
    console.log('Study updated:', fileName, '- Status saved as:', study.status);
    res.json({ success: true, study });
  } catch (error) {
    console.error('Error updating study:', error);
    res.status(500).json({ error: 'Failed to update study' });
  }
});

// DELETE /api/studies/:studyId - Delete a study
app.delete('/api/studies/:studyId', (req, res) => {
  try {
    const { studyId } = req.params;
    
    const studiesDir = path.join(__dirname, 'studies');
    const fileName = `${studyId}.json`;
    const filePath = path.join(studiesDir, fileName);
    
    // Check if study exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Study not found' });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    console.log('Study deleted:', fileName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting study:', error);
    res.status(500).json({ error: 'Failed to delete study' });
  }
});

// POST /api/studies/:studyId/participant/:code/use - Mark participant code as used
app.post('/api/studies/:studyId/participant/:code/use', (req, res) => {
  try {
    const { studyId, code } = req.params;
    
    const studiesDir = path.join(__dirname, 'studies');
    const fileName = `${studyId}.json`;
    const filePath = path.join(studiesDir, fileName);
    
    // Check if study exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Study not found' });
    }
    
    // Read study data
    const studyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Find and update the participant code
    if (!studyData.participantCodes || !Array.isArray(studyData.participantCodes)) {
      return res.status(404).json({ error: 'No participant codes found' });
    }
    
    const participantIndex = studyData.participantCodes.findIndex(p => p.code === code);
    if (participantIndex === -1) {
      return res.status(404).json({ error: 'Participant code not found' });
    }
    
    // Update the code status
    studyData.participantCodes[participantIndex].status = 'used';
    studyData.participantCodes[participantIndex].usedDate = new Date().toISOString();
    
    // Save the updated study
    fs.writeFileSync(filePath, JSON.stringify(studyData, null, 2));
    
    console.log(`Participant code ${code} marked as used for study ${studyId}`);
    res.json({ success: true, code: code, status: 'used' });
  } catch (error) {
    console.error('Error updating participant code:', error);
    res.status(500).json({ error: 'Failed to update participant code' });
  }
});

// POST /api/submissions - Save study submission
app.post('/api/submissions', (req, res) => {
  try {
    const submission = req.body;
    
    // Validate required fields
    if (!submission.studyId) {
      return res.status(400).json({ error: 'Missing required field: studyId' });
    }
    
    const studyId = submission.studyId;
    const submissionsDir = path.join(__dirname, 'submissions', studyId);
    
    // Ensure submissions directory exists for this study
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }
    
    // Generate unique submission filename with timestamp
    const timestamp = Date.now();
    const fileName = `submission-${timestamp}.json`;
    const filePath = path.join(submissionsDir, fileName);
    
    // Save submission to file
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2), 'utf-8');
    
    console.log('Submission saved:', filePath);
    res.json({ success: true, submissionId: timestamp });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// API Routes - Image proxy endpoint
app.get('/api/image', async (req, res) => {
  const bucketName = req.query.bucket;
  const imagePath = req.query.path;
  const download = req.query.download;
  
  if (!bucketName || !imagePath) {
    return res.status(400).json({ error: 'Bucket name and image path are required' });
  }
  
  const imageFilename = imagePath + '.jpeg';
  console.log('API: Fetching image:', imageFilename, 'from bucket:', bucketName);
  
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(imageFilename);
    
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'image/jpeg';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    if (download) {
      res.setHeader('Content-Disposition', 'inline');
    }
    
    file.createReadStream()
      .on('error', (err) => {
        console.error('Error streaming image:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to stream image' });
        }
      })
      .pipe(res);
      
  } catch (error) {
    console.error('Error fetching image:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch image',
      details: error.message 
    });
  }
});

// Files listing endpoint
app.get('/api/files', async (req, res) => {
  const bucketName = req.query.bucket;
  
  if (!bucketName) {
    return res.status(400).json({ error: 'Bucket name is required' });
  }
  
  console.log('API: Listing files from bucket:', bucketName);
  
  try {
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles();
    const jsonFiles = await Promise.all(
      files
        .filter(file => file.name.toLowerCase().endsWith('.json'))
        .map(async (file) => {
          const [metadata] = await file.getMetadata();
          return {
            name: file.name,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            size: metadata.size
          };
        })
    );
    
    console.log('Found', jsonFiles.length, 'JSON files');
    res.json({ files: jsonFiles });
  } catch (error) {
    console.error('Error listing files:', error.message);
    res.status(500).json({ 
      error: 'Failed to list files',
      details: error.message 
    });
  }
});

// File content endpoint
app.get('/api/file', async (req, res) => {
  const bucketName = req.query.bucket;
  const filename = req.query.filename;
  
  if (!bucketName || !filename) {
    return res.status(400).json({ error: 'Bucket name and filename are required' });
  }
  
  console.log('API: Loading file:', filename, 'from bucket:', bucketName);
  
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);
    const [contents] = await file.download();
    const jsonContent = JSON.parse(contents.toString('utf-8'));
    
    console.log('File loaded successfully');
    res.json({ content: jsonContent });
  } catch (error) {
    console.error('Error reading file:', error.message);
    res.status(500).json({ 
      error: 'Failed to read file',
      details: error.message 
    });
  }
});

// ==================== CRO Agent Management API ====================

// Helper function to ensure accounts directory exists
function ensureAccountsDirectory() {
  const accountsDir = path.join(__dirname, 'accounts');
  if (!fs.existsSync(accountsDir)) {
    fs.mkdirSync(accountsDir, { recursive: true });
  }
  return accountsDir;
}

// Helper function to load CRO agents
function loadCROAgents() {
  try {
    const accountsDir = ensureAccountsDirectory();
    const filePath = path.join(accountsDir, 'cro.json');
    
    if (!fs.existsSync(filePath)) {
      // Create empty agents file if it doesn't exist
      fs.writeFileSync(filePath, JSON.stringify({ agents: [] }, null, 2));
      return { agents: [] };
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading CRO agents:', error);
    return { agents: [] };
  }
}

// Helper function to save CRO agents
function saveCROAgents(agentsData) {
  try {
    const accountsDir = ensureAccountsDirectory();
    const filePath = path.join(accountsDir, 'cro.json');
    fs.writeFileSync(filePath, JSON.stringify(agentsData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving CRO agents:', error);
    return false;
  }
}

// GET /api/agents - Get all CRO agents
app.get('/api/agents', (req, res) => {
  try {
    const data = loadCROAgents();
    // Don't send passwords to frontend
    const safeAgents = data.agents.map(agent => ({
      id: agent.id,
      username: agent.username,
      email: agent.email,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt
    }));
    res.json(safeAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// POST /api/agents - Create new CRO agent
app.post('/api/agents', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const data = loadCROAgents();
    
    // Check if username already exists
    if (data.agents.some(agent => agent.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Create new agent
    const newAgent = {
      id: `CRO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      email: email || '',
      password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.agents.push(newAgent);
    
    if (saveCROAgents(data)) {
      // Return agent without password
      const { password: _, ...safeAgent } = newAgent;
      res.json(safeAgent);
    } else {
      res.status(500).json({ error: 'Failed to save agent' });
    }
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// PUT /api/agents/:agentId - Update CRO agent
app.put('/api/agents/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const { username, email, password } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const data = loadCROAgents();
    const agentIndex = data.agents.findIndex(agent => agent.id === agentId);
    
    if (agentIndex === -1) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Check if username is taken by another agent
    if (data.agents.some((agent, index) => 
      agent.username === username && index !== agentIndex
    )) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Update agent
    data.agents[agentIndex].username = username;
    data.agents[agentIndex].email = email || '';
    if (password) {
      data.agents[agentIndex].password = password; // In production, hash this
    }
    data.agents[agentIndex].updatedAt = new Date().toISOString();
    
    if (saveCROAgents(data)) {
      // Return agent without password
      const { password: _, ...safeAgent } = data.agents[agentIndex];
      res.json(safeAgent);
    } else {
      res.status(500).json({ error: 'Failed to update agent' });
    }
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// DELETE /api/agents/:agentId - Delete CRO agent
app.delete('/api/agents/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const data = loadCROAgents();
    
    const agentIndex = data.agents.findIndex(agent => agent.id === agentId);
    
    if (agentIndex === -1) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    data.agents.splice(agentIndex, 1);
    
    if (saveCROAgents(data)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// ==================== Consent Management API ====================

// Helper function to ensure consents directory exists
function ensureConsentsDirectory() {
  const consentsDir = path.join(__dirname, 'consents');
  if (!fs.existsSync(consentsDir)) {
    fs.mkdirSync(consentsDir, { recursive: true });
  }
  return consentsDir;
}

// Helper function to load consents
function loadConsents() {
  try {
    const consentsDir = ensureConsentsDirectory();
    const filePath = path.join(consentsDir, 'consents.json');
    
    if (!fs.existsSync(filePath)) {
      // Create empty consents file if it doesn't exist
      fs.writeFileSync(filePath, JSON.stringify({ consents: [] }, null, 2));
      return { consents: [] };
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading consents:', error);
    return { consents: [] };
  }
}

// Helper function to save consents
function saveConsents(consentsData) {
  try {
    const consentsDir = ensureConsentsDirectory();
    const filePath = path.join(consentsDir, 'consents.json');
    fs.writeFileSync(filePath, JSON.stringify(consentsData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving consents:', error);
    return false;
  }
}

// GET /api/consents - Get all consents
app.get('/api/consents', (req, res) => {
  try {
    const data = loadConsents();
    res.json(data.consents);
  } catch (error) {
    console.error('Error getting consents:', error);
    res.status(500).json({ error: 'Failed to load consents' });
  }
});

// POST /api/consents - Create new consent
app.post('/api/consents', (req, res) => {
  try {
    const { title, content, checkboxText } = req.body;
    
    // Validate required fields
    if (!title || !content || !checkboxText) {
      return res.status(400).json({ error: 'Title, content, and checkbox text are required' });
    }
    
    const data = loadConsents();
    
    // Create new consent
    const newConsent = {
      id: `CONSENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      checkboxText,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.consents.push(newConsent);
    
    if (saveConsents(data)) {
      res.status(201).json(newConsent);
    } else {
      res.status(500).json({ error: 'Failed to create consent' });
    }
  } catch (error) {
    console.error('Error creating consent:', error);
    res.status(500).json({ error: 'Failed to create consent' });
  }
});

// PUT /api/consents/:consentId - Update consent
app.put('/api/consents/:consentId', (req, res) => {
  try {
    const { consentId } = req.params;
    const { title, content, checkboxText } = req.body;
    
    // Validate required fields
    if (!title || !content || !checkboxText) {
      return res.status(400).json({ error: 'Title, content, and checkbox text are required' });
    }
    
    const data = loadConsents();
    const consentIndex = data.consents.findIndex(c => c.id === consentId);
    
    if (consentIndex === -1) {
      return res.status(404).json({ error: 'Consent not found' });
    }
    
    // Update consent
    data.consents[consentIndex].title = title;
    data.consents[consentIndex].content = content;
    data.consents[consentIndex].checkboxText = checkboxText;
    data.consents[consentIndex].updatedAt = new Date().toISOString();
    
    if (saveConsents(data)) {
      res.json(data.consents[consentIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update consent' });
    }
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({ error: 'Failed to update consent' });
  }
});

// DELETE /api/consents/:consentId - Delete consent
app.delete('/api/consents/:consentId', (req, res) => {
  try {
    const { consentId } = req.params;
    const data = loadConsents();
    
    const consentIndex = data.consents.findIndex(c => c.id === consentId);
    
    if (consentIndex === -1) {
      return res.status(404).json({ error: 'Consent not found' });
    }
    
    data.consents.splice(consentIndex, 1);
    
    if (saveConsents(data)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to delete consent' });
    }
  } catch (error) {
    console.error('Error deleting consent:', error);
    res.status(500).json({ error: 'Failed to delete consent' });
  }
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Visual Capture Assistant - Photo Analysis Platform');
  console.log('========================================');
  console.log('🌐 URL: http://localhost:' + PORT);
  console.log('📝 Enter any bucket name to browse');
  console.log('🖼️  Images proxied through server (CORS-free)');
  console.log('========================================\n');
});