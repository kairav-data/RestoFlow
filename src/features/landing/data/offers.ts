import type { Offer } from './content';

/**
 * Offers shown on the landing page. These are the terms RestoFlow currently advertises:
 * edit this list to change what the website promises.
 */
export const OFFERS: Offer[] = [
  {
    tag: 'For restaurants',
    title: 'Free onboarding',
    body: 'We set up your restaurant page, tables and QR codes with you, so you can take your first order the same day.',
    points: ['Restaurant page with your logo', 'Tables and printable QR codes', 'Owner login for your whole team'],
    cta: 'Get onboarded',
    href: '#contact',
    highlight: true,
  },
  {
    tag: 'For restaurants',
    title: 'AI menu scan, included',
    body: 'Turn a photo of your printed menu into a complete digital menu. No typing a hundred dishes by hand.',
    points: ['Reads dishes, prices and categories', 'Writes dish descriptions', 'Half and full plates supported'],
    cta: 'See how it works',
    href: '#app',
  },
  {
    tag: 'For guests',
    title: 'No app, no passwords',
    body: 'Scan, sign in with a code sent to your email, and order. Your history follows you to every RestoFlow restaurant.',
    points: ['Works in any phone browser', 'Pay at the table, no card details online', 'Games while you wait'],
    cta: 'Find a restaurant',
    href: '#restaurants',
  },
];
