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
    <title>VCA Dashboard - Photo Submission Results</title>
    <meta name="google-signin-client_id" content="434775612504-337vvnh0ufstp9a7n4kdom0eu1tn6st1.apps.googleusercontent.com">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        :root {
            --primary-green: #10b981;
            --primary-green-light: #34d399;
            --primary-green-dark: #059669;
            --accent-blue: #3b82f6;
            --accent-blue-light: #60a5fa;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --text-muted: #94a3b8;
            --bg-primary: #ffffff;
            --bg-secondary: #F9F8F6;
            --bg-tertiary: #f1f5f9;
            --border-light: #e2e8f0;
            --border-medium: #cbd5e1;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --radius-sm: 4px;
            --radius-md: 6px;
            --radius-lg: 8px;
            --radius-xl: 12px;
            --spacing-1: 4px;
            --spacing-2: 8px;
            --spacing-3: 12px;
            --spacing-4: 16px;
            --spacing-5: 20px;
            --spacing-6: 24px;
            --spacing-8: 32px;
            --spacing-10: 40px;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            color: var(--text-primary);
            font-size: 14px;
            line-height: 1.5;
        }
        .dashboard {
            display: flex;
            min-height: 100vh;
            background: var(--bg-secondary);
        }
        
        /* Sidebar Navigation */
        .sidebar {
            width: 280px;
            background: var(--bg-primary);
            border-right: 1px solid var(--border-light);
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            z-index: 100;
        }
        .sidebar-header {
            padding: var(--spacing-6);
            border-bottom: 1px solid var(--border-light);
        }
        .sidebar-logo {
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
            font-size: 18px;
            font-weight: 600;
            color: var(--primary-green);
        }
        .sidebar-subtitle {
            font-size: 12px;
            color: var(--text-muted);
            margin-top: var(--spacing-1);
        }
        
        .sidebar-nav {
            flex: 1;
            padding: var(--spacing-4);
            overflow-y: auto;
        }
        .nav-section {
            margin-bottom: var(--spacing-6);
        }
        .nav-section-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: var(--spacing-3);
            padding-left: var(--spacing-3);
        }
        .nav-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
            padding: var(--spacing-3) var(--spacing-3);
            border-radius: var(--radius-md);
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: var(--spacing-1);
        }
        .nav-item:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }
        .nav-item.active {
            background: var(--primary-green);
            color: white;
        }
        .nav-item-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
        }
        
        .sidebar-footer {
            padding: var(--spacing-4);
            border-top: 1px solid var(--border-light);
        }
        
        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 280px;
            display: flex;
            flex-direction: column;
        }
        
        .page-header {
            background: var(--bg-primary);
            padding: var(--spacing-6) var(--spacing-8);
            border-bottom: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .page-title-section {
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
        }
        .page-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary);
        }
        .page-subtitle {
            color: var(--text-secondary);
            font-size: 14px;
            margin-top: var(--spacing-1);
        }
        .page-actions {
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
        }
        .bucket-display {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
            margin-right: var(--spacing-4);
        }
        .bucket-name {
            color: var(--text-secondary);
            font-size: 12px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
            background: var(--bg-tertiary);
            padding: var(--spacing-1) var(--spacing-3);
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-light);
        }
        .change-bucket-btn {
            padding: var(--spacing-2) var(--spacing-4);
            background: var(--accent-blue);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .change-bucket-btn:hover { 
            background: var(--accent-blue-light); 
            transform: translateY(-1px);
        }
        
        .btn-primary {
            background: var(--primary-green);
            color: white;
            border: none;
            padding: var(--spacing-3) var(--spacing-5);
            border-radius: var(--radius-md);
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
        }
        .btn-primary:hover {
            background: var(--primary-green-dark);
            transform: translateY(-1px);
        }
        
        /* Filters and Controls */
        .controls-section {
            background: var(--bg-primary);
            padding: var(--spacing-4) var(--spacing-8);
            border-bottom: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--spacing-4);
        }
        .filter-controls {
            display: flex;
            align-items: center;
            gap: var(--spacing-4);
        }
        .filter-chips {
            display: flex;
            gap: var(--spacing-2);
        }
        .filter-chip {
            padding: var(--spacing-2) var(--spacing-4);
            border-radius: var(--radius-lg);
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            border: 1px solid var(--border-light);
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .filter-chip:hover {
            background: var(--bg-secondary);
        }
        .filter-chip.active {
            background: var(--primary-green);
            color: white;
            border-color: var(--primary-green);
        }
        
        .search-container {
            position: relative;
            min-width: 280px;
        }
        .search-input {
            width: 100%;
            padding: var(--spacing-3) var(--spacing-3) var(--spacing-3) var(--spacing-10);
            border: 1px solid var(--border-medium);
            border-radius: var(--radius-md);
            font-size: 14px;
            background: var(--bg-secondary);
            transition: all 0.2s ease;
        }
        .search-input:focus {
            outline: none;
            border-color: var(--primary-green);
            background: var(--bg-primary);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .search-icon {
            position: absolute;
            left: var(--spacing-3);
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 16px;
        }
        
        .export-controls {
            display: flex;
            gap: var(--spacing-2);
        }
        /* Summary Bar */
        .summary-bar {
            background: var(--bg-primary);
            padding: var(--spacing-4) var(--spacing-8);
            border-bottom: 1px solid var(--border-light);
            display: flex;
            gap: var(--spacing-6);
        }
        .summary-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-width: 120px;
        }
        .summary-stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
        }
        .summary-stat-label {
            font-size: 12px;
            color: var(--text-muted);
            margin-top: var(--spacing-1);
            font-weight: 500;
        }
        .summary-stat.primary .summary-stat-value {
            color: var(--primary-green);
        }
        
        /* Loading Indicator */
        .loading-indicator {
            padding: var(--spacing-6);
            text-align: center;
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border-color);
        }
        .loading-content {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-3);
            padding: var(--spacing-4) var(--spacing-6);
            background: var(--bg-secondary);
            border-radius: var(--radius-2);
            border: 1px solid var(--border-color);
        }
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-color);
            border-top: 2px solid var(--primary-green);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .loading-text {
            text-align: left;
        }
        .loading-message {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 2px;
        }
        .loading-progress {
            font-size: 12px;
            color: var(--text-secondary);
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Main Content Area */
        .content-area {
            display: flex;
            flex: 1;
            gap: var(--spacing-5);
            padding: var(--spacing-5) var(--spacing-8);
            overflow: hidden;
        }
        
        /* File Cards Grid */
        .files-section {
            flex: 2;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        .files-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--spacing-4);
        }
        .files-count {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: var(--spacing-4);
            overflow-y: auto;
            max-height: calc(100vh - 280px);
            padding-right: var(--spacing-2);
        }
        
        /* File Card */
        .file-card {
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-light);
            padding: var(--spacing-5);
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: var(--shadow-sm);
        }
        .file-card:hover {
            border-color: var(--primary-green);
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }
        .file-card.active {
            border-color: var(--primary-green);
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
        }
        
        .file-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: var(--spacing-4);
            position: relative;
        }
        
        .file-thumbnail {
            position: absolute;
            top: 0;
            right: 0;
            width: 60px;
            height: 60px;
            border-radius: var(--radius-md);
            border: 2px solid var(--border-light);
            background: var(--bg-secondary);
            overflow: hidden;
        }
        .file-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .file-thumbnail-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: var(--text-secondary);
            font-size: 24px;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        }
        
        .file-info {
            flex: 1;
            padding-right: 72px; /* Space for 60px thumbnail + margin */
            min-width: 0;
        }
        .study-name {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--spacing-2);
            letter-spacing: 0.5px;
        }
        .participant-info {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-1);
        }
        .user-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }
        .info-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--spacing-2);
        }
        .capture-date {
            font-size: 12px;
            color: var(--text-secondary);
            font-weight: 500;
        }
        .user-id {
            font-size: 11px;
            color: var(--text-muted);
            font-family: 'SF Mono', Monaco, monospace;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-pill {
            padding: var(--spacing-1) var(--spacing-3);
            border-radius: var(--radius-lg);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-pill.valid {
            background: #d1fae5;
            color: #065f46;
        }
        .status-pill.invalid {
            background: #fee2e2;
            color: #991b1b;
        }
        .status-pill.unknown {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .file-metrics {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
            margin-top: var(--spacing-2);
            flex-wrap: wrap;
        }
        .metric-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-1);
            padding: 3px 8px;
            background: var(--bg-secondary);
            border-radius: var(--radius-sm);
            font-size: 11px;
            color: var(--text-secondary);
            border: 1px solid var(--border-light);
            font-weight: 500;
        }
        .metric-value {
            font-weight: 600;
        }
        
        .status-badge.valid {
            background: #d1fae5;
            border-color: #a7f3d0;
            color: #065f46;
        }
        .status-badge.invalid {
            background: #fee2e2;
            border-color: #fecaca;
            color: #991b1b;
        }
        .status-badge.unknown {
            background: #f3f4f6;
            border-color: #e5e7eb;
            color: #6b7280;
        }
        
        /* Detail Viewer Panel */
        .viewer-section {
            flex: 1;
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-light);
            display: flex;
            flex-direction: column;
            max-height: calc(100vh - 200px);
        }
        
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
        
        .panel-header {
            background: var(--primary-green);
            color: white;
            padding: var(--spacing-4) var(--spacing-5);
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
        }

        
        .viewer-content { 
            flex: 1; 
            overflow: auto; 
            padding: var(--spacing-5); 
        }
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
            padding: var(--spacing-4) var(--spacing-5);
            border-bottom: 1px solid var(--border-light);
            display: flex;
            gap: var(--spacing-2);
            flex-wrap: wrap;
            background: var(--bg-secondary);
        }
        .btn {
            padding: var(--spacing-2) var(--spacing-4);
            border: none;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .btn-primary { 
            background: var(--accent-blue); 
            color: white; 
        }
        .btn-primary:hover:not(:disabled) { 
            background: var(--accent-blue-light); 
            transform: translateY(-1px);
        }
        .btn-secondary { 
            background: var(--bg-tertiary); 
            color: var(--text-secondary); 
            border: 1px solid var(--border-medium); 
        }
        .btn-secondary:hover:not(:disabled) { 
            background: var(--bg-secondary); 
            color: var(--text-primary);
        }
        .btn-success { 
            background: var(--primary-green); 
            color: white; 
        }
        .btn-success:hover:not(:disabled) { 
            background: var(--primary-green-dark); 
            transform: translateY(-1px);
        }
        
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
        
        /* Responsive Design */
        @media (max-width: 1200px) {
            .content-area {
                flex-direction: column;
            }
            .viewer-section {
                max-height: 400px;
            }
            .files-grid {
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                max-height: none;
            }
        }
        
        @media (max-width: 968px) {
            .sidebar {
                width: 240px;
            }
            .main-content {
                margin-left: 240px;
            }
            .page-header {
                flex-direction: column;
                align-items: flex-start;
                gap: var(--spacing-4);
            }
            .controls-section {
                flex-direction: column;
                gap: var(--spacing-3);
            }
            .summary-bar {
                flex-wrap: wrap;
                gap: var(--spacing-3);
            }
        }
        
        @media (max-width: 768px) {
            .sidebar {
                display: none;
            }
            .main-content {
                margin-left: 0;
            }
            .files-grid {
                grid-template-columns: 1fr;
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

    <div class="dashboard">
        <!-- Sidebar Navigation -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <span>�</span>
                    <span>VCA Dashboard</span>
                </div>
                <div class="sidebar-subtitle">Photo Analysis Platform</div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">Analysis Tools</div>
                    <div class="nav-item active">
                        <span class="nav-item-icon">📊</span>
                        <span>Photo Submissions</span>
                    </div>
                    <div class="nav-item">
                        <span class="nav-item-icon">📈</span>
                        <span>Analytics</span>
                    </div>
                    <div class="nav-item">
                        <span class="nav-item-icon">📋</span>
                        <span>Reports</span>
                    </div>
                </div>
                
                <div class="nav-section">
                    <div class="nav-section-title">Data Management</div>
                    <div class="nav-item">
                        <span class="nav-item-icon">🗂️</span>
                        <span>Buckets</span>
                    </div>
                    <div class="nav-item">
                        <span class="nav-item-icon">🔧</span>
                        <span>Settings</span>
                    </div>
                </div>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-info" id="userInfo" style="display: none;">
                    <img class="user-avatar" id="userAvatar" src="" alt="User Avatar">
                    <div style="margin-left: 8px;">
                        <div class="user-name" id="userName" style="font-size: 13px; font-weight: 500;"></div>
                        <button class="sign-out-btn" onclick="signOut()" style="font-size: 11px; margin-top: 4px;">Sign Out</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Page Header -->
            <div class="page-header">
                <div class="page-title-section">
                    <div>
                        <h1 class="page-title">📊 Photo Submissions</h1>
                        <div class="page-subtitle">Manage and analyze photo submission results</div>
                    </div>
                </div>
                <div class="page-actions">
                    <div class="bucket-display">
                        <span class="bucket-name" id="currentBucketName">📦 vca-gcs-edc-loreal-internal-results-eu-dv</span>
                        <button class="change-bucket-btn" id="changeBucketBtn">Change Bucket</button>
                    </div>
                </div>
            </div>
            
            <!-- Controls and Filters -->
            <div class="controls-section">
                <div class="filter-controls">
                    <div class="filter-chips">
                        <div class="filter-chip active" data-filter="all">All Files</div>
                        <div class="filter-chip" data-filter="valid">Valid Selfies</div>
                        <div class="filter-chip" data-filter="invalid">Invalid Selfies</div>
                    </div>
                    
                    <div class="search-container">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="search-input" id="searchInput" placeholder="Search files...">
                    </div>
                </div>
                
                <div class="export-controls">
                    <span class="files-count" id="fileCount">0 files</span>
                </div>
            </div>
            
            <!-- Summary Statistics -->
            <div class="summary-bar" id="summaryBar" style="display: none;">
                <div class="summary-stat primary">
                    <div class="summary-stat-value" id="totalFiles">0</div>
                    <div class="summary-stat-label">Total Files</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-stat-value" id="validSelfies">0</div>
                    <div class="summary-stat-label">Valid Selfies</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-stat-value" id="avgScores">0</div>
                    <div class="summary-stat-label">Avg Quality Score</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-stat-value" id="totalConcerns">0</div>
                    <div class="summary-stat-label">Total Concerns</div>
                </div>
            </div>
            
            <!-- Loading Indicator -->
            <div class="loading-indicator" id="loadingIndicator" style="display: none;">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">
                        <div class="loading-message">Loading file metadata...</div>
                        <div class="loading-progress" id="loadingProgress">0 / 0 files</div>
                    </div>
                </div>
            </div>
            
            <!-- Content Area -->
            <div class="content-area">
                <!-- Files Grid -->
                <div class="files-section">
                    <div class="files-grid" id="filesGrid">
                        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
                            <h3>No files loaded</h3>
                            <p>Please select a bucket to begin</p>
                        </div>
                    </div>
                </div>
                
                <!-- Detail Viewer -->
                <div class="viewer-section">
                    <div class="panel-header">
                        <span id="viewerTitle">Select a file to view details</span>
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
                            <p>Choose a file from the grid to view detailed analysis</p>
                        </div>
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
    // Development bypass for localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Auto-authenticate for development
        if (!isAuthenticated) {
            currentUser = {
                id: 'dev-user',
                email: 'developer@localhost',
                name: 'Development User',
                picture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Yjc2ODgiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMiIgeT0iMTIiPgo8cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4UzMuNTggMTYgOCAxNiAxNiAxMi40MiAxNiA4IDEyLjQyIDAgOCAwWk04IDJDMTEuMzEgMiAxNCA0LjY5IDE0IDhTMTEuMzEgMTQgOCAxNCA0IDExLjMxIDQgOCA0IDQuNjkgOCAyWiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+',
                domain: 'localhost'
            };
            isAuthenticated = true;
            hideAuthOverlay();
            showUserInfo();
        }
        return true;
    }
    
    // Production authentication flow
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
    // Skip Google Sign-In initialization for localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Localhost detected - skipping Google Sign-In initialization');
        return;
    }
    
    // Dynamically load Google Sign-In library for production only
    if (typeof google === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = function() {
            initializeGoogleSignInLibrary();
        };
        script.onerror = function() {
            console.warn('Failed to load Google Sign-In library');
            showGoogleSignInError();
        };
        document.head.appendChild(script);
    } else {
        initializeGoogleSignInLibrary();
    }
}

function initializeGoogleSignInLibrary() {
    try {
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
            // Retry after a short delay if Google library not ready yet
            setTimeout(initializeGoogleSignInLibrary, 100);
        }
    } catch (error) {
        console.warn('Google Sign-In initialization failed:', error);
        showGoogleSignInError();
    }
}

function showGoogleSignInError() {
    if (document.querySelector('.g_id_signin')) {
        document.querySelector('.g_id_signin').innerHTML = 
            '<div style="padding: 12px; text-align: center; color: #666; font-size: 14px;">' +
            'Google Sign-In temporarily unavailable.<br>' +
            '<button onclick="window.location.reload()" style="margin-top: 8px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>' +
            '</div>';
    }
}
var currentBucket = 'vca-gcs-edc-loreal-internal-results-eu-dv';
var allFiles = [];
var allFilesData = [];
var currentFile = null;
var currentData = null;
var isRawView = false;
var currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first (this will auto-authenticate for localhost)
    checkAuthentication();
    
    // Initialize Google Sign-In only for non-localhost
    initializeGoogleSignIn();
    
    // Event listeners
    document.getElementById('connectBtn').addEventListener('click', connectToBucket);
    document.getElementById('changeBucketBtn').addEventListener('click', showBucketModal);
    document.getElementById('pdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('downloadBtn').addEventListener('click', downloadFile);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('toggleViewBtn').addEventListener('click', toggleView);
    
    document.getElementById('bucketNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            connectToBucket();
        }
    });
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterAndDisplayFiles();
    });
    
    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            // Update active chip
            document.querySelectorAll('.filter-chip').forEach(function(c) {
                c.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            filterAndDisplayFiles();
        });
    });
    
    // Auto-connect to default bucket (after authentication check)
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
    
    // Show loading state
    document.getElementById('filesGrid').innerHTML = 
        '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;"><div class="loading"><div class="spinner"></div><span>Loading files...</span></div></div>';
    
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
            allFilesData = [];
            
            // Show summary bar
            document.getElementById('summaryBar').style.display = 'flex';
            
            // Load basic file data and display cards
            loadFileAnalytics();
            displayFilesAsCards();
            updateSummaryStats();
        })
        .catch(function(err) {
            console.error('Error:', err);
            document.getElementById('filesGrid').innerHTML = 
                '<div style="grid-column: 1/-1;" class="error"><h3>❌ Error</h3><p>' + err.message + 
                '</p><ul><li>Run: gcloud auth application-default login</li>' +
                '<li>Check bucket name and permissions</li>' +
                '<li>Verify bucket exists</li></ul>' +
                '<button class="retry-btn" onclick="loadFiles()">Retry</button></div>';
        });
}

function loadFileAnalytics() {
    // Initialize with placeholder data
    allFilesData = allFiles.map(function(file, index) {
        return {
            filename: file,
            loaded: false,
            validSelfie: null,
            scoresCount: 0,
            acneTotal: 0,
            hasDevice: false,
            networkQuality: null
        };
    });
    
    // Start preloading metadata for all files
    preloadFileMetadata();
}

function preloadFileMetadata() {
    var loadedCount = 0;
    var totalFiles = allFiles.length;
    
    if (totalFiles === 0) {
        return;
    }
    
    console.log('Preloading metadata for', totalFiles, 'files...');
    
    // Show loading indicator if it exists
    var loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
        var loadingProgress = document.getElementById('loadingProgress');
        if (loadingProgress) {
            loadingProgress.textContent = '0 / ' + totalFiles + ' files';
        }
    }
    
    allFiles.forEach(function(filename, index) {
        fetch('/api/file?bucket=' + encodeURIComponent(currentBucket) + '&filename=' + encodeURIComponent(filename))
            .then(function(response) {
                return response.json().then(function(data) {
                    if (response.ok) {
                        return data;
                    }
                    throw new Error(data.error || 'Failed to load file');
                });
            })
            .then(function(data) {
                // Extract metrics and update allFilesData
                var metrics = extractFileMetrics(filename, data.content);
                allFilesData[index] = metrics;
                
                loadedCount++;
                updateLoadingProgress(loadedCount, totalFiles);
            })
            .catch(function(err) {
                console.warn('Failed to preload', filename, ':', err.message);
                loadedCount++;
                updateLoadingProgress(loadedCount, totalFiles);
            });
    });
}

function updateLoadingProgress(loaded, total) {
    // Update progress indicator if it exists
    var loadingProgress = document.getElementById('loadingProgress');
    if (loadingProgress) {
        loadingProgress.textContent = loaded + ' / ' + total + ' files';
    }
    
    // Update display every 3 files or at completion
    if (loaded % 3 === 0 || loaded === total) {
        console.log('Preloaded', loaded, '/', total, 'files');
        
        // Refresh the display with new data
        displayFilesAsCards();
        updateSummaryStats();
    }
    
    // Hide loading indicator when done
    if (loaded === total) {
        setTimeout(function() {
            var loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }, 500);
    }
}

function extractFileMetrics(filename, data) {
    var metrics = {
        filename: filename,
        loaded: true,
        validSelfie: data.validSelfie || false,
        scoresCount: 0,
        acneTotal: 0,
        hasDevice: !!(data.exif && data.exif.deviceBrand),
        networkQuality: data.networkQuality || 'Unknown'
    };
    
    // Count quality scores
    if (data.scores) {
        metrics.scoresCount = Object.keys(data.scores).length;
    }
    
    // Count acne total
    if (data.apiResults && data.apiResults.modiface && data.apiResults.modiface.acne_count && data.apiResults.modiface.acne_count.front) {
        var acne = data.apiResults.modiface.acne_count.front;
        metrics.acneTotal = (acne.inflammatory || 0) + (acne.retentional || 0) + (acne.pigmented || 0);
    }
    
    return metrics;
}

function displayFilesAsCards() {
    var container = document.getElementById('filesGrid');
    
    if (allFiles.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;"><h3>No JSON files found</h3><p>No files found in this bucket</p></div>';
        return;
    }
    
    filterAndDisplayFiles();
}

function filterAndDisplayFiles() {
    var searchTerm = document.getElementById('searchInput').value.toLowerCase();
    var container = document.getElementById('filesGrid');
    
    // Filter files based on search and filter
    var filteredFiles = allFilesData.filter(function(fileData) {
        // Search filter
        if (searchTerm && !fileData.filename.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Status filter
        if (currentFilter === 'valid' && !fileData.validSelfie) {
            return false;
        }
        if (currentFilter === 'invalid' && fileData.validSelfie !== false) {
            return false;
        }
        
        return true;
    });
    
    // Update count
    document.getElementById('fileCount').textContent = 
        filteredFiles.length + ' file' + (filteredFiles.length !== 1 ? 's' : '');
    
    // Display cards
    if (filteredFiles.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;"><h3>No files match your criteria</h3><p>Try adjusting your search or filter</p></div>';
        return;
    }
    
    container.innerHTML = '';
    filteredFiles.forEach(function(fileData) {
        var card = createFileCard(fileData);
        container.appendChild(card);
    });
}

function parseFilename(filename) {
    // Extract just the filename without path
    var fileName = filename.split('/').pop();
    
    // Remove .json extension
    var baseName = fileName.replace(/\.json$/i, '');
    
    // Parse format: STUDY-DATE-ID-NAME (e.g., TESTLOGPT-20241027-9251-JamesZHOU)
    var parts = baseName.split('-');
    
    if (parts.length >= 4) {
        return {
            studyName: parts[0],
            date: parts[1],
            userId: parts[2],
            userName: parts.slice(3).join('-'), // Join remaining parts in case name has hyphens
            originalFilename: fileName
        };
    } else if (parts.length === 3) {
        // Fallback for 3-part format: STUDY-DATE-NAME
        return {
            studyName: parts[0],
            date: parts[1],
            userId: '',
            userName: parts[2],
            originalFilename: fileName
        };
    }
    
    // Fallback if parsing fails
    return {
        studyName: 'Unknown Study',
        date: 'Unknown Date',
        userId: '',
        userName: baseName,
        originalFilename: fileName
    };
}

function createFileCard(fileData) {
    var card = document.createElement('div');
    card.className = 'file-card';
    card.setAttribute('data-filepath', fileData.filename);
    
    // Parse filename for structured information
    var parsedInfo = parseFilename(fileData.filename);
    
    // Format date for display
    var displayDate = parsedInfo.date;
    if (parsedInfo.date && parsedInfo.date.length === 8) {
        // Convert YYYYMMDD to readable format
        var year = parsedInfo.date.substring(0, 4);
        var month = parsedInfo.date.substring(4, 6);
        var day = parsedInfo.date.substring(6, 8);
        displayDate = month + '/' + day + '/' + year;
    }
    
    // Determine status
    var status = fileData.validSelfie === null ? 'unknown' : 
                 fileData.validSelfie ? 'valid' : 'invalid';
    var statusText = fileData.validSelfie === null ? 'Unknown' : 
                     fileData.validSelfie ? 'Valid' : 'Invalid';
    
    // Create thumbnail image URL
    var pathWithoutExtension = fileData.filename.replace(/\.json$/i, '');
    var imageUrl = '/api/image?bucket=' + encodeURIComponent(currentBucket) + '&path=' + encodeURIComponent(pathWithoutExtension);
    
    card.innerHTML = 
        '<div class="file-card-header">' +
            '<div class="file-info">' +
                '<div class="study-name">' + parsedInfo.studyName + '</div>' +
                '<div class="participant-info">' +
                    '<div class="user-name">' + parsedInfo.userName + '</div>' +
                    '<div class="capture-date">' + displayDate + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="file-thumbnail">' +
                '<img src="' + imageUrl + '" alt="Photo thumbnail" onerror="this.style.display=&quot;none&quot;; this.nextElementSibling.style.display=&quot;flex&quot;;" />' +
                '<div class="file-thumbnail-placeholder" style="display: none;">📷</div>' +
            '</div>' +
        '</div>' +
        '<div class="file-metrics">' +
            '<div class="metric-badge">' +
                '<span class="metric-value">' + (fileData.loaded ? fileData.scoresCount : '?') + '</span>' +
                '<span>scores</span>' +
            '</div>' +
            '<div class="metric-badge">' +
                '<span class="metric-value">' + (fileData.loaded ? fileData.acneTotal : '?') + '</span>' +
                '<span>acne</span>' +
            '</div>' +
            '<div class="metric-badge">' +
                '<span class="metric-value">' + (fileData.hasDevice ? '✓' : '–') + '</span>' +
                '<span>device</span>' +
            '</div>' +
            '<div class="metric-badge status-badge ' + status + '">' +
                '<span>' + statusText + '</span>' +
            '</div>' +
        '</div>';
    
    card.onclick = function() {
        loadFile(fileData.filename);
        
        // Update active state
        document.querySelectorAll('.file-card').forEach(function(c) {
            c.classList.remove('active');
        });
        card.classList.add('active');
    };
    
    return card;
}

function updateSummaryStats() {
    var totalFiles = allFilesData.length;
    var validSelfies = allFilesData.filter(function(f) { return f.validSelfie === true; }).length;
    var totalScores = allFilesData.reduce(function(sum, f) { return sum + f.scoresCount; }, 0);
    var avgScores = totalFiles > 0 ? Math.round(totalScores / totalFiles) : 0;
    var totalConcerns = allFilesData.reduce(function(sum, f) { return sum + f.acneTotal; }, 0);
    
    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('validSelfies').textContent = validSelfies;
    document.getElementById('avgScores').textContent = avgScores;
    document.getElementById('totalConcerns').textContent = totalConcerns;
}

function exportAllFiles() {
    if (allFiles.length === 0) {
        showToast('No files to export');
        return;
    }
    
    var exportData = {
        bucket: currentBucket,
        totalFiles: allFiles.length,
        files: allFilesData.map(function(f) {
            return {
                filename: f.filename,
                validSelfie: f.validSelfie,
                scoresCount: f.scoresCount,
                acneTotal: f.acneTotal,
                hasDevice: f.hasDevice,
                networkQuality: f.networkQuality
            };
        })
    };
    
    var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'vca_summary_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Summary exported successfully!');
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
    
    // Update viewer title
    var displayName = filename.split('/').pop();
    viewerTitle.textContent = '📄 ' + displayName;
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
            
            // Update file metrics in our data store
            var fileIndex = allFilesData.findIndex(function(f) { return f.filename === filename; });
            if (fileIndex !== -1) {
                allFilesData[fileIndex] = extractFileMetrics(filename, currentData);
                
                // Update the card display
                updateFileCard(filename, allFilesData[fileIndex]);
                
                // Update summary stats
                updateSummaryStats();
            }
            
            displayJSON(currentData);
        })
        .catch(function(err) {
            console.error('Error:', err);
            viewerContent.innerHTML = '<div class="error"><h3>❌ Error</h3><p>' + 
                err.message + '</p></div>';
        });
}

function updateFileCard(filename, metrics) {
    var card = document.querySelector('.file-card[data-filepath="' + filename + '"]');
    if (!card) return;
    
    // Update status pill
    var status = metrics.validSelfie === null ? 'unknown' : 
                 metrics.validSelfie ? 'valid' : 'invalid';
    var statusText = metrics.validSelfie === null ? 'Unknown' : 
                     metrics.validSelfie ? 'Valid Selfie' : 'Invalid Selfie';
    
    var statusPill = card.querySelector('.status-pill');
    if (statusPill) {
        statusPill.className = 'status-pill ' + status;
        statusPill.textContent = statusText;
    }
    
    // Update KPI values
    var kpiTiles = card.querySelectorAll('.kpi-tile');
    if (kpiTiles[0]) kpiTiles[0].querySelector('.kpi-value').textContent = metrics.scoresCount;
    if (kpiTiles[1]) kpiTiles[1].querySelector('.kpi-value').textContent = metrics.acneTotal;
    if (kpiTiles[2]) kpiTiles[2].querySelector('.kpi-value').textContent = metrics.hasDevice ? 'Yes' : 'No';
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