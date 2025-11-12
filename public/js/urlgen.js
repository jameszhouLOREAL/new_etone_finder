// Selfie Assistant URL Builder JavaScript
class SelfieAssistantURLBuilder {
    constructor() {
        this.initializeEventListeners();
        // Don't generate URL automatically on page load
        this.setDefaultValues();
    }

    initializeEventListeners() {
        // Connection mode toggle
        document.querySelectorAll('input[name="connectionMode"]').forEach(radio => {
            radio.addEventListener('change', this.toggleConnectionMode.bind(this));
        });

        // Validation toggle
        document.getElementById('enableValidations').addEventListener('change', this.toggleValidations.bind(this));

        // API scoring toggle
        document.getElementById('enableAPI').addEventListener('change', this.toggleAPIOptions.bind(this));

        // Individual validation toggles
        const validationTypes = ['light', 'distance', 'tilt', 'expression', 'eyes'];
        validationTypes.forEach(type => {
            document.getElementById(`${type}Validation`).addEventListener('change', 
                () => this.toggleValidationType(type));
        });

        // Removed auto-generate URL on form changes
        // User must click the "Generate URL & QR Code" button
    }

    toggleConnectionMode() {
        const isConnected = document.getElementById('connectedMode').checked;
        document.getElementById('connectedOptions').style.display = isConnected ? 'block' : 'none';
    }

    toggleValidations() {
        const enabled = document.getElementById('enableValidations').checked;
        document.getElementById('validationOptions').style.display = enabled ? 'block' : 'none';
    }

    toggleAPIOptions() {
        const enabled = document.getElementById('enableAPI').checked;
        document.getElementById('apiOptions').style.display = enabled ? 'block' : 'none';
    }

    toggleValidationType(type) {
        const enabled = document.getElementById(`${type}Validation`).checked;
        document.getElementById(`${type}Thresholds`).style.display = enabled ? 'block' : 'none';
    }

    generateMeasurementID() {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `TESTLOGPT-${dateStr}-${randomDigits}-JamesZHOU`;
    }

    getAPIToken(zone, apiMode = 'full') {
        // Return the already encoded tokens as-is
        if (apiMode === 'full') {
            // Full combo: ShadeMatch + NEXA + Modiface
            const fullTokens = {
                'FRONT_FACE': 'CiQABoLc7Nc6%2BScoymPRZm2o43Eq9UE%2BcM8nf9ZxNBc%2BVT0N0WwSXwB03kGgneGjRxmj5DHp4QGGrF4WPnnFAMYvZLWUWWH3ybwjrBDPkjh90BXceAJ9hIHCHfIMllmayp0QJ6L7MHW7s1nBix3UPPBAQI8bjh2tBNK0SsFmtziosUj%2BskFu',
                'RIGHT_FACE': 'CiQABoLc7Nc6%2BScoymPRZm2o43Eq9UE%2BcM8nf9ZxNBc%2BVT0N0WwSXwB03kGgneGjRxmj5DHp4QGGrF4WPnnFAMYvZLWUWWH3ybwjrBDPkjh90BXceAJ9hIHCHfIMllmayp0QJ6L7MHW7s1nBix3UPPBAQI8bjh2tBNK0SsFmtziosUj%2BskFu',
                'LEFT_FACE': 'CiQABoLc7Nc6%2BScoymPRZm2o43Eq9UE%2BcM8nf9ZxNBc%2BVT0N0WwSXwB03kGgneGjRxmj5DHp4QGGrF4WPnnFAMYvZLWUWWH3ybwjrBDPkjh90BXceAJ9hIHCHfIMllmayp0QJ6L7MHW7s1nBix3UPPBAQI8bjh2tBNK0SsFmtziosUj%2BskFu'
            };
            return fullTokens[zone];
        } else {
            // NEXA only
            const nexaTokens = {
                'FRONT_FACE': 'CiQABoLc7Bj%2FLNhlJQ2%2F%2F%2BEaUXv%2FIdF2vm5zDozj8qd47eB7W1USUAB03kGgvin7J81oSZdpXhzCCZgNhPFjyDRFy8V5g09LpF0ZSv6t4S5uVjjOuP1rV9b7T8PwbsIhutIM1oMBuxn7D%2Fegd5S%2BMyTgL4dlXH1O',
                'RIGHT_FACE': 'CiQABoLc7Bj%2FLNhlJQ2%2F%2F%2BEaUXv%2FIdF2vm5zDozj8qd47eB7W1USUAB03kGgvin7J81oSZdpXhzCCZgNhPFjyDRFy8V5g09LpF0ZSv6t4S5uVjjOuP1rV9b7T8PwbsIhutIM1oMBuxn7D%2Fegd5S%2BMyTgL4dlXH1O',
                'LEFT_FACE': 'CiQABoLc7Bj%2FLNhlJQ2%2F%2F%2BEaUXv%2FIdF2vm5zDozj8qd47eB7W1USUAB03kGgvin7J81oSZdpXhzCCZgNhPFjyDRFy8V5g09LpF0ZSv6t4S5uVjjOuP1rV9b7T8PwbsIhutIM1oMBuxn7D%2Fegd5S%2BMyTgL4dlXH1O'
            };
            return nexaTokens[zone];
        }
    }

    clampValue(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    buildValidationParams() {
        if (!document.getElementById('enableValidations').checked) {
            return { features: '', thresholds: '' };
        }

        const features = [];
        const thresholds = [];

        // Light validation
        if (document.getElementById('lightValidation').checked) {
            features.push('Brightness', 'Lighting', 'LightColor');
            
            const brightMin = this.clampValue(parseInt(document.getElementById('brightMin').value), 0, 255);
            const brightMax = this.clampValue(parseInt(document.getElementById('brightMax').value), 0, 255);
            const lightingValue = this.clampValue(parseInt(document.getElementById('lightingValue').value), -255, 255);
            const lightColorValue = this.clampValue(parseInt(document.getElementById('lightColorValue').value), -255, 255);
            
            thresholds.push(`BrightMin,${brightMin}`, `BrightMax,${brightMax}`, 
                          `LightingValue,${lightingValue}`, `LightColorValue,${lightColorValue}`);
        }

        // Distance validation
        if (document.getElementById('distanceValidation').checked) {
            features.push('Distance', 'Framing');
            
            const distanceFar = this.clampValue(parseInt(document.getElementById('distanceFar').value), 0, 100);
            const distanceClose = this.clampValue(parseInt(document.getElementById('distanceClose').value), 0, 100);
            
            thresholds.push(`DistanceFar,${distanceFar}`, `DistanceClose,${distanceClose}`);
        }

        // Tilt validation
        if (document.getElementById('tiltValidation').checked) {
            features.push('Tilt');
            
            const pitchMin = this.clampValue(parseInt(document.getElementById('pitchMin').value), -90, 90);
            const pitchMax = this.clampValue(parseInt(document.getElementById('pitchMax').value), -90, 90);
            const rollMin = this.clampValue(parseInt(document.getElementById('rollMin').value), -90, 90);
            const rollMax = this.clampValue(parseInt(document.getElementById('rollMax').value), -90, 90);
            const yawMin = this.clampValue(parseInt(document.getElementById('yawMin').value), -90, 90);
            const yawMax = this.clampValue(parseInt(document.getElementById('yawMax').value), -90, 90);
            const rightProfile = this.clampValue(parseInt(document.getElementById('rightProfile').value), -90, 90);
            const leftProfile = this.clampValue(parseInt(document.getElementById('leftProfile').value), -90, 90);
            
            thresholds.push(`PitchMin,${pitchMin}`, `PitchMax,${pitchMax}`, 
                          `RollMin,${rollMin}`, `RollMax,${rollMax}`,
                          `YawMin,${yawMin}`, `YawMax,${yawMax}`,
                          `RightProfile,${rightProfile}`, `LeftProfile,${leftProfile}`);
        }

        // Expression validation
        if (document.getElementById('expressionValidation').checked) {
            features.push('Neutral', 'Eyebrow');
            
            const smileRatio = this.clampValue(parseFloat(document.getElementById('smileRatio').value), 0, 1);
            const eyebrowHeight = this.clampValue(parseFloat(document.getElementById('eyebrowHeight').value), 0, 1);
            
            thresholds.push(`smileRatio,${smileRatio}`, `EyebrowHeight,${eyebrowHeight}`);
        }

        // Eyes validation
        if (document.getElementById('eyesValidation').checked) {
            features.push('Eyes');
            
            const eyeClose = this.clampValue(parseFloat(document.getElementById('eyeClose').value), 0, 1);
            
            thresholds.push(`EyeClose,${eyeClose}`);
        }

        return {
            features: features.join(','),
            thresholds: thresholds.join(',')
        };
    }

    generateURL() {
        const environment = document.getElementById('environment').value;
        const language = document.getElementById('language').value;
        const camera = document.getElementById('camera').value;
        const askedZone = document.getElementById('askedZone').value;
        const autoTake = document.getElementById('autoTake').checked ? 'YES' : 'NO';
        const showTutorial = document.getElementById('showTutorial').checked ? '1' : '0';
        const volunteerId = document.getElementById('volunteerId').value || 'TestVolunteer';
        const isConnected = document.getElementById('connectedMode').checked;
        const enableGPS = document.getElementById('enableGPS').checked;
        const enableAPI = document.getElementById('enableAPI').checked;

        // Get base URL based on environment
        const baseUrls = {
            'dev': 'https://www-dev.visual-capture-assistant.com',
            'qa': 'https://www-qa.visual-capture-assistant.com',
            'prod': 'https://www.visual-capture-assistant.com'
        };
        
        // Build URL manually to avoid double encoding
        let url = `${baseUrls[environment]}/${language}/?`;
        
        // Add basic parameters
        const params = [];
        params.push(`dispTutorial=${showTutorial}`);
        params.push(`usedCameraReq=${camera}`);
        params.push(`autoTakePict=${autoTake}`);
        params.push(`askedZone=${askedZone}`);
        params.push(`volunteerId=${volunteerId}`);

        // Connection mode parameters
        if (isConnected) {
            params.push('edcConnected=YES');
            params.push('edcVersion=LO_INTERNAL');
            params.push('studyId=test-yerb');
            params.push('eproUrl=http%3A%2F%2Fwww.google.com'); // Pre-encoded
            
            if (enableGPS) {
                params.push('getGps=YES');
                params.push('gpsToEdc=YES');
            } else {
                params.push('getGps=NO');
                params.push('gpsToEdc=NO');
            }

            if (enableAPI) {
                const apiMode = document.getElementById('apiFullCombo').checked ? 'full' : 'nexa';
                params.push(`apis=${this.getAPIToken(askedZone, apiMode)}`); // Already encoded
            }

            params.push(`MeasurementID=${this.generateMeasurementID()}`);
        } else {
            params.push('edcConnected=NO');
            params.push('edcVersion=LOCAL-SA');
            params.push('studyId=finally_working');
        }

        // Add validation parameters
        const validation = this.buildValidationParams();
        if (validation.features) {
            params.push(`features=${encodeURIComponent(validation.features)}`);
            params.push(`thresholds=${encodeURIComponent(validation.thresholds)}`);
        }

        url += params.join('&');

        // Display results
        this.displayResults(url, isConnected, volunteerId);
    }

    setDefaultValues() {
        // Set default values without generating URL
        document.getElementById('environment').value = 'dev';
        document.getElementById('language').value = 'en';
        document.getElementById('camera').value = 'FRONT';
        document.getElementById('askedZone').value = 'FRONT_FACE';
        document.getElementById('autoTake').checked = true;
        document.getElementById('showTutorial').checked = false;
        document.getElementById('volunteerId').value = 'TestVolunteer';
        document.getElementById('localMode').checked = true;
    }

    generateDefaultURL() {
        // Set default values and generate URL
        this.setDefaultValues();
        this.generateURL();
    }

    displayResults(url, isConnected, volunteerId) {
        // Generate parameter summary
        const summary = this.generateParameterSummary();
        
        // Update modal content
        document.getElementById('modalParameterSummary').innerHTML = summary;
        document.getElementById('modalGeneratedURL').textContent = url;

        // Determine QR code size based on URL length
        // Longer URLs need larger QR codes for readability
        const urlLength = url.length;
        let qrSize = 300;
        
        if (urlLength > 500) {
            qrSize = 500; // Large QR for complex URLs with validations
        } else if (urlLength > 300) {
            qrSize = 400; // Medium QR for moderate URLs
        }
        
        console.log(`URL length: ${urlLength} characters, QR size: ${qrSize}x${qrSize}`);

        // Generate QR code with appropriate size and error correction
        // ecc=H provides highest error correction (30% recovery capability)
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&ecc=H&data=${encodeURIComponent(url)}`;
        document.getElementById('modalQrCode').src = qrURL;

        // Show cloud storage link if connected mode
        if (isConnected) {
            const storageURL = `https://console.cloud.google.com/storage/browser/vca-gcs-edc-loreal-internal-results-eu-dv/${volunteerId}?project=rni-selfieass-fr-emea-dv`;
            document.getElementById('modalStorageLink').href = storageURL;
            document.getElementById('modalCloudStorageLink').style.display = 'block';
        } else {
            document.getElementById('modalCloudStorageLink').style.display = 'none';
        }

        // Show the modal
        document.getElementById('urlModal').style.display = 'block';
        
        // Also update the inline output section (keep it for reference)
        document.getElementById('outputSection').style.display = 'block';
        document.getElementById('parameterSummary').innerHTML = summary;
        document.getElementById('generatedURL').textContent = url;
        const qrURLSmall = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&ecc=H&data=${encodeURIComponent(url)}`;
        document.getElementById('qrCode').src = qrURLSmall;

        if (isConnected) {
            const storageURL = `https://console.cloud.google.com/storage/browser/vca-gcs-edc-loreal-internal-results-eu-dv/${volunteerId}?project=rni-selfieass-fr-emea-dv`;
            document.getElementById('storageLink').href = storageURL;
            document.getElementById('cloudStorageLink').style.display = 'block';
        } else {
            document.getElementById('cloudStorageLink').style.display = 'none';
        }

        // Scroll to results
        document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
    }

    generateParameterSummary() {
        const environment = document.getElementById('environment').value.toUpperCase();
        const language = document.getElementById('language').value.toUpperCase();
        const camera = document.getElementById('camera').value;
        const zone = document.getElementById('askedZone').value;
        const autoTake = document.getElementById('autoTake').checked ? 'YES' : 'NO';
        const tutorial = document.getElementById('showTutorial').checked ? 'YES' : 'NO';
        const mode = document.getElementById('connectedMode').checked ? 'Connected' : 'Local';
        const volunteerId = document.getElementById('volunteerId').value;

        let summary = `⚙️ <strong>Configuration:</strong> ${environment} environment, ${language} language, ${camera} camera, Auto-take ${autoTake}, ${zone} zone, ${mode} mode, Tutorial ${tutorial}, VolunteerId: ${volunteerId}`;

        // API Scoring info
        if (document.getElementById('connectedMode').checked && document.getElementById('enableAPI').checked) {
            const apiMode = document.getElementById('apiFullCombo').checked ? 'Full Combo (ShadeMatch + NEXA + Modiface)' : 'NEXA Only';
            summary += `<br>🔌 <strong>API Scoring:</strong> ${apiMode}`;
        }

        if (document.getElementById('enableValidations').checked) {
            const activeValidations = [];
            if (document.getElementById('lightValidation').checked) activeValidations.push('Light');
            if (document.getElementById('distanceValidation').checked) activeValidations.push('Distance');
            if (document.getElementById('tiltValidation').checked) activeValidations.push('Tilt');
            if (document.getElementById('expressionValidation').checked) activeValidations.push('Expression');
            if (document.getElementById('eyesValidation').checked) activeValidations.push('Eyes');
            
            if (activeValidations.length > 0) {
                summary += `<br>✅ <strong>Active Validations:</strong> ${activeValidations.join(', ')}`;
            }
        }

        return summary;
    }

    copyURL() {
        const urlText = document.getElementById('generatedURL').textContent;
        navigator.clipboard.writeText(urlText).then(() => {
            // Show success feedback
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-primary');
            }, 2000);
        });
    }
}

// Global functions for HTML onclick events
function generateURL() {
    if (window.urlBuilder) {
        window.urlBuilder.generateURL();
    } else {
        console.error('URL Builder not initialized yet');
    }
}

function copyURL() {
    if (window.urlBuilder) {
        window.urlBuilder.copyURL();
    } else {
        console.error('URL Builder not initialized yet');
    }
}

function copyModalURL() {
    const urlText = document.getElementById('modalGeneratedURL').textContent;
    navigator.clipboard.writeText(urlText).then(() => {
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-primary');
        }, 2000);
    });
}

function closeURLModal() {
    document.getElementById('urlModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('urlModal');
    if (event.target === modal) {
        closeURLModal();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.urlBuilder = new SelfieAssistantURLBuilder();
});