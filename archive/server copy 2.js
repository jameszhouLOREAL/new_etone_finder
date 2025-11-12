/**
 * VCA Photo Submission Results with Image Proxy
 */

const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const app = express();
const PORT = 4200;

const storage = new Storage({
    projectId: 'vca-gcs-edc-loreal-internal-results-eu-dv'
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VCA Photo Submission Results</title>
    <meta name="google-signin-client_id" content="434775612504-337vvnh0ufstp9a7n4kdom0eu1tn6st1.apps.googleusercontent.com">
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
            padding: 20px;
            color: #1e293b;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: white;
            padding: 25px 30px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header-left h1 { color: #1e40af; font-size: 28px; margin-bottom: 8px; font-weight: 600; }
        .bucket-display {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .bucket-name {
            color: #475569;
            font-size: 14px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            background: #f1f5f9;
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .change-bucket-btn {
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
        }
        .change-bucket-btn:hover { background: #2563eb; }
        
        /* Authentication Overlay */
        .auth-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        .auth-card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: authSlideIn 0.4s ease-out;
        }
        @keyframes authSlideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .auth-card h2 {
            color: #1e40af;
            margin-bottom: 12px;
            font-size: 24px;
            font-weight: 600;
        }
        .auth-card p {
            color: #64748b;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .auth-card .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .google-btn {
            background: #4285f4;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 0 auto;
            transition: background 0.2s;
            width: 100%;
            max-width: 280px;
        }
        .google-btn:hover {
            background: #3367d6;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: auto;
        }
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
        }
        .user-name {
            color: #374151;
            font-size: 14px;
            font-weight: 500;
        }
        .sign-out-btn {
            padding: 6px 12px;
            background: #f1f5f9;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        .sign-out-btn:hover {
            background: #e2e8f0;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }
        .modal.active { display: flex; }
        .modal-content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            animation: modalSlideIn 0.3s ease-out;
        }
        @keyframes modalSlideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .modal-content h2 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 24px;
            font-weight: 600;
        }
        .modal-content p {
            color: #64748b;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        .input-group { margin-bottom: 20px; }
        .input-group label {
            display: block;
            color: #374151;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .input-group input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            transition: border-color 0.3s;
            background: #ffffff;
        }
        .input-group input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .modal-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .modal-btn-primary {
            background: #3b82f6;
            color: white;
        }
        .modal-btn-primary:hover { background: #2563eb; }
        .example-text {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        
        .content {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 20px;
            align-items: start;
        }
        .file-list-panel {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            max-height: calc(100vh - 200px);
            display: flex;
            flex-direction: column;
        }
        .panel-header {
            background: #1e40af;
            color: white;
            padding: 16px 20px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .file-count {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
        }
        .search-box { padding: 16px; border-bottom: 1px solid #e2e8f0; }
        .search-box input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            background: #f8fafc;
        }
        .search-box input:focus { 
            border-color: #3b82f6; 
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .file-list { overflow-y: auto; flex: 1; padding: 10px; }
        
        .tree-item { margin: 2px 0; }
        .folder {
            cursor: pointer;
            padding: 8px 10px;
            border-radius: 4px;
            transition: all 0.2s;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .folder:hover { background: #f1f5f9; }
        .folder-icon {
            font-size: 14px;
            transition: transform 0.2s;
            display: inline-block;
            width: 16px;
        }
        .folder.expanded .folder-icon { transform: rotate(90deg); }
        .folder-name {
            font-weight: 600;
            color: #1e40af;
            font-size: 14px;
        }
        .folder-count {
            margin-left: auto;
            background: #dbeafe;
            color: #1e40af;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
        }
        .folder-children {
            display: none;
            margin-left: 20px;
            border-left: 2px solid #e2e8f0;
            padding-left: 5px;
        }
        .folder.expanded + .folder-children { display: block; }
        .file-item {
            padding: 8px 10px;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s;
            margin: 2px 0;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
        }
        .file-item:hover {
            background: #f1f5f9;
            padding-left: 15px;
        }
        .file-item.active {
            background: #dbeafe;
            border-left: 3px solid #3b82f6;
            font-weight: 600;
        }
        .file-icon { color: #3b82f6; font-size: 14px; }
        .file-name {
            word-break: break-word;
            flex: 1;
        }
        
        .viewer-panel {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            max-height: calc(100vh - 200px);
            display: flex;
            flex-direction: column;
        }
        .viewer-content { flex: 1; overflow: auto; padding: 25px; }
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #64748b;
            flex-direction: column;
            gap: 15px;
        }
        .spinner {
            border: 3px solid #f1f5f9;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error {
            background: #fef2f2;
            color: #dc2626;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            margin: 20px;
            border: 1px solid #fecaca;
        }
        .error h3 { margin-bottom: 10px; }
        .error ul { margin-left: 20px; margin-top: 10px; }
        .retry-btn {
            margin-top: 15px;
            padding: 10px 20px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        }
        .retry-btn:hover { background: #b91c1c; }
        .empty-state { text-align: center; padding: 60px 20px; color: #999; }
        .action-buttons {
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            background: #f8fafc;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .btn-primary { background: #3b82f6; color: white; font-weight: 500; }
        .btn-primary:hover:not(:disabled) { background: #2563eb; }
        .btn-secondary { background: #f1f5f9; color: #374151; border: 1px solid #d1d5db; }
        .btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
        .btn-success { background: #10b981; color: white; font-weight: 500; }
        .btn-success:hover:not(:disabled) { background: #059669; }
        
        #pdfContent {
            position: fixed;
            left: -9999px;
            top: 0;
            width: 800px;
            background: white;
            padding: 40px;
        }
        
        .section { margin-bottom: 25px; }
        .section-title {
            color: #1e40af;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
        }
        
        .analysis-image-container {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .analysis-image-link {
            display: inline-block;
            position: relative;
            transition: transform 0.2s;
        }
        .analysis-image-link:hover {
            transform: scale(1.05);
        }
        .analysis-image-link::after {
            content: '🔍 Click to view full size';
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }
        .analysis-image-link:hover::after {
            opacity: 1;
        }
        .analysis-image {
            width: 100px;
            height: auto;
            border-radius: 6px;
            border: 2px solid #4A74F3;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: border-color 0.2s;
        }
        .analysis-image-link:hover .analysis-image {
            border-color: #2649B2;
        }
        .analysis-image.error-img { display: none; }
        .image-error-msg {
            display: none;
            color: #999;
            font-size: 12px;
            font-style: italic;
            margin-top: 10px;
        }
        .image-label {
            display: block;
            color: #666;
            font-size: 12px;
            margin-top: 8px;
            font-weight: 600;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            margin-bottom: 15px;
        }
        .info-table th {
            background: #2649B2;
            color: white;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        .info-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        }
        .info-table tr:last-child td { border-bottom: none; }
        .info-table tr:nth-child(even) { background: #f8f9ff; }
        .info-table td:first-child {
            font-weight: 600;
            color: #666;
            width: 40%;
        }
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        .badge-ok { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .score-bar {
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 4px;
            min-width: 100px;
        }
        .score-fill {
            height: 100%;
            background: #4A74F3;
            border-radius: 3px;
        }
        
        .concerns-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px;
        }
        
        .concern-card {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 12px;
            border-left: 3px solid #4A74F3;
            break-inside: avoid;
        }
        .concern-name {
            font-weight: 600;
            color: #2649B2;
            margin-bottom: 6px;
            text-transform: capitalize;
            font-size: 13px;
        }
        .concern-value { color: #666; font-size: 12px; }
        
        .pdf-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2649B2;
        }
        .pdf-header h1 {
            color: #2649B2;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .pdf-header .subtitle {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
        }
        .json-key { color: #9D5CE6; font-weight: 600; }
        .json-string { color: #2649B2; }
        .json-number { color: #4A74F3; }
        .json-boolean { color: #8E7DE3; font-weight: 600; }
        .json-null { color: #999; font-style: italic; }
        
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #374151;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid #4b5563;
            z-index: 10000;
            animation: slideIn 0.3s;
            font-weight: 500;
        }
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .expand-collapse-all {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
            display: flex;
            gap: 8px;
        }
        .expand-collapse-all button {
            flex: 1;
            padding: 6px 12px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        .expand-collapse-all button:hover {
            background: #f0f4ff;
            border-color: #4A74F3;
            color: #2649B2;
        }
        
        @media (max-width: 968px) {
            .content { grid-template-columns: 1fr; }
            .header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
        }
        
        @media print {
            .concerns-grid {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }
    </style>
</head>
<body>
    <!-- Authentication Overlay -->
    <div class="auth-overlay" id="authOverlay">
        <div class="auth-card">
            <div class="logo">🔐</div>
            <h2>Sign In Required</h2>
            <p>Please sign in with your Google account to access VCA Photo Submission Results</p>
            <div id="g_id_onload"
                 data-client_id="434775612504-337vvnh0ufstp9a7n4kdom0eu1tn6st1.apps.googleusercontent.com"
                 data-callback="handleCredentialResponse"
                 data-auto_prompt="false">
            </div>
            <div class="g_id_signin" 
                 data-type="standard"
                 data-size="large"
                 data-theme="outline"
                 data-text="sign_in_with"
                 data-shape="rectangular"
                 data-logo_alignment="left"
                 data-width="280">
            </div>
        </div>
    </div>

    <div class="modal" id="bucketModal">
        <div class="modal-content">
            <h2>🗂️ VCA Bucket Viewer</h2>
            <p>Enter the name of the GCP Storage bucket you want to browse.</p>
            <div class="input-group">
                <label for="bucketNameInput">Bucket Name</label>
                <input type="text" id="bucketNameInput" placeholder="vca-gcs-edc-loreal-internal-results-eu-dv" autocomplete="off">
                <div class="example-text">Example: vca-gcs-edc-loreal-internal-results-eu-dv</div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-primary" id="connectBtn">Connect</button>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="header">
            <div class="header-left">
                <h1>🗂️ VCA Photo Submission Results</h1>
                <div class="bucket-display">
                    <span class="bucket-name" id="currentBucketName">📦 vca-gcs-edc-loreal-internal-results-eu-dv</span>
                    <button class="change-bucket-btn" id="changeBucketBtn">Change Bucket</button>
                </div>
            </div>
            <div class="user-info" id="userInfo" style="display: none;">
                <img class="user-avatar" id="userAvatar" src="" alt="User Avatar">
                <span class="user-name" id="userName"></span>
                <button class="sign-out-btn" onclick="signOut()">Sign Out</button>
            </div>
        </div>
        <div class="content">
            <div class="file-list-panel">
                <div class="panel-header">
                    <span>JSON Files</span>
                    <span class="file-count" id="fileCount">0 files</span>
                </div>
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="🔍 Search files...">
                </div>
                <div class="expand-collapse-all">
                    <button id="expandAllBtn">📂 Expand All</button>
                    <button id="collapseAllBtn">📁 Collapse All</button>
                </div>
                <div class="file-list" id="fileList">
                    <div class="empty-state">
                        <p>Please select a bucket to begin</p>
                    </div>
                </div>
            </div>
            <div class="viewer-panel">
                <div class="panel-header">
                    <span id="viewerTitle">Select a file to view</span>
                </div>
                <div class="action-buttons" id="actionButtons" style="display: none;">
                    <button class="btn btn-success" id="pdfBtn">📄 Export PDF</button>
                    <button class="btn btn-primary" id="downloadBtn">💾 Download JSON</button>
                    <button class="btn btn-secondary" id="copyBtn">📋 Copy</button>
                    <button class="btn btn-secondary" id="toggleViewBtn">
                        🔄 <span id="viewToggleText">Show Raw JSON</span>
                    </button>
                </div>
                <div class="viewer-content" id="viewerContent">
                    <div class="empty-state">
                        <h3>No file selected</h3>
                        <p>Choose a JSON file from the list</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="pdfContent"></div>
    
    <script src="/app.js"></script>
</body>
</html>`);
});

// Serve the JavaScript file separately
app.get('/app.js', (req, res) => {
  res.type('application/javascript');
  res.send(`
const { jsPDF } = window.jspdf;

// Authentication variables
let isAuthenticated = false;
let currentUser = null;

// Google Sign-In callback
function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    
    currentUser = {
        id: responsePayload.sub,
        email: responsePayload.email,
        name: responsePayload.name,
        picture: responsePayload.picture,
        domain: responsePayload.hd
    };
    
    // Check if user is from allowed domain (optional)
    if (currentUser.domain && currentUser.domain !== 'loreal.com') {
        showToast('Access restricted to L\\'Oréal accounts only');
        return;
    }
    
    isAuthenticated = true;
    hideAuthOverlay();
    showUserInfo();
    showToast('Successfully signed in as ' + currentUser.name);
}

// Decode JWT response
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Hide authentication overlay
function hideAuthOverlay() {
    document.getElementById('authOverlay').style.display = 'none';
    // Auto-load the default bucket after authentication
    if (currentBucket) {
        document.getElementById('currentBucketName').textContent = '📦 ' + currentBucket;
        loadFiles();
    }
}

// Show user info in header
function showUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    userAvatar.src = currentUser.picture;
    userName.textContent = currentUser.name;
    userInfo.style.display = 'flex';
}

// Sign out function
function signOut() {
    google.accounts.id.disableAutoSelect();
    isAuthenticated = false;
    currentUser = null;
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('authOverlay').style.display = 'flex';
    showToast('Signed out successfully');
}

// Check authentication on page load
function checkAuthentication() {
    // For now, we'll show the auth overlay on every page load
    // In a real app, you'd check for stored credentials or session
    if (!isAuthenticated) {
        document.getElementById('authOverlay').style.display = 'flex';
        // Also hide the bucket modal
        document.getElementById('bucketModal').classList.remove('active');
        return false;
    }
    return true;
}

// Initialize Google Sign-In when the page loads
function initializeGoogleSignIn() {
    // Wait for Google Sign-In library to load
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: '434775612504-337vvnh0ufstp9a7n4kdom0eu1tn6st1.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        
        // Render the sign-in button
        google.accounts.id.renderButton(
            document.querySelector('.g_id_signin'),
            { 
                theme: 'outline', 
                size: 'large',
                text: 'sign_in_with',
                width: 280
            }
        );
    } else {
        // Retry after a short delay if Google library not loaded yet
        setTimeout(initializeGoogleSignIn, 100);
    }
}
var currentBucket = 'vca-gcs-edc-loreal-internal-results-eu-dv';
var allFiles = [];
var currentFile = null;
var currentData = null;
var isRawView = false;
var fileTree = {};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Sign-In first
    initializeGoogleSignIn();
    
    document.getElementById('connectBtn').addEventListener('click', connectToBucket);
    document.getElementById('changeBucketBtn').addEventListener('click', showBucketModal);
    document.getElementById('expandAllBtn').addEventListener('click', expandAll);
    document.getElementById('collapseAllBtn').addEventListener('click', collapseAll);
    document.getElementById('pdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('downloadBtn').addEventListener('click', downloadFile);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('toggleViewBtn').addEventListener('click', toggleView);
    
    document.getElementById('bucketNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            connectToBucket();
        }
    });
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        var term = e.target.value.toLowerCase();
        
        if (term === '') {
            displayFileTree(fileTree);
        } else {
            var filtered = allFiles.filter(function(f) { return f.toLowerCase().includes(term); });
            displayFilteredFiles(filtered);
        }
    });
    
    // Check authentication first
    checkAuthentication();
    
    // Auto-connect to default bucket (only if authenticated)
    if (currentBucket && isAuthenticated) {
        document.getElementById('currentBucketName').textContent = '📦 ' + currentBucket;
        hideBucketModal();
        loadFiles();
    }
});

function showBucketModal() {
    document.getElementById('bucketModal').classList.add('active');
    document.getElementById('bucketNameInput').value = currentBucket || '';
    document.getElementById('bucketNameInput').focus();
}

function hideBucketModal() {
    document.getElementById('bucketModal').classList.remove('active');
}

function connectToBucket() {
    if (!isAuthenticated) {
        showToast('Please sign in first');
        return;
    }
    
    var bucketName = document.getElementById('bucketNameInput').value.trim();
    
    if (!bucketName) {
        showToast('Please enter a bucket name');
        return;
    }
    
    currentBucket = bucketName;
    document.getElementById('currentBucketName').textContent = '📦 ' + currentBucket;
    hideBucketModal();
    
    loadFiles();
}

function loadFiles() {
    if (!isAuthenticated) {
        showToast('Please sign in first');
        return;
    }
    
    if (!currentBucket) {
        showToast('No bucket selected');
        return;
    }
    
    console.log('Loading files from bucket:', currentBucket);
    
    document.getElementById('fileList').innerHTML = 
        '<div class="loading"><div class="spinner"></div><span>Loading files...</span></div>';
    
    fetch('/api/files?bucket=' + encodeURIComponent(currentBucket))
        .then(function(response) {
            return response.json().then(function(data) {
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load files');
                }
                return data;
            });
        })
        .then(function(data) {
            console.log('Files loaded:', data.files.length);
            allFiles = data.files;
            fileTree = buildFileTree(allFiles);
            displayFileTree(fileTree);
        })
        .catch(function(err) {
            console.error('Error:', err);
            document.getElementById('fileList').innerHTML = 
                '<div class="error"><h3>❌ Error</h3><p>' + err.message + 
                '</p><ul><li>Run: gcloud auth application-default login</li>' +
                '<li>Check bucket name and permissions</li>' +
                '<li>Verify bucket exists</li></ul>' +
                '<button class="retry-btn" onclick="loadFiles()">Retry</button></div>';
        });
}

function buildFileTree(files) {
    var tree = {};
    
    files.forEach(function(file) {
        var parts = file.split('/');
        var current = tree;
        
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            
            if (i === parts.length - 1) {
                if (!current._files) current._files = [];
                current._files.push(file);
            } else {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }
        }
    });
    
    return tree;
}

function countFilesInTree(tree) {
    var count = 0;
    
    if (tree._files) {
        count += tree._files.length;
    }
    
    for (var key in tree) {
        if (key !== '_files') {
            count += countFilesInTree(tree[key]);
        }
    }
    
    return count;
}

function displayFileTree(tree, parentElement, level) {
    var container = parentElement || document.getElementById('fileList');
    level = level || 0;
    
    if (!parentElement) {
        container.innerHTML = '';
        document.getElementById('fileCount').textContent = 
            allFiles.length + ' file' + (allFiles.length !== 1 ? 's' : '');
    }
    
    if (allFiles.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No JSON files found in this bucket</p></div>';
        return;
    }
    
    var folders = Object.keys(tree).filter(function(k) { return k !== '_files'; }).sort();
    
    folders.forEach(function(folderName) {
        var folderCount = countFilesInTree(tree[folderName]);
        
        var folderDiv = document.createElement('div');
        folderDiv.className = 'tree-item';
        
        var folderHeader = document.createElement('div');
        folderHeader.className = 'folder';
        folderHeader.innerHTML = 
            '<span class="folder-icon">▶</span>' +
            '<span class="folder-name">📁 ' + folderName + '</span>' +
            '<span class="folder-count">' + folderCount + '</span>';
        
        var folderChildren = document.createElement('div');
        folderChildren.className = 'folder-children';
        
        folderHeader.onclick = function() {
            this.classList.toggle('expanded');
        };
        
        folderDiv.appendChild(folderHeader);
        folderDiv.appendChild(folderChildren);
        container.appendChild(folderDiv);
        
        displayFileTree(tree[folderName], folderChildren, level + 1);
    });
    
    if (tree._files) {
        tree._files.sort().forEach(function(file) {
            var fileName = file.split('/').pop();
            var fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.setAttribute('data-filepath', file);
            fileDiv.innerHTML = 
                '<span class="file-icon">📄</span>' +
                '<span class="file-name">' + fileName + '</span>';
            fileDiv.onclick = function() {
                loadFile(file);
            };
            container.appendChild(fileDiv);
        });
    }
}

function expandAll() {
    document.querySelectorAll('.folder').forEach(function(folder) {
        folder.classList.add('expanded');
    });
}

function collapseAll() {
    document.querySelectorAll('.folder').forEach(function(folder) {
        folder.classList.remove('expanded');
    });
}

function displayFilteredFiles(files) {
    var container = document.getElementById('fileList');
    container.innerHTML = '';
    
    document.getElementById('fileCount').textContent = 
        files.length + ' file' + (files.length !== 1 ? 's' : '') + ' found';
    
    if (files.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No files match your search</p></div>';
        return;
    }
    
    files.forEach(function(file) {
        var fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.setAttribute('data-filepath', file);
        fileDiv.innerHTML = 
            '<span class="file-icon">📄</span>' +
            '<span class="file-name">' + file + '</span>';
        fileDiv.onclick = function() {
            loadFile(file);
        };
        container.appendChild(fileDiv);
    });
}

function loadFile(filename) {
    if (!currentBucket) {
        showToast('No bucket selected');
        return;
    }
    
    console.log('Loading file:', filename);
    currentFile = filename;
    var viewerContent = document.getElementById('viewerContent');
    var viewerTitle = document.getElementById('viewerTitle');
    var actionButtons = document.getElementById('actionButtons');
    
    document.querySelectorAll('.file-item').forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-filepath') === filename) {
            item.classList.add('active');
        }
    });
    
    viewerTitle.textContent = '📄 ' + filename;
    viewerContent.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading...</span></div>';
    actionButtons.style.display = 'none';
    isRawView = false;
    document.getElementById('viewToggleText').textContent = 'Show Raw JSON';
    
    fetch('/api/file?bucket=' + encodeURIComponent(currentBucket) + '&filename=' + encodeURIComponent(filename))
        .then(function(response) {
            return response.json().then(function(data) {
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load file');
                }
                return data;
            });
        })
        .then(function(data) {
            currentData = data.content;
            actionButtons.style.display = 'flex';
            displayJSON(currentData);
        })
        .catch(function(err) {
            console.error('Error:', err);
            viewerContent.innerHTML = '<div class="error"><h3>❌ Error</h3><p>' + 
                err.message + '</p></div>';
        });
}

function getImageUrl() {
    if (!currentBucket || !currentFile) return null;
    
    var pathWithoutExtension = currentFile.replace(/\\.json$/i, '');
    return '/api/image?bucket=' + encodeURIComponent(currentBucket) + '&path=' + encodeURIComponent(pathWithoutExtension);
}

function getImageDirectUrl() {
    if (!currentBucket || !currentFile) return null;
    
    var pathWithoutExtension = currentFile.replace(/\\.json$/i, '');
    return '/api/image?bucket=' + encodeURIComponent(currentBucket) + '&path=' + encodeURIComponent(pathWithoutExtension) + '&download=1';
}

function displayJSON(data) {
    var viewerContent = document.getElementById('viewerContent');
    
    if (isRawView) {
        viewerContent.innerHTML = '<pre>' + syntaxHighlight(JSON.stringify(data, null, 2)) + '</pre>';
    } else {
        viewerContent.innerHTML = formatSkinAnalysis(data);
    }
}

function exportToPDF() {
    if (!currentData || !currentFile) {
        showToast('No data to export');
        return;
    }
    
    var pdfBtn = document.getElementById('pdfBtn');
    pdfBtn.disabled = true;
    pdfBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-width: 2px; margin: 0;"></div> Generating...';
    
    var pdfContainer = document.getElementById('pdfContent');
    pdfContainer.style.left = '0';
    pdfContainer.style.top = '0';
    
    var content = '<div class="pdf-header">' +
        '<h1>Skin Analysis Report</h1>' +
        '<div class="subtitle">' + currentFile + '</div>' +
        '<div class="subtitle">' + new Date().toLocaleString() + '</div>' +
        '</div>' +
        formatSkinAnalysis(currentData);
    
    pdfContainer.innerHTML = content;
    
    setTimeout(function() {
        html2canvas(pdfContainer, {
            scale: 2,
            useCORS: false,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 800,
            allowTaint: true
        }).then(function(canvas) {
            pdfContainer.style.left = '-9999px';
            
            var imgData = canvas.toDataURL('image/png');
            var pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            var imgWidth = 210;
            var pageHeight = 297;
            var imgHeight = (canvas.height * imgWidth) / canvas.width;
            var heightLeft = imgHeight;
            var position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            var pdfFilename = currentFile.split('/').pop().replace('.json', '_report.pdf');
            pdf.save(pdfFilename);
            
            showToast('PDF exported successfully!');
            
            pdfBtn.disabled = false;
            pdfBtn.innerHTML = '📄 Export PDF';
        }).catch(function(err) {
            console.error('PDF Export Error:', err);
            showToast('Failed to export PDF: ' + err.message);
            pdfBtn.disabled = false;
            pdfBtn.innerHTML = '📄 Export PDF';
        });
    }, 1500);
}

function formatSkinAnalysis(data) {
    var html = '';
    
    var imageUrl = getImageUrl();
    var directUrl = getImageDirectUrl();
    if (imageUrl) {
        html += '<div class="analysis-image-container">';
        html += '<a href="' + directUrl + '" target="_blank" rel="noopener noreferrer" class="analysis-image-link" title="Click to view full size image">';
        html += '<img src="' + imageUrl + '" class="analysis-image" ';
        html += 'onerror="this.classList.add(\\'error-img\\'); this.parentElement.parentElement.querySelector(\\'.image-error-msg\\').style.display=\\'block\\';" />';
        html += '</a>';
        html += '<span class="image-label">Analysis Image (Click to view full size)</span>';
        html += '<div class="image-error-msg">Image not available</div>';
        html += '</div>';
    }
    
    html += '<div class="section">';
    html += '<h3 class="section-title">📊 Analysis Summary</h3>';
    html += '<table class="info-table">';
    html += '<tr><th colspan="2">General Information</th></tr>';
    if (data.askedZone) html += '<tr><td>Zone</td><td>' + data.askedZone + '</td></tr>';
    if (data.captureMode) html += '<tr><td>Capture Mode</td><td>' + data.captureMode + '</td></tr>';
    if (data.validSelfie !== undefined) html += '<tr><td>Valid Selfie</td><td><span class="badge ' + (data.validSelfie ? 'badge-ok' : 'badge-warning') + '">' + (data.validSelfie ? 'Valid ✓' : 'Invalid ✗') + '</span></td></tr>';
    if (data.networkQuality) html += '<tr><td>Network Quality</td><td>' + data.networkQuality + '</td></tr>';
    if (data.timeSpent) html += '<tr><td>Time Spent</td><td>' + data.timeSpent + '</td></tr>';
    if (data.browserName) html += '<tr><td>Browser</td><td>' + data.browserName + '</td></tr>';
    html += '</table>';
    html += '</div>';
    
    if (data.exif) {
        html += '<div class="section">';
        html += '<h3 class="section-title">📱 Device Information</h3>';
        html += '<table class="info-table">';
        html += '<tr><th colspan="2">EXIF Data</th></tr>';
        if (data.exif.deviceBrand) html += '<tr><td>Device Brand</td><td>' + data.exif.deviceBrand + '</td></tr>';
        if (data.exif.deviceModel) html += '<tr><td>Device Model</td><td>' + data.exif.deviceModel + '</td></tr>';
        if (data.exif.deviceOS) html += '<tr><td>Operating System</td><td>' + data.exif.deviceOS + '</td></tr>';
        if (data.exif.width && data.exif.height) html += '<tr><td>Image Dimensions</td><td>' + data.exif.width + ' × ' + data.exif.height + ' px</td></tr>';
        if (data.exif.brightness) html += '<tr><td>Brightness</td><td>' + data.exif.brightness.toFixed(2) + '</td></tr>';
        if (data.exif.whiteBalanceMode) html += '<tr><td>White Balance</td><td>' + data.exif.whiteBalanceMode + '</td></tr>';
        if (data.exif.selfieDateTime) html += '<tr><td>Capture Date</td><td>' + new Date(data.exif.selfieDateTime).toLocaleString() + '</td></tr>';
        html += '</table>';
        html += '</div>';
    }
    
    if (data.scores) {
        html += '<div class="section">';
        html += '<h3 class="section-title">⭐ Quality Scores</h3>';
        html += '<table class="info-table">';
        html += '<tr><th>Metric</th><th>Value</th><th>Status</th></tr>';
        for (var key in data.scores) {
            var score = data.scores[key];
            var value = Array.isArray(score.result) ? score.result.join(', ') : score.result;
            var statusClass = score.status === 'OK' ? 'badge-ok' : 'badge-warning';
            html += '<tr><td style="text-transform: capitalize;">' + key + '</td><td>' + value + '</td><td><span class="badge ' + statusClass + '">' + score.status + '</span></td></tr>';
        }
        html += '</table>';
        html += '</div>';
    }
    
    if (data.apiResults && data.apiResults.shade) {
        html += '<div class="section">';
        html += '<h3 class="section-title">🎨 Skin Tone (LAB Color Space)</h3>';
        html += '<table class="info-table">';
        html += '<tr><th>Component</th><th>Value</th></tr>';
        html += '<tr><td>L (Lightness)</td><td>' + data.apiResults.shade.l.toFixed(2) + '</td></tr>';
        html += '<tr><td>A (Red-Green)</td><td>' + data.apiResults.shade.a.toFixed(2) + '</td></tr>';
        html += '<tr><td>B (Blue-Yellow)</td><td>' + data.apiResults.shade.b.toFixed(2) + '</td></tr>';
        html += '</table>';
        html += '</div>';
    }
    
    if (data.apiResults && data.apiResults.modiface && data.apiResults.modiface.ranges && data.apiResults.modiface.ranges[0]) {
        var concerns = data.apiResults.modiface.ranges[0].concerns;
        if (concerns && concerns.length > 0) {
            html += '<div class="section">';
            html += '<h3 class="section-title">🔍 Skin Concerns Analysis (Age Range: ' + data.apiResults.modiface.ranges[0].label + ')</h3>';
            html += '<div class="concerns-grid">';
            concerns.forEach(function(concern) {
                var score = concern.normalizedScore ? (parseFloat(concern.normalizedScore) * 100).toFixed(1) : 'N/A';
                var concernName = concern.code.replace(/([A-Z])/g, ' $1').trim();
                html += '<div class="concern-card">';
                html += '<div class="concern-name">' + concernName + '</div>';
                if (concern.normalizedScore) {
                    html += '<div class="concern-value">Score: ' + score + '%</div>';
                    html += '<div class="score-bar"><div class="score-fill" style="width: ' + score + '%"></div></div>';
                } else {
                    html += '<div class="concern-value">No data available</div>';
                }
                html += '</div>';
            });
            html += '</div>';
            html += '</div>';
        }
    }
    
    if (data.apiResults && data.apiResults.nexa) {
        html += '<div class="section">';
        html += '<h3 class="section-title">🔬 Nexa Analysis (Version ' + data.apiResults.nexa.version + ')</h3>';
        html += '<table class="info-table">';
        html += '<tr><th>Feature</th><th>Score</th></tr>';
        for (var key in data.apiResults.nexa) {
            if (key !== 'version' && typeof data.apiResults.nexa[key] === 'number') {
                var featureName = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                var score = data.apiResults.nexa[key].toFixed(2);
                html += '<tr><td style="text-transform: capitalize;">' + featureName + '</td><td>' + score + '</td></tr>';
            }
        }
        html += '</table>';
        html += '</div>';
    }
    
    if (data.apiResults && data.apiResults.modiface && data.apiResults.modiface.acne_count) {
        var acneData = data.apiResults.modiface.acne_count.front;
        html += '<div class="section">';
        html += '<h3 class="section-title">🔴 Acne Analysis</h3>';
        html += '<table class="info-table">';
        html += '<tr><th>Type</th><th>Count</th></tr>';
        html += '<tr><td>Inflammatory</td><td>' + acneData.inflammatory + '</td></tr>';
        html += '<tr><td>Retentional</td><td>' + acneData.retentional + '</td></tr>';
        html += '<tr><td>Pigmented</td><td>' + acneData.pigmented + '</td></tr>';
        html += '<tr><td><strong>Total</strong></td><td><strong>' + (acneData.inflammatory + acneData.retentional + acneData.pigmented) + '</strong></td></tr>';
        html += '</table>';
        html += '</div>';
    }
    
    if (data.apiResults && data.apiResults.modiface && data.apiResults.modiface.metadata) {
        var meta = data.apiResults.modiface.metadata;
        html += '<div class="section">';
        html += '<h3 class="section-title">ℹ️ Analysis Metadata</h3>';
        html += '<table class="info-table">';
        if (meta.brand) html += '<tr><td>Brand</td><td>' + meta.brand + '</td></tr>';
        if (meta.country) html += '<tr><td>Country</td><td>' + meta.country.toUpperCase() + '</td></tr>';
        if (meta.touchpoint) html += '<tr><td>Touchpoint</td><td>' + meta.touchpoint + '</td></tr>';
        if (meta.environment) html += '<tr><td>Environment</td><td>' + meta.environment + '</td></tr>';
        if (meta.creationDate) html += '<tr><td>Created</td><td>' + new Date(meta.creationDate).toLocaleString() + '</td></tr>';
        if (meta.creationVersion) html += '<tr><td>Version</td><td>' + meta.creationVersion + '</td></tr>';
        html += '</table>';
        html += '</div>';
    }
    
    return html;
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, 
        function (match) {
            var cls = 'json-number';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'json-key' : 'json-string';
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        }
    );
}

function toggleView() {
    isRawView = !isRawView;
    document.getElementById('viewToggleText').textContent = isRawView ? 'Show Formatted View' : 'Show Raw JSON';
    displayJSON(currentData);
}

function downloadFile() {
    if (!currentData || !currentFile) return;
    var blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = currentFile.split('/').pop();
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON file downloaded!');
}

function copyToClipboard() {
    if (!currentData) return;
    navigator.clipboard.writeText(JSON.stringify(currentData, null, 2))
        .then(function() { showToast('Copied to clipboard!'); })
        .catch(function(err) { showToast('Failed to copy: ' + err); });
}

function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}
  `);
});

// NEW: Image proxy endpoint to bypass CORS
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
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Get file metadata to set proper content type
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'image/jpeg';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    if (download) {
      res.setHeader('Content-Disposition', 'inline');
    }
    
    // Stream the image
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

app.get('/api/files', async (req, res) => {
  const bucketName = req.query.bucket;
  
  if (!bucketName) {
    return res.status(400).json({ error: 'Bucket name is required' });
  }
  
  console.log('API: Listing files from bucket:', bucketName);
  
  try {
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles();
    const jsonFiles = files
      .filter(file => file.name.toLowerCase().endsWith('.json'))
      .map(file => file.name);
    
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

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 GCP Bucket JSON Viewer with Image Proxy');
  console.log('========================================');
  console.log('🌐 URL: http://localhost:' + PORT);
  console.log('📝 Enter any bucket name to browse');
  console.log('🖼️  Images proxied through server (CORS-free)');
  console.log('========================================\n');
});