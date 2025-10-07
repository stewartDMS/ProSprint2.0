# Outlook Integration Diagnostics and Repair Documentation

## Issue Description
The Outlook integration was returning "Failed to connect OUTLOOK. Please try again." even after the OAuth callback handler was in place. This document outlines the diagnostics implemented and issues that may be encountered.

## Changes Implemented

### 1. Comprehensive Logging in Microsoft OAuth Callback Handler
**File**: `pages/api/integrations/email/callback/microsoft.ts`

Added extensive logging at every critical point of the OAuth flow:

#### Request Logging
- Logs all incoming requests with method, query parameters, and timestamp
- Format: `[Microsoft OAuth Callback] Received request: {...}`

#### Environment Variable Verification
- Checks and logs the presence of all required environment variables:
  - `MICROSOFT_CLIENT_ID` - Shows if present and its length (not the actual value for security)
  - `MICROSOFT_CLIENT_SECRET` - Shows if present and its length
  - `MICROSOFT_REDIRECT_URI` - Shows the value or indicates if using default
- Format: `[Microsoft OAuth Callback] Environment variables check: {...}`

#### OAuth Error Detection
- Captures OAuth errors returned by Microsoft in the callback URL
- Logs `error` and `error_description` parameters
- Redirects to frontend with detailed error message

#### Token Exchange Logging
- Logs the start of token exchange with code length
- Logs all request parameters (except sensitive values)
- Logs the response status from Microsoft's token endpoint
- Format: `[Microsoft OAuth Callback] Token exchange request: {...}`

#### Success Path Logging
- Logs successful token retrieval with metadata (not token values)
- Shows token type, scope, expiration, and whether refresh token was received
- Logs successful token storage
- Format: `[Microsoft OAuth Callback] Token exchange successful: {...}`

#### Error Path Logging
- Logs detailed error responses from Microsoft including:
  - HTTP status code and status text
  - Full error response body
  - Specific error codes from Microsoft
- Format: `[Microsoft OAuth Callback] Token exchange failed: {...}`

#### Exception Handling
- Catches and logs any exceptions during the OAuth flow
- Includes error message and stack trace
- Redirects with user-friendly error message

### 2. Error Message Propagation to Frontend
**File**: `pages/integrations.tsx`

Enhanced the error handling to display detailed error messages:

- Added `message` query parameter parsing from URL
- Decodes and displays the error message from Microsoft
- Shows specific error details instead of generic "Please try again" message
- Maintains user-friendly error presentation with detailed diagnostics

Example error messages that will now be displayed:
- "Failed to connect OUTLOOK: Authorization code not received from Microsoft"
- "Failed to connect OUTLOOK: Microsoft OAuth not configured - missing client credentials"
- "Failed to connect OUTLOOK: [specific Microsoft error description]"

### 3. Redirect URI Consistency
Ensured that the `redirect_uri` parameter used in token exchange matches exactly what was used in the authorization request:
- Uses `MICROSOFT_REDIRECT_URI` environment variable if set
- Falls back to default: `https://pro-sprint-ai.vercel.app/api/integrations/email/callback/microsoft`

## Common Issues and Diagnostics

### Issue 1: Missing Environment Variables
**Symptom**: Error message "Microsoft OAuth not configured - missing client credentials"

**Diagnosis**: Check console logs for:
```
[Microsoft OAuth Callback] Environment variables check: {
  MICROSOFT_CLIENT_ID: 'MISSING',
  MICROSOFT_CLIENT_SECRET: 'MISSING',
  ...
}
```

**Fix**: 
1. Ensure `.env.local` file exists in the project root
2. Add the following variables:
   ```
   MICROSOFT_CLIENT_ID=your-client-id
   MICROSOFT_CLIENT_SECRET=your-client-secret
   MICROSOFT_REDIRECT_URI=https://your-domain.com/api/integrations/email/callback/microsoft
   ```
3. Restart the Next.js development server

### Issue 2: Redirect URI Mismatch
**Symptom**: Error message with description like "redirect_uri mismatch"

**Diagnosis**: Check console logs for:
```
[Microsoft OAuth Callback] Token exchange request: {
  redirect_uri: '...',
  ...
}
```

**Fix**:
1. The `redirect_uri` in the token exchange must EXACTLY match what's registered in Azure AD
2. Update `MICROSOFT_REDIRECT_URI` in `.env.local` to match Azure AD configuration
3. Verify the redirect URI in Azure AD Application Registration matches your deployment URL

### Issue 3: Invalid Client Credentials
**Symptom**: Error message about invalid client or client authentication failed

**Diagnosis**: Check console logs for:
```
[Microsoft OAuth Callback] Token exchange failed: {
  error: 'invalid_client',
  error_description: '...',
  ...
}
```

**Fix**:
1. Verify `MICROSOFT_CLIENT_ID` matches the Application (client) ID in Azure AD
2. Verify `MICROSOFT_CLIENT_SECRET` is valid and not expired
3. Generate a new client secret in Azure AD if necessary

### Issue 4: Authorization Code Issues
**Symptom**: Error about invalid or expired authorization code

**Diagnosis**: Check console logs for:
```
[Microsoft OAuth Callback] Token exchange failed: {
  error: 'invalid_grant',
  error_description: '...',
  ...
}
```

**Fix**:
1. Authorization codes are single-use and expire quickly (typically 10 minutes)
2. Ensure user completes OAuth flow without interruption
3. Check for clock sync issues between servers
4. Verify no duplicate callback requests are being made

### Issue 5: Insufficient Permissions/Scopes
**Symptom**: Error about consent required or invalid scope

**Diagnosis**: Check the OAuth authorization URL being generated in the connect flow

**Fix**:
1. Verify the scopes requested in the authorization URL
2. Ensure Azure AD app has permissions configured for:
   - `Mail.Send`
   - `Mail.Read`
   - `offline_access`
3. Ensure admin consent is granted if required

## Monitoring OAuth Flow

To monitor the complete OAuth flow, watch console logs for these key stages:

1. **Request Received**
   ```
   [Microsoft OAuth Callback] Received request: {...}
   ```

2. **Environment Check**
   ```
   [Microsoft OAuth Callback] Environment variables check: {...}
   ```

3. **Token Exchange Start**
   ```
   [Microsoft OAuth Callback] Starting token exchange: {...}
   ```

4. **Token Exchange Response**
   ```
   [Microsoft OAuth Callback] Token exchange response: {...}
   ```

5. **Success or Error**
   - Success: `[Microsoft OAuth Callback] Token stored successfully, redirecting to success page`
   - Error: `[Microsoft OAuth Callback] Token exchange failed: {...}`

## Testing Recommendations

### Local Testing
1. Set up `.env.local` with valid Microsoft credentials
2. Start dev server: `npm run dev`
3. Open browser console to see client-side logs
4. Check server console for detailed OAuth logs
5. Attempt to connect Outlook integration

### Production Testing
1. Ensure all environment variables are set in Vercel/deployment platform
2. Monitor server logs during OAuth flow
3. Test with different user accounts
4. Verify redirect URIs match production domain

## Security Considerations

The logging implementation includes:
- ✅ No logging of actual access tokens or refresh tokens
- ✅ No logging of complete authorization codes (only prefix logged)
- ✅ No logging of client secrets
- ⚠️ Client IDs are logged (these are not secret but shouldn't be widely distributed)
- ⚠️ Error descriptions from Microsoft may contain sensitive info - review logs carefully

### Production Recommendations
1. Consider using structured logging service (e.g., Datadog, LogRocket)
2. Implement log retention policies
3. Encrypt logs at rest
4. Restrict access to logs
5. Monitor for suspicious patterns
6. Implement CSRF state parameter validation (currently marked as TODO)

## Additional Files That May Need Review

### Related OAuth Files
- `pages/api/integrations/outlook/callback.ts` - Alternative/duplicate callback handler
- `pages/api/integrations/outlook.ts` - Main Outlook integration endpoint
- `pages/api/integrations/email.ts` - Email integration handler
- `pages/api/utils/tokenStorage.ts` - Token storage utility

### Potential Issues with Multiple Callback Handlers
There appear to be two callback handlers:
1. `/api/integrations/email/callback/microsoft` (updated with diagnostics)
2. `/api/integrations/outlook/callback` (not updated)

**Recommendation**: Verify which callback URL is registered in Azure AD and ensure it points to the correct handler. Consider consolidating to a single callback handler to avoid confusion.

## Next Steps for Production

1. **Implement CSRF Protection**: Add state parameter validation
2. **Add Rate Limiting**: Prevent OAuth callback abuse
3. **Implement Token Refresh**: Automatic token refresh before expiration
4. **Database Storage**: Replace in-memory token storage with encrypted database
5. **User Authentication**: Associate tokens with authenticated user sessions
6. **Error Alerting**: Set up alerts for repeated OAuth failures
7. **Analytics**: Track OAuth success/failure rates

## Conclusion

The diagnostics implemented will provide clear visibility into:
- Configuration issues (missing environment variables)
- Microsoft-side errors (redirect URI mismatch, invalid credentials)
- Network/connectivity issues
- Token exchange problems

When an error occurs, both the server logs and frontend will now show specific, actionable error messages instead of generic failures.
