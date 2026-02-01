import express from 'express'
import { apply, serve } from '@photonjs/express'

function startServer() {
  const app = express()

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'sqoolify-frontend' })
  })

  // Photon auto-installs Vike SSR middleware, static file serving
  apply(app)

  return serve(app, {
    port: 3000,
    onReady() {
      console.log('Sqoolify Frontend running at http://localhost:3000')
    },
  })
}

export default startServer()
