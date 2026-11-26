import React from "react";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

const DEALERSHIP_LOCATION = {
  name: "CarDealer CMS Headquarters",
  address: "430 N Semoran Blvd, Orlando, FL 32807, USA",
  phone: "+1 (555) 382-9471",
  hours: "Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed",
  mapQuery: "430+N+Semoran+Blvd,+Orlando,+FL+32807",
};

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com", icon: SiFacebook },
  { name: "Instagram", href: "https://instagram.com", icon: SiInstagram },
  { name: "X", href: "https://x.com", icon: SiX },
  { name: "YouTube", href: "https://youtube.com", icon: SiYoutube },
] as const;

export function ContactBanner() {
  const mapEmbedUrl = `https://maps.google.com/maps?q=${DEALERSHIP_LOCATION.mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${DEALERSHIP_LOCATION.mapQuery}`;

  return (
    <section className="relative overflow-hidden border-t border-border bg-gradient-to-r from-card via-secondary/40 to-card py-12 lg:py-16">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          
          {/* Left Column: Phone Mockup with Map (lg:col-span-5) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[320px] rounded-[2.5rem] border-4 border-foreground/15 bg-card shadow-2xl overflow-hidden lg:-my-6">
              {/* Phone Top Bar */}
              <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-heading text-xs font-semibold uppercase tracking-wider">
                    Find Us
                  </span>
                </div>
                <a
                  href={mapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 hover:opacity-90 transition-opacity"
                  aria-label="Open location in Google Maps"
                >
                  <span>Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Phone Screen: Embedded Google Map */}
              <div className="relative h-[300px] sm:h-[340px] w-full bg-muted">
                <iframe
                  src={mapEmbedUrl}
                  className="h-full w-full border-0"
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Dealership Location Map"
                />
              </div>
            </div>
          </div>
          {/* Right Column: Contact Information (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-foreground">
            <div className="space-y-2">
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-primary">
                Visit Our Showroom
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Connect With Our Team Today
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Whether you are looking to test drive your dream car, appraise your trade-in, or discuss flexible financing options, our experts are ready to assist you.
              </p>
            </div>

            {/* Contact Details List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">
                    Location
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {DEALERSHIP_LOCATION.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider">
                    Phone Direct
                  </h3>
                  <a
                    href={`tel:${DEALERSHIP_LOCATION.phone}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors block underline underline-offset-2"
                  >
                    {DEALERSHIP_LOCATION.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours and Socials Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {DEALERSHIP_LOCATION.hours}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const IconComp = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit our ${social.name} page`}
                      className="rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <IconComp className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

