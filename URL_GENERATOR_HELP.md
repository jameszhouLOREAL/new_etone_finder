# Selfie Assistant URL Generator - User Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Configuration Options](#configuration-options)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Advanced Features](#advanced-features)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

The **Selfie Assistant URL Generator** is a tool that creates customized URLs for the Visual Capture Assistant selfie application. It allows you to configure various settings and validation parameters, then generates a URL and QR code that can be shared with study participants.

### Key Features
- ✅ Generate URLs for different environments (DEV, QA, PROD)
- ✅ Configure camera settings, language, and capture modes
- ✅ Enable/disable validation features with custom thresholds
- ✅ Support for cloud-connected or local-only modes
- ✅ API integration options (ShadeMatch, NEXA, Modiface)
- ✅ Automatic QR code generation
- ✅ One-click URL copying

---

## Getting Started

### Accessing the Tool
1. Navigate to the URL Generator page from the sidebar menu
2. Look for the **"🔗 Selfie URL Generator"** menu item
3. The tool loads with default settings already configured

### Quick Start (5 Steps)
1. **Choose Environment**: Select DEV, QA, or PROD
2. **Set Language**: Choose the participant's language
3. **Configure Camera**: Select Front or Back camera
4. **Choose Mode**: Local (saves locally) or Connected (uploads to cloud)
5. **Click "Generate URL & QR Code"**

---

## Configuration Options

### 1. Basic Configuration (Column 1)

#### **Environment**
- **DEV**: Development environment for testing
- **QA**: Quality Assurance environment for validation
- **PROD**: Production environment for live studies

```
🔹 Tip: Always test in DEV before using QA or PROD
```

#### **Language**
Supported languages:
- **en** - English
- **fr** - French
- **ja** - Japanese
- **pt** - Portuguese
- **zh** - Chinese
- **es** - Spanish
- **hi** - Hindi

#### **Camera**
- **Front Camera**: For selfies (most common)
- **Back Camera**: For rear-facing captures

#### **Asked Zone**
Defines which face view to capture:
- **Front Face**: Standard frontal selfie
- **Right Profile**: Right side profile view
- **Left Profile**: Left side profile view

#### **Auto Take Picture**
- ✅ **Enabled** (Default): Automatically captures when face is detected and valid
- ❌ **Disabled**: Participant manually taps to capture

#### **Show Tutorial**
- ✅ **Enabled**: Shows instructional tutorial before capture
- ❌ **Disabled** (Default): Skips tutorial, goes straight to capture

#### **Volunteer ID**
- Unique identifier for the participant (max 10 characters)
- Default: `TestVolunteer`
- Use alphanumeric characters only
- Example: `VOL001`, `TestUser`, `ABC123`

---

### 2. Connection Mode (Column 2)

#### **Local Mode** (Default)
- Photos saved locally on the device only
- No cloud upload
- No GPS tracking
- No API scoring
- Best for: Quick tests, offline scenarios

#### **Connected Mode**
- Photos uploaded to Google Cloud Storage
- Enables additional features:
  - GPS location tracking
  - API-based skin analysis
  - Cloud storage access

##### **Enable GPS**
When checked in Connected Mode:
- Captures device GPS coordinates
- Sends location data to cloud
- Useful for geolocation studies

##### **Enable API Scoring**
When checked in Connected Mode, choose:

**Full Combo** (Default)
- ShadeMatch API
- NEXA API  
- Modiface API
- Provides comprehensive skin analysis

**NEXA Only**
- Only runs NEXA API
- Faster processing
- Lower API costs

---

### 3. Validation Features (Column 3)

#### **Enable Custom Validations**
Check this box to activate custom validation thresholds.

When enabled, you can configure:

#### **Light Validation**
Controls brightness and lighting quality:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Brightness Min** | 0-255 | 90 | Minimum brightness level |
| **Brightness Max** | 0-255 | 200 | Maximum brightness level |
| **Lighting Value** | -255 to 255 | 70 | Overall lighting quality |
| **Light Color** | -255 to 255 | 20 | Color temperature balance |

```
💡 Higher brightness = brighter image
💡 Lighting Value: Positive = better lighting
💡 Light Color: Near 0 = neutral white balance
```

#### **Distance Validation**
Controls face-to-camera distance:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Distance Far** | 0-100 | 10 | Maximum distance threshold |
| **Distance Close** | 0-100 | 30 | Minimum distance threshold |

```
📏 Lower values = closer to camera
📏 Higher values = farther from camera
```

#### **Tilt Validation**
Controls head orientation and pose:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Pitch Min** | -90 to 90 | -25 | Head tilt down (negative) |
| **Pitch Max** | -90 to 90 | 25 | Head tilt up (positive) |
| **Roll Min** | -90 to 90 | -20 | Head tilt left |
| **Roll Max** | -90 to 90 | 20 | Head tilt right |
| **Yaw Min** | -90 to 90 | -20 | Face turn left |
| **Yaw Max** | -90 to 90 | 20 | Face turn right |
| **Right Profile** | -90 to 90 | -35 | Right profile angle |
| **Left Profile** | -90 to 90 | 35 | Left profile angle |

```
🔄 Pitch: Nodding (up/down)
🔄 Roll: Head tilt (ear to shoulder)
🔄 Yaw: Shaking head (left/right)
```

#### **Expression Validation**
Controls facial expression:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Smile Ratio** | 0-1 | 0.47 | Maximum smile allowed |
| **Eyebrow Height** | 0-1 | 0.9 | Maximum eyebrow raise |

```
😐 Lower values = more neutral required
😊 Higher values = more expression allowed
```

#### **Eyes Validation**
Controls eye openness:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Eye Close Threshold** | 0-1 | 0.15 | Maximum eye closure |

```
👀 Lower values = eyes must be more open
👁️ Higher values = allows slightly closed eyes
```

---

## Step-by-Step Guide

### Scenario 1: Simple Local Test
**Goal**: Quick test with no validations

1. Keep default settings:
   - Environment: **DEV**
   - Language: **en**
   - Camera: **FRONT**
   - Mode: **Local Mode**
2. Change Volunteer ID: `TEST001`
3. Click **"Generate URL & QR Code"**
4. Copy the URL or scan the QR code
5. Open on mobile device to test

---

### Scenario 2: Connected Cloud Study
**Goal**: Production study with cloud storage

1. **Basic Configuration**:
   - Environment: **PROD**
   - Language: **fr** (French study)
   - Camera: **FRONT**
   - Asked Zone: **FRONT_FACE**
   - Auto Take: **✅ Enabled**
   - Volunteer ID: `STUDY_P001`

2. **Connection Mode**:
   - Select **Connected Mode**
   - ✅ Enable GPS
   - ✅ Enable API Scoring
   - Select **Full Combo**

3. Click **"Generate URL & QR Code"**

4. **Share with participant**:
   - Copy URL for email
   - Download QR code for print materials

5. **Access Results**:
   - Click the "View Files" link in the Cloud Storage section
   - Requires Google Cloud authorization

---

### Scenario 3: Custom Validation Study
**Goal**: Strict quality control with custom thresholds

1. **Basic Configuration**:
   - Environment: **QA**
   - Language: **en**
   - Camera: **FRONT**
   - Volunteer ID: `QA_VALID_001`

2. **Enable Validations**:
   - ✅ Enable Custom Validations

3. **Configure Light Validation**:
   - ✅ Light Validation
   - Brightness Min: `100`
   - Brightness Max: `180`
   - Lighting Value: `75`
   - Light Color: `15`

4. **Configure Distance Validation**:
   - ✅ Distance Validation
   - Distance Far: `15`
   - Distance Close: `25`

5. **Configure Tilt Validation**:
   - ✅ Tilt Validation
   - Keep defaults or adjust as needed

6. **Configure Expression Validation**:
   - ✅ Expression Validation
   - Smile Ratio: `0.3` (very neutral)
   - Eyebrow Height: `0.8`

7. Click **"Generate URL & QR Code"**

---

### Scenario 4: Profile Study (Side Views)
**Goal**: Capture right and left profile photos

**For Right Profile**:
1. Set Asked Zone: **RIGHT_FACE**
2. Enable Tilt Validation
3. Adjust Right Profile: `-45` (more profile)
4. Generate URL → `URL_RIGHT`

**For Left Profile**:
1. Set Asked Zone: **LEFT_FACE**
2. Enable Tilt Validation
3. Adjust Left Profile: `45` (more profile)
4. Generate URL → `URL_LEFT`

Share both URLs with participant for complete profile capture.

---

## Advanced Features

### QR Code Sizing
The tool automatically generates QR codes with optimal size based on URL complexity:
- **Simple URLs** (< 300 chars): 300x300 pixels
- **Medium URLs** (300-500 chars): 400x400 pixels
- **Complex URLs** (> 500 chars): 500x500 pixels

All QR codes use **ECC Level H** (30% error correction) for maximum reliability.

### Measurement ID Generation
For Connected Mode, the system automatically generates unique Measurement IDs:
- Format: `TESTLOGPT-YYYYMMDD-XXXX-JamesZHOU`
- YYYYMMDD: Current date
- XXXX: Random 4-digit number
- Ensures unique tracking for each session

### Cloud Storage Access
When using Connected Mode:
1. Photos upload to: `vca-gcs-edc-loreal-internal-results-eu-dv/{volunteerId}`
2. Click "View Files" link in the output
3. Requires Google Cloud authorization
4. Access controlled by project permissions

### API Tokens
API tokens are pre-configured and encoded for each zone:
- **Full Combo**: Includes ShadeMatch + NEXA + Modiface
- **NEXA Only**: Optimized NEXA-only token
- Automatically selected based on Asked Zone

---

## Troubleshooting

### Issue: QR Code Not Displaying
**Solution**:
- Check internet connection (QR codes generated via API)
- Wait a few seconds for image to load
- Try generating again

### Issue: URL Too Long
**Symptom**: QR code very dense or hard to scan

**Solution**:
- Disable unnecessary validations
- Use shorter Volunteer ID
- Consider using fewer validation features
- QR code automatically scales up for complex URLs

### Issue: Cloud Storage Link Not Working
**Solution**:
- Ensure you selected "Connected Mode"
- Verify you have Google Cloud project access
- Check volunteer ID is alphanumeric only
- Contact admin for permission issues

### Issue: Validation Not Working as Expected
**Solution**:
- Verify "Enable Custom Validations" is checked
- Check individual validation toggle (Light, Distance, etc.)
- Ensure threshold values are within valid ranges
- Test in DEV environment first

### Issue: Copy Button Not Working
**Solution**:
- Ensure browser supports clipboard API
- Check browser permissions for clipboard access
- Manually select and copy text if needed

---

## Best Practices

### 🎯 For Development/Testing
1. Always use **DEV environment** first
2. Start with **Local Mode** for quick iteration
3. Use simple Volunteer IDs like `TEST001`, `TEST002`
4. Test without validations first, then add complexity

### 🎯 For QA/Validation
1. Use **QA environment** for final validation
2. Enable **Connected Mode** to test cloud integration
3. Configure realistic validation thresholds
4. Document threshold values used

### 🎯 For Production Studies
1. Use **PROD environment** only after QA approval
2. Always enable **Connected Mode** for data tracking
3. Use meaningful Volunteer IDs (study protocol)
4. Keep validation thresholds user-friendly (not too strict)
5. Provide tutorial for first-time users
6. Test QR codes on multiple devices before distribution

### 🎯 Validation Threshold Guidelines
**Too Strict** (Avoid):
- Brightness: < 80 or > 210
- Tilt angles: < 15 degrees
- Expression: < 0.2

**Recommended** (Balanced):
- Brightness: 90-200
- Tilt angles: 20-25 degrees  
- Expression: 0.3-0.5

**Too Lenient** (Not recommended):
- Brightness: No limits
- Tilt angles: > 30 degrees
- No expression limits

### 🎯 URL Management
- **Save generated URLs** for study documentation
- **Version control**: Note which settings were used
- **Test on actual devices** before mass distribution
- **Create URL templates** for repeated studies

---

## Examples

### Example 1: Minimal Configuration
```
Environment: DEV
Language: en
Camera: FRONT
Mode: Local
Volunteer ID: TEST
Validations: None

Result: Simple, short URL for quick testing
```

### Example 2: Full Production Study
```
Environment: PROD
Language: fr
Camera: FRONT
Asked Zone: FRONT_FACE
Auto Take: YES
Tutorial: NO
Mode: Connected
GPS: YES
API: Full Combo
Volunteer ID: FR_STUDY_001

Validations:
✅ Light (Bright: 95-195, Lighting: 72, Color: 18)
✅ Distance (Far: 12, Close: 28)
✅ Tilt (Default angles)
✅ Expression (Smile: 0.4, Eyebrow: 0.85)

Result: Comprehensive study URL with quality controls
```

### Example 3: Profile Capture Study
```
Setup 1 (Right):
- Asked Zone: RIGHT_FACE
- Tilt Right Profile: -40
- Volunteer ID: PROFILE_R_001

Setup 2 (Left):  
- Asked Zone: LEFT_FACE
- Tilt Left Profile: 40
- Volunteer ID: PROFILE_L_001

Result: Two separate URLs for complete profile documentation
```

---

## Quick Reference Card

| Action | Steps |
|--------|-------|
| **Generate basic URL** | 1. Set Volunteer ID<br>2. Click "Generate URL & QR Code" |
| **Copy URL** | Click "Copy URL to Clipboard" button |
| **Download QR code** | Right-click QR image → Save As |
| **Enable cloud upload** | Select "Connected Mode" |
| **Add validations** | Check "Enable Custom Validations" → Select types |
| **Change language** | Select from Language dropdown |
| **Test before production** | Always use DEV environment first |

---

## Support

For technical issues or questions:
- Check the **Troubleshooting** section above
- Review **Best Practices** for guidance
- Contact the development team with:
  - Environment used
  - Configuration settings
  - Error messages (if any)
  - Screenshot of the issue

---

## Version History

- **v2.5.2** (Current): Latest stable version
- Added modal display for better QR code viewing
- Improved QR code sizing based on URL complexity
- Enhanced validation threshold controls

---

**Last Updated**: November 2025
**Document Version**: 1.0
