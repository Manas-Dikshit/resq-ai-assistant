import { FlaskConical } from "lucide-react";

interface Props {
  label?: string;
  className?: string;
}

/**
 * Marks synthetic, seeded, or illustrative data so it is never mistaken for a
 * live operational feed.
 */
const DemoDataBadge = ({ label = "Sample data", className = "" }: Props) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[9px] font-display font-bold uppercase tracking-wide text-warning ${className}`}
    title="This data is illustrative or seeded and is not a live feed."
  >
    <FlaskConical className="h-2.5 w-2.5" />
    {label}
  </span>
);

export default DemoDataBadge;
