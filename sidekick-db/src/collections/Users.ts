import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  // useAPIKey lets a machine client (e.g. the chatbot backend) authenticate with
  // a static key instead of an email/password login + JWT. Generate a key per
  // user in the admin UI, then send: Authorization: users API-Key <key>
  auth: {
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
