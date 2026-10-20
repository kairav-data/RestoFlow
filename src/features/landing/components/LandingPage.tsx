import React from 'react';
import type { LandingData } from '../types';
import { LandingNav } from './LandingNav';
import { Hero } from './Hero';
import { Journey } from './Journey';
import { AppShowcase } from './AppShowcase';
import { RestaurantsSection } from './RestaurantsSection';
import { DishesSection } from './DishesSection';
import { OwnerFeatures } from './OwnerFeatures';
import { OffersSection } from './OffersSection';
import { AboutSection } from './AboutSection';
import { ContactSection } from './ContactSection';
import { LandingFooter } from './LandingFooter';

/** The public RestoFlow home page. */
export const LandingPage: React.FC<{ data: LandingData }> = ({ data }) => (
  <div className="min-h-screen overflow-x-clip bg-white">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-card">
      Skip to content
    </a>
    <LandingNav />
    <main id="main">
      <Hero stats={data.stats} />
      <Journey />
      <AppShowcase />
      <RestaurantsSection restaurants={data.restaurants} />
      <DishesSection dishes={data.dishes} />
      <OwnerFeatures />
      <OffersSection />
      <AboutSection stats={data.stats} />
      <ContactSection />
    </main>
    <LandingFooter />
  </div>
);
