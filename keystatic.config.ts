import { config, fields, collection, singleton } from '@keystatic/core';

// ---------------------------------------------------------------------------
// STORAGE
// ---------------------------------------------------------------------------
// 'local'  -> reads/writes files on disk. Only for your own local dev.
// 'github' -> reads/writes via the GitHub API + a GitHub App. This is what
//             you switch to for a client so they can edit from the browser
//             without touching git at all.
//
// Per-client checklist to go from local -> github:
//   1. Create (or reuse) a GitHub App scoped to *only* this client's repo.
//   2. Set KEYSTATIC_GITHUB_CLIENT_ID / KEYSTATIC_GITHUB_CLIENT_SECRET /
//      KEYSTATIC_SECRET as environment variables in Cloudflare Pages.
//   3. Flip the storage kind below and redeploy.
// See README.md for the full walkthrough.
// ---------------------------------------------------------------------------
const isProd = process.env.NODE_ENV === 'production';

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'test-agency-starter/test-agency-starter',
  },
  ui: {
    brand: { name: 'Client Website — Content' },
  },

  singletons: {
    // Global site settings the client rarely touches, but needs somewhere.
    siteSettings: singleton({
      label: 'Site settings',
      path: 'src/content/settings/site',
      schema: {
        siteName: fields.text({ label: 'Site name', validation: { isRequired: true } }),
        tagline: fields.text({ label: 'Tagline / one-line pitch' }),
        logo: fields.image({
          label: 'Logo',
          directory: 'src/assets/settings',
          publicPath: '../../assets/settings/',
        }),
        contactEmail: fields.text({ label: 'Contact email' }),
        phone: fields.text({ label: 'Phone number' }),
        address: fields.text({ label: 'Address', multiline: true }),
        socialLinks: fields.array(
          fields.object({
            platform: fields.select({
              label: 'Platform',
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'X / Twitter', value: 'x' },
              ],
              defaultValue: 'instagram',
            }),
            url: fields.url({ label: 'URL' }),
          }),
          {
            label: 'Social links',
            itemLabel: (props) => props.fields.platform.value,
          }
        ),
        defaultSeo: fields.object(
          {
            title: fields.text({ label: 'Default <title>' }),
            description: fields.text({ label: 'Default meta description', multiline: true }),
          },
          { label: 'Default SEO' }
        ),
      },
    }),

    // The homepage is a singleton (there's only ever one), built from
    // reorderable content blocks so a client can restructure the page
    // without breaking the design.
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/settings/homepage',
      schema: {
        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', validation: { isRequired: true } }),
            subheadline: fields.text({ label: 'Subheadline', multiline: true }),
            ctaLabel: fields.text({ label: 'Button text' }),
            ctaHref: fields.text({ label: 'Button link' }),
            image: fields.image({
              label: 'Hero image',
              directory: 'src/assets/homepage',
              publicPath: '../../assets/homepage/',
            }),
          },
          { label: 'Hero section' }
        ),
        sections: fields.blocks(
          {
            richText: {
              label: 'Text block',
              schema: fields.object({
                heading: fields.text({ label: 'Heading' }),
                body: fields.markdoc.inline({ label: 'Body text' }),
              }),
            },
            featureGrid: {
              label: 'Feature grid',
              schema: fields.object({
                heading: fields.text({ label: 'Heading' }),
                items: fields.array(
                  fields.object({
                    title: fields.text({ label: 'Title' }),
                    description: fields.text({ label: 'Description', multiline: true }),
                  }),
                  { label: 'Features', itemLabel: (p) => p.fields.title.value }
                ),
              }),
            },
            callToAction: {
              label: 'Call to action banner',
              schema: fields.object({
                heading: fields.text({ label: 'Heading' }),
                ctaLabel: fields.text({ label: 'Button text' }),
                ctaHref: fields.text({ label: 'Button link' }),
              }),
            },
          },
          { label: 'Page sections' }
        ),
      },
    }),
  },

  collections: {
    // Freeform pages beyond the homepage: "Über uns", "Leistungen", etc.
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        seoDescription: fields.text({ label: 'Meta description', multiline: true }),
        showInNav: fields.checkbox({ label: 'Show in navigation', defaultValue: true }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'mdoc',
          image: {
            directory: 'src/assets/pages',
            publicPath: '../../assets/pages/',
          },
        }),
      },
    }),

    // Blog / news, if the client wants one.
    posts: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        publishedDate: fields.date({ label: 'Published date', defaultValue: { kind: 'today' } }),
        excerpt: fields.text({ label: 'Excerpt (used on the overview page)', multiline: true }),
        coverImage: fields.image({
          label: 'Cover image',
          directory: 'src/assets/posts',
          publicPath: '../../assets/posts/',
        }),
        seoDescription: fields.text({ label: 'Meta description', multiline: true }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'mdoc',
          image: {
            directory: 'src/assets/posts',
            publicPath: '../../assets/posts/',
          },
        }),
      },
    }),
  },
});
