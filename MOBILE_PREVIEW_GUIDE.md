# Mobile Preview Guide

## Overview

The Mobile Preview feature allows you to view your study as it would appear on a mobile device, providing a realistic preview of the participant experience.

## Accessing Mobile Preview

### From Study Design Page

1. Open a study in the Study Design page
2. Click the **"Mobile Preview"** button in the header (next to "Show Preview")
3. A new tab will open with the mobile-optimized preview
4. The URL format will be: `/mobilepreview?studyId=YOUR_STUDY_ID`

### From Study Management Page

1. Navigate to the Study Management page
2. Find the study you want to preview
3. Click the **mobile phone icon** <i class="fas fa-mobile-alt"></i> in the Actions column
4. A new tab will open with the mobile preview

## Features

### Mobile-Optimized Layout

- **Responsive Design**: Automatically adapts to mobile screen sizes
- **Touch-Friendly**: Large buttons and interactive elements optimized for touch
- **Native Feel**: Mimics native mobile app interactions

### Page Navigation

- **Instruction Page**: If configured, shows the customer instruction page first
- **Question Pages**: One question per page for focused attention
- **Progress Bar**: Visual indicator showing completion progress
- **Back/Next Buttons**: Easy navigation between pages

### Question Types Supported

1. **Multiple Choice**: Radio button selection
2. **Checkboxes**: Multiple selection options
3. **Text Input**: Single-line text entry
4. **Text Area**: Multi-line text entry
5. **Date**: Date picker input
6. **Rating**: 5-star rating system
7. **Ranking**: Drag-and-drop ranking (touch-enabled)

### Validation

- Required fields are marked with a red badge
- Validates responses before allowing navigation to next page
- Shows error messages for incomplete required questions

### Data Submission

- Collects all responses in structured format
- Shows success screen upon completion
- Submission data logged to console (for development)

## URL Parameters

### Required Parameters

- `studyId`: The unique identifier of the study to preview

Example:
```
https://yourdomain.com/mobilepreview?studyId=NEW-STUDY-SURVSDFEY-1762975719473
```

## Mobile Preview URL Structure

The mobile preview URL can be shared directly with participants or testers:

1. **Development**: `http://localhost:4200/mobilepreview?studyId=YOUR_STUDY_ID`
2. **Production**: `https://yourdomain.com/mobilepreview?studyId=YOUR_STUDY_ID`

## Best Practices

### Testing

1. **Save First**: Always save your study before opening mobile preview
2. **Published Studies**: Only published or active studies will display
3. **Multiple Devices**: Test on various mobile devices and browsers
4. **Different Screen Sizes**: Check both phone and tablet views

### Sharing

- Share the mobile preview URL with team members for review
- Use QR codes to quickly access on mobile devices
- Test the complete user flow before launching to participants

### Performance

- Preview loads data via API call to `/api/studies/:studyId`
- Requires active internet connection
- Cached responses allow navigation back and forth

## Troubleshooting

### "Unable to Load Study"

**Possible causes:**
- Study ID is invalid or doesn't exist
- Study is not published/active
- Network connection issue

**Solution:**
- Verify the study ID is correct
- Ensure study status is "Published" or "Active"
- Check browser console for error messages

### "Please save your study first"

**Cause:** Study hasn't been saved yet

**Solution:**
- Click "Save Draft" or "Publish" before opening mobile preview
- Ensure you have a valid studyId in the URL

### Mobile Preview Not Opening

**Possible causes:**
- Pop-up blocker preventing new tab
- Browser security settings

**Solution:**
- Allow pop-ups for your domain
- Check browser console for errors
- Try copying the URL and opening manually

## Technical Details

### File Structure

- **HTML**: `/views/mobilepreview.html`
- **Backend Route**: `/mobilepreview` (in app.js)
- **API Endpoint**: `/api/studies/:studyId`

### Response Format

Responses are collected in the following format:

```javascript
{
  studyId: "YOUR_STUDY_ID",
  responses: {
    0: "Selected answer",
    1: ["Multiple", "Selections"],
    2: "Text response",
    3: 5, // Rating
    // ... etc
  },
  submittedAt: "2025-11-12T10:30:00.000Z"
}
```

### Browser Compatibility

- Modern mobile browsers (iOS Safari, Chrome, Firefox)
- iOS 12+ and Android 8+
- Progressive Web App (PWA) compatible

## Future Enhancements

- Offline support
- Response validation
- Multi-language support
- Accessibility improvements
- Analytics tracking

## Support

For issues or questions about the mobile preview feature, contact your system administrator or check the main documentation.

---

**Last Updated**: November 2025  
**Version**: 1.0.0
