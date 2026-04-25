import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const til = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/til' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    description: z.string(),
  }),
});

const wantToLearn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/want-to-learn' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tag: z.string(),
  }),
});

export const collections = { til, 'want-to-learn': wantToLearn };
