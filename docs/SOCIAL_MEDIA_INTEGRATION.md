# Social Media Integration in Solstice

This document explains how Solstice integrates with social media platforms to provide a seamless content management experience.

## Overview

Solstice is designed to work with your existing social media workflows rather than replace them. Instead of requiring you to manually save content within the app, Solstice connects to your social media accounts and automatically syncs the content you've already saved on those platforms.

## Supported Platforms

Solstice currently supports integration with:

- Instagram
- Twitter
- Facebook
- YouTube

## How It Works

### 1. Connect Your Accounts

In the Repository screen, you can connect your social media accounts. When you tap "Connect" for a platform:

- Solstice will open an authentication flow for that platform
- You'll be asked to grant Solstice permission to access your saved content
- Your login credentials are handled directly by the platform (not stored by Solstice)

### 2. Sync Your Saved Content

Once connected, you can tap "Sync Content" to retrieve your saved items:

- **Instagram**: Pulls in posts you've saved in your Instagram collection
- **Twitter**: Retrieves your bookmarked tweets
- **YouTube**: Syncs videos from your "Watch Later" playlist
- **Facebook**: Imports posts from your saved items

The content is downloaded to your device and made available in your Solstice repository, even when offline.

### 3. Sharing Content to Solstice

You can also share content directly to Solstice from other apps:

#### Using the Share Extension

When browsing content in other apps:
1. Tap the share button
2. Select "Add to Solstice" from the share sheet
3. The content will be automatically added to your repository

#### Using Deep Links

Solstice supports deep linking, so other apps can send content directly:
- Example: `solstice://import?url=https://example.com/workout`

### 4. Browser Extension (Coming Soon)

A browser extension will allow you to save web content directly to Solstice with a single click.

## Privacy & Data Usage

- Solstice only accesses the content you've explicitly saved on social platforms
- Your login credentials are never stored by Solstice
- Content is stored locally on your device and optionally backed up to your personal Solstice cloud account
- You can disconnect a platform at any time to revoke access

## Troubleshooting

### Connection Issues

If you're having trouble connecting your accounts:

1. Ensure you're logged into the platform's app or website
2. Check that you have the latest version of Solstice
3. Try disconnecting and reconnecting the platform
4. Verify your internet connection

### Content Not Syncing

If your saved content isn't appearing:

1. Make sure you've saved content on the platform itself
2. Try manual sync by pulling down on the Repository screen
3. Check that you've granted all necessary permissions

## Feedback

We're constantly improving our social media integration. If you have suggestions or encounter issues, please contact us at support@solstice.app or report an issue through the app's settings menu. 