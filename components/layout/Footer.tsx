import Link from "next/link";
import { Zap } from "lucide-react";
import { ALL_SPORTS, SPORT_SLUG } from "@/types";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white/60 border-t border-white/10 mt-16">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-brand-red fill-brand-red" />
              <span className="text-white font-black text-base tracking-tight">
                HS SPORTS<span className="text-brand-red"> ELITE</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed">
              Northern NJ's premier source for high school sports coverage. Stats, stories, and scores from the teams that matter to you.
            </p>
            <div className="flex gap-3 mt-4">
              <Link href="/subscribe" className="bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors">
                Subscribe
              </Link>
              <Link href="/advertise" className="border border-white/30 hover:border-white text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors">
                Advertise
              </Link>
            </div>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4">Sports</h4>
            <ul className="space-y-2">
              {ALL_SPORTS.slice(0, 6).map((sport) => (
                <li key={sport}>
                  <Link href={`/sports/${SPORT_SLUG[sport]}`} className="text-xs hover:text-white transition-colors">
                    {sport}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More sports */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4">More Sports</h4>
            <ul className="space-y-2">
              {ALL_SPORTS.slice(6).map((sport) => (
                <li key={sport}>
                  <Link href={`/sports/${SPORT_SLUG[sport]}`} className="text-xs hover:text-white transition-colors">
                    {sport}
                  </Link>
                </li>
              ))}
              <li><Link href="/athletes" className="text-xs hover:text-white transition-colors">Athletes</Link></li>
              <li><Link href="/schools" className="text-xs hover:text-white transition-colors">Schools</Link></li>
              <li><Link href="/scores" className="text-xs hover:text-white transition-colors">Scores</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/advertise" className="text-xs hover:text-white transition-colors">Advertise With Us</Link></li>
              <li><Link href="/subscribe" className="text-xs hover:text-white transition-colors">Subscribe</Link></li>
              <li><Link href="/about" className="text-xs hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-xs hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-xs hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-xs hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs">© {new Date().getFullYear()} HS Sports Elite. All rights reserved.</p>
          <p className="text-xs">Northern NJ High School Sports Coverage</p>
        </div>
      </div>
    </footer>
  );
}
