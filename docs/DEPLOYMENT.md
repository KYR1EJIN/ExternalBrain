# Deployment Guide

## Overview

This guide covers deploying **Kyrie's External Brain** to production, with a focus on Vercel (recommended) and alternatives.

## Prerequisites

1. **OpenAI Account**
   - API key with access to GPT-4 models
   - Vector store created and populated with book content
   - Vector store ID noted for environment variables

2. **Git Repository**
   - Code pushed to GitHub, GitLab, or Bitbucket
   - Repository is accessible for deployment

3. **Node.js**
   - Version 18+ (for local testing)

## Vercel Deployment (Recommended)

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web` (if your Next.js app is in `web/` folder)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 2: Set Environment Variables

In Vercel project settings → Environment Variables, add:

```
OPENAI_API_KEY=sk-...
OPENAI_VECTOR_STORE_ID=vs_...
OPENAI_MODEL=gpt-4-turbo-preview
DEFAULT_BOOK_ID=default
NODE_ENV=production
```

**Important:**
- Set for **Production**, **Preview**, and **Development** environments
- Never commit `.env.local` to Git
- Use Vercel's environment variable UI for all secrets

### Step 3: Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Build the Next.js app
   - Deploy to production URL
3. Check build logs for errors

### Step 4: Verify Deployment

1. Visit your production URL (e.g., `your-app.vercel.app`)
2. Test the chat interface
3. Check browser console for errors
4. Test API endpoint: `POST /api/chat`

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Alternative Platforms

### Netlify

1. **Connect Repository**: Import from Git
2. **Build Settings**:
   - Build command: `cd web && npm run build`
   - Publish directory: `web/.next`
3. **Environment Variables**: Add in Site Settings → Environment Variables
4. **Deploy**: Netlify will auto-deploy on push

### Render

1. **Create Web Service**: Connect Git repository
2. **Build Settings**:
   - Build command: `cd web && npm install && npm run build`
   - Start command: `cd web && npm start`
3. **Environment Variables**: Add in Environment tab
4. **Deploy**: Render will build and deploy

### Railway

1. **New Project**: Connect Git repository
2. **Settings**:
   - Root directory: `web`
   - Build command: `npm run build`
   - Start command: `npm start`
3. **Variables**: Add in Variables tab
4. **Deploy**: Railway auto-deploys

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `OPENAI_VECTOR_STORE_ID` | Vector store ID | `vs_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_MODEL` | Model to use | `gpt-4-turbo-preview` |
| `DEFAULT_BOOK_ID` | Default book identifier | `default` |
| `NODE_ENV` | Environment | `development` |

### Local Development

Create `.env.local` in `web/` directory:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_VECTOR_STORE_ID=your_vector_store_id
OPENAI_MODEL=gpt-4-turbo-preview
DEFAULT_BOOK_ID=default
NODE_ENV=development
```

**Never commit `.env.local`** - it's in `.gitignore`

## Build Configuration

### Next.js Config

The `next.config.js` is minimal by default. Add if needed:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add any custom config here
}

module.exports = nextConfig
```

### Package.json Scripts

Standard Next.js scripts:

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Lint code

## Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors
- **Fix**: Run `npm run build` locally, fix errors before pushing

**Issue**: Environment variables not found
- **Fix**: Check Vercel environment variables are set for correct environment

**Issue**: Module not found errors
- **Fix**: Ensure all dependencies are in `package.json`, run `npm install`

### Runtime Errors

**Issue**: API route returns 500
- **Fix**: Check server logs, verify environment variables are set
- **Fix**: Check OpenAI API key is valid and has credits

**Issue**: Vector store not found
- **Fix**: Verify `OPENAI_VECTOR_STORE_ID` is correct
- **Fix**: Ensure vector store exists in your OpenAI account

**Issue**: CORS errors
- **Fix**: Next.js API routes don't have CORS issues by default
- **Fix**: If using custom domain, check DNS settings

### Performance

**Issue**: Slow responses
- **Fix**: Check OpenAI API latency
- **Fix**: Consider streaming responses (future enhancement)
- **Fix**: Optimize vector store query (reduce `topK`)

## Monitoring

### Vercel Analytics

- Enable in Project Settings → Analytics
- Track page views, API calls, errors

### Logs

- **Vercel**: View logs in project dashboard
- **Local**: Check terminal output during `npm run dev`

### Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance

## Cost Considerations

### Vercel

- **Free tier**: Sufficient for development and light traffic
- **Pro tier**: $20/month for more bandwidth and features

### OpenAI

- **API costs**: Pay per token (input + output)
- **Vector store**: Storage costs apply
- **Estimate**: ~$0.01-0.10 per conversation (varies by length)

### Optimization

- Use streaming to reduce perceived latency
- Cache common queries (future enhancement)
- Optimize prompts to reduce token usage

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Rotate API keys**: Regularly update OpenAI API key
3. **Rate limiting**: Add rate limiting to API route (future enhancement)
4. **Input validation**: Validate all user inputs
5. **Error handling**: Don't expose sensitive info in errors

## Next Steps After Deployment

1. **Test thoroughly**: Try various questions and edge cases
2. **Monitor usage**: Watch API costs and performance
3. **Gather feedback**: Get user input on responses
4. **Iterate prompts**: Refine based on real usage
5. **Add features**: Streaming, source labeling UI, etc.

## Rollback Strategy

### Vercel

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Git-based

1. Revert to previous commit
2. Push to trigger new deployment
3. Vercel will deploy the reverted version

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **OpenAI Docs**: [platform.openai.com/docs](https://platform.openai.com/docs)

