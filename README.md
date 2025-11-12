

curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt update
sudo apt install -y google-cloud-sdk


gcloud init

gcloud auth application-default login

# Fix SSL certificate issues on macOS
export NODE_TLS_REJECT_UNAUTHORIZED=0

export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

# Alternative: Install/update certificates (more secure)
# brew install ca-certificates
# export NODE_EXTRA_CA_CERTS=/opt/homebrew/etc/ca-certificates/cert.pem

---

## 📝 Study Design Tool

The VCA platform includes a comprehensive Study Design tool for creating custom surveys and forms without requiring a database.

### Features
- **13 Question Types**: Text, multiple choice, rating, date, file upload, and more
- **Drag & Drop**: Reorder questions easily
- **Live Preview**: See your form as you build it
- **JSON Export/Import**: Save and share studies as JSON files
- **No Database Required**: All studies stored as portable JSON files

### Workflow

1. **Create a Study**
   - Navigate to Study Design from the sidebar
   - Add questions using the question toolbar
   - Configure form settings (dates, limits, theme)

2. **Save Draft**
   - Click "Save Draft" button
   - Automatically downloads JSON file
   - Also saves to browser localStorage

3. **Publish Study**
   - Click "Publish Study" button
   - Downloads final JSON with publish timestamp
   - Use this file to deploy the study

4. **Load Existing Study**
   - Click "Load Study" button
   - Select any previously saved JSON file
   - All questions and settings will be restored

### JSON Format

Studies are saved in a structured JSON format. See `example-study.json` for a complete example.

```json
{
  "title": "Study name",
  "description": "Study description",
  "settings": { ... },
  "questions": [ ... ],
  "version": "1.0",
  "createdAt": "2025-11-11T12:00:00.000Z"
}
```

### Use Cases
- **Version Control**: Store study JSON files in Git
- **Collaboration**: Share JSON files with team members
- **Backup**: Archive important study designs
- **Deployment**: Use JSON to deploy studies to survey platforms

