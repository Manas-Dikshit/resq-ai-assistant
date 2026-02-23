import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const DISTRICTS = ["Puri", "Cuttack", "Ganjam", "Khordha", "Jagatsinghpur", "Kendrapara", "Balasore", "Bhadrak", "Mayurbhanj", "Jajpur"];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const AddAssessmentForm = ({ onClose, onSuccess, userId }: Props) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    district: "",
    location_name: "",
    damage_type: "structural",
    severity: "moderate",
    affected_households: 0,
    affected_population: 0,
    estimated_cost_inr: 0,
    recovery_phase: "assessment",
    priority: "medium",
    notes: "",
    lat: 0,
    lng: 0,
  });

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => setForm(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => toast({ title: "Could not detect location", variant: "destructive" })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.district || !form.location_name) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("damage_assessments").insert({
      ...form,
      assessor_id: userId,
      lat: form.lat || null,
      lng: form.lng || null,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assessment saved successfully!" });
      onSuccess();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-bold text-foreground">New Damage Assessment</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Bridge collapse at Mahanadi" className="text-xs h-8" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">District *</Label>
              <Select value={form.district} onValueChange={v => setForm(f => ({ ...f, district: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Location *</Label>
              <Input value={form.location_name} onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))} placeholder="Village/area" className="text-xs h-8" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Damage Type</Label>
              <Select value={form.damage_type} onValueChange={v => setForm(f => ({ ...f, damage_type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["structural", "infrastructure", "agricultural", "environmental", "livelihood"].map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Severity</Label>
              <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["minor", "moderate", "severe", "critical"].map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "urgent"].map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Households</Label>
              <Input type="number" value={form.affected_households} onChange={e => setForm(f => ({ ...f, affected_households: +e.target.value }))} className="text-xs h-8" />
            </div>
            <div>
              <Label className="text-xs">Population</Label>
              <Input type="number" value={form.affected_population} onChange={e => setForm(f => ({ ...f, affected_population: +e.target.value }))} className="text-xs h-8" />
            </div>
            <div>
              <Label className="text-xs">Est. Cost (₹)</Label>
              <Input type="number" value={form.estimated_cost_inr} onChange={e => setForm(f => ({ ...f, estimated_cost_inr: +e.target.value }))} className="text-xs h-8" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full h-16 rounded-md border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe the damage..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={detectLocation} className="text-xs gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Detect Location
            </Button>
            {form.lat !== 0 && (
              <span className="text-[10px] text-muted-foreground font-display">
                {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
            <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1.5">
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Assessment"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddAssessmentForm;
